const { DECIMAL, INITIAL_ANSWER, developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments,network }) => {

    if (developmentChains.includes(network.name)) {
        const { firstAccount } = await getNamedAccounts();
        const { deploy } = deployments;

        const MockV3Aggregator = await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true
        });

        console.log("MockV3Aggregator deployed to:", MockV3Aggregator.address);
    } else {
        console.log("environment is not local, mock contract deployment is skipped");
    }

};

module.exports.tags = ["all", "mock"];