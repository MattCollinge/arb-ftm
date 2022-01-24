// MIT License
// Copyright (c) 2021 Dũng Trần a.k.a Chiro Hiro <chiro8x@gmail.com>

const hre = require('hardhat');


async function unlockSigner(address) {
  
      await hre.network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [address]
      })
      const signer = await hre.ethers.provider.getSigner(address)
    
    return signer;
}

module.exports = {unlockSigner: unlockSigner}