// // test/Box.test.js
// // Load dependencies
// const { expect } = require('chai');
// // const { accounts, contract } = require('@openzeppelin/test-environment');

// // Import utilities from Test Helpers
// const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// // Load compiled artifacts
// //Truffle/Chai syntax - 
// const Box = artifacts.require('Box');
// //Web3.js syntax
// // const Box = contract.fromArtifact('Box');


// // Start test block
// // Start test block
// contract('Box', async function ([ owner, other ]) {
//     // Use large integers ('big numbers')
//     const value = new BN('42');
  
//     beforeEach(async function () {
//       this.box = await Box.new({ from: owner });
//     });
  
//     it('retrieve returns a value previously stored', async function () {
//       await this.box.store(value, { from: owner });
  
//       // Use large integer comparisons
//       expect(await this.box.retrieve()).to.be.bignumber.equal(value);
//     });
  
//     it('store emits an event', async function () {
//       const receipt = await this.box.store(value, { from: owner });
  
//       // Test that a ValueChanged event was emitted with the new value
//       expectEvent(receipt, 'ValueChanged', { value: value });
//     });
  
//     it('non owner cannot store a value', async function () {
//       // Test a transaction reverts
//       await expectRevert(
//         this.box.store(value, { from: other }),
//         'Ownable: caller is not the owner',
//       );
//     });
//   });
  