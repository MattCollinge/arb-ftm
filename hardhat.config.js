/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-truffle5");

const { rinkeby_alchemyApiKey, rinkeby_mnemonic, mainnet_alchemyApiKey } = require('./secrets.json');

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.6",
      },
      // {
      //   version: "0.8.0",
      // },
      {
        version: "0.5.1"
      }
    ],
  },
  networks: {
       rinkeby: {
         url: `https://eth-rinkeby.alchemyapi.io/v2/${rinkeby_alchemyApiKey}`, 
         accounts: { mnemonic: rinkeby_mnemonic },
       },
       hardhat: {
        forking: {
          url: `https://eth-mainnet.alchemyapi.io/v2/${mainnet_alchemyApiKey}`,
          blockNumber: 14063561,
        },
        // gas: 28000000,
        // gasPrice: 124738040282
      }
  }
}
  