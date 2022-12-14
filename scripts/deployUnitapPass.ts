import hre, { ethers } from "hardhat";

async function deployAll() {
  const [admin] = await ethers.getSigners();
  const salesPrice = ethers.utils.parseEther("0.001");
  //   const UnitapPassFactory = await ethers.getContractFactory("UnitapPass");
  //   const unitapPass = await UnitapPassFactory.deploy();

  //   await unitapPass.deployed();

  //   console.log("UnitapPass deployed to ", unitapPass.address);

  const UnitapPassBatchSaleFactory = await ethers.getContractFactory(
    "UnitapPassBatchSale"
  );

  const args = [
    "0x904018a4e9905021C1806A054E6EbD5796570131",
    admin.address,
    salesPrice,
  ];

  //@ts-ignore
  const unitapPassBatchSale = await UnitapPassBatchSaleFactory.deploy(...args);
  await unitapPassBatchSale.deployed();

  let unitapPass = await ethers.getContractAt(
    "UnitapPass",
    "0x904018a4e9905021C1806A054E6EbD5796570131"
  );

  console.log("UnitapPassBatchSale deployed to: ", unitapPassBatchSale.address);

  //   const grantRole = await unitapPass.grantRole(
  //     await unitapPass.MINTER_ROLE(),
  //     unitapPassBatchSale.address
  //   );
  //   await grantRole.wait(1);
  //   console.log("MINTER_ROLE granted to UnitapPassBatchSale");

  const revokeRole = await unitapPass.revokeRole(
    await unitapPass.MINTER_ROLE(),
    "0x396723407c96de81e138BA951308Af79dD9A5AA1"
  );
  await revokeRole.wait(1);

  console.log("MINTER_ROLE renounced");

  //   await hre.run("verify:verify", {
  //     address: "0x904018a4e9905021C1806A054E6EbD5796570131",
  //     constructorArguments: [],
  //   });

  await hre.run("verify:verify", {
    address: "0xC99B2Fa525E1a0C17dB4fdE3540faA1575885A8B",
    constructorArguments: args,
  });
}

deployAll().then().catch(console.log);
