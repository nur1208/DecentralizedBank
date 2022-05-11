// const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

const privateKeys = process.env.PRIVATE_KEYS || "";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          privateKeys.split(","), // Array of account private keys
          `wss://rinkeby.infura.io/ws/v3/${process.env.INFURA_API_KEY}` // Url to an Ethereum Node
        );
      },
      // gas: 5000000,
      gasPrice: 5000000000, // 5 gwei
      network_id: 4,
      gas: 5000000,
      // gasPrice: 45000000000,
      confirmations: 2,
      // timeoutBlocks: 200,
      skipDryRun: false,
      websocket: true,
      timeoutBlocks: 50000,
      networkCheckTimeout: 1000000,
    },
  },
  contracts_build_directory: "../src/abis/",
  compilers: {
    solc: {
      version: "pragma",
      settings: {
        optimizer: {
          enabled: false,
          runs: 200,
        },
      },
    },
  },
};
