require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("./tasks/deploy-fundme");
require("./tasks/interact-contract");
require("hardhat-deploy");

require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy-ethers");

SEPOLIA_URL = process.env.SEPOLIA_URL;
PRIVATE_KEY = process.env.PRIVATE_KEY;
PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;
ETHER_API_KEY = process.env.ETHER_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      chainId: 11155111,
    }
  },
  etherscan: {
    apiKey:{
      sepolia:ETHER_API_KEY
    }
  },
  namedAccounts: {
    firstAccount: {
      default: 0,
    },
    secondAccount: {
      default: 1,
    },
  },

};
