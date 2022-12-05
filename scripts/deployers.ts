import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export async function deployUnitapPass(admin: SignerWithAddress) {
  const UnitapPassFactory = await ethers.getContractFactory("UnitapPass");
  const unitapPass = await UnitapPassFactory.connect(admin).deploy();
  await unitapPass.deployed();

  return unitapPass;
}

export async function deployUnitapBatchSale(
  admin: SignerWithAddress,
  unitapPassAddress: string,
  safeAddress: string
) {
  const UnitapPassBatchSaleFactory = await ethers.getContractFactory(
    "UnitapPassBatchSale"
  );
  const unitapPassBatchSale = await UnitapPassBatchSaleFactory.connect(
    admin
  ).deploy(unitapPassAddress, safeAddress);
  await unitapPassBatchSale.deployed();

  return unitapPassBatchSale;
}
