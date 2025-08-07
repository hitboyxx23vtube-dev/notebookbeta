// Elements
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

const playMusicBtn = document.getElementById("playMusicBtn");
const pauseMusicBtn = document.getElementById("pauseMusicBtn");
const stopMusicBtn = document.getElementById("stopMusicBtn");
const volumeRange = document.getElementById("volumeRange");

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
    editorContainer.style.backgroundColor = "black";
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

function deleteTab(name) {
  if (!name) return;
  if (!confirm(`Delete tab "${name}"? This cannot be undone.`)) return;
  const users = getUsers();
  delete users[currentUser].data.tabs[name];
  saveUsers(users);
  tabs = tabs.filter((t) => t !== name);
  if (tabs.length > 0) {
    loadUserData();
  } else {
    currentTab = "";
    tabsDiv.innerHTML = "";
    noteInput.value = "";
    editorContainer.style.backgroundImage = "none";
    editorContainer.style.backgroundColor = "black";
    musicPlayer.pause();
    musicPlayer.src = "";
  }
}

function renderTab(name) {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.textContent = name;
  const tabData = getUsers()[currentUser].data.tabs[name];
  tab.style.backgroundColor = tabData.tabColor || "#7b3fbf";
  tab.style.color = tabData.tabTextColor || "white";

  tab.onclick = () => switchTab(name);

  // Add delete button
  const delBtn = document.createElement("span");
  delBtn.className = "deleteTabBtn";
  delBtn.textContent = "×";
  delBtn.title = `Delete tab "${name}"`;
  delBtn.onclick = (e) => {
    e.stopPropagation();
    deleteTab(name);
  };
  tab.appendChild(delBtn);

  tabsDiv.appendChild(tab);
}

function switchTab(name) {
  currentTab = name;
  Array.from(tabsDiv.children).forEach((t) => t.classList.remove("active"));
  const activeTab = [...tabsDiv.children].find((t) => t.textContent.startsWith(name));
  if (activeTab) activeTab.classList.add("active");

  const users = getUsers();
  const tabData = users[currentUser].data.tabs[name];
  noteInput.value = tabData.content || "";
  editorContainer.style.backgroundColor = tabData.bgColor || "#000000";
  editorContainer.style.backgroundImage = tabData.bgImage ? `url(${tabData.bgImage})` : "none";
  noteInput.style.fontFamily = tabData.customFont || tabData.font || "Arial";
  // Clear existing stickers
  Array.from(editorContainer.querySelectorAll("img.sticker, .emojiOnCanvas")).forEach((el) => el.remove());

  // Add stickers for this tab
  if (tabData.stickers && Array.isArray(tabData.stickers)) {
    tabData.stickers.forEach(addStickerToCanvas);
  }

  // Music
  if (tabData.music) {
    musicPlayer.src = tabData.music;
    musicPlayer.play();
  } else {
    musicPlayer.pause();
    musicPlayer.src = "";
  }

  // Update settings panel values
  bgColorInput.value = tabData.bgColor || "#000000";
  tabColorInput.value = tabData.tabColor || "#7b3fbf";
  tabTextColorInput.value = tabData.tabTextColor || "#FFFFFF";
  fontSelector.value = tabData.font || "Arial";
  if (tabData.font === "") {
    fontSelector.value = "Custom";
    customFontInput.style.display = "block";
  } else {
    customFontInput.style.display = "none";
  }
}

noteInput.oninput = () => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  users[currentUser].data.tabs[currentTab].content = noteInput.value;
  saveUsers(users);
};

btnCreateTab.onclick = createTab;
btnSettings.onclick = () => {
  settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
};
btnExport.onclick = () => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  const content = users[currentUser].data.tabs[currentTab].content;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  a.download = `${currentTab}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
};
resetThemeBtn.onclick = () => {
  if (!currentUser || !currentTab) return;
  bgColorInput.value = "#000000";
  tabColorInput.value = "#7b3fbf";
  tabTextColorInput.value = "#FFFFFF";
  fontSelector.value = "Arial";
  customFontInput.style.display = "none";
  customFontInput.value = "";

  const users = getUsers();
  const tabData = users[currentUser].data.tabs[currentTab];
  tabData.bgColor = "#000000";
  tabData.tabColor = "#7b3fbf";
  tabData.tabTextColor = "#FFFFFF";
  tabData.font = "Arial";
  tabData.customFont = "";
  tabData.bgImage = "";
  tabData.music = "";
  saveUsers(users);

  switchTab(currentTab);
};
closeSettingsBtn.onclick = () => (settingsPanel.style.display = "none");

// Settings input handlers
bgColorInput.oninput = (e) => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  users[currentUser].data.tabs[currentTab].bgColor = e.target.value;
  editorContainer.style.backgroundColor = e.target.value;
  saveUsers(users);
};
tabColorInput.oninput = (e) => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  users[currentUser].data.tabs[currentTab].tabColor = e.target.value;
  Array.from(tabsDiv.children).forEach((tabEl) => {
    if (tabEl.textContent.startsWith(currentTab)) tabEl.style.backgroundColor = e.target.value;
  });
  saveUsers(users);
};
tabTextColorInput.oninput = (e) => {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  users[currentUser].data.tabs[currentTab].tabTextColor = e.target.value;
  Array.from(tabsDiv.children).forEach((tabEl) => {
    if (tabEl.textContent.startsWith(currentTab)) tabEl.style.color = e.target.value;
  });
  saveUsers(users);
};
bgImageInput.onchange = (e) => {
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
};
bgMusicInput.onchange = (e) => {
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
};
fontSelector.onchange = (e) => {
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
};
customFontInput.onchange = (e) => {
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
};

// Music controls
playMusicBtn.onclick = () => {
  if (musicPlayer.src) musicPlayer.play();
};
pauseMusicBtn.onclick = () => {
  musicPlayer.pause();
};
stopMusicBtn.onclick = () => {
  musicPlayer.pause();
  musicPlayer.currentTime = 0;
};
volumeRange.oninput = (e) => {
  musicPlayer.volume = e.target.value;
};

// Stickers logic

const emojiStickers = document.querySelectorAll(".emojiSticker");
emojiStickers.forEach((emoji) => {
  emoji.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "emoji", src: emoji.textContent })
    );
  });
});
customStickerInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    addStickerToCanvas({ type: "image", src: reader.result, x: 100, y: 100 });
    saveSticker({ type: "image", src: reader.result, x: 100, y: 100 });
    customStickerInput.value = "";
  };
  reader.readAsDataURL(file);
};

editorContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
});

editorContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!currentUser || !currentTab) return;
  const data = e.dataTransfer.getData("application/json");
  if (!data) return;

  let sticker;
  try {
    sticker = JSON.parse(data);
  } catch {
    return;
  }
  if (!sticker.type || !sticker.src) return;

  const rect = editorContainer.getBoundingClientRect();
  let x = e.clientX - rect.left - 25;
  let y = e.clientY - rect.top - 25;

  sticker.x = x;
  sticker.y = y;

  if (isNearDumpster(x, y, 50, 50)) {
    return; // ignore adding if near dumpster on drop
  }

  addStickerToCanvas(sticker);
  saveSticker(sticker);
});

function addStickerToCanvas(sticker) {
  if (!currentUser || !currentTab) return;
  if (sticker.type === "image") {
    const img = document.createElement("img");
    img.src = sticker.src;
    img.className = "sticker";
    img.style.left = sticker.x + "px";
    img.style.top = sticker.y + "px";
    setupStickerDrag(img, sticker);
    editorContainer.appendChild(img);
  } else if (sticker.type === "emoji") {
    const span = document.createElement("span");
    span.textContent = sticker.src;
    span.className = "emojiOnCanvas";
    span.style.left = sticker.x + "px";
    span.style.top = sticker.y + "px";
    setupStickerDrag(span, sticker);
    editorContainer.appendChild(span);
  }
}

function setupStickerDrag(el, sticker) {
  el.style.position = "absolute";
  el.draggable = true;
  el.style.userSelect = "none";

  let offsetX, offsetY;

  el.addEventListener("dragstart", (e) => {
    el.classList.add("dragging");
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    e.dataTransfer.setDragImage(el, offsetX, offsetY);
    e.dataTransfer.setData("application/json", JSON.stringify(sticker));
  });

  el.addEventListener("dragend", (e) => {
    el.classList.remove("dragging");

    const containerRect = editorContainer.getBoundingClientRect();
    let x = e.clientX - containerRect.left - offsetX;
    let y = e.clientY - containerRect.top - offsetY;

    x = Math.max(0, Math.min(x, containerRect.width - el.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - el.offsetHeight));

    if (isNearDumpster(x, y, el.offsetWidth, el.offsetHeight)) {
      el.remove();
      removeSticker(sticker);
      return;
    }

    el.style.left = x + "px";
    el.style.top = y + "px";

    saveStickerPosition(sticker, x, y);
  });
}

function isNearDumpster(x, y, w, h) {
  const dumpsterRect = stickerDumpster.getBoundingClientRect();
  const containerRect = editorContainer.getBoundingClientRect();

  const stickerLeft = containerRect.left + x;
  const stickerRight = stickerLeft + w;
  const stickerTop = containerRect.top + y;
  const stickerBottom = stickerTop + h;

  const extendedLeft = dumpsterRect.left - 10;
  const extendedRight = dumpsterRect.right + 10;
  const extendedTop = dumpsterRect.top - 10;
  const extendedBottom = dumpsterRect.bottom + 10;

  return !(
    stickerRight < extendedLeft ||
    stickerLeft > extendedRight ||
    stickerBottom < extendedTop ||
    stickerTop > extendedBottom
  );
}

function saveSticker(sticker) {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  const tabData = users[currentUser].data.tabs[currentTab];
  const exists = tabData.stickers.some(
    (st) =>
      st.src === sticker.src &&
      st.type === sticker.type &&
      Math.abs(st.x - sticker.x) < 5 &&
      Math.abs(st.y - sticker.y) < 5
  );
  if (!exists) {
    tabData.stickers.push(sticker);
    saveUsers(users);
  }
}

function saveStickerPosition(sticker, x, y) {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  const tabData = users[currentUser].data.tabs[currentTab];
  let s = tabData.stickers.find(
    (st) =>
      st.src === sticker.src &&
      st.type === sticker.type &&
      Math.abs(st.x - sticker.x) < 20 &&
      Math.abs(st.y - sticker.y) < 20
  );
  if (!s) {
    s = tabData.stickers.find(
      (st) => st.src === sticker.src && st.type === sticker.type
    );
  }
  if (s) {
    s.x = x;
    s.y = y;
    saveUsers(users);
  }
}

function removeSticker(sticker) {
  if (!currentUser || !currentTab) return;
  const users = getUsers();
  const tabData = users[currentUser].data.tabs[currentTab];
  tabData.stickers = tabData.stickers.filter(
    (st) =>
      !(
        st.src === sticker.src &&
        st.type === sticker.type &&
        Math.abs(st.x - sticker.x) < 20 &&
        Math.abs(st.y - sticker.y) < 20
      )
  );
  saveUsers(users);
}

document.getElementById("loginBtn").onclick = login;
document.getElementById("signupBtn").onclick = signup;
