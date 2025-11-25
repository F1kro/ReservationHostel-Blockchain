const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // ganti
  const newAdmin = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // ganti

  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("HotelReservation", contractAddress, deployer);

  const tx = await contract.addAdmin(newAdmin);
  await tx.wait();
  console.log("✅ Added admin:", newAdmin);
}

main().catch((err) => { console.error(err); process.exit(1); });
