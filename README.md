# arb-ftm
<!-- Not working...
yarn add  @openzeppelin/test-environment --dev
yarn add --dev jest
yarn add truffle --dev 
-->

yarn add hardhat --dev
yarn add @openzeppelin/contracts --dev
yarn add chai --dev
yarn add @nomiclabs/hardhat-ethers ethers --dev
yarn add @openzeppelin/test-helpers --dev
yarn add @nomiclabs/hardhat-web3 web3 --dev 
yarn add @nomiclabs/hardhat-truffle5 --dev

npx hardhat compile
npm install @defi-wonderland/smock
npx hardhat test 
npx hardhat run --network localhost ./scripts/index.js
npx hardhat console --network localhost
npx hardhat run --network localhost scripts/deploy.js
npx hardhat node

=======

npx hardhat console --network rinkeby
accounts = await ethers.provider.listAccounts()
(await ethers.provider.getBalance('0xc10b0003a60e9841e712ae236e44d2919d37ab5a')).toString()

Deploy to Rinkeby:
npx hardhat run --network rinkeby scripts/deploy.js

Check it on Etherscan:
https://rinkeby.etherscan.io/address/0xE52509025760bc8c5B8486596aA3cf9BA3f485Ee

npx hardhat console --network rinkeby
const Box = await ethers.getContractFactory('Box');
const box = await Box.attach('0xE52509025760bc8c5B8486596aA3cf9BA3f485Ee');
await box.store(49);
(await box.retrieve()).toString()

To use a Forked version of Mainnet locally:
npx hardhat console --network hardhat
(await ethers.provider.getBalance('0x948DF972DBDDfCb2892448834d9e0eBafCF6129B')).toString()