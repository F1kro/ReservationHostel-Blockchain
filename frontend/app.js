
(async function () {
  const connectButton = document.getElementById("connectButton");
  const accountSpan = document.getElementById("account");
  const roomsDiv = document.getElementById("rooms");
  const myReservationsDiv = document.getElementById("myReservations");

  let provider, signer, contract;

  const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const CONTRACT_ABI = [
    {
      inputs: [],
      name: "getAllRooms",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "string", name: "name", type: "string" },
            { internalType: "uint256", name: "priceWei", type: "uint256" },
            { internalType: "uint256", name: "slots", type: "uint256" },
            { internalType: "bool", name: "exists", type: "bool" },
          ],
          internalType: "struct HotelReservation.Room[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMyReservations",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "uint256", name: "roomId", type: "uint256" },
            { internalType: "address", name: "user", type: "address" },
            { internalType: "uint256", name: "fromTimestamp", type: "uint256" },
            { internalType: "uint256", name: "toTimestamp", type: "uint256" },
            { internalType: "bool", name: "active", type: "bool" },
          ],
          internalType: "struct HotelReservation.Reservation[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "roomId", type: "uint256" },
        { internalType: "uint256", name: "fromTimestamp", type: "uint256" },
        { internalType: "uint256", name: "toTimestamp", type: "uint256" },
      ],
      name: "reserve",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "reservationId", type: "uint256" }],
      name: "checkout",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  async function connect() {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    if (network.chainId !== 31337) {
      alert("⚠️ Harap konek ke jaringan lokal Hardhat (chainId 31337).");
      return;
    }

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    accountSpan.textContent = await signer.getAddress();

    await loadRooms();
    await loadMyReservations(); // 🧾
  }

  async function loadRooms() {
    const rooms = await contract.getAllRooms();
    roomsDiv.innerHTML = "";
    rooms.forEach((room) => {
      if (!room.exists) return;
      const div = document.createElement("div");
      div.className = "bg-white shadow p-4 rounded-xl";
      div.innerHTML = `
        <h3 class="text-lg font-bold">${room.name}</h3>
        <p>💰 ${ethers.utils.formatEther(room.priceWei)} ETH / malam</p>
        <p>🏨 Slot tersedia: ${room.slots}</p>
        <button onclick="bookRoom(${room.id}, '${room.priceWei}')" class="mt-2 bg-blue-600 text-white px-3 py-2 rounded-lg">Pesan</button>
      `;
      roomsDiv.appendChild(div);
    });
  }

  window.bookRoom = async function (roomId, priceWei) {
    const nights = prompt("Berapa malam?");
    if (!nights || isNaN(nights)) return;
    const now = Math.floor(Date.now() / 1000);
    const to = now + nights * 86400;
    const tx = await contract.reserve(roomId, now, to, {
      value: ethers.BigNumber.from(priceWei).mul(nights),
    });
    await tx.wait();
    alert("✅ Berhasil reservasi!");
    await loadRooms();
    await loadMyReservations();
  };

  async function loadMyReservations() {
    const list = await contract.getMyReservations();
    myReservationsDiv.innerHTML = list.length ? "" : "<p>Belum ada reservasi.</p>";
    list.forEach((r) => {
      const checkIn = new Date(r.fromTimestamp * 1000).toLocaleString();
      const checkOut = new Date(r.toTimestamp * 1000).toLocaleString();
      const card = document.createElement("div");
      card.className = "bg-gray-100 p-3 rounded-lg mb-2";
      card.innerHTML = `
        <p>🛏️ Room ID: ${r.roomId}</p>
        <p>📅 ${checkIn} - ${checkOut}</p>
        <p>Status: ${r.active ? "Aktif ✅" : "Selesai 💤"}</p>
        ${
          r.active
            ? `<button class="bg-red-600 text-white px-2 py-1 rounded mt-2" onclick="checkout(${r.id})">Checkout</button>`
            : ""
        }
      `;
      myReservationsDiv.appendChild(card);
    });
  }

  window.checkout = async function (id) {
    const tx = await contract.checkout(id);
    await tx.wait();
    alert("🏁 Checkout berhasil!");
    await loadRooms();
    await loadMyReservations();
  };

  connectButton.addEventListener("click", connect);
})();
