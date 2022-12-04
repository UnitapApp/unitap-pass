import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export async function deployUnitapPass(admin: SignerWithAddress) {
  const UnitapPassFactory = await ethers.getContractFactory("UnitapPass");
  const unitapPass = await UnitapPassFactory.connect(admin).deploy();
  await unitapPass.deployed();

  return unitapPass;
}
