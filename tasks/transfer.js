const { task } = require("hardhat/config");

task("transfer", "Kirim ETH antar akun")
  .addParam("from", "Alamat pengirim")
  .addParam("to", "Alamat penerima")
  .addParam("amount", "Jumlah ETH yang dikirim")
  .setAction(async (taskArgs, hre) => {
    try {
      const { from, to, amount } = taskArgs;
      const provider = hre.network.provider;

      // Konversi jumlah ETH ke wei
      const valueHex = hre.ethers.utils.hexlify(
        hre.ethers.utils.parseEther(amount)
      );

      // Kirim transaksi lewat JSON-RPC
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from,
            to,
            value: valueHex,
          },
        ],
      });

      console.log(`✅ Transaksi berhasil! Hash: ${txHash}`);
      console.log(`📤 ${amount} ETH dikirim dari ${from} ke ${to}`);

    } catch (error) {
      console.error("❌ Gagal mengirim ETH:", error.message);
    }
  });
