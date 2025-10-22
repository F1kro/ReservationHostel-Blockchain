// const { task } = require("hardhat/config");
// const fs = require("fs");
// const path = require("path");

// task("rooms", "Lihat daftar kamar atau tambah kamar baru")
//   .addOptionalParam("add", "Tambahkan kamar baru, format: 'Nama,HargaETH,Slot'")
//   .setAction(async (taskArgs, hre) => {
//     const contractPath = path.join(__dirname, "../artifacts/contracts/HotelReservation.sol/HotelReservation.json");
//     const artifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));
//     const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // sesuaikan kalau re-deploy

//     const [owner] = await hre.ethers.getSigners();
//     const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, artifact.abi, owner);

//     if (taskArgs.add) {
//       // Format: "Deluxe Room,0.05,5"
//       const [name, price, slots] = taskArgs.add.split(",");
//       console.log(`🛏️ Menambahkan kamar baru: ${name} | ${price} ETH | slot ${slots}`);

//       const tx = await contract.addRoom(name, hre.ethers.utils.parseEther(price), parseInt(slots));
//       await tx.wait();

//       console.log("✅ Kamar berhasil ditambahkan!");
//     } else {
//       const rooms = await contract.getAllRooms();
//       console.log(`\n🏨 Daftar Kamar (${rooms.length})`);
//       console.log("=".repeat(40));
//       rooms.forEach((r) => {
//         console.log(`ID: ${r.id} | ${r.name}`);
//         console.log(`💰 Harga : ${hre.ethers.utils.formatEther(r.priceWei)} ETH`);
//         console.log(`🏨 Slot  : ${r.slots}`);
//         console.log("-".repeat(40));
//       });
//     }
//   });const { task } = require("hardhat/config");
const fs = require("fs");
const path = require("path");

task("rooms", "Lihat daftar kamar")
  .setAction(async (taskArgs, hre) => {
    try {
      const provider = hre.network.provider; // provider Hardhat langsung

      // Ambil ABI kontrak dari artifacts
      const artifactPath = path.join(__dirname, "../artifacts/contracts/HotelReservation.sol/HotelReservation.json");
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      const abi = artifact.abi;

      // Ambil alamat kontrak (bisa simpan di file deployments.json)
      let CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // default localhost
      const deploymentsPath = path.join(__dirname, "../deployments.json");
      if (fs.existsSync(deploymentsPath)) {
        const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
        CONTRACT_ADDRESS = deployments.HotelReservation?.address || CONTRACT_ADDRESS;
      }

      // Temukan signature function getAllRooms
      const getAllRoomsAbi = abi.find(f => f.name === "getAllRooms");
      const iface = new hre.ethers.utils.Interface([getAllRoomsAbi]);
      const data = iface.encodeFunctionData("getAllRooms");

      // Panggil kontrak via JSON-RPC
      const resultHex = await provider.request({
        method: "eth_call",
        params: [
          {
            to: CONTRACT_ADDRESS,
            data: data,
          },
          "latest"
        ],
      });

      const rooms = iface.decodeFunctionResult("getAllRooms", resultHex)[0];

      if (!rooms || rooms.length === 0) {
        console.log("⚠️ Belum ada kamar di sistem!");
        return;
      }

      console.log(`\n🏨 Daftar Kamar (${rooms.length})`);
      console.log("=".repeat(50));

      rooms.forEach((r) => {
        console.log(`🆔 ID: ${r.id.toString()}`);
        console.log(`🏠 Nama : ${r.name}`);
        console.log(`💰 Harga: ${hre.ethers.utils.formatEther(r.priceWei)} ETH`);
        console.log(`📦 Slot : ${r.slots.toString()}`);
        console.log("-".repeat(50));
      });

    } catch (err) {
      console.error("❌ Gagal load rooms:", err.message);
    }
  });
