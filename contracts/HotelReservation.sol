// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HotelReservation {
    struct Room {
        uint256 id;
        string name;
        uint256 priceWei;
        uint256 slots;
        bool exists;
        string[] facilities;
    }

    struct Reservation {
        uint256 id;
        uint256 roomId;
        address user;
        uint256 fromTimestamp;
        uint256 toTimestamp;
        bool active;
    }

    mapping(uint256 => Room) public rooms;
    uint256 public roomCount;

    mapping(uint256 => Reservation) public reservations;
    uint256 public reservationCount;

    mapping(address => uint256[]) public reservationsByUser;
    mapping(address => bool) public admins;

    event RoomAdded(uint256 indexed roomId, string name, uint256 priceWei, uint256 slots);
    event RoomUpdated(uint256 indexed roomId, string name, uint256 priceWei, uint256 slots);
    event RoomRemoved(uint256 indexed roomId);
    event Reserved(address indexed user, uint256 indexed roomId, uint256 reservationId);
    event Checkout(address indexed user, uint256 indexed reservationId);
    event AdminAdded(address indexed admin);
    event ProfileUpdated(address indexed user, string uri);

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin allowed");
        _;
    }

constructor() {
    // set deployer as admin
    admins[msg.sender] = true;
    emit AdminAdded(msg.sender);

}

    // Admin management
    function addAdmin(address _admin) external onlyAdmin {
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    function isAdmin(address _addr) external view returns (bool) {
        return admins[_addr];
    }

    // Profile (simple)
    mapping(address => string) private profiles;
    function setProfilePic(string calldata uri) external {
        profiles[msg.sender] = uri;
        emit ProfileUpdated(msg.sender, uri);
    }
    function getProfilePic(address _addr) external view returns (string memory) {
        return profiles[_addr];
    }

    // CRUD Rooms (only admin)
    function addRoom(string memory name, uint256 priceWei, uint256 slots, string[] memory _facilities) public onlyAdmin {
        roomCount++;
        Room storage r = rooms[roomCount];
        r.id = roomCount;
        r.name = name;
        r.priceWei = priceWei;
        r.slots = slots;
        r.exists = true;
        // copy facilities
        for (uint i = 0; i < _facilities.length; i++) {
            r.facilities.push(_facilities[i]);
        }
        emit RoomAdded(roomCount, name, priceWei, slots);
    }

    function editRoom(uint256 roomId, string memory name, uint256 priceWei, uint256 slots, string[] memory _facilities) public onlyAdmin {
        require(rooms[roomId].exists, "Room not found");
        rooms[roomId].name = name;
        rooms[roomId].priceWei = priceWei;
        rooms[roomId].slots = slots;
        // replace facilities
        delete rooms[roomId].facilities;
        for (uint i = 0; i < _facilities.length; i++) {
            rooms[roomId].facilities.push(_facilities[i]);
        }
        emit RoomUpdated(roomId, name, priceWei, slots);
    }

    function removeRoom(uint256 roomId) public onlyAdmin {
        require(rooms[roomId].exists, "Room not found");
        rooms[roomId].exists = false;
        emit RoomRemoved(roomId);
    }

    // read all rooms (returns facilities as string[] for each room)
    function getAllRooms() public view returns (Room[] memory) {
        Room[] memory list = new Room[](roomCount);
        for (uint256 i = 1; i <= roomCount; i++) {
            list[i - 1] = rooms[i];
        }
        return list;
    }

    // Reserve
    function reserve(uint256 roomId, uint256 fromTimestamp, uint256 toTimestamp) external payable {
        Room storage room = rooms[roomId];
        require(room.exists, "Room not found");
        require(room.slots > 0, "No slots available");
        require(msg.value >= room.priceWei, "Insufficient payment");

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
        reservationsByUser[msg.sender].push(reservationCount);
        emit Reserved(msg.sender, roomId, reservationCount);
    }

    // Checkout (only owner of reservation)
    function checkout(uint256 reservationId) public {
        Reservation storage r = reservations[reservationId];
        require(r.user == msg.sender, "Not reservation owner");
        require(r.active, "Reservation not active");
        r.active = false;
        rooms[r.roomId].slots++;
        emit Checkout(msg.sender, reservationId);
    }

    // Get my reservations
    function getMyReservations() public view returns (Reservation[] memory) {
        uint256[] storage ids = reservationsByUser[msg.sender];
        Reservation[] memory list = new Reservation[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = reservations[ids[i]];
        }
        return list;
    }

    // Admin: get all reservations
    function getAllReservations() external view onlyAdmin returns (Reservation[] memory) {
        Reservation[] memory list = new Reservation[](reservationCount);
        for (uint256 i = 1; i <= reservationCount; i++) {
            list[i - 1] = reservations[i];
        }
        return list;
    }

    // View reservations by user
    function getReservationsByUser(address user) external view returns (Reservation[] memory) {
        uint256[] storage ids = reservationsByUser[user];
        Reservation[] memory list = new Reservation[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = reservations[ids[i]];
        }
        return list;
    }
}
