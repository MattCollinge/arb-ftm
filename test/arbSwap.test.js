// test/Box.test.js
// Load dependencies
const { expect } = require('chai');
// const { accounts, contract } = require('@openzeppelin/test-environment');

// Import utilities from Test Helpers
const { BN, ether, expectEvent, expectRevert, balance } = require('@openzeppelin/test-helpers');

const unlockSigner = require('./hardhat-unlock-signer');

// Load compiled artifacts
//Truffle/Chai syntax - 
const ArbSwap = artifacts.require('arbSwap');
const ForceSend = artifacts.require('ForceSend');
//Web3.js syntax
// const Box = contract.fromArtifact('Box');

// https://ethereum.stackexchange.com/questions/104030/testing-token-with-uniswap-liquidity-provisioning-using-hardhat

// Start test block
contract('arbSwap', async function ([ owner, other ]) {
    // Use large integers ('big numbers')
    const value = new BN('42');

    const { factory_address, factory_abi} = require('./contracts/UniswapV2_Factory'); //'0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
    const { router_address, router_abi} = require('./contracts/UniswapV2_Router02');
    const { weth_address, weth_abi} = require('./contracts/WETH');
    const { dai_address, dai_abi} = require('./contracts/DAI');
    const { usdc_address, usdc_abi} = require('./contracts/USDC');
    
    console.log('Factory Address - MC:',factory_address);
    
    const factory = new ethers.Contract(factory_address, factory_abi);
    const router = new ethers.Contract(router_address, router_abi);
    
    

    beforeEach(async function () {
      this.arbSwap = await ArbSwap.new(factory_address, { from: owner });
      // this.forceSend = await ForceSend.new({ from: owner });
      [this.addr, this.addr2] = await ethers.getSigners();
      
      this.weth_signer = await unlockSigner.unlockSigner(weth_address);
      this.weth = await new ethers.Contract(weth_address, weth_abi, this.weth_signer);
      this.dai_signer = await unlockSigner.unlockSigner(dai_address);
      this.dai = await new ethers.Contract(dai_address, dai_abi, this.dai_signer);
    });
  
    it('can elevate signer and add tokens', async function () {
      

      const weth_signer = this.weth_signer;
      const weth = this.weth;

      const dai_signer = this.dai_signer;
      const dai = this.dai;

      
      // console.log(await dai.symbol());
      // console.log(await dai.decimals());
      const addr = this.addr;
      const addr2 = this.addr2;

      console.log(`Address: addr - ${addr.address}`);
      console.log(`Address: addr2 - ${addr2.address}`);

      console.log(`Address: addr - DAI Balance: ${await dai.balanceOf(addr.address)}`);
      console.log(`Address: addr2 - DAI Balance: ${await dai.balanceOf(addr2.address)}`);
      console.log(`Address: addr - WETH Balance: ${await weth.balanceOf(addr.address)}`);
      console.log(`Address: addr2 - WETH Balance: ${await weth.balanceOf(addr2.address)}`);
      console.log(`Address: addr - ETH Balance: ${await balance.current(addr.address)}`);
      console.log(`Address: addr2 - ETH Balance: ${await balance.current(addr2.address)}`);

      //Use hack to get eth into dai contract address for gas
      const forceSend = await ForceSend.new();
      await forceSend.go(dai.address, { value: ether('100') });
      const ethBalance = await balance.current(dai.address);
      const eb = new BN(ethBalance);
      expect(eb).to.be.bignumber.least(new BN(ether('100')));
   
       //Use hack to get eth into weth contract address for gas
       await forceSend.go(weth.address, { value: ether('100') });
       const weth_ethBalance = await balance.current(weth.address);
       const w_eb = new BN(weth_ethBalance);
       expect(w_eb).to.be.bignumber.least(new BN(ether('100')));
    
      
      // // Verify dai balance
      const daiBalance = await dai.balanceOf(addr.address);
      // console.log(`daiBalance raw: ${daiBalance.toString()}, type: ${typeof(daiBalance)}`);
      const db = new BN(daiBalance.toString());
      // console.log(`daiBalance: ${db}`);
      expect(db).to.be.bignumber.least(ether('1'));

      await dai.transfer(addr2.address, ether('3').toString())
      await weth.transfer(addr.address, ether('61').toString())

          //.send({ from: addr.address, gasLimit: 800000 });
        const daiBalance2 = await dai.balanceOf(addr2.address);
        expect(new BN(daiBalance2.toString())).to.be.bignumber.least(ether('1'));

        const wethBalance2 = await weth.balanceOf(addr.address);
        expect(new BN(wethBalance2.toString())).to.be.bignumber.least(ether('60'));
      
      // }


      // await dai.increaseAllowance(addr.address, "1000");
      console.log(`just before mint`);
      await dai_signer.sendTransaction({
        to: addr2.address,
        // from: addr.address,
        value: ethers.utils.parseEther("0.07")
      });

        // (dai_address).mint(addr.address, "999");

      await dai.transfer(addr.address, ether('1000').toString())
      // .send({ from: dai.address, gasLimit: 800000 });

      console.log(`just after mint`);

      console.log(`Address: addr - DAI Balance: ${await dai.balanceOf(addr.address)}`);
      console.log(`Address: addr2 - DAI Balance: ${await dai.balanceOf(addr2.address)}`);
      console.log(`Address: addr - WETH Balance: ${await weth.balanceOf(addr.address)}`);
      console.log(`Address: addr2 - WETH Balance: ${await weth.balanceOf(addr2.address)}`);
      console.log(`Address: addr - ETH Balance: ${await balance.current(addr.address)}`);
      console.log(`Address: addr2 - ETH Balance: ${await balance.current(addr2.address)}`);
     
      // expect(await strategy.deposit(1)).to.be.ok;

    //  const receipt = await this.arbSwap.arb(path, optimalTradeSize, reservesExpected, expectedGas, deadline, { from: owner });
  
      // Use large integer comparisons
      // expectEvent(receipt, 'ArbPerformed', { before: value, after: value + 1 });

    const ownerBalance = await dai.balanceOf(addr2.address);
    // console.log(`Owner Balance: ${ownerBalance}`);
    expect(new BN(ownerBalance.toString())).to.be.bignumber.equal(ether("3"));
    });
  
    it('can perform an arb swap', async function () {
      //Set up

      const addr = this.addr;
      const addr2 = this.addr2;

      const weth_signer = this.weth_signer;
      const weth = this.weth;

      const dai_signer = this.dai_signer;
      const dai = this.dai;


      // WETH-> DAI
      // const path = ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x6b175474e89094c44da98b954eedeac495271d0f', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'];
      
      // const path = [weth_address, dai_address, usdc_address, weth_address];
      // const reservesExpected = [new BN('4822051237679429732377'),new BN('11723202476225523304899155'),new BN('11723202476225523304899155'), new BN('11723202476225523304899155'), new BN('11723202476225523304899155'), new BN('4822051237679429732377')];
      
      const path = [weth_address, usdc_address, dai_address, weth_address];
      const reservesExpected = [new BN('43540953938637873393098'),new BN('105489637510017'),new BN('11723202476225523304899155'), new BN('11723202476225523304899155'), new BN('11723202476225523304899155'), new BN('4822051237679429732377')];
      
      // DAI -> WETH
      // const path = ['0x6b175474e89094c44da98b954eedeac495271d0f', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'];
      // const reservesExpected = [new BN('11723202476225523304899155'),new BN('4822051237679429732377'),321,212];
      
      const optimalTradeSize = 2;
      const expectedGas = 120;
      const deadline = (await ethers.provider.getBlock()).timestamp + 20000;

      // console.log(`Block: ${(await ethers.provider.getBlock()).toString()}`)
      console.log(`Deadline: ${deadline}`);

      await dai.connect(addr).approve(this.arbSwap.address, ether("35").toString());
      await weth.connect(addr).approve(this.arbSwap.address, ether("61000000000000000000").toString());
  
      //TODO: This is where it is broken vvvvvv
      console.log(`Address: addr - ${addr.address}`);

      console.log(`Address: addr - WETH Balance: ${await weth.balanceOf(addr.address)}`);
      console.log(`Address: addr - DAI Balance: ${await dai.balanceOf(addr.address)}`);
      console.log(`Address: addr - ETH Balance: ${await balance.current(addr.address)}`);

      //Execute
      const receipt = await this.arbSwap.arb(path, new BN('61'), reservesExpected, expectedGas, deadline, { from: addr.address });
      // ether(optimalTradeSize.toString())

      //Validate
      expectEvent(receipt, 'ArbPerformed', { startValue: new BN('61000000000000000000'), path: path});
      // expectEvent.inTransaction(receipt,'0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc', 'Swap');

      console.log(`Address: addr - WETH Balance: ${await weth.balanceOf(addr.address)}`);
      console.log(`Address: addr - DAI Balance: ${await dai.balanceOf(addr.address)}`);
      console.log(`Address: addr - ETH Balance: ${await balance.current(addr.address)}`);
     
    });

    // it('store emits an event', async function () {
    //   const receipt = await this.box.store(value, { from: owner });
  
    //   // Test that a ValueChanged event was emitted with the new value
    //   expectEvent(receipt, 'ValueChanged', { value: value });
    // });
  
    // it('non owner cannot store a value', async function () {
    //   // Test a transaction reverts
    //   await expectRevert(
    //     this.box.store(value, { from: other }),
    //     'Ownable: caller is not the owner',
    //   );
    // });
  });

  