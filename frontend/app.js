(async function () {
  // DOM refs
  const connectBtn = document.getElementById("connectBtn");
  const navProfileWrapper = document.getElementById("navProfileWrapper");
  const navAvatarImg = document.getElementById("navAvatarImg"); // changed
  const navDrop = document.getElementById("navDrop");
  const dropAddr = document.getElementById("dropAddr");
  const dropBal = document.getElementById("dropBal");
  const dropName = document.getElementById("dropName");
  const dropPhone = document.getElementById("dropPhone");
  const logoutBtn = document.getElementById("logoutBtn");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const themeToggle = document.getElementById("themeToggle");

  const menuDashboard = document.getElementById("menuDashboard");
  const menuRooms = document.getElementById("menuRooms");
  const menuHistory = document.getElementById("menuHistory");
  const menuAbout = document.getElementById("menuAbout");

  const pageDashboard = document.getElementById("pageDashboard");
  const pageRooms = document.getElementById("pageRooms");
  const pageHistory = document.getElementById("pageHistory");
  const pageAbout = document.getElementById("pageAbout");

  const roomsGrid = document.getElementById("roomsGrid");
  const roomsList = document.getElementById("roomsList");
  const roomsListBtnAdd = document.getElementById("btnAddRoom");
  const roomsListSearch = document.getElementById("searchRoom");
  const historyTable = document.getElementById("historyTable");

  const metricRooms = document.getElementById("metricRooms");
  const metricActive = document.getElementById("metricActive");
  const metricDone = document.getElementById("metricDone");
  const metricRevenue = document.getElementById("metricRevenue");
  const metricRevenueLabel = document.getElementById("metricRevenueLabel");

  const modeLabel = document.getElementById("modeLabel");
  const welcomeTitle = document.getElementById("welcomeTitle");
  const welcomeSub = document.getElementById("welcomeSub");

  // CONTRACT CONFIG (try reading frontend/contract-address.json & contract-abi.json)
  let CONTRACT_ADDRESS = null;
  let CONTRACT_ABI = null;
  try {
    const r = await fetch("./contract-address.json");
    if (r.ok) {
      const j = await r.json();
      CONTRACT_ADDRESS = j.address;
    }
  } catch (e) {}
  try {
    const r2 = await fetch("./contract-abi.json");
    if (r2.ok) CONTRACT_ABI = await r2.json();
  } catch (e) {}

  // fallback ABI (kept minimal)
  if (!CONTRACT_ABI) {
    CONTRACT_ABI = [
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
              {
                internalType: "string[]",
                name: "facilities",
                type: "string[]",
              },
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
              {
                internalType: "uint256",
                name: "fromTimestamp",
                type: "uint256",
              },
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
        inputs: [
          { internalType: "uint256", name: "reservationId", type: "uint256" },
        ],
        name: "checkout",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "_addr", type: "address" }],
        name: "isAdmin",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "string", name: "uri", type: "string" }],
        name: "setProfilePic",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "_addr", type: "address" }],
        name: "getProfilePic",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "priceWei", type: "uint256" },
          { internalType: "uint256", name: "slots", type: "uint256" },
          { internalType: "string[]", name: "_facilities", type: "string[]" },
        ],
        name: "addRoom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "roomId", type: "uint256" }],
        name: "removeRoom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "roomId", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "priceWei", type: "uint256" },
          { internalType: "uint256", name: "slots", type: "uint256" },
          { internalType: "string[]", name: "_facilities", type: "string[]" },
        ],
        name: "editRoom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "getAllReservations",
        outputs: [
          {
            components: [
              { internalType: "uint256", name: "id", type: "uint256" },
              { internalType: "uint256", name: "roomId", type: "uint256" },
              { internalType: "address", name: "user", type: "address" },
              {
                internalType: "uint256",
                name: "fromTimestamp",
                type: "uint256",
              },
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
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getReservationsByUser",
        outputs: [
          {
            components: [
              { internalType: "uint256", name: "id", type: "uint256" },
              { internalType: "uint256", name: "roomId", type: "uint256" },
              { internalType: "address", name: "user", type: "address" },
              {
                internalType: "uint256",
                name: "fromTimestamp",
                type: "uint256",
              },
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
    ];
  }

  if (!CONTRACT_ADDRESS)
    CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // state
  let provider = null;
  let signer = null;
  let contract = null;
  let userAddress = null;
  let isAdmin = false;

  window._roomsCache = [];

  // SweetAlert theme configuration
  const getSwalTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    return {
      background: isDark ? "#1f2937" : "#ffffff",
      color: isDark ? "#f9fafb" : "#111827",
      inputBg: isDark ? "#374151" : "#f9fafb",
      inputColor: isDark ? "#f9fafb" : "#111827",
      border: isDark ? "#4b5563" : "#d1d5db",
      confirmButton: isDark ? "#2563eb" : "#3b82f6",
      cancelButton: isDark ? "#6b7280" : "#9ca3af",
    };
  };

  // utilities
  function showPage(pageEl) {
    [pageDashboard, pageRooms, pageHistory, pageAbout].forEach((el) =>
      el.classList.add("hidden")
    );
    pageEl.classList.remove("hidden");
    // active menu visual
    [menuDashboard, menuRooms, menuHistory, menuAbout].forEach((m) =>
      m.classList.remove("bg-gray-100", "dark:bg-gray-800")
    );
    if (pageEl === pageDashboard)
      menuDashboard.classList.add("bg-gray-100", "dark:bg-gray-800");
    if (pageEl === pageRooms)
      menuRooms.classList.add("bg-gray-100", "dark:bg-gray-800");
    if (pageEl === pageHistory)
      menuHistory.classList.add("bg-gray-100", "dark:bg-gray-800");
    if (pageEl === pageAbout)
      menuAbout.classList.add("bg-gray-100", "dark:bg-gray-800");
  }
  function shortAddr(a) {
    return a ? a.slice(0, 6) + "..." + a.slice(-4) : "";
  }

  // profile storage helpers (localStorage per address) now include image
  function profileKey(addr) {
    return `sc_profile_${addr.toLowerCase()}`;
  }
  function getProfile(addr) {
    try {
      if (!addr) return null;
      const raw = localStorage.getItem(profileKey(addr));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function setProfile(addr, name, phone, image) {
    const obj = {
      name: name || "",
      phone: phone || "",
      image: image || "",
      updatedAt: Date.now(),
    };
    localStorage.setItem(profileKey(addr), JSON.stringify(obj));
    return obj;
  }

  function renderProfileToDropdown() {
    const profile = userAddress ? getProfile(userAddress) : null;
    dropName.textContent = profile?.name || "Tidak ada nama";
    dropPhone.textContent = profile?.phone
      ? `Telp: ${profile.phone}`
      : "Telp: -";
    // set avatar image (with safe fallback)
    const imgUrl =
      profile && profile.image && String(profile.image).trim()
        ? String(profile.image).trim()
        : "assets/placeholder.png";
    if (navAvatarImg) {
      navAvatarImg.src = imgUrl;
      navAvatarImg.onerror = function () {
        this.onerror = null;
        this.src = "assets/placeholder.png";
      };
    }
  }

  // navigation handlers
  menuDashboard.addEventListener("click", () => showPage(pageDashboard));
  menuRooms.addEventListener("click", () => showPage(pageRooms));
  menuHistory.addEventListener("click", async () => {
    showPage(pageHistory);
    await loadHistory();
  });
  menuAbout.addEventListener("click", () => showPage(pageAbout));

  // Dark mode toggle: persist to localStorage and update icon
  function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Default to dark if no preference
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains("dark");
    themeToggle.innerText = isDark ? "☀️" : "🌙";
    themeToggle.title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    updateThemeIcon();
  });
  initTheme();

  // Connect wallet
  connectBtn.addEventListener("click", connectWallet);
  async function connectWallet() {
    if (!window.ethereum)
      return Swal.fire(
        "MetaMask tidak ditemukan",
        "Pasang MetaMask untuk menggunakan DApp ini",
        "error"
      );
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      userAddress = (await signer.getAddress()).toLowerCase();
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // role check
      try {
        isAdmin = await contract.isAdmin(userAddress);
      } catch (e) {
        isAdmin = false;
      }

      // UI updates
      navProfileWrapper.classList.remove("hidden");
      connectBtn.classList.add("hidden");
      dropAddr.textContent = shortAddr(userAddress);
      dropAddr.title = userAddress;
      try {
        const bal = Number(
          ethers.utils.formatEther(await provider.getBalance(userAddress))
        );
        dropBal.textContent = bal.toFixed(4);
      } catch (e) {
        dropBal.textContent = "-";
      }
      modeLabel.innerText = isAdmin ? "Admin" : "Guest";
      welcomeTitle.textContent = isAdmin
        ? "Selamat Datang, Admin Hotel"
        : "Selamat Datang, Guest Dashboard";
      welcomeSub.textContent = isAdmin
        ? "Administrator Panel"
        : "Guest Dashboard";
      roomsListBtnAdd.classList.toggle("hidden", !isAdmin);

      // show login success
      const theme = getSwalTheme();
      Swal.fire({
        icon: "success",
        title: "Connected",
        text: `Wallet connected: ${shortAddr(userAddress)}`,
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        background: theme.background,
        color: theme.color,
      });

      // profile flow: prompt for name + phone + image if not set
      try {
        await checkProfileAndPrompt();
      } catch (e) {
        console.warn("profile prompt failed", e);
        renderProfileToDropdown();
      }

      // load data
      try {
        await loadRooms();
      } catch (e) {
        console.warn(e);
      }
      try {
        await updateMetrics();
      } catch (e) {
        console.warn(e);
      }
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({
        title: "Error",
        text: "Gagal connect wallet (cek console)",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
  }

  // profile dropdown toggles
  navAvatarImg?.addEventListener("click", () =>
    navDrop.classList.toggle("hidden")
  );
  logoutBtn?.addEventListener("click", () => {
    provider = signer = contract = null;
    userAddress = null;
    isAdmin = false;
    navProfileWrapper.classList.add("hidden");
    connectBtn.classList.remove("hidden");
    navDrop.classList.add("hidden");
    dropAddr.textContent = "";
    dropBal.textContent = "-";
    dropName.textContent = "-";
    dropPhone.textContent = "-";
    if (navAvatarImg) {
      navAvatarImg.src = "assets/placeholder.png";
    }
    modeLabel.innerText = "Guest";
    welcomeTitle.textContent = "Selamat Datang, Guest Dashboard";
    welcomeSub.textContent = "Guest Dashboard";
    roomsGrid.innerHTML = "";
    roomsList.innerHTML = "";
    historyTable.innerHTML = "";
    metricRooms.innerText = "0";
    metricActive.innerText = "0";
    metricDone.innerText = "0";
    metricRevenue.innerText = "0 ETH";
    metricRevenueLabel.textContent = "Total Pendapatan";
    metricRevenue.parentElement.style.display = "block";
    showPage(pageDashboard);
  });

  // Edit profile (existing)
  editProfileBtn?.addEventListener("click", async () => {
    if (!userAddress) return;
    const profile = getProfile(userAddress) || {};
    const theme = getSwalTheme();
    const { value: vals } = await Swal.fire({
      title: "Edit Profile",
      html:
        `<input id="p_name" class="swal2-input" placeholder="Nama" value="${
          profile.name || ""
        }" style="background: ${theme.inputBg}; color: ${
          theme.inputColor
        }; border-color: ${theme.border};">` +
        `<input id="p_phone" class="swal2-input" placeholder="No. Telepon" value="${
          profile.phone || ""
        }" style="background: ${theme.inputBg}; color: ${
          theme.inputColor
        }; border-color: ${theme.border};">` +
        `<input id="p_image" class="swal2-input" placeholder="Image URL (opsional)" value="${
          profile.image || ""
        }" style="background: ${theme.inputBg}; color: ${
          theme.inputColor
        }; border-color: ${theme.border};">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButton,
      cancelButtonColor: theme.cancelButton,
      preConfirm: () => ({
        name: document.getElementById("p_name").value,
        phone: document.getElementById("p_phone").value,
        image: document.getElementById("p_image").value,
      }),
    });
    if (!vals) return;
    if (!vals.name) {
      const theme = getSwalTheme();
      return Swal.fire({
        title: "Invalid",
        text: "Nama tidak boleh kosong",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
    setProfile(userAddress, vals.name, vals.phone, vals.image);
    renderProfileToDropdown();
    const theme2 = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: "Tersimpan",
      background: theme2.background,
      color: theme2.color,
    });
  });

  // profile prompt on first connect (now includes image url)
  async function checkProfileAndPrompt() {
    if (!userAddress) return;
    const existing = getProfile(userAddress);
    if (existing && existing.name) {
      renderProfileToDropdown();
      return; // already set
    }
    // ask user for name + phone + image (only first time)
    const theme = getSwalTheme();
    const { value: vals } = await Swal.fire({
      title: "Set Profil Anda",
      html:
        `<input id="p_name" class="swal2-input" placeholder="Nama" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="p_phone" class="swal2-input" placeholder="No. Telepon (opsional)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="p_image" class="swal2-input" placeholder="Image URL (opsional)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Lewati",
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButton,
      cancelButtonColor: theme.cancelButton,
      preConfirm: () => ({
        name: document.getElementById("p_name").value,
        phone: document.getElementById("p_phone").value,
        image: document.getElementById("p_image").value,
      }),
    });
    if (!vals) {
      // user skipped; still set an empty profile object so we don't prompt again
      setProfile(userAddress, "", "", "");
      renderProfileToDropdown();
      return;
    }
    if (!vals.name) {
      const theme = getSwalTheme();
      return Swal.fire({
        title: "Invalid",
        text: "Nama tidak boleh kosong",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
    setProfile(userAddress, vals.name, vals.phone, vals.image);
    renderProfileToDropdown();
    const theme2 = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: "Profil tersimpan",
      background: theme2.background,
      color: theme2.color,
    });
  }

  // --------- Rooms, history, metrics (kept as before) ----------
  async function loadRooms() {
    if (!contract) throw new Error("Not connected to contract");
    roomsGrid.innerHTML = "";
    roomsList.innerHTML = "";
    let list = [];
    try {
      const onChain = await contract.getAllRooms();
      list = onChain.map((r) => {
        const facilities = Array.isArray(r.facilities)
          ? r.facilities.map((f) => f.toString())
          : [];
        return {
          id: r.id.toString ? r.id.toString() : String(r.id),
          name: r.name,
          priceWei: r.priceWei,
          slots: r.slots.toString ? r.slots.toString() : String(r.slots),
          exists: r.exists,
          facilities,
          image: r.image && r.image.length ? r.image : "",
        };
      });
    } catch (e) {
      console.warn("getAllRooms failed, using demo fallback —", e);
      list = [
        {
          id: "1",
          name: "Standard Room",
          priceWei: ethers.utils.parseEther("0.05"),
          slots: "4",
          exists: true,
          facilities: ["WiFi", "AC", "TV"],
          image: "",
        },
        {
          id: "2",
          name: "Deluxe Room",
          priceWei: ethers.utils.parseEther("0.085"),
          slots: "5",
          exists: true,
          facilities: ["WiFi", "AC", "Mini Bar"],
          image: "",
        },
      ];
    }

    window._roomsCache = list;
    const query = roomsListSearch?.value?.toLowerCase?.() || "";

    list.forEach((r) => {
      if (!r.exists) return;
      // image resolution: prefer chain image or saved local image; attempt external url, fallback to local asset
      const lsImgKey = `sc_room_image_${r.id}`;
      let candidateImg =
        r.image && String(r.image).trim()
          ? String(r.image).trim()
          : localStorage.getItem(lsImgKey) || "";
      if (candidateImg && !/^https?:\/\//i.test(candidateImg)) {
        if (/^\/\//.test(candidateImg)) candidateImg = "https:" + candidateImg;
      }
      const finalImg = candidateImg || "assets/dashboardAdmin.png";

      const card = document.createElement("div");
      card.className =
        "bg-white dark:bg-gray-800 rounded overflow-hidden border border-gray-200 dark:border-gray-800 shadow cursor-pointer";

      const imgWrap = document.createElement("div");
      imgWrap.className = "h-40 w-full overflow-hidden";

      const imgEl = document.createElement("img");
      imgEl.className = "w-full h-40 object-cover";
      imgEl.alt = r.name || "room";
      imgEl.src = finalImg;
      imgEl.onerror = function () {
        this.onerror = null;
        this.src = "assets/dashboardAdmin.png";
      };

      imgWrap.appendChild(imgEl);

      const content = document.createElement("div");
      content.className = "p-4";
      let priceEth = "0";
      try {
        priceEth = ethers.utils.formatEther(
          r.priceWei.toString ? r.priceWei : r.priceWei
        );
      } catch {}
      content.innerHTML = `
        <h4 class="font-semibold">${r.name}</h4>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${
          r.facilities && r.facilities.join
            ? r.facilities.slice(0, 3).join(" · ")
            : ""
        }</p>
        <div class="mt-3 flex items-center justify-between">
          <div class="text-blue-600 dark:text-blue-400 font-bold">${priceEth} ETH / malam</div>
          <div><button data-id="${
            r.id
          }" class="detailBtn px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Lihat</button></div>
        </div>
      `;

      card.appendChild(imgWrap);
      card.appendChild(content);

      card.addEventListener("click", (ev) => {
        if (
          ev.target &&
          (ev.target.tagName === "BUTTON" || ev.target.closest("button"))
        )
          return;
        showRoomDetail(r.id);
      });
      const btnDetail = content.querySelector(".detailBtn");
      if (btnDetail)
        btnDetail.addEventListener("click", (ev) => {
          ev.stopPropagation();
          showRoomDetail(r.id);
        });

      roomsGrid.appendChild(card);

      // list view
      if (
        query &&
        !r.name.toLowerCase().includes(query) &&
        !(r.facilities && r.facilities.join(",").toLowerCase().includes(query))
      )
        return;

      const listCard = document.createElement("div");
      listCard.className =
        "bg-white dark:bg-gray-800 rounded overflow-hidden border border-gray-200 dark:border-gray-800 shadow p-0";
      const imgWrap2 = document.createElement("div");
      imgWrap2.className = "h-40 w-full overflow-hidden";
      const imgEl2 = document.createElement("img");
      imgEl2.className = "w-full h-40 object-cover";
      imgEl2.alt = r.name || "room";
      imgEl2.src = finalImg;
      imgEl2.onerror = function () {
        this.onerror = null;
        this.src = "assets/dashboardAdmin.png";
      };
      imgWrap2.appendChild(imgEl2);

      const facHtml =
        r.facilities && r.facilities.length
          ? r.facilities
              .map(
                (f) =>
                  `<span class="inline-block text-xs px-2 py-1 mr-1 mt-2 bg-gray-100 dark:bg-gray-700 rounded">${f}</span>`
              )
              .join("")
          : "";

      let actionHtml = "";
      if (isAdmin) {
        actionHtml = `<button data-id="${r.id}" class="editRoomBtn px-3 py-1 border rounded text-xs">Edit</button>
                      <button data-id="${r.id}" class="delRoomBtn px-3 py-1 bg-red-600 text-white rounded text-xs">Hapus</button>`;
      } else {
        actionHtml = `<button data-id="${r.id}" class="bookNowBtn px-3 py-1 bg-blue-600 text-black rounded text-xs">Pesan Sekarang</button>
                      <button data-id="${r.id}" class="detailListBtn px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Detail</button>`;
      }

      const listContent = document.createElement("div");
      listContent.className = "p-4";
      listContent.innerHTML = `
        <h4 class="font-semibold">${r.name}</h4>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">${facHtml}</div>
        <div class="mt-3 flex items-center justify-between">
          <div class="text-blue-600 dark:text-blue-400 font-bold">${priceEth} ETH / malam</div>
          <div class="flex gap-2">${actionHtml}</div>
        </div>
      `;

      listCard.appendChild(imgWrap2);
      listCard.appendChild(listContent);
      roomsList.appendChild(listCard);
    });

    // actions
    document
      .querySelectorAll(".editRoomBtn")
      .forEach((btn) => btn.addEventListener("click", onEditRoom));
    document
      .querySelectorAll(".delRoomBtn")
      .forEach((btn) => btn.addEventListener("click", onDeleteRoom));
    document
      .querySelectorAll(".bookNowBtn")
      .forEach((btn) => btn.addEventListener("click", onBookRoom));
    document.querySelectorAll(".detailListBtn").forEach((btn) =>
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        showRoomDetail(ev.currentTarget.dataset.id);
      })
    );
  }

  // show room detail modal
  async function showRoomDetail(roomId) {
    if (!window._roomsCache) return;
    const r = window._roomsCache.find(
      (x) => x.id.toString() === roomId.toString()
    );
    if (!r) {
      const theme = getSwalTheme();
      return Swal.fire({
        title: "Error",
        text: "Ruangan tidak ditemukan",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
    const lsImgKey = `sc_room_image_${r.id}`;
    let candidateImg =
      r.image && String(r.image).trim()
        ? String(r.image).trim()
        : localStorage.getItem(lsImgKey) || "";
    if (candidateImg && !/^https?:\/\//i.test(candidateImg)) {
      if (/^\/\//.test(candidateImg)) candidateImg = "https:" + candidateImg;
    }
    const imgSrc = candidateImg || "assets/dashboardAdmin.png";
    const facilitiesHtml =
      r.facilities && r.facilities.length
        ? r.facilities
            .map(
              (f) =>
                `<span class="inline-block text-xs px-2 py-1 mr-1 mt-2 bg-gray-100 dark:bg-gray-700 rounded">${f}</span>`
            )
            .join("")
        : '<span class="text-gray-500 text-sm">Tidak ada fasilitas tercantum</span>';
    let priceEth = "0";
    try {
      priceEth = ethers.utils.formatEther(
        r.priceWei.toString ? r.priceWei : r.priceWei
      );
    } catch {}

    const theme = getSwalTheme();
    const html = `
      <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
        <div style="flex:1; min-width:260px; max-width:360px;">
          <img src="${imgSrc}" onerror="this.onerror=null;this.src='assets/dashboardAdmin.png';" style="width:100%; height:220px; object-fit:cover; border-radius:8px;"/>
        </div>
        <div style="flex:1 1 320px; min-width:220px;">
          <h3 style="margin:0 0 8px 0;">${r.name}</h3>
          <div style="color:${theme.color}; margin-bottom:8px;"><b>${priceEth} ETH</b> / malam</div>
          <div style="margin-bottom:8px;">${facilitiesHtml}</div>
          <div style="margin-bottom:12px; color:${theme.color}; font-size:13px;">Slots tersedia: ${r.slots}</div>
          <div style="display:flex; gap:8px;">
            <button id="swal_book_btn" class="swal2-confirm swal2-styled" style="background:${theme.confirmButton}; border:none;">Pesan Sekarang</button>
            <button id="swal_close_btn" class="swal2-cancel swal2-styled" style="background:${theme.cancelButton}; border:none;">Tutup</button>
          </div>
        </div>
      </div>
    `;
    Swal.fire({
      title: "Detail Ruangan",
      html,
      showConfirmButton: false,
      showCancelButton: false,
      background: theme.background,
      color: theme.color,
      width: 820,
      didOpen: () => {
        const closeBtn = document.getElementById("swal_close_btn");
        const bookBtn = document.getElementById("swal_book_btn");
        if (closeBtn) closeBtn.addEventListener("click", () => Swal.close());
        if (bookBtn)
          bookBtn.addEventListener("click", async () => {
            Swal.close();
            const { value: nights } = await Swal.fire({
              title: "Berapa malam?",
              input: "number",
              inputLabel: "Jumlah malam",
              inputAttributes: { min: 1, step: 1 },
              showCancelButton: true,
              confirmButtonText: "Pesan",
              cancelButtonText: "Batal",
              background: theme.background,
              color: theme.color,
              confirmButtonColor: theme.confirmButton,
              cancelButtonColor: theme.cancelButton,
              inputValidator: (value) => {
                if (!value || value <= 0)
                  return "Masukkan jumlah malam yang valid";
              },
            });
            if (!nights || nights <= 0) return;
            await performReservation(r, nights);
          });
      },
    });
  }
  // helper: cek apakah image URL bisa dimuat (resolve true/false)
  function verifyImageUrl(url, timeout = 4000) {
    return new Promise((resolve) => {
      if (!url) return resolve(false);
      try {
        const img = new Image();
        let done = false;
        const timer = setTimeout(() => {
          if (done) return;
          done = true;
          img.src = ""; // stop loading
          resolve(false);
        }, timeout);
        img.onload = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve(true);
        };
        img.onerror = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve(false);
        };
        // mulai load
        // tambahkan cache-busting sedikit agar tidak selalu cache (opsional)
        img.src = url;
      } catch (e) {
        return resolve(false);
      }
    });
  }

  // Add Room (admin) 
  roomsListBtnAdd?.addEventListener("click", async () => {
    const theme = getSwalTheme();
    const { value: form } = await Swal.fire({
      title: "Tambah Ruangan Baru",
      html:
        `<input id="r_name" class="swal2-input" placeholder="Nama Ruangan" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="r_price" class="swal2-input" placeholder="Harga per malam (ETH)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="r_slots" class="swal2-input" placeholder="Slots (jumlah ketersediaan)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="r_facilities" class="swal2-input" placeholder="Fasilitas (pisah dengan koma)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">` +
        `<input id="r_image" class="swal2-input" placeholder="Image URL (opsional)" style="background: ${theme.inputBg}; color: ${theme.inputColor}; border-color: ${theme.border};">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Tambah Ruangan",
      cancelButtonText: "Batal",
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButton,
      cancelButtonColor: theme.cancelButton,
      preConfirm: () => ({
        name: document.getElementById("r_name").value,
        price: document.getElementById("r_price").value,
        slots: document.getElementById("r_slots").value,
        facilities: document.getElementById("r_facilities").value,
        image: document.getElementById("r_image").value,
      }),
    });
    if (!form) return;
    const { name, price, slots, facilities, image } = form;
    if (!name || !price || !slots) {
      const theme = getSwalTheme();
      return Swal.fire({
        title: "Invalid",
        text: "Isi semua field penting",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
    const facilitiesArray = facilities
      ? facilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    try {
      if (!contract) throw new Error("Not connected to contract");
      const priceWei = ethers.utils.parseEther(price);
      const tx = await contract.addRoom(
        name,
        priceWei,
        parseInt(slots),
        facilitiesArray
      );
      await tx.wait();

      // Refresh rooms cache supaya kita punya id & data terbaru
      try {
        await loadRooms();
      } catch (e) {
        console.warn("loadRooms after addRoom failed", e);
      }

      // Jika user memberi image URL, verifikasi dulu sebelum simpan
      if (image && String(image).trim()) {
        const imgUrl = String(image).trim();
        const ok = await verifyImageUrl(imgUrl, 5000); // 5s timeout
        if (ok) {
          try {
            // cari room yang baru berdasarkan name + price (harus unik/terbedakan)
            const candidate = window._roomsCache.find((rr) => {
              try {
                return (
                  rr.name === name &&
                  ethers.utils.formatEther(
                    rr.priceWei.toString ? rr.priceWei : rr.priceWei
                  ) === price
                );
              } catch (e) {
                return rr.name === name;
              }
            });
            if (candidate && candidate.id) {
              localStorage.setItem(`sc_room_image_${candidate.id}`, imgUrl);
            } else {
              // fallback: simpan dengan key sementara supaya bisa dipakai ketika admin reload/refresh manual
              // key format: sc_room_image_temp_<timestamp>
              const tempKey = `sc_room_image_temp_${Date.now()}`;
              localStorage.setItem(
                tempKey,
                JSON.stringify({ name, price, image: imgUrl })
              );
              console.warn(
                "Room baru berhasil ditambahkan tetapi id tidak ditemukan. Gambar disimpan pada key sementara:",
                tempKey
              );
            }
          } catch (e) {
            console.warn("Gagal menyimpan image ke localStorage:", e);
          }
        } else {
          // beri notifikasi kalau URL gambar tidak valid / tidak dapat diakses
          const theme2 = getSwalTheme();
          Swal.fire({
            icon: "warning",
            title: "Gambar tidak bisa dimuat",
            text: "URL gambar yang Anda masukkan tidak dapat dimuat. Ruangan tetap ditambahkan tanpa gambar khusus.",
            background: theme2.background,
            color: theme2.color,
          });
        }
      }

      const theme2 = getSwalTheme();
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Ruangan ditambahkan",
        background: theme2.background,
        color: theme2.color,
      });

      // reload rooms & metrics (safety)
      try {
        await loadRooms();
      } catch (e) {
        console.warn(e);
      }
      try {
        await updateMetrics();
      } catch (e) {
        console.warn(e);
      }
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({
        title: "Error",
        text: "Gagal menambah ruangan (cek console)",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
  });

  // Edit Room (admin)
  async function onEditRoom(e) {
    const roomId = e.currentTarget.dataset.id;
    let current = null;
    try {
      if (!contract) throw new Error("Not connected to contract");
      const rooms = await contract.getAllRooms();
      const r = rooms.find((x) => x.id.toString() === roomId.toString());
      if (r) {
        current = {
          name: r.name,
          priceEth: ethers.utils.formatEther(r.priceWei),
          slots: r.slots.toString ? r.slots.toString() : String(r.slots),
          facilities: Array.isArray(r.facilities)
            ? r.facilities.map((f) => f.toString())
            : [],
          image: localStorage.getItem(`sc_room_image_${r.id}`) || "",
        };
      }
    } catch (err) {
      console.warn("prefill fail", err);
    }

    const theme = getSwalTheme();
    const { value: vals } = await Swal.fire({
      title: "Edit Ruangan",
      html:
        `<input id="er_name" class="swal2-input" placeholder="Nama Ruangan" value="${
          current?.name || ""
        }" style="background: ${theme.inputBg}; color: ${
          theme.inputColor
        }; border-color: ${theme.border};">` +
        `<input id="er_price" class="swal2-input" placeholder="Harga per malam (ETH)" value="${
          current?.priceEth || ""
        }" style="background: ${theme.inputBg}; color: ${
          theme.inputColor
        }; border-color: ${theme.border};">` +
        `<input id="er_slots" class="swal2-input" placeholder="Slots" value="${
          current?.slots || ""
        }" style="background: ${theme.inputBg}; color: ${
          theme.inputColor
        }; border-color: ${theme.border};">` +
        `<input id="er_facilities" class="swal2-input" placeholder="Fasilitas (pisah dengan koma)" value="${(
          current?.facilities || []
        ).join(", ")}" style="background: ${theme.inputBg}; color: ${
          theme.inputColor
        }; border-color: ${theme.border};">` +
        `<input id="er_image" class="swal2-input" placeholder="Image URL (opsional)" value="${
          current?.image || ""
        }" style="background: ${theme.inputBg}; color: ${
          theme.inputColor
        }; border-color: ${theme.border};">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan Perubahan",
      cancelButtonText: "Batal",
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButton,
      cancelButtonColor: theme.cancelButton,
      preConfirm: () => ({
        name: document.getElementById("er_name").value,
        price: document.getElementById("er_price").value,
        slots: document.getElementById("er_slots").value,
        facilities: document.getElementById("er_facilities").value,
        image: document.getElementById("er_image").value,
      }),
    });
    if (!vals) return;
    const { name, price, slots, facilities, image } = vals;
    if (!name || !price || !slots) {
      const theme = getSwalTheme();
      return Swal.fire({
        title: "Invalid",
        text: "Isi field penting",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
    const facilitiesArray = facilities
      ? facilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    try {
      if (!contract) throw new Error("Not connected to contract");
      const priceWei = ethers.utils.parseEther(price);
      const tx = await contract.editRoom(
        parseInt(roomId),
        name,
        priceWei,
        parseInt(slots),
        facilitiesArray
      );
      await tx.wait();
      if (image && String(image).trim())
        localStorage.setItem(`sc_room_image_${roomId}`, String(image).trim());
      else if (localStorage.getItem(`sc_room_image_${roomId}`))
        localStorage.removeItem(`sc_room_image_${roomId}`);
      const theme2 = getSwalTheme();
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Ruangan diperbarui",
        background: theme2.background,
        color: theme2.color,
      });
      await loadRooms();
      await updateMetrics();
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({
        title: "Error",
        text: "Gagal update ruangan (cek console)",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
  }

  // Delete Room (admin)
  async function onDeleteRoom(e) {
    const roomId = e.currentTarget.dataset.id;
    const theme = getSwalTheme();
    const confirm = await Swal.fire({
      title: "Hapus ruangan?",
      text: "Tindakan ini menonaktifkan ruangan (bisa ditambahkan kembali oleh admin).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      background: theme.background,
      color: theme.color,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: theme.cancelButton,
    });
    if (!confirm.isConfirmed) return;
    try {
      if (!contract) throw new Error("Not connected to contract");
      const tx = await contract.removeRoom(parseInt(roomId));
      await tx.wait();
      if (localStorage.getItem(`sc_room_image_${roomId}`))
        localStorage.removeItem(`sc_room_image_${roomId}`);
      const theme2 = getSwalTheme();
      Swal.fire({
        icon: "success",
        title: "Dihapus",
        text: "Ruangan telah dinonaktifkan",
        background: theme2.background,
        color: theme2.color,
      });
      await loadRooms();
      await updateMetrics();
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({
        title: "Error",
        text: "Gagal hapus ruangan (cek console)",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
  }

  // reservation helpers
  async function performReservation(room, nights) {
    try {
      if (!contract) throw new Error("Not connected to contract");
      const priceBN = ethers.BigNumber.from(
        room.priceWei.toString ? room.priceWei : room.priceWei
      );
      const now = Math.floor(Date.now() / 1000);
      const to = now + nights * 86400;
      const totalCost = priceBN.mul(nights);
      const totalEth = ethers.utils.formatEther(totalCost);
      const theme = getSwalTheme();
      const confirmResult = await Swal.fire({
        title: "Konfirmasi Pemesanan",
        html: `<div style="text-align:left;"><p><strong>Ruangan:</strong> ${room.name}</p><p><strong>Durasi:</strong> ${nights} malam</p><p><strong>Total Biaya:</strong> ${totalEth} ETH</p></div>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Konfirmasi Pembayaran",
        cancelButtonText: "Batal",
        background: theme.background,
        color: theme.color,
        confirmButtonColor: theme.confirmButton,
        cancelButtonColor: theme.cancelButton,
      });
      if (!confirmResult.isConfirmed) return;
      const tx = await contract.reserve(parseInt(room.id), now, to, {
        value: totalCost,
      });
      await tx.wait();
      const themeSuccess = getSwalTheme();
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Reservasi berhasil",
        background: themeSuccess.background,
        color: themeSuccess.color,
      });
      await loadRooms();
      await updateMetrics();
    } catch (err) {
      console.error(err);
      const theme = getSwalTheme();
      Swal.fire({
        title: "Error",
        text: "Gagal reservasi (cek console)",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
  }

  async function onBookRoom(e) {
    const roomId = e.currentTarget.dataset.id;
    const r = window._roomsCache.find(
      (x) => x.id.toString() === roomId.toString()
    );
    if (!r) {
      const theme = getSwalTheme();
      return Swal.fire({
        title: "Error",
        text: "Ruangan tidak ditemukan",
        icon: "error",
        background: theme.background,
        color: theme.color,
      });
    }
    const theme = getSwalTheme();
    const { value: nights } = await Swal.fire({
      title: "Berapa malam?",
      input: "number",
      inputLabel: "Jumlah malam",
      inputAttributes: { min: 1, step: 1 },
      showCancelButton: true,
      confirmButtonText: "Pesan",
      cancelButtonText: "Batal",
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButton,
      cancelButtonColor: theme.cancelButton,
      inputValidator: (value) => {
        if (!value || value <= 0) return "Masukkan jumlah malam yang valid";
      },
    });
    if (!nights || nights <= 0) return;
    await performReservation(r, nights);
  }

  // History (admin shows user profile + WA link)
  async function loadHistory() {
    if (!contract) {
      historyTable.innerHTML =
        '<div class="text-gray-400">Silakan konek wallet terlebih dahulu.</div>';
      return;
    }
    historyTable.innerHTML = "";
    try {
      if (isAdmin) {
        const list = await contract.getAllReservations();
        if (!list.length) {
          historyTable.innerHTML =
            '<div class="text-gray-400">Tidak ada pemesanan.</div>';
          return;
        }
        list.forEach((r) => {
          const div = document.createElement("div");
          div.className = "p-3 border-b border-gray-200 dark:border-gray-800";
          const from = new Date(r.fromTimestamp * 1000).toLocaleDateString();
          const to = new Date(r.toTimestamp * 1000).toLocaleDateString();
          const userAddr = r.user ? r.user.toString().toLowerCase() : "";
          const profile = getProfile(userAddr) || {
            name: null,
            phone: null,
            image: null,
          };
          const rawPhone = profile.phone ? String(profile.phone) : "";
          const cleanPhone = rawPhone.replace(/\D+/g, "");
          const waEnabled = cleanPhone && cleanPhone.length >= 6;
          const userLabel =
            profile.name && profile.name.trim().length
              ? profile.name
              : shortAddr(userAddr);
          const contactBtnHtml = waEnabled
            ? `<a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener noreferrer" class="inline-block ml-2 px-3 py-1 bg-green-600 text-black rounded text-xs">Hubungi</a>`
            : `<button disabled class="inline-block ml-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded text-xs cursor-not-allowed">Hubungi</button>`;
          div.innerHTML = `
            <div class="flex justify-between">
              <div><b>#${r.id}</b> - Room ${r.roomId}</div>
              <div>${
                r.active
                  ? '<span class="text-green-600">Dalam Penginapan</span>'
                  : '<span class="text-gray-500">Sudah Checkout</span>'
              }</div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              User: <span class="text-gray-900 dark:text-gray-100">${userLabel}</span> <span class="text-xs text-gray-500 dark:text-gray-400">(${shortAddr(
            userAddr
          )})</span>
              ${
                profile.phone
                  ? `<div class="mt-1">Telp: <span class="text-gray-900 dark:text-gray-100">${profile.phone}</span> ${contactBtnHtml}</div>`
                  : `<div class="mt-1 text-sm text-gray-500 dark:text-gray-400">Telp: - ${contactBtnHtml}</div>`
              }
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Periode: ${from} - ${to}</div>
          `;
          historyTable.appendChild(div);
        });
      } else {
        const list = await contract.getMyReservations();
        if (!list.length) {
          historyTable.innerHTML =
            '<div class="text-gray-400">Belum ada reservasi.</div>';
          return;
        }
        for (const r of list) {
          const div = document.createElement("div");
          div.className = "p-3 border-b border-gray-200 dark:border-gray-800";
          const from = new Date(r.fromTimestamp * 1000).toLocaleDateString();
          const to = new Date(r.toTimestamp * 1000).toLocaleDateString();
          div.innerHTML = `<div class="flex justify-between"><div><b>#${
            r.id
          }</b> - Room ${r.roomId}</div><div>${
            r.active
              ? '<span class="text-green-600">Dalam Penginapan</span>'
              : '<span class="text-gray-500">Sudah Checkout</span>'
          }</div></div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Periode: ${from} - ${to}</div>
            ${
              r.active
                ? '<div class="mt-2"><button class="checkoutBtn bg-red-600 px-3 py-1 rounded">Checkout</button></div>'
                : ""
            }`;
          if (r.active) {
            setTimeout(() => {
              const btn = div.querySelector(".checkoutBtn");
              if (!btn) return;
              btn.addEventListener("click", async () => {
                try {
                  const tx = await contract.checkout(r.id);
                  await tx.wait();
                  const theme = getSwalTheme();
                  Swal.fire({
                    icon: "success",
                    title: "Checkout berhasil",
                    background: theme.background,
                    color: theme.color,
                  });
                  await loadHistory();
                  await loadRooms();
                  await updateMetrics();
                } catch (err) {
                  console.error(err);
                  const theme = getSwalTheme();
                  Swal.fire({
                    title: "Error",
                    text: "Gagal checkout (cek console)",
                    icon: "error",
                    background: theme.background,
                    color: theme.color,
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
      historyTable.innerHTML =
        '<div class="text-red-500">Gagal load history (cek console)</div>';
    }
  }

  // update metrics —  "Total Pengeluaran (ETH)"
async function updateMetrics() {
  if (!contract) return;
  try {
    const rooms = await contract.getAllRooms();

    const activeRoomsCount = rooms.filter(r => {
      try { return r.exists === true || String(r.exists) === 'true'; }
      catch { return false; }
    }).length;
    metricRooms.innerText = activeRoomsCount;

    let active = 0, done = 0;
    let revenueWei = ethers.BigNumber.from(0);

    try {
      if (isAdmin) {
        const all = await contract.getAllReservations();
        const priceMap = {};
        rooms.forEach(r => {
          priceMap[r.id.toString()] =
            ethers.BigNumber.from(r.priceWei.toString ? r.priceWei : r.priceWei);
        });

        for (const r of all) {
          if (r.active) active++; else done++;
          const nights = Math.max(
            1,
            Math.ceil((Number(r.toTimestamp) - Number(r.fromTimestamp)) / 86400)
          );
          const roomPriceWei = priceMap[r.roomId.toString()] || ethers.BigNumber.from(0);
          revenueWei = revenueWei.add(roomPriceWei.mul(nights));
        }

      } else {
        const myReservations = await contract.getMyReservations();
        const priceMap = {};
        rooms.forEach(r => {
          priceMap[r.id.toString()] =
            ethers.BigNumber.from(r.priceWei.toString ? r.priceWei : r.priceWei);
        });

        for (const r of myReservations) {
          if (r.active) active++; else done++;
          const nights = Math.max(
            1,
            Math.ceil((Number(r.toTimestamp) - Number(r.fromTimestamp)) / 86400)
          );
          const roomPriceWei = priceMap[r.roomId.toString()] || ethers.BigNumber.from(0);
          revenueWei = revenueWei.add(roomPriceWei.mul(nights));
        }
      }
    } catch (err) {
      console.warn('get reservations failed', err);
    }

    metricActive.innerText = active;
    metricDone.innerText = done;

    // Label + nilai pendapatan / pengeluaran
    if (isAdmin) {
      try {
        const revEth = ethers.utils.formatEther(revenueWei);
        metricRevenue.innerText = `${Number(revEth).toFixed(4)} ETH`;
        metricRevenueLabel.textContent = 'Total Pendapatan';
        metricRevenue.parentElement.style.display = 'block';
      } catch {
        metricRevenue.innerText = '0 ETH';
        metricRevenueLabel.textContent = 'Total Pendapatan';
        metricRevenue.parentElement.style.display = 'block';
      }
    } else {
      try {
        const revEth = ethers.utils.formatEther(revenueWei);
        metricRevenue.innerText = `${Number(revEth).toFixed(4)} ETH`;
        metricRevenueLabel.textContent = 'Total Pengeluaran (ETH)';
        metricRevenue.parentElement.style.display = 'block';
      } catch {
        metricRevenue.innerText = '0 ETH';
        metricRevenueLabel.textContent = 'Total Pengeluaran (ETH)';
        metricRevenue.parentElement.style.display = 'block';
      }
    }

  } catch (err) {
    console.error('Error updating metrics:', err);
    metricRooms.innerText = '0';
    metricActive.innerText = '0';
    metricDone.innerText = '0';
    metricRevenue.innerText = '0 ETH';
    metricRevenueLabel.textContent = isAdmin ? 'Total Pendapatan' : 'Total Pengeluaran (ETH)';
    metricRevenue.parentElement.style.display = 'block';
  }
}

  // search handler
  roomsListSearch?.addEventListener(
    "input",
    debounce(async () => {
      await loadRooms();
    }, 250)
  );
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
  window._hc = { loadRooms, loadHistory, updateMetrics, showRoomDetail };
})();
