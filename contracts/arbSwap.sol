pragma solidity >=0.6.0;

// "SPDX-License-Identifier: UNLICENSED"
// import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
// import "@uniswap/lib/contracts/libraries/Babylonian.sol";
// import "@uniswap/lib/contracts/libraries/TransferHelper.sol";

// import '@uniswap/v2-periphery/contracts/interfaces/IERC20.sol';
// import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
// import '@uniswap/v2-periphery/contracts/libraries/SafeMath.sol';
// import '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';

// import '../externalContracts/uniswap-core/interfaces/IUniswapV2Pair.sol';
import '../externalContracts/uniswap-lib/libraries/Babylonian.sol';
import '../externalContracts/uniswap-lib/libraries/TransferHelper.sol';

import '../externalContracts/uniswap-v2-periphery/interfaces/IERC20.sol';
// import '../externalContracts/uniswap-v2-periphery/interfaces/IUniswapV2Router02.sol';
// import '../externalContracts/uniswap-v2-periphery/UniswapV2Router02.sol';
import '../externalContracts/uniswap-v2-periphery/libraries/UniswapV2Library.sol';
import '../externalContracts/uniswap-v2-periphery/libraries/SafeMath.sol';

// import '@openzeppelin/contracts/utils/Strings.sol';
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract arbSwap {
    using SafeMath for uint256;

    // IUniswapV2Router02 public immutable router;
    address public immutable factory;
    IERC20 public DAI;

    // Emitted when an arb Succeeds
    event ArbPerformed(uint256 startValue, address[] path);

    constructor(address factory_) public {
        factory = factory_;
        // router = IUniswapV2Router02(router_);
        // DAI = IERC20(0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2);
    }

    /*
    Mainnet WETH: 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
    Mainnet DAI: 0x6b175474e89094c44da98b954eedeac495271d0f
    Kovan DAI: 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
    */

    struct arbParams {
        IERC20 startToken;
        uint256 amountIn;
        uint256 amountOutMin;
        uint256 balanceStart;
        address tokenA;
        address tokenB;
        uint256 balanceEnd;
    }

    function arb(address[] memory path, uint256 optimalTradeSize, uint256[] memory reservesExpected, uint256 expectedGas, uint256  deadline) public payable {
        arbParams memory arbP;

        arbP.startToken = IERC20(path[0]);

        arbP.amountIn = optimalTradeSize * uint(10)**arbP.startToken.decimals();

        //TODO: Figure out what to do here vv
        arbP.amountOutMin = 10000;//amountIn + expectedGas;

        arbP.balanceStart = arbP.startToken.balanceOf(msg.sender);

        require(
            reservesExpected.length == (path.length - 1)*2, "reservesExpected not set"
        );

        //First check the Reserves are as we expect them to be:
        //TODO: Pull out as Funtion and pass TokenA, TokenB, Expected REserve Toke A, Expected REserve Token B
        arbP.tokenA = path[0];
        arbP.tokenB = path[1];

        (uint256 reserveA, uint256 reserveB) = UniswapV2Library.getReserves(factory, arbP.tokenA, arbP.tokenB);

        require(
            reserveA == reservesExpected[0] && reserveB == reservesExpected[1],  
            string(abi.encodePacked("Reserves are not as expected: expectedA:", 
                    toString(reservesExpected[0]), ", actualA:", toString(reserveA), 
                    ", expectedB:", toString(reservesExpected[1]), ", actualB:", toString(reserveB)))
        );

        // require(
        //     arbP.startToken.approve(address(router), arbP.amountIn),
        //     "approve failed."
        // );

        // require(
        //     arbP.startToken.transferFrom(msg.sender, address(this), arbP.amountIn), "MC transferFrom failed."
        // );

        swapExactTokensForTokens(
            arbP.amountIn,
            arbP.amountOutMin,
            path,
            msg.sender,
            deadline //block.timestamp
        );

        arbP.balanceEnd = arbP.startToken.balanceOf(msg.sender);

        // require(
        //    arbP.balanceEnd > arbP.balanceStart, "Arb Failed: Not profitable"
        // );

        emit ArbPerformed(arbP.amountIn, path);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }


// //Uniswap code required to avoid Front running:

// import '@uniswap/lib/contracts/libraries/TransferHelper.sol';

// import './interfaces/IUniswapV2Router02.sol';
// import './libraries/UniswapV2Library.sol';
// import './libraries/SafeMath.sol';
// import './interfaces/IERC20.sol';
// // --- FROM UniswapV2Library.sol

//         // returns sorted token addresses, used to handle return values from pairs sorted in this order
//     function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
//         require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
//         (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
//         require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
//     }

//         // calculates the CREATE2 address for a pair without making any external calls
//     function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
//         (address token0, address token1) = sortTokens(tokenA, tokenB);
//         pair = address(uint(keccak256(abi.encodePacked(
//                 hex'ff',
//                 factory,
//                 keccak256(abi.encodePacked(token0, token1)),
//                 hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // init code hash
//             ))));
//     }

//     // fetches and sorts the reserves for a pair
//     function getReserves(address factory, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
//         (address token0,) = sortTokens(tokenA, tokenB);
//         (uint reserve0, uint reserve1,) = IUniswapV2Pair(pairFor(factory, tokenA, tokenB)).getReserves();
//         (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
//     }

// // --- FROM UniswapV2Router.sol ----
    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'UniswapV2Router: EXPIRED');
        _;
    }
    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] memory path,
        address to,
        uint deadline
    ) internal ensure(deadline) returns (uint[] memory amounts) {
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, to);
    }
}