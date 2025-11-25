// frontend/app.js
// Updated: enhanced UI behavior, SweetAlert forms, role handling, metrics & darkmode persistence

(async function () {
  // DOM refs
  const connectBtn = document.getElementById('connectBtn');
  const navProfileWrapper = document.getElementById('navProfileWrapper');
  const navAvatar = document.getElementById('navAvatar');
  const navDrop = document.getElementById('navDrop');
  const dropAddr = document.getElementById('dropAddr');
  const dropBal = document.getElementById('dropBal');
  const logoutBtn = document.getElementById('logoutBtn');
  const themeToggle = document.getElementById('themeToggle');

  const menuDashboard = document.getElementById('menuDashboard');
  const menuRooms = document.getElementById('menuRooms');
  const menuHistory = document.getElementById('menuHistory');
  const menuAbout = document.getElementById('menuAbout');

  const pageDashboard = document.getElementById('pageDashboard');
  const pageRooms = document.getElementById('pageRooms');
  const pageHistory = document.getElementById('pageHistory');
  const pageAbout = document.getElementById('pageAbout');

  const roomsGrid = document.getElementById('roomsGrid');
  const roomsList = document.getElementById('roomsList');
  const roomsListBtnAdd = document.getElementById('btnAddRoom');
  const roomsListSearch = document.getElementById('searchRoom');
  const historyTable = document.getElementById('historyTable');

  const metricRooms = document.getElementById('metricRooms');
  const metricActive = document.getElementById('metricActive');
  const metricDone = document.getElementById('metricDone');
  const metricRevenue = document.getElementById('metricRevenue');

  const modeLabel = document.getElementById('modeLabel');
  const welcomeTitle = document.getElementById('welcomeTitle');
  const welcomeSub = document.getElementById('welcomeSub');

  // CONTRACT CONFIG (try reading frontend/contract-address.json & contract-abi.json)
  let CONTRACT_ADDRESS = null;
  let CONTRACT_ABI = null;
  try {
    const r = await fetch('./contract-address.json');
    if (r.ok) {
      const j = await r.json();
      CONTRACT_ADDRESS = j.address;
    }
  } catch (e) {}
  try {
    const r2 = await fetch('./contract-abi.json');
    if (r2.ok) CONTRACT_ABI = await r2.json();
  } catch (e) {}

  // fallback ABI (must match contract)
  if (!CONTRACT_ABI) {
    CONTRACT_ABI = [
      {"inputs":[],"name":"getAllRooms","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"priceWei","type":"uint256"},{"internalType":"uint256","name":"slots","type":"uint256"},{"internalType":"bool","name":"exists","type":"bool"},{"internalType":"string[]","name":"facilities","type":"string[]"}],"internalType":"struct HotelReservation.Room[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"getMyReservations","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"roomId","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"fromTimestamp","type":"uint256"},{"internalType":"uint256","name":"toTimestamp","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct HotelReservation.Reservation[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"roomId","type":"uint256"},{"internalType":"uint256","name":"fromTimestamp","type":"uint256"},{"internalType":"uint256","name":"toTimestamp","type":"uint256"}],"name":"reserve","outputs":[],"stateMutability":"payable","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"reservationId","type":"uint256"}],"name":"checkout","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"_addr","type":"address"}],"name":"isAdmin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"string","name":"uri","type":"string"}],"name":"setProfilePic","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"_addr","type":"address"}],"name":"getProfilePic","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"priceWei","type":"uint256"},{"internalType":"uint256","name":"slots","type":"uint256"},{"internalType":"string[]","name":"_facilities","type":"string[]"}],"name":"addRoom","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"roomId","type":"uint256"}],"name":"removeRoom","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"roomId","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"priceWei","type":"uint256"},{"internalType":"uint256","name":"slots","type":"uint256"},{"internalType":"string[]","name":"_facilities","type":"string[]"}],"name":"editRoom","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[],"name":"getAllReservations","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"roomId","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"fromTimestamp","type":"uint256"},{"internalType":"uint256","name":"toTimestamp","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct HotelReservation.Reservation[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getReservationsByUser","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"roomId","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"fromTimestamp","type":"uint256"},{"internalType":"uint256","name":"toTimestamp","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct HotelReservation.Reservation[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"}
    ];
  }

  if (!CONTRACT_ADDRESS) CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // state
  let provider = null;
  let signer = null;
  let contract = null;
  let userAddress = null;
  let isAdmin = false;

  // SweetAlert theme configuration
  const getSwalTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      background: isDark ? '#1f2937' : '#ffffff',
      color: isDark ? '#f9fafb' : '#111827',
      inputBg: isDark ? '#374151' : '#f9fafb',
      inputColor: isDark ? '#f9fafb' : '#111827',
      border: isDark ? '#4b5563' : '#d1d5db',
      confirmButton: isDark ? '#2563eb' : '#3b82f6',
      cancelButton: isDark ? '#6b7280' : '#9ca3af'
    };
  };

  // Note: you asked not to force default images — so we do NOT auto-assign images.
  // If a room has image metadata (r.image), it will be used. Otherwise a neutral placeholder is shown.
  // Uploaded preview image path (available in this environment): /mnt/data/tambahRuangan.png

  // utilities
  function showPage(pageEl) {
    [pageDashboard, pageRooms, pageHistory, pageAbout].forEach(el => el.classList.add('hidden'));
    pageEl.classList.remove('hidden');
  }
  function shortAddr(a) { return a ? a.slice(0,6) + '...' + a.slice(-4) : ''; }
  function idrFormat(n) {
    try { 
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      }).format(n); 
    } 
    catch { 
      return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 
    }
  }

  // navigation handlers
  menuDashboard.addEventListener('click', () => showPage(pageDashboard));
  menuRooms.addEventListener('click', () => showPage(pageRooms));
  menuHistory.addEventListener('click', async () => { showPage(pageHistory); await loadHistory(); });
  menuAbout.addEventListener('click', () => showPage(pageAbout));

  // Dark mode toggle: persist to localStorage and update icon
  function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark if no preference
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    themeToggle.innerText = isDark ? '☀️' : '🌙';
    themeToggle.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    updateThemeIcon();
  });
  initTheme();

  // Connect wallet
  connectBtn.addEventListener('click', connectWallet);
  async function connectWallet() {
    if (!window.ethereum) return Swal.fire('MetaMask tidak ditemukan', 'Pasang MetaMask untuk menggunakan DApp ini', 'error');
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // role check
      try { isAdmin = await contract.isAdmin(userAddress); } catch(e) { isAdmin = false; }

      // UI updates
      navProfileWrapper.classList.remove('hidden');
      connectBtn.classList.add('hidden');
      dropAddr.textContent = shortAddr(userAddress);
      dropAddr.title = userAddress;
      dropBal.textContent = Number(ethers.utils.formatEther(await provider.getBalance(userAddress))).toFixed(4);
      modeLabel.innerText = isAdmin ? 'Admin' : 'Guest';
      welcomeTitle.textContent = isAdmin ? 'Selamat Datang, Admin Hotel' : 'Selamat Datang, Guest Dashboard';
      welcomeSub.textContent = isAdmin ? 'Administrator Panel' : 'Guest Dashboard';
      roomsListBtnAdd.classList.toggle('hidden', !isAdmin);

      // show/hide revenue metric
      metricRevenue.parentElement.style.display = 'block';

      // show login success alert
      const theme = getSwalTheme();
      Swal.fire({ 
        icon:'success', 
        title:'Connected', 
        text:`Wallet connected: ${shortAddr(userAddress)}`, 
        toast:true, 
        position:'top-end', 
        timer:2000, 
        showConfirmButton:false,
        background: theme.background,
        color: theme.color
      });

      // load data
      await loadRooms();
      await updateMetrics();
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({ 
        title: 'Error', 
        text: 'Gagal connect wallet (cek console)', 
        icon: 'error',
        background: theme.background,
        color: theme.color
      });
    }
  }

  // profile dropdown
  navAvatar?.addEventListener('click', () => navDrop.classList.toggle('hidden'));
  logoutBtn?.addEventListener('click', () => {
    provider = signer = contract = null;
    userAddress = null;
    isAdmin = false;
    navProfileWrapper.classList.add('hidden');
    connectBtn.classList.remove('hidden');
    navDrop.classList.add('hidden');
    dropAddr.textContent = '';
    dropBal.textContent = '-';
    modeLabel.innerText = 'Guest';
    welcomeTitle.textContent = 'Selamat Datang, Guest Dashboard';
    welcomeSub.textContent = 'Guest Dashboard';
    roomsGrid.innerHTML = '';
    roomsList.innerHTML = '';
    historyTable.innerHTML = '';
    metricRooms.innerText = '0';
    metricActive.innerText = '0';
    metricDone.innerText = '0';
    metricRevenue.innerText = 'Rp 0'; // Default to IDR format
    metricRevenue.parentElement.style.display = 'block'; // Ensure it's visible
    showPage(pageDashboard);
  });

  // load rooms
  async function loadRooms() {
    roomsGrid.innerHTML = '';
    roomsList.innerHTML = '';

    let list = [];
    try {
      const onChain = await contract.getAllRooms();
      list = onChain.map(r => {
        const facilities = Array.isArray(r.facilities) ? r.facilities.map(f => f.toString()) : [];
        return {
          id: r.id.toString ? r.id.toString() : String(r.id),
          name: r.name,
          priceWei: r.priceWei,
          slots: r.slots.toString ? r.slots.toString() : String(r.slots),
          exists: r.exists,
          facilities
        };
      });
    } catch (e) {
      console.warn('getAllRooms failed, using demo fallback —', e);
      // minimal demo fallback (no images)
      list = [
        { id:'1', name:'Standard Room', priceWei: ethers.utils.parseEther("0.05"), slots:'4', exists:true, facilities:['WiFi','AC','TV'] },
        { id:'2', name:'Deluxe Room', priceWei: ethers.utils.parseEther("0.085"), slots:'5', exists:true, facilities:['WiFi','AC','Mini Bar'] },
      ];
    }

    const query = roomsListSearch?.value?.toLowerCase?.() || '';

    list.forEach((r, idx) => {
      if (!r.exists) return;

      // image handling: only use r.image if provided (no default)
      const img = r.image || '';

      const priceEth = ethers.utils.formatEther(r.priceWei.toString ? r.priceWei : r.priceWei);

      // dashboard card
      const card = document.createElement('div');
      card.className = 'bg-gray-800 rounded overflow-hidden border border-gray-800 shadow';
      card.innerHTML = `
        <div class="${img ? 'h-40 bg-cover bg-center' : 'h-40 bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center'}"
             ${img ? `style="background-image:url('${img}')"` : ''}>
          ${!img ? `<div class="text-gray-400">No image</div>` : ''}
        </div>
        <div class="p-4">
          <h4 class="font-semibold">${r.name}</h4>
          <p class="text-sm text-gray-400 mt-2">${(r.facilities && r.facilities.join) ? r.facilities.slice(0,3).join(' · ') : ''}</p>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-blue-400 font-bold">${priceEth} ETH / malam</div>
          </div>
        </div>
      `;
      roomsGrid.appendChild(card);

      // rooms list card
      if (query && !r.name.toLowerCase().includes(query) && !(r.facilities && r.facilities.join(',').toLowerCase().includes(query))) return;

      const listCard = document.createElement('div');
      listCard.className = 'bg-gray-800 rounded overflow-hidden border border-gray-800 shadow p-0';
      const facHtml = (r.facilities && r.facilities.length)
        ? r.facilities.map(f => `<span class="inline-block text-xs px-2 py-1 mr-1 mt-2 bg-gray-700 rounded">${f}</span>`).join('')
        : '';

      let actionHtml = '';
      if (isAdmin) {
        actionHtml = `<button data-id="${r.id}" class="editRoomBtn px-3 py-1 border rounded text-xs">Edit</button>
                      <button data-id="${r.id}" class="delRoomBtn px-3 py-1 bg-red-600 text-white rounded text-xs">Hapus</button>`;
      } else {
        actionHtml = `<button data-id="${r.id}" class="bookNowBtn px-3 py-1 bg-blue-600 text-black rounded text-xs">Pesan Sekarang</button>`;
      }

      listCard.innerHTML = `
        <div class="${img ? 'h-40 bg-cover bg-center' : 'h-40 bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center'}"
             ${img ? `style="background-image:url('${img}')"` : ''}>
          ${!img ? `<div class="text-gray-400">No image</div>` : ''}
        </div>
        <div class="p-4">
          <h4 class="font-semibold">${r.name}</h4>
          <div class="text-sm text-gray-400 mt-2">${facHtml}</div>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-blue-400 font-bold">${priceEth} ETH / malam</div>
            <div class="flex gap-2">${actionHtml}</div>
          </div>
        </div>
      `;
      roomsList.appendChild(listCard);
    });

    // wire up actions
    document.querySelectorAll('.editRoomBtn').forEach(btn => btn.addEventListener('click', onEditRoom));
    document.querySelectorAll('.delRoomBtn').forEach(btn => btn.addEventListener('click', onDeleteRoom));
    document.querySelectorAll('.bookNowBtn').forEach(btn => btn.addEventListener('click', onBookRoom));
  }

  // Add Room (admin) — SweetAlert form. If cancelled, no contract call.
  roomsListBtnAdd?.addEventListener('click', async () => {
    const theme = getSwalTheme();
    
    const { value: form } = await Swal.fire({
      title: 'Tambah Ruangan Baru',
      html:
        `<input id="r_name" class="swal2-input" placeholder="Nama Ruangan" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="r_price" class="swal2-input" placeholder="Harga per malam (ETH)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="r_slots" class="swal2-input" placeholder="Slots (jumlah ketersediaan)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="r_facilities" class="swal2-input" placeholder="Fasilitas (pisah dengan koma)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="r_image" class="swal2-input" placeholder="Image URL (opsional)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tambah Ruangan',
      cancelButtonText: 'Batal',
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButton,
      cancelButtonColor: theme.cancelButton,
      preConfirm: () => {
        return {
          name: document.getElementById('r_name').value,
          price: document.getElementById('r_price').value,
          slots: document.getElementById('r_slots').value,
          facilities: document.getElementById('r_facilities').value,
          image: document.getElementById('r_image').value
        };
      }
    });

    if (!form) return; // cancelled

    const { name, price, slots, facilities, image } = form;
    if (!name || !price || !slots) {
      const theme = getSwalTheme();
      return Swal.fire({ 
        title: 'Invalid', 
        text: 'Isi semua field penting', 
        icon: 'error',
        background: theme.background,
        color: theme.color
      });
    }

    const facilitiesArray = facilities ? facilities.split(',').map(s => s.trim()).filter(Boolean) : [];

    try {
      const priceWei = ethers.utils.parseEther(price);
      const tx = await contract.addRoom(name, priceWei, parseInt(slots), facilitiesArray);
      await tx.wait();
      const theme = getSwalTheme();
      Swal.fire({ 
        icon:'success', 
        title:'Sukses', 
        text:'Ruangan ditambahkan',
        background: theme.background,
        color: theme.color
      });
      await loadRooms();
      await updateMetrics();
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({ 
        title: 'Error', 
        text: 'Gagal menambah ruangan (cek console)', 
        icon: 'error',
        background: theme.background,
        color: theme.color
      });
    }
  });

  // Edit Room (admin)
  async function onEditRoom(e) {
    const roomId = e.currentTarget.dataset.id;
    let current = null;
    try {
      const rooms = await contract.getAllRooms();
      const r = rooms.find(x => x.id.toString() === roomId.toString());
      if (r) {
        current = {
          name: r.name,
          priceEth: ethers.utils.formatEther(r.priceWei),
          slots: r.slots.toString ? r.slots.toString() : String(r.slots),
          facilities: Array.isArray(r.facilities) ? r.facilities.map(f => f.toString()) : []
        };
      }
    } catch (err) { console.warn('prefill fail', err); }

    const theme = getSwalTheme();
    const { value: vals } = await Swal.fire({
      title: 'Edit Ruangan',
      html:
        `<input id="er_name" class="swal2-input" placeholder="Nama Ruangan" value="${current?.name || ''}" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="er_price" class="swal2-input" placeholder="Harga per malam (ETH)" value="${current?.priceEth || ''}" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="er_slots" class="swal2-input" placeholder="Slots" value="${current?.slots || ''}" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="er_facilities" class="swal2-input" placeholder="Fasilitas (pisah dengan koma)" value="${(current?.facilities || []).join(', ')}" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      cancelButtonText: 'Batal',
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButton,
      cancelButtonColor: theme.cancelButton,
      preConfirm: () => ({
        name: document.getElementById('er_name').value,
        price: document.getElementById('er_price').value,
        slots: document.getElementById('er_slots').value,
        facilities: document.getElementById('er_facilities').value
      })
    });
    if (!vals) return; // cancelled
    const { name, price, slots, facilities } = vals;
    if (!name || !price || !slots) {
      const theme = getSwalTheme();
      return Swal.fire({ 
        title: 'Invalid', 
        text: 'Isi field penting', 
        icon: 'error',
        background: theme.background,
        color: theme.color
      });
    }

    const facilitiesArray = facilities ? facilities.split(',').map(s => s.trim()).filter(Boolean) : [];

    try {
      const priceWei = ethers.utils.parseEther(price);
      const tx = await contract.editRoom(parseInt(roomId), name, priceWei, parseInt(slots), facilitiesArray);
      await tx.wait();
      const theme = getSwalTheme();
      Swal.fire({ 
        icon:'success', 
        title:'Sukses', 
        text:'Ruangan diperbarui',
        background: theme.background,
        color: theme.color
      });
      await loadRooms();
      await updateMetrics();
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({ 
        title: 'Error', 
        text: 'Gagal update ruangan (cek console)', 
        icon: 'error',
        background: theme.background,
        color: theme.color
      });
    }
  }

  // Delete Room (admin)
  async function onDeleteRoom(e) {
    const roomId = e.currentTarget.dataset.id;
    const theme = getSwalTheme();
    const confirm = await Swal.fire({
      title: 'Hapus ruangan?',
      text: 'Tindakan ini menonaktifkan ruangan (bisa ditambahkan kembali oleh admin).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      background: theme.background,
      color: theme.color,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: theme.cancelButton
    });
    if (!confirm.isConfirmed) return;
    try {
      const tx = await contract.removeRoom(parseInt(roomId));
      await tx.wait();
      const theme = getSwalTheme();
      Swal.fire({ 
        icon:'success', 
        title:'Dihapus', 
        text:'Ruangan telah dinonaktifkan',
        background: theme.background,
        color: theme.color
      });
      await loadRooms();
      await updateMetrics();
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({ 
        title: 'Error', 
        text: 'Gagal hapus ruangan (cek console)', 
        icon: 'error',
        background: theme.background,
        color: theme.color
      });
    }
  }

  // Book room (user)
  async function onBookRoom(e) {
    const roomId = e.currentTarget.dataset.id;
    const theme = getSwalTheme();
    const { value: nights } = await Swal.fire({
      title: 'Berapa malam?',
      input: 'number',
      inputLabel: 'Jumlah malam',
      inputAttributes: { min: 1, step: 1 },
      showCancelButton: true,
      confirmButtonText: 'Pesan',
      cancelButtonText: 'Batal',
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButton,
      cancelButtonColor: theme.cancelButton,
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return 'Masukkan jumlah malam yang valid';
        }
      }
    });
    if (!nights || nights <= 0) return;
    try {
      const rooms = await contract.getAllRooms();
      const r = rooms.find(x => x.id.toString() === roomId.toString());
      if (!r) {
        const theme = getSwalTheme();
        return Swal.fire({ 
          title: 'Error', 
          text: 'Ruangan tidak ditemukan', 
          icon: 'error',
          background: theme.background,
          color: theme.color
        });
      }
      const priceBN = ethers.BigNumber.from(r.priceWei.toString ? r.priceWei : r.priceWei);
      const now = Math.floor(Date.now() / 1000);
      const to = now + (nights * 86400);
      const totalCost = priceBN.mul(nights);
      const totalEth = ethers.utils.formatEther(totalCost);
      
      // Confirmation dialog
      const theme = getSwalTheme();
      const confirmResult = await Swal.fire({
        title: 'Konfirmasi Pemesanan',
        html: `
          <div style="text-align: left;">
            <p><strong>Ruangan:</strong> ${r.name}</p>
            <p><strong>Durasi:</strong> ${nights} malam</p>
            <p><strong>Total Biaya:</strong> ${totalEth} ETH</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Konfirmasi Pembayaran',
        cancelButtonText: 'Batal',
        background: theme.background,
        color: theme.color,
        confirmButtonColor: theme.confirmButton,
        cancelButtonColor: theme.cancelButton
      });
      
      if (!confirmResult.isConfirmed) return;
      
      const tx = await contract.reserve(parseInt(roomId), now, to, { value: totalCost });
      await tx.wait();
      const themeSuccess = getSwalTheme();
      Swal.fire({ 
        icon:'success', 
        title:'Sukses', 
        text:'Reservasi berhasil',
        background: themeSuccess.background,
        color: themeSuccess.color
      });
      await loadRooms();
      await updateMetrics();
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({ 
        title: 'Error', 
        text: 'Gagal reservasi (cek console)', 
        icon: 'error',
        background: theme.background,
        color: theme.color
      });
    }
  }

  // History
  async function loadHistory() {
    historyTable.innerHTML = '';
    try {
      if (isAdmin) {
        const list = await contract.getAllReservations();
        if (!list.length) {
          historyTable.innerHTML = '<div class="text-gray-400">Tidak ada pemesanan.</div>';
          return;
        }
        list.forEach(r => {
          const div = document.createElement('div');
          div.className = 'p-3 border-b border-gray-800';
          const from = new Date(r.fromTimestamp * 1000).toLocaleDateString();
          const to = new Date(r.toTimestamp * 1000).toLocaleDateString();
          div.innerHTML = `<div class="flex justify-between"><div><b>#${r.id}</b> - Room ${r.roomId}</div><div>${r.active ? '<span class="text-green-400">Dalam Penginapan</span>' : '<span class="text-gray-400">Sudah Checkout</span>'}</div></div>
            <div class="text-sm text-gray-400 mt-1">User: ${shortAddr(r.user)}</div>
            <div class="text-sm text-gray-400">Periode: ${from} - ${to}</div>`;
          historyTable.appendChild(div);
        });
      } else {
        const list = await contract.getMyReservations();
        if (!list.length) {
          historyTable.innerHTML = '<div class="text-gray-400">Belum ada reservasi.</div>';
          return;
        }
        for (const r of list) {
          const div = document.createElement('div');
          div.className = 'p-3 border-b border-gray-800';
          const from = new Date(r.fromTimestamp * 1000).toLocaleDateString();
          const to = new Date(r.toTimestamp * 1000).toLocaleDateString();
          div.innerHTML = `<div class="flex justify-between"><div><b>#${r.id}</b> - Room ${r.roomId}</div><div>${r.active ? '<span class="text-green-400">Dalam Penginapan</span>' : '<span class="text-gray-400">Sudah Checkout</span>'}</div></div>
            <div class="text-sm text-gray-400 mt-1">Periode: ${from} - ${to}</div>
            ${ r.active ? '<div class="mt-2"><button class="checkoutBtn bg-red-600 px-3 py-1 rounded">Checkout</button></div>' : '' }`;
          if (r.active) {
            // attach checkout handler
            setTimeout(() => {
              const btn = div.querySelector('.checkoutBtn');
              btn.addEventListener('click', async () => {
                try {
                  const tx = await contract.checkout(r.id);
                  await tx.wait();
                  const theme = getSwalTheme();
                  Swal.fire({ 
                    icon:'success', 
                    title:'Checkout berhasil',
                    background: theme.background,
                    color: theme.color
                  });
                  await loadHistory();
                  await loadRooms();
                  await updateMetrics();
                } catch (err) {
                  console.error(err);
                  const theme = getSwalTheme();
                  Swal.fire({ 
                    title: 'Error', 
                    text: 'Gagal checkout (cek console)', 
                    icon: 'error',
                    background: theme.background,
                    color: theme.color
                  });
                }
              });
            }, 50);
          }
          historyTable.appendChild(div);
        }
      }
    } catch (err) {
      console.error(err);
      historyTable.innerHTML = '<div class="text-red-500">Gagal load history (cek console)</div>';
    }
  }

  // Metrics: compute rooms, active/done counts, and revenue in ETH for admin
  async function updateMetrics() {
    try {
      const rooms = await contract.getAllRooms();
      metricRooms.innerText = rooms.length;

      let active = 0, done = 0;
      let revenueWei = ethers.BigNumber.from(0);

      try {
        if (isAdmin) {
          // Admin: get all reservations
          const all = await contract.getAllReservations();
          // prepare map roomId -> priceWei
          const priceMap = {};
          rooms.forEach(r => { priceMap[r.id.toString()] = ethers.BigNumber.from(r.priceWei.toString ? r.priceWei : r.priceWei); });

          for (const r of all) {
            if (r.active) active++;
            else done++;

            // compute nights from timestamps (floor((to - from)/86400))
            const nights = Math.max(1, Math.ceil((Number(r.toTimestamp) - Number(r.fromTimestamp)) / 86400));
            const roomPriceWei = priceMap[r.roomId.toString()] || ethers.BigNumber.from(0);
            revenueWei = revenueWei.add(roomPriceWei.mul(nights));
          }
        } else {
          // User: get only their reservations
          const myReservations = await contract.getMyReservations();
          // prepare map roomId -> priceWei
          const priceMap = {};
          rooms.forEach(r => { priceMap[r.id.toString()] = ethers.BigNumber.from(r.priceWei.toString ? r.priceWei : r.priceWei); });

          for (const r of myReservations) {
            if (r.active) active++;
            else done++;

            // compute nights from timestamps
            const nights = Math.max(1, Math.ceil((Number(r.toTimestamp) - Number(r.fromTimestamp)) / 86400));
            const roomPriceWei = priceMap[r.roomId.toString()] || ethers.BigNumber.from(0);
            revenueWei = revenueWei.add(roomPriceWei.mul(nights));
          }
        }
      } catch (err) {
        console.warn('get reservations failed', err);
      }

      metricActive.innerText = active;
      metricDone.innerText = done;

      if (isAdmin) {
        // show ETH for admin
        try {
          const revEth = ethers.utils.formatEther(revenueWei);
          metricRevenue.innerText = `${Number(revEth).toFixed(4)} ETH`;
          metricRevenue.parentElement.style.display = 'block';
        } catch {
          metricRevenue.innerText = '0 ETH';
          metricRevenue.parentElement.style.display = 'block';
        }
      } else {
        // show IDR for user (convert from ETH)
        try {
          const revEth = ethers.utils.formatEther(revenueWei);
          // Simple conversion rate (you might want to get real ETH to IDR rate)
          const ethToIdr = 25000000; // 1 ETH = 25,000,000 IDR (example rate)
          const revenueIdr = Number(revEth) * ethToIdr;
          metricRevenue.innerText = idrFormat(revenueIdr);
          metricRevenue.parentElement.style.display = 'block';
        } catch {
          metricRevenue.innerText = 'Rp 0';
          metricRevenue.parentElement.style.display = 'block';
        }
      }

    } catch (err) {
      console.error('Error updating metrics:', err);
      metricRooms.innerText = '0';
      metricActive.innerText = '0';
      metricDone.innerText = '0';
      metricRevenue.innerText = isAdmin ? '0 ETH' : 'Rp 0';
      metricRevenue.parentElement.style.display = 'block';
    }
  }

  // search handler
  roomsListSearch?.addEventListener('input', debounce(async () => { await loadRooms(); }, 250));

  function debounce(fn, t) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), t);
    };
  }

  // initial page
  showPage(pageDashboard);

  // expose helpers for debug
  window._hc = { loadRooms, loadHistory, updateMetrics };

})();