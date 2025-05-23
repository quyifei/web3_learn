const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {assert, expect} = require("chai");
const {developmentChains} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
? describe.skip
: describe("Test FundMe contract", async function () {
    let fundMe;
    let firstAccount;

    this.timeout(300000);

    beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
        await fundMe.waitForDeployment();
    });

    it("test if owner is msg.sender", async function () {
        assert.equal(firstAccount, (await fundMe.owner()));
    });

    //test fund and getFund successfully
    it("test fund and getFund successfully",
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.002")});
            await new Promise((resolve) => setTimeout(resolve, 181*1000));

            const  getFundTx = await fundMe.getFund();
            const getFundReceipt = await getFundTx.wait();

            expect(getFundReceipt)
                .to.emit(fundMe, "FundWithdrawnByOwner")
                .withArgs(ethers.parseEther("0.002"));
    });

    //test fund and refund successfully
    it("test fund and refund successfully",
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.001")});
            await new Promise((resolve) => setTimeout(resolve, 181*1000));

            const  reFundTx = await fundMe.refund();
            const reFundTxReceipt = await reFundTx.wait();

            expect(reFundTxReceipt)
                .to.emit(fundMe, "RefundWithdrawnByFunder")
                .withArgs(ethers.parseEther("0.001"));
        }
    );



});