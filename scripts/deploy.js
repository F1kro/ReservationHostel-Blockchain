const hre = require("hardhat");

async function main() {
  const HotelReservation = await hre.ethers.getContractFactory("HotelReservation");
  const hotel = await HotelReservation.deploy();
  await hotel.deployed();

  console.log(`✅ HotelReservation deployed to: ${hotel.address}`);
  console.log("🏨 Sample rooms added successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
