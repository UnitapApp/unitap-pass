import { UnitapPass, UnitapPassBatchSale } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { deployUnitapBatchSale, deployUnitapPass } from "../scripts/deployers";
import { expect } from "chai";

describe("Batch Sale", async () => {
  let unitapPassBatchSale: UnitapPassBatchSale;
  let unitapPass: UnitapPass;

  let adminUnitapPass: SignerWithAddress;
  let adminUnitapPassBatchSale: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let safe: SignerWithAddress;

  before(async () => {
    [adminUnitapPass, adminUnitapPassBatchSale, user1, user2, safe] =
      await ethers.getSigners();
    unitapPass = await deployUnitapPass(adminUnitapPass);
    unitapPassBatchSale = await deployUnitapBatchSale(
      adminUnitapPassBatchSale,
      unitapPass.address,
      safe.address
    );
  });

  it("should grant minter role to batch sale contract", async () => {
    await unitapPass
      .connect(adminUnitapPass)
      .grantRole(unitapPass.MINTER_ROLE(), unitapPassBatchSale.address);
  });

  it("should start a batch with size 100", async () => {
    await unitapPassBatchSale
      .connect(adminUnitapPassBatchSale)
      .startBatch(100, ethers.utils.parseEther("0.01"));
  });

  it("should mint 90 tokens for user 1", async () => {
    // call multiMint function on batch sale contract and send 90*0.01 ether to it
    await unitapPassBatchSale
      .connect(user1)
      .multiMint(90, user1.address, { value: ethers.utils.parseEther("0.9") });

    // check that user 1 has 90 tokens
    expect(await unitapPass.balanceOf(user1.address)).to.equal(90);
  });

  it("should not be able to start new batch while one is active", async () => {
    await expect(
      unitapPassBatchSale
        .connect(adminUnitapPassBatchSale)
        .startBatch(100, ethers.utils.parseEther("0.01"))
    ).to.be.revertedWithCustomError(
      unitapPassBatchSale,
      "CurrentBatchNotSoldOut"
    );
  });

  it("should mint 10 tokens for user 2", async () => {
    // call multiMint function on batch sale contract and send 10*0.01 ether to it
    await unitapPassBatchSale
      .connect(user2)
      .multiMint(10, user2.address, { value: ethers.utils.parseEther("0.1") });

    // check that user 2 has 10 tokens
    expect(await unitapPass.balanceOf(user2.address)).to.equal(10);
  });

  it("should not be able to mint more tokens", async () => {
    // call multiMint function on batch sale contract and send 1 ether to it
    await expect(
      unitapPassBatchSale
        .connect(user1)
        .multiMint(1, user1.address, { value: ethers.utils.parseEther("1") })
    ).to.be.revertedWithCustomError(unitapPassBatchSale, "CurrentBatchSoldOut");
  });

  it("should be able to start new batch", async () => {
    await unitapPassBatchSale
      .connect(adminUnitapPassBatchSale)
      .startBatch(100, ethers.utils.parseEther("0.01"));
  });

  it("should be able to mint 100 tokens for user 1", async () => {
    // call multiMint function on batch sale contract and send 100*0.01 ether to it
    await unitapPassBatchSale
      .connect(user1)
      .multiMint(100, user1.address, { value: ethers.utils.parseEther("1") });

    // check that user 1 has 100 tokens
    expect(await unitapPass.balanceOf(user1.address)).to.equal(190);
    expect(await unitapPassBatchSale.totalSoldCount()).to.equal(200);
  });

  it("should get total sold value", async () => {
    expect(await unitapPassBatchSale.totalSoldValue()).to.equal(
      ethers.utils.parseEther("2")
    );
  });

  it("should be able to withdraw funds", async () => {
    const safeBalanceBefore = await ethers.provider.getBalance(safe.address);

    // withdraw funds
    await unitapPassBatchSale.connect(adminUnitapPassBatchSale).withdrawETH();

    // get balance of admin after withdraw
    const safeBalanceAfter = await ethers.provider.getBalance(safe.address);

    // check that admin balance increased
    expect(safeBalanceAfter).to.be.eq(
      safeBalanceBefore.add(ethers.utils.parseEther("2"))
    );
  });
});
