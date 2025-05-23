const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {assert, expect} = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const {developmentChains} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
? describe.skip
: describe("Test FundMe contract", async function () {
    let fundMe;
    let firstAccount;
    let secondAccount;
    let dataFeedAddr;
    let dataFeedDeployment
    let fundMeDeployment;
    let fundMeSecondAccount;

    beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        secondAccount = (await getNamedAccounts()).secondAccount;
        fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
        
        dataFeedDeployment = await deployments.get("MockV3Aggregator");
        dataFeedAddr = dataFeedDeployment.address;

        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount);

        await fundMe.waitForDeployment();
    });

    it("test if owner is msg.sender", async function () {
        assert.equal(firstAccount, (await fundMe.owner()));
    });

    it("test if the datafeed is assigned correctly", async function () {
        // console.log("datafeed", await fundMe.dataFeed());
        assert.equal(
            (await fundMe.dataFeed()),
            dataFeedDeployment.address,
        );
    });


    it("window closed, value greater then minumum, fund failed",
        async function () {
            await helpers.time.increase(200);
            await helpers.mine();
            await expect(fundMe.fund({value: ethers.parseEther("0.001")}))
            .to.be.revertedWith( "window is closed");
        }
    )

    it("window open, value less then minumum, fund failed",
        async function () {
            await expect(fundMe.fund({value: ethers.parseEther("0.0001")}))
            .to.be.revertedWith( "Send more ETH");
        }
    )

    it("window open, value greater then minumum, fund success",
        async function () {
            await helpers.time.increase(10);
            await helpers.mine();
            await fundMe.fund({value: ethers.parseEther("0.001")});
            const balance = await fundMe.fundersToAmount(firstAccount);
            expect(balance).to.be.equal(ethers.parseEther("0.001"));
            // console.log("balance", balance.toString());
        }
    )

    // it("window open, getFund fails", 
    //     async function(){

    //     }

    // )

    it("not owner, window closed, target reached, getFund failed",
        async function () {

            await fundMe.fund({value: ethers.parseEther("0.001")});
            await fundMe.fund({value: ethers.parseEther("0.001")});
            // const balance = await ethers.provider.getBalance(fundMeDeployment.address);
            // console.log("balance", balance.toString());
            await helpers.time.increase(200);
            await helpers.mine();

            // await expect(fundMeSecondAccount.getFund())
            //     .to.be.revertedWith( "this function can only be called by owner");

            const secondSigner = await ethers.getSigner(secondAccount);
            await expect(fundMe.connect(secondSigner).getFund())
                .to.be.revertedWith( "this function can only be called by owner");
        }
    )

    it("owner, window open, target reached, getFund failed",
        async function () {

            await fundMe.fund({value: ethers.parseEther("0.001")});
            await fundMe.fund({value: ethers.parseEther("0.001")});
            // const balance = await ethers.provider.getBalance(fundMeDeployment.address);
            // console.log("balance", balance.toString());
            await helpers.time.increase(100);
            await helpers.mine();

            await expect(fundMe.getFund())
                .to.be.revertedWith( "window is not closed");
        }
    )

    it("owner, window closed, target not reached, getFund failed",
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.001")});
            await helpers.time.increase(200);
            await helpers.mine();

            await expect(fundMe.getFund())
                .to.be.revertedWith( "Target is not reached");
        }
    )
    
    it("owner, window closed, target reached, getFund success",
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.002")});
            await helpers.time.increase(200);
            await helpers.mine();

            await expect(fundMe.getFund())
                .to.emit(fundMe, "FundWithdrawnByOwner")
                .withArgs(ethers.parseEther("0.002"));
        }
    ) 

    it("window open, target not reached, funder has balance, ReFund failed",
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.001")});
            await helpers.time.increase(100);
            await helpers.mine();

            await expect(fundMe.refund())
                .to.be.revertedWith( "window is not closed");
        }
    ) 
    
    
    it("window closed, target reached, funder has balance, ReFund failed",
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.002")});
            await helpers.time.increase(200);
            await helpers.mine();

            await expect(fundMe.refund())
                .to.be.revertedWith( "Target is reached");
        }
    )  

    it("window closed, target not reached, funder has no balance, ReFund failed",
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.001")});
            await helpers.time.increase(200);
            await helpers.mine();

            await expect(fundMeSecondAccount.refund())
                .to.be.revertedWith( "there is no fund for you");
        }
    )  

    it("window closed, target not reached, funder has balance, ReFund success",
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.001")});
            await helpers.time.increase(200);
            await helpers.mine();

            await expect(fundMe.refund())
                .to.emit(fundMe, "RefundWithdrawnByFunder")
                .withArgs(ethers.parseEther("0.001"));
        }
    )  

});