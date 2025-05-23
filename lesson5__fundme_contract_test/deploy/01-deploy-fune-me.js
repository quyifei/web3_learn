const {developmentChains, networkConfig, LOCK_TIME, CONFIRMATIONS} = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts, deployments, network})=>{
    const {firstAccount} = await getNamedAccounts();
    const {deploy} = deployments;

    let dataFeedAddr;
    let confirmations;

    if(developmentChains.includes(network.name)){
        const MockV3Aggregator = await deployments.get("MockV3Aggregator");
        dataFeedAddr = MockV3Aggregator.address;
        confirmations = 0;
    }else{
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
        confirmations = CONFIRMATIONS;
    }
    

    await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: confirmations,
    });

    const fundMe = await deployments.get("FundMe");
    if (network.config.chainId === 11155111 && process.env.ETHER_API_KEY) {
        await verifyFundMe(fundMe.address, [LOCK_TIME,dataFeedAddr ]);
    } else {
        console.log("Skipping verification on non-mainnet network");
    }
    console.log("FundMe deployed to:", fundMe.address);

};

async function verifyFundMe(contractAddress, args) {
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
    });
}

module.exports.tags = ["all", "fundme"];