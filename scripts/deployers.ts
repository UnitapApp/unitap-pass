import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
export async function deployUnitapPass(admin: SignerWithAddress) {
  const UnitapPassFactory = await ethers.getContractFactory("UnitapPass");
  const unitapPass = await UnitapPassFactory.connect(admin).deploy();
  await unitapPass.deployed();

  return unitapPass;
}

export async function deployUnitapBatchSale(
  admin: SignerWithAddress,
  unitapPassAddress: string,
  safeAddress: string,
  price: BigNumber
) {
  const UnitapPassBatchSaleFactory = await ethers.getContractFactory(
    "UnitapPassBatchSale"
  );
  const unitapPassBatchSale = await UnitapPassBatchSaleFactory.connect(
    admin
  ).deploy(unitapPassAddress, safeAddress, price);
  await unitapPassBatchSale.deployed();

  return unitapPassBatchSale;
}
