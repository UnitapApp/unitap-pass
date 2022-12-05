// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IUnitapPass.sol";

struct Batch {
    uint32 batchSize;
    uint32 soldCount;
}

contract UnitapPassBatchSale is Ownable {
    uint32 public constant MAX_SALE_COUNT = 2000;

    address public unitapPass;
    address public safe; // all funds will be withdrawn to this address

    uint32 public totalSoldCount;
    uint256 public price;

    Batch[] public batches;

    constructor(
        address unitapPass_,
        address safe_,
        uint256 price_
    ) Ownable() {
        unitapPass = unitapPass_;
        safe = safe_;
        price = price_;
    }

    event StartBatch(uint32 batchSize, uint256 batchIndex);
    event MultiMint(uint256 batchIndex, address to, uint32 count);
    event WithdrawETH(uint256 amount, address to);

    error InvalidBatchSize();
    error CurrentBatchNotSoldOut();
    error CurrentBatchSoldOut();
    error InsufficientFunds();

    function startBatch(uint32 batchSize) external onlyOwner {
        if (totalSoldCount + batchSize > MAX_SALE_COUNT) {
            revert InvalidBatchSize();
        }

        // if current batch is not sold out, then we can't start a new batch
        if (batches.length > 0) {
            Batch storage currentBatch = batches[batches.length - 1];
            if (currentBatch.soldCount < currentBatch.batchSize) {
                revert CurrentBatchNotSoldOut();
            }
        }

        batches.push(Batch(batchSize, 0));
        emit StartBatch(batchSize, batches.length - 1);
    }

    function multiMint(uint32 count, address to) public payable {
        Batch storage batch = batches[batches.length - 1];

        if (batch.soldCount + count > batch.batchSize)
            revert CurrentBatchSoldOut();

        uint256 totalValue = price * count;

        if (msg.value < totalValue) revert InsufficientFunds();

        for (uint32 i = 0; i < count; i++) {
            IUnitapPass(unitapPass).safeMint(to);
        }

        batch.soldCount += count;
        totalSoldCount += count;

        // refund extra ETH
        if (msg.value > totalValue) {
            payable(msg.sender).transfer(msg.value - totalValue);
        }

        emit MultiMint(batches.length - 1, to, count);
    }

    function withdrawETH() external {
        uint256 amount = address(this).balance;
        payable(safe).transfer(amount);
        emit WithdrawETH(amount, safe);
    }
}
