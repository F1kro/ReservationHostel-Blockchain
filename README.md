# 🏨 HotelChain – Aplikasi Reservasi Hotel Berbasis Blockchain

HotelChain adalah aplikasi **reservasi hotel berbasis teknologi blockchain** yang dirancang sebagai pemenuhan **Tugas Besar Mata Kuliah Blockchain**.  
Aplikasi ini dibangun menggunakan **Solidity**, **Hardhat**, serta frontend **HTML/JS (ethers.js)** untuk menghubungkan smart contract dengan antarmuka web.

## 👥 Dibuat oleh

### 1. Fiqro Najiah  
**NIM : F1D02310051**

### 2. Juan Jordan Anugrah  
**NIM : F1D02310061**

## 📌 Deskripsi Proyek

HotelChain menghadirkan sistem pemesanan kamar hotel yang aman, transparan, dan tidak dapat dimanipulasi dengan memanfaatkan teknologi blockchain.  
Seluruh pemesanan, checkout, harga, dan data kamar dikelola melalui smart contract.

Fitur utama:

- Pembayaran menggunakan **Ethereum (ETH)**
- Admin dapat menambah, mengedit, dan menonaktifkan kamar
- Pengguna dapat memesan kamar & checkout
- Mode Gelap/Terang
- Profil pengguna lengkap (nama, nomor HP, foto)
- Total pendapatan (admin) & total pengeluaran (guest)
- Riwayat reservasi rinci
- Fitur hubungi pelanggan via **WhatsApp**
- Tampilan modern berbasis TailwindCSS

## 📁 Struktur Proyek

project/
│
├── contracts/
│   └── HotelReservation.sol
│
├── scripts/
│   └── deploy.js
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── contract-abi.json
│   └── contract-address.json
│
└── README.md

## 🚀 Cara Menjalankan Proyek

### 1. Instal Dependensi
npm install

### 2. Compile Smart Contract
npx hardhat compile

### 3. Jalankan Local Node
npx hardhat node

### 4. Deploy Smart Contract
npx hardhat run scripts/deploy.js --network localhost

### 5. Masukkan Alamat Kontrak & ABI  
Copy hasil deploy ke:
- frontend/contract-address.json
- frontend/contract-abi.json

### 6. Jalankan Frontend  
Buka:
frontend/index.html

Pastikan MetaMask terhubung ke jaringan Hardhat.

## 🧩 Teknologi yang Digunakan

- Solidity  
- Hardhat  
- Ethers.js  
- TailwindCSS  
- SweetAlert2  
- MetaMask  

## 🛠 Fitur Utama

### Admin
- Tambah/Edit/Hapus kamar
- Lihat riwayat reservasi
- Lihat nomor HP user & hubungi via WhatsApp
- Statistik pendapatan

### Guest
- Pesan kamar
- Checkout
- Riwayat reservasi
- Statistik pengeluaran ETH
- Profil pengguna

## 🔒 Keunggulan Blockchain

- Transparan  
- Aman  
- Tidak dapat dimanipulasi  
- Transaksi tercatat permanen  
- Tidak membutuhkan database terpusat  
