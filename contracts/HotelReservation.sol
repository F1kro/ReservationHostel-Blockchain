// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HotelReservation {
    struct Room {
        uint256 id;
        string name;
        uint256 priceWei;
        uint256 slots;
        bool exists;
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

    mapping(address => Reservation[]) public reservationsByUser;
    uint256 public reservationCount;

    event RoomAdded(uint256 indexed roomId, string name, uint256 priceWei, uint256 slots);
    event Reserved(address indexed user, uint256 indexed roomId, uint256 reservationId);
    event Checkout(address indexed user, uint256 indexed reservationId);

    constructor() {
        addRoom("Deluxe Room", 0.05 ether, 5);
        addRoom("Executive Suite", 0.08 ether, 3);
        addRoom("Presidential Suite", 0.12 ether, 2);
    }

    function addRoom(string memory name, uint256 priceWei, uint256 slots) public {
        roomCount++;
        rooms[roomCount] = Room(roomCount, name, priceWei, slots, true);
        emit RoomAdded(roomCount, name, priceWei, slots);
    }

    function getAllRooms() public view returns (Room[] memory) {
        Room[] memory list = new Room[](roomCount);
        for (uint256 i = 1; i <= roomCount; i++) {
            list[i - 1] = rooms[i];
        }
        return list;
    }

    function reserve(uint256 roomId, uint256 fromTimestamp, uint256 toTimestamp) external payable {
        Room storage room = rooms[roomId];
        require(room.exists, "Room not found");
        require(room.slots > 0, "No slots available");
        require(msg.value >= room.priceWei, "Insufficient payment");

        room.slots--;
        reservationCount++;
        reservationsByUser[msg.sender].push(
            Reservation({
                id: reservationCount,
                roomId: roomId,
                user: msg.sender,
                fromTimestamp: fromTimestamp,
                toTimestamp: toTimestamp,
                active: true
            })
        );

        emit Reserved(msg.sender, roomId, reservationCount);
    }

    function getMyReservations() public view returns (Reservation[] memory) {
        return reservationsByUser[msg.sender];
    }

    function checkout(uint256 reservationId) public {
        Reservation[] storage userRes = reservationsByUser[msg.sender];
        for (uint256 i = 0; i < userRes.length; i++) {
            if (userRes[i].id == reservationId && userRes[i].active) {
                userRes[i].active = false;
                rooms[userRes[i].roomId].slots++;
                emit Checkout(msg.sender, reservationId);
                return;
            }
        }
        revert("Reservation not found or inactive");
    }
}
