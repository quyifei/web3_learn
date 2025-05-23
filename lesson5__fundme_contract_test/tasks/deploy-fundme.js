const {task} = require("hardhat/config");

task("deploy-fundme", "Deploy and verify a Fundme contract")
  .setAction(async (taskArgs, hre) => {
      const foundMeFactory = await hre.ethers.getContractFactory("FundMe");
      console.log("Deploying FundMe...");
      const fundMe = await foundMeFactory.deploy(300);
      await fundMe.waitForDeployment();
      console.log("Contract deployed to:", fundMe.target);

      // Wait for 5 confirmations before verifying
      console.log("Waiting for 5 confirmations before verifying...");
      await fundMe.deploymentTransaction().wait(5);

      console.log("Verifying contract on Etherscan...");
      if (hre.network.config.chainId === 11155111 && process.env.ETHER_API_KEY) {
          console.log("waiting for 5 confimations before verifying...");
          await verifyFundMe(fundMe.target, [300]);
      } else {
          console.log("Skipping verification on non-mainnet network");
      }
  });

async function verifyFundMe(contractAddress, args) {
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
    });
}
