import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployUnitapPass } from "../scripts/deployers";
import { UnitapPass } from "../typechain-types";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Unitap Pass Base URI", async () => {
  let unitapPass: UnitapPass;
  let admin: SignerWithAddress;
  let owner0: SignerWithAddress;
  let owner1: SignerWithAddress;

  before(async () => {
    [admin, owner0, owner1] = await ethers.getSigners();
    unitapPass = await deployUnitapPass(admin);
  });

  it("should be able to mint tokenID 0", async () => {
    await unitapPass.connect(admin).safeMint(owner0.address);
    await unitapPass.connect(admin).safeMint(owner1.address);
  });

  it("Should have the correct owners", async () => {
    expect(await unitapPass.ownerOf(0)).to.equal(owner0.address);
    expect(await unitapPass.ownerOf(1)).to.equal(owner1.address);
  });

  it("should set the base URI", async () => {
    await unitapPass.setBaseURI("https://unitap.io/");
    expect(await unitapPass.baseURI()).to.equal("https://unitap.io/");
  });

  it("Should return the correct base URI for token 0", async () => {
    expect(await unitapPass.tokenURI(0)).to.equal("https://unitap.io/0");
  });

  it("Should return the correct base URI for token 1", async () => {
    expect(await unitapPass.tokenURI(1)).to.equal("https://unitap.io/1");
  });
});
