const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const HotelReservation = await hre.ethers.getContractFactory("HotelReservation");
  const hotel = await HotelReservation.deploy();
  await hotel.deployed();

  console.log(`✅ HotelReservation deployed to: ${hotel.address}`);
  console.log("🏨 Sample rooms added successfully!");

  // Write address + ABI to frontend folder if exists
  const frontendDir = path.join(__dirname, "..", "frontend");
  try {
    if (!fs.existsSync(frontendDir)) {
      console.warn("frontend folder not found, skipping writing address/abi files.");
      return;
    }

    // address
    const addressOutput = {
      address: hotel.address
    };
    fs.writeFileSync(path.join(frontendDir, "contract-address.json"), JSON.stringify(addressOutput, null, 2));
    console.log("➡️ Wrote frontend/contract-address.json");

    // ABI
    const abi = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "artifacts", "contracts", "HotelReservation.sol", "HotelReservation.json"), "utf8")).abi;
    fs.writeFileSync(path.join(frontendDir, "contract-abi.json"), JSON.stringify(abi, null, 2));
    console.log("➡️ Wrote frontend/contract-abi.json");
  } catch (err) {
    console.error("Failed to write frontend files:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
