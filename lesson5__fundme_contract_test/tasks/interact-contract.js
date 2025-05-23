const {task} = require("hardhat/config");
// const { ethers } = require("hardhat");

task("interact-contract", "Interact with a contract")
  .addParam("addr", "The address of the contract to interact with")
  .setAction(async (taskArgs, hre) => {
    const contractAddr = taskArgs.addr;
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = fundMeFactory.attach(contractAddr);

    const [firstAccount, secondAccount] = await ethers.getSigners();

    const fundTx = await fundMe.connect(firstAccount).fund({value: ethers.parseEther("0.001")});
    await fundTx.wait();
    const balance = await ethers.provider.getBalance(contractAddr);
    console.log("Contract balance after first fund:", balance);

    const fundTxOfSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.001")});
    await fundTxOfSecondAccount.wait();
    const balanceOfSecondAccount = await ethers.provider.getBalance(contractAddr);
    console.log("Contract balance after second fund:", balanceOfSecondAccount);


    const firstAccountBalanceFundMe = await fundMe.fundersToAmount(firstAccount.address);
    console.log("Funder balance of first account:", firstAccountBalanceFundMe.toString());

    const secondAccountBalanceFundMe = await fundMe.fundersToAmount(secondAccount.address);

    console.log("Funder balance of second account:", secondAccountBalanceFundMe.toString());

  });