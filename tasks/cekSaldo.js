const { task } = require("hardhat/config");

task("ceksaldo", "Cek saldo akun")
  .addParam("account", "Alamat akun yang akan dicek")
  .setAction(async (taskArgs, hre) => {
    try {
      const provider = hre.network.provider; // ambil provider Hardhat langsung
      const account = taskArgs.account;

      // Gunakan provider request langsung (JSON-RPC call)
      const balanceHex = await provider.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });

      // Konversi balance ke ETH (BigInt)
      const balanceEth = Number(BigInt(balanceHex) / 10n ** 18n);

      console.log(`\n💰 Alamat: ${account}`);
      console.log(`📊 Saldo : ${balanceEth} ETH\n`);
    } catch (error) {
      console.error("❌ Gagal mendapatkan saldo:", error.message);
    }
  });
