require('@nomiclabs/hardhat-ethers');
// require("@nomicfoundation/hardhat-toolbox");

// Import semua task custom
require("./tasks/cekSaldo.js");
require("./tasks/transfer.js");
require("./tasks/bookingRooms.js");

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

module.exports = {
  solidity: '0.8.19',
  networks: {
    hardhat: {},
  }
  
};
