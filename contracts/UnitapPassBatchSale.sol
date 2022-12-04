// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IUnitapPass.sol";

struct Batch {
    uint32 batchSize;
    uint32 soldCount;
    uint256 price;
}

contract UnitapPassBatchSale is Ownable {
    uint32 public constant MAX_SALE_COUNT = 2000;
    address unitapPass;
    uint32 public totalSoldCount;
    Batch[] public batches;

    constructor(address unitapPass_) Ownable() {
        unitapPass = unitapPass_;
    }

    event StartBatch(uint32 batchSize, uint256 price, uint256 batchIndex);
    event MultiMint(uint256 batchIndex, address to, uint32 count);

    error InvalidBatchSize();
    error CurrentBatchNotSoldOut();
    error CurrentBatchSoldOut();
    error InsufficientFunds();

    function startBatch(uint32 batchSize, uint256 price) public onlyOwner {
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

        batches.push(Batch(batchSize, 0, price));
        emit StartBatch(batchSize, price, batches.length - 1);
    }

    function multiMint(uint32 count, address to) public payable {
        Batch storage batch = batches[batches.length - 1];

        if (batch.soldCount + count > batch.batchSize)
            revert CurrentBatchSoldOut();
        if (msg.value < batch.price * count) revert InsufficientFunds();

        for (uint32 i = 0; i < count; i++) {
            IUnitapPass(unitapPass).safeMint(to);
        }

        batch.soldCount += count;
        totalSoldCount += count;

        emit MultiMint(batches.length - 1, to, count);
    }
}
