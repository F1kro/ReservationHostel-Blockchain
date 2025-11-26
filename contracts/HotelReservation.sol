// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HotelReservation {

    // Struktur data untuk menyimpan informasi kamar
    struct Room {
        uint256 id;
        string name;
        uint256 priceWei;
        uint256 slots;
        bool exists;
        string[] facilities;
    }

    // Struktur data untuk menyimpan detail reservasi
    struct Reservation {
        uint256 id;
        uint256 roomId;
        address user;
        uint256 fromTimestamp;
        uint256 toTimestamp;
        bool active;
    }

    // Penyimpanan kamar berdasarkan ID
    mapping(uint256 => Room) public rooms;
    uint256 public roomCount;

    // Penyimpanan reservasi berdasarkan ID reservasi
    mapping(uint256 => Reservation) public reservations;
    uint256 public reservationCount;

    // Menyimpan daftar ID reservasi per user
    mapping(address => uint256[]) public reservationsByUser;

    // Penyimpanan admin
    mapping(address => bool) public admins;

    // Event untuk aktivitas dalam sistem
    event RoomAdded(uint256 indexed roomId, string name, uint256 priceWei, uint256 slots);
    event RoomUpdated(uint256 indexed roomId, string name, uint256 priceWei, uint256 slots);
    event RoomRemoved(uint256 indexed roomId);
    event Reserved(address indexed user, uint256 indexed roomId, uint256 reservationId);
    event Checkout(address indexed user, uint256 indexed reservationId);
    event AdminAdded(address indexed admin);
    event ProfileUpdated(address indexed user, string uri);

    // Hanya admin yang boleh menjalankan fungsi tertentu
    modifier onlyAdmin() {
        require(admins[msg.sender], "Hanya admin yang diizinkan");
        _;
    }

    constructor() {
        // Menetapkan deployer sebagai admin pertama
        admins[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    // ================================
    //       MANAJEMEN ADMIN
    // ================================
    function addAdmin(address _admin) external onlyAdmin {
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    function isAdmin(address _addr) external view returns (bool) {
        return admins[_addr];
    }

    // ================================
    //     PROFILE PENGGUNA (SIMPLE)
    // ================================
    mapping(address => string) private profiles;

    // Menyimpan URI foto profil
    function setProfilePic(string calldata uri) external {
        profiles[msg.sender] = uri;
        emit ProfileUpdated(msg.sender, uri);
    }

    function getProfilePic(address _addr) external view returns (string memory) {
        return profiles[_addr];
    }

    // ================================
    //      CRUD KAMAR (HANYA ADMIN)
    // ================================
    function addRoom(string memory name, uint256 priceWei, uint256 slots, string[] memory _facilities) public onlyAdmin {
        roomCount++;
        Room storage r = rooms[roomCount];
        r.id = roomCount;
        r.name = name;
        r.priceWei = priceWei;
        r.slots = slots;
        r.exists = true;

        // Menyalin daftar fasilitas
        for (uint i = 0; i < _facilities.length; i++) {
            r.facilities.push(_facilities[i]);
        }

        emit RoomAdded(roomCount, name, priceWei, slots);
    }

    function editRoom(uint256 roomId, string memory name, uint256 priceWei, uint256 slots, string[] memory _facilities) public onlyAdmin {
        require(rooms[roomId].exists, "Kamar tidak ditemukan");

        rooms[roomId].name = name;
        rooms[roomId].priceWei = priceWei;
        rooms[roomId].slots = slots;

        // Mengganti fasilitas lama
        delete rooms[roomId].facilities;
        for (uint i = 0; i < _facilities.length; i++) {
            rooms[roomId].facilities.push(_facilities[i]);
        }

        emit RoomUpdated(roomId, name, priceWei, slots);
    }

    function removeRoom(uint256 roomId) public onlyAdmin {
        require(rooms[roomId].exists, "Kamar tidak ditemukan");
        rooms[roomId].exists = false;

        emit RoomRemoved(roomId);
    }

    // Mengambil semua kamar (hasil berupa array seluruh Room)
    function getAllRooms() public view returns (Room[] memory) {
        Room[] memory list = new Room[](roomCount);
        for (uint256 i = 1; i <= roomCount; i++) {
            list[i - 1] = rooms[i];
        }
        return list;
    }

    // ================================
    //        SISTEM RESERVASI
    // ================================
    function reserve(uint256 roomId, uint256 fromTimestamp, uint256 toTimestamp) external payable {
        Room storage room = rooms[roomId];
        require(room.exists, "Kamar tidak ditemukan");
        require(room.slots > 0, "Slot tidak tersedia");
        require(msg.value >= room.priceWei, "Pembayaran tidak cukup");

        // Kurangi slot kamar
        room.slots--;

        reservationCount++;
        reservations[reservationCount] = Reservation({
            id: reservationCount,
            roomId: roomId,
            user: msg.sender,
            fromTimestamp: fromTimestamp,
            toTimestamp: toTimestamp,
            active: true
        });

        // Catat reservasi berdasarkan user
        reservationsByUser[msg.sender].push(reservationCount);

        emit Reserved(msg.sender, roomId, reservationCount);
    }

    // Checkout hanya boleh dilakukan oleh pemilik reservasi
    function checkout(uint256 reservationId) public {
        Reservation storage r = reservations[reservationId];
        require(r.user == msg.sender, "Anda bukan pemilik reservasi");
        require(r.active, "Reservasi sudah tidak aktif");

        r.active = false;

        // Slot kamar dikembalikan
        rooms[r.roomId].slots++;

        emit Checkout(msg.sender, reservationId);
    }

    // Mendapatkan semua reservasi milik address pemanggil
    function getMyReservations() public view returns (Reservation[] memory) {
        uint256[] storage ids = reservationsByUser[msg.sender];
        Reservation[] memory list = new Reservation[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = reservations[ids[i]];
        }

        return list;
    }

    // Admin dapat mengambil semua reservasi yang ada
    function getAllReservations() external view onlyAdmin returns (Reservation[] memory) {
        Reservation[] memory list = new Reservation[](reservationCount);

        for (uint256 i = 1; i <= reservationCount; i++) {
            list[i - 1] = reservations[i];
        }

        return list;
    }

    // Mendapatkan daftar reservasi berdasarkan alamat user tertentu
    function getReservationsByUser(address user) external view returns (Reservation[] memory) {
        uint256[] storage ids = reservationsByUser[user];
        Reservation[] memory list = new Reservation[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = reservations[ids[i]];
        }

        return list;
    }
}
