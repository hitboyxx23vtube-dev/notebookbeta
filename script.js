const username = document.getElementById("username");
const password = document.getElementById("password");
const authMessage = document.getElementById("authMessage");
const authContainer = document.getElementById("authContainer");
const notebookContainer = document.getElementById("notebookContainer");
const tabsDiv = document.getElementById("tabs");
const noteInput = document.getElementById("noteInput");
const editorContainer = document.getElementById("editorContainer");
const stickerDumpster = document.getElementById("stickerDumpster");
const settingsPanel = document.getElementById("settingsPanel");
const bgColorInput = document.getElementById("bgColor");
const tabColorInput = document.getElementById("tabColor");
const tabTextColorInput = document.getElementById("tabTextColor");
const bgImageInput = document.getElementById("bgImage");
const bgMusicInput = document.getElementById("bgMusic");
const fontSelector = document.getElementById("fontSelector");
const customFontInput = document.getElementById("customFont");
const musicPlayer = document.getElementById("musicPlayer");
const btnCreateTab = document.getElementById("btnCreateTab");
const btnSettings = document.getElementById("btnSettings");
const btnExport = document.getElementById("btnExport");
const resetThemeBtn = document.getElementById("resetThemeBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const customStickerInput = document.getElementById("customSticker");

let currentUser = "";
let currentTab = "";
let tabs = [];

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function login() {
  const users = getUsers();
  const u = username.value.trim(),
    p = password.value.trim();
  if (!u || !p) {
    authMessage.style.color = "red";
    authMessage.textContent = "Please enter username and password.";
    return;
  }
  if (users[u] && users[u].password === p) {
    currentUser = u;
    authContainer.style.display = "none";
    notebookContainer.style.display = "block";
    authMessage.textContent = "";
    loadUserData();
  } else {
    authMessage.style.color = "red";
    authMessage.textContent = "Incorrect username or password!";
  }
}

function signup() {
  const users = getUsers();
  const u = username.value.trim(),
    p = password.value.trim();
  if (!u || !p) {
    authMessage.style.color = "red";
    authMessage.textContent = "Please enter username and password.";
    return;
  }
  if (users[u]) {
    authMessage.style.color = "red";
    authMessage.textContent = "User already exists!";
  } else {
    users[u] = { password: p, data: { tabs: {} } };
    saveUsers(users);
    authMessage.style.color = "lightgreen";
    authMessage.textContent = "User created! Please login.";
  }
}

function loadUserData() {
  tabsDiv.innerHTML = "";
  const userData = getUsers()[currentUser].data;
  tabs = Object.keys(userData.tabs);
  if (tabs.length > 0) {
    tabs.forEach((tab) => renderTab(tab));
    switchTab(tabs[0]);
  } else {
    currentTab = "";
    noteInput.value = "";
    editorContainer.style.backgroundImage = "none";
    musicPlayer.pause();
    musicPlayer.src = "";
  }
}

function createTab() {
  let name = prompt("Enter tab name:");
  if (!name) return;
  name = name.trim();
  if (!name) return alert("Tab name cannot be empty");
  if (tabs.includes(name)) {
    alert("Tab name already exists.");
    return;
  }
  tabs.push(name);
  const users = getUsers();
  users[currentUser].data.tabs[name] = {
    content: "",
    stickers: [],
    bgImage: "",
    music: "",
    font: "Arial",
    customFont: "",
    bgColor: "#000000",
    tabColor: "#7b3fbf", // purple
    tabTextColor: "#FFFFFF",
  };
  saveUsers(users);
  renderTab(name);
  switchTab(name);
}

function renderTab(name) {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.textContent = name;
  const tabData = getUsers()[currentUser].data.tabs[name];
  tab.style.backgroundColor = tabData.tabColor || "#7b3fbf";
  tab.style.color = tabData.tabTextColor || "white";

  tab.onclick = () => switchTab(name);
  tabsDiv.appendChild(tab);
}

function switchTab(name) {
  currentTab = name;
  Array.from(tabsDiv.children).forEach((t) => t.classList.remove("active"));
  const activeTab = [...tabsDiv.children].find((t) => t.textContent === name);
  if (activeTab) activeTab.classList.add("active");

  const tabData = getUsers()[currentUser].data.tabs[name];
  noteInput.value = tabData.content;
  editorContainer.style.backgroundImage = tabData.bgImage ? `url(${tabData.bgImage})` : "none";
  noteInput.style.fontFamily = tabData.customFont || tabData.font || "Arial";
  editorContainer.style.backgroundColor = tabData.bgColor || "black";

  bgColorInput.value = tabData.bgColor || "#000000";
  tabColorInput.value = tabData.tabColor || "#7b3fbf";
  tabTextColorInput.value = tabData.tabTextColor || "#FFFFFF";
  fontSelector.value = tabData.customFont ? "Custom" : tabData.font;

  if (tabData.music) {
    musicPlayer.src = tabData.music;
    musicPlayer.play();
  } else {
    musicPlayer.pause();
    musicPlayer.src = "";
  }

  // Remove existing stickers
  document.querySelectorAll(".sticker, .emojiOnCanvas").forEach((el) => el.remove());
  // Add saved stickers
  tabData.stickers.forEach((sticker) => addStickerToCanvas(sticker));
}

noteInput.addEventListener("input", () => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  users[currentUser].data.tabs[currentTab].content = noteInput.value;
  saveUsers(users);
});

btnCreateTab.addEventListener("click", createTab);
btnSettings.addEventListener("click", () => {
  if (!currentTab) return alert("Please select or create a tab first.");
  settingsPanel.style.display = "block";
});
btnExport.addEventListener("click", () => {
  if (!currentUser || !currentTab) return alert("Please select a tab.");
  const content = getUsers()[currentUser].data.tabs[currentTab].content;
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${currentTab}.txt`;
  a.click();
});
resetThemeBtn.addEventListener("click", () => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  const tabData = users[currentUser].data.tabs[currentTab];
  tabData.bgColor = "#000000";
  tabData.tabColor = "#7b3fbf";
  tabData.tabTextColor = "#FFFFFF";
  tabData.bgImage = "";
  tabData.music = "";
  tabData.font = "Arial";
  tabData.customFont = "";
  saveUsers(users);
  switchTab(currentTab);
});
closeSettingsBtn.addEventListener("click", () => {
  settingsPanel.style.display = "none";
});

// Sticker Drag & Drop Logic

customStickerInput.addEventListener("change", (e) => {
  if (!currentUser || !currentTab) return alert("Select a tab first.");
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.createElement("img");
    img.src = reader.result;
    img.className = "sticker";
    setupStickerDrag(img, reader.result, "image");
    editorContainer.appendChild(img);
    saveSticker(reader.result, "image", 100, 100);
  };
  reader.readAsDataURL(file);
  e.target.value = "";
});

document.querySelectorAll(".emojiSticker").forEach((emoji) => {
  emoji.addEventListener("dragstart", (e) => {
    const el = document.createElement("span");
    el.className = "emojiOnCanvas dragging";
    el.textContent = e.target.textContent;
    editorContainer.appendChild(el);
    e.dataTransfer.setDragImage(el, 25, 25);
    el.style.left = e.clientX + "px";
    el.style.top = e.clientY + "px";
    e.dataTransfer.setData("text/plain", e.target.textContent);
    e.dataTransfer.effectAllowed = "copyMove";
  });
});

function addStickerToCanvas(sticker) {
  if (!currentUser || !currentTab) return;
  if (sticker.type === "image") {
    const img = document.createElement("img");
    img.src = sticker.src;
    img.className = "sticker";
    img.style.left = sticker.x + "px";
    img.style.top = sticker.y + "px";
    setupStickerDrag(img, sticker.src, "image");
    editorContainer.appendChild(img);
  } else if (sticker.type === "emoji") {
    const span = document.createElement("span");
    span.textContent = sticker.src;
    span.className = "emojiOnCanvas";
    span.style.left = sticker.x + "px";
    span.style.top = sticker.y + "px";
    setupStickerDrag(span, sticker.src, "emoji");
    editorContainer.appendChild(span);
  }
}

function setupStickerDrag(el, src, type) {
  el.style.position = "absolute";
  el.style.touchAction = "none";
  el.draggable = true;

  let offsetX, offsetY;

  el.addEventListener("dragstart", (e) => {
    el.classList.add("dragging");
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    e.dataTransfer.setDragImage(el, offsetX, offsetY);
    e.dataTransfer.setData("text/plain", JSON.stringify({ src, type }));
  });

  el.addEventListener("dragend", (e) => {
    el.classList.remove("dragging");

    // Compute new position relative to editorContainer
    const containerRect = editorContainer.getBoundingClientRect();
    let x = e.clientX - containerRect.left - offsetX;
    let y = e.clientY - containerRect.top - offsetY;

    // Clamp positions so sticker stays inside container
    x = Math.max(0, Math.min(x, containerRect.width - el.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - el.offsetHeight));

    // Check collision with dumpster
    if (isOverDumpster(x, y, el.offsetWidth, el.offsetHeight)) {
      // Remove sticker & update storage
      el.remove();
      removeSticker(src, type);
      return;
    }

    el.style.left = x + "px";
    el.style.top = y + "px";

    saveStickerPosition(src, type, x, y);
  });
}

// Helpers to check dumpster collision

function isOverDumpster(x, y, w, h) {
  const dumpsterRect = stickerDumpster.getBoundingClientRect();
  const containerRect = editorContainer.getBoundingClientRect();

  // Sticker pos relative to viewport:
  const stickerLeft = containerRect.left + x;
  const stickerRight = stickerLeft + w;
  const stickerTop = containerRect.top + y;
  const stickerBottom = stickerTop + h;

  // Check overlap (rect collision)
  return !(
    stickerRight < dumpsterRect.left ||
    stickerLeft > dumpsterRect.right ||
    stickerBottom < dumpsterRect.top ||
    stickerTop > dumpsterRect.bottom
  );
}

function saveSticker(src, type, x, y) {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  const tabData = users[currentUser].data.tabs[currentTab];

  tabData.stickers.push({ src, type, x, y });
  saveUsers(users);
}

function saveStickerPosition(src, type, x, y) {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  const tabData = users[currentUser].data.tabs[currentTab];
  let sticker = tabData.stickers.find((s) => s.src === src && s.type === type);
  if (sticker) {
    sticker.x = x;
    sticker.y = y;
    saveUsers(users);
  }
}

function removeSticker(src, type) {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  let tabData = users[currentUser].data.tabs[currentTab];
  tabData.stickers = tabData.stickers.filter((s) => !(s.src === src && s.type === type));
  saveUsers(users);
}

// Settings inputs change handlers

bgColorInput.addEventListener("input", (e) => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  users[currentUser].data.tabs[currentTab].bgColor = e.target.value;
  editorContainer.style.backgroundColor = e.target.value;
  saveUsers(users);
});

tabColorInput.addEventListener("input", (e) => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  users[currentUser].data.tabs[currentTab].tabColor = e.target.value;

  [...tabsDiv.children].forEach((tabEl) => {
    if (tabEl.textContent === currentTab) tabEl.style.backgroundColor = e.target.value;
  });
  saveUsers(users);
});

tabTextColorInput.addEventListener("input", (e) => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  users[currentUser].data.tabs[currentTab].tabTextColor = e.target.value;

  [...tabsDiv.children].forEach((tabEl) => {
    if (tabEl.textContent === currentTab) tabEl.style.color = e.target.value;
  });
  saveUsers(users);
});

bgImageInput.addEventListener("change", (e) => {
  if (!currentUser || !currentTab) return;
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const users = getUsers();
    users[currentUser].data.tabs[currentTab].bgImage = reader.result;
    editorContainer.style.backgroundImage = `url(${reader.result})`;
    saveUsers(users);
  };
  reader.readAsDataURL(file);
});

bgMusicInput.addEventListener("change", (e) => {
  if (!currentUser || !currentTab) return;
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const users = getUsers();
    users[currentUser].data.tabs[currentTab].music = reader.result;
    musicPlayer.src = reader.result;
    musicPlayer.play();
    saveUsers(users);
  };
  reader.readAsDataURL(file);
});

fontSelector.addEventListener("change", (e) => {
  if (!currentUser || !currentTab) return;
  const val = e.target.value;
  const users = getUsers();
  if (val === "Custom") {
    customFontInput.style.display = "block";
  } else {
    customFontInput.style.display = "none";
    users[currentUser].data.tabs[currentTab].font = val;
    users[currentUser].data.tabs[currentTab].customFont = "";
    noteInput.style.fontFamily = val;
    saveUsers(users);
  }
});

customFontInput.addEventListener("change", (e) => {
  if (!currentUser || !currentTab) return;
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const fontData = reader.result;
    const fontName = "CustomFont_" + Date.now();
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: '${fontName}';
        src: url('${fontData}');
      }
    `;
    document.head.appendChild(style);
    const users = getUsers();
    users[currentUser].data.tabs[currentTab].customFont = fontName;
    users[currentUser].data.tabs[currentTab].font = "";
    noteInput.style.fontFamily = fontName;
    saveUsers(users);
  };
  reader.readAsDataURL(file);
});

// Login/signup buttons

document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("signupBtn").addEventListener("click", signup);
