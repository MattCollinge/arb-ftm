// scripts/deploy.js
async function main () {
  // We get the contract to deploy
  // const Box = await ethers.getContractFactory('Box');
  // console.log('Deploying Box...');
  // const box = await Box.deploy();
  // await box.deployed();
  // console.log('Box deployed to:', box.address);

  const ArbSwap = await ethers.getContractFactory('arbSwap');
  console.log('Deploying arbSwap...');
  const factory = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
  const router= '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const arbSwap = await ArbSwap.deploy(factory, router);
  await arbSwap.deployed();
  console.log('arbSwap deployed to:', arbSwap.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });