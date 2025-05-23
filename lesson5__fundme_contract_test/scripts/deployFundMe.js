const { ethers } = require("hardhat");

async function main() {
    const foundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("Deploying FundMe...");

    const foundMe = await foundMeFactory.deploy(180);
    await foundMe.waitForDeployment();  
    console.log("Contract deployed to:", foundMe.target);


    if (hre.network.config.chainId === 11155111 && process.env.ETHER_API_KEY) {
        console.log("waiting for 5 confimations before verifying...")
        await foundMe.deploymentTransaction().wait(5);

        await verifyFundMe(foundMe.target, [180]);
    } else {
        console.log("Skipping verification on non-mainnet network");
    }

}

async function verifyFundMe(contractAddress, args) {
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
    });
}

main().then().catch((error) => {
    console.error(error);
    process.exit(1);
});