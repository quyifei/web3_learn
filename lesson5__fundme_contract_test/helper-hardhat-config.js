const DECIMAL= 8;
const INITIAL_ANSWER = 250000000000;
const developmentChains = ["hardhat", "local"]
const LOCK_TIME = 180
const CONFIRMATIONS = 5;


const networkConfig = {
    11155111: {
        ethUsdDataFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    
}

module.exports = {
    DECIMAL,
    LOCK_TIME,
    CONFIRMATIONS,
    INITIAL_ANSWER,
    networkConfig,
    developmentChains
}