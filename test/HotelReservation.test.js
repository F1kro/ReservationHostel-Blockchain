const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('HotelReservation', function () {
  it('should add rooms and allow reservations', async function () {
    const [owner, guest] = await ethers.getSigners();
    const Hotel = await ethers.getContractFactory('HotelReservation');
    const hotel = await Hotel.deploy();
    await hotel.deployed();

    await hotel.addRoom('Deluxe', ethers.utils.parseEther('0.01'));
    const roomCount = await hotel.roomCount();
    expect(roomCount).to.equal(1);

    const r = await hotel.rooms(1);
    expect(r.name).to.equal('Deluxe');

    const from = Math.floor(Date.now() / 1000);
    const to = from + 86400;
    await hotel.connect(guest).reserve(1, from, to, { value: ethers.utils.parseEther('0.01') });

    const reservations = await hotel.getReservations(1);
    expect(reservations.length).to.equal(1);
  });
});
