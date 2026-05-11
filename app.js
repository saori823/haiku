// Firebaseの機能を読み込む

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebaseの設定（ご自身のものに書き換えてください）
const firebaseConfig = {
  apiKey: "AIzaSyCciyJzSAnQMefY9iBa8FR5fPeubPLv45o",
  authDomain: "haiku-app-e9f90.firebaseapp.com",
  projectId: "haiku-app-e9f90",
  storageBucket: "haiku-app-e9f90.firebasestorage.app",
  messagingSenderId: "43349649919",
  appId: "1:43349649919:web:6c9309e993170b8ede1fca",
  measurementId: "G-LPP3JLWRFF",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allHaikus = [];
let allKigos = []; // すべての季語を保持する変数

function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// ナビゲーション
document.getElementById("nav-post").addEventListener("click", () => {
  document.body.className = "";
  showPage("page-post");
});
document.getElementById("nav-list").addEventListener("click", () => {
  showPage("page-list");
  loadHaikus();
});
document
  .getElementById("back-to-list-btn")
  .addEventListener("click", () => showPage("page-list"));

// ページ内ジャンプの処理
document.getElementById("jump-to-kigo-btn").addEventListener("click", () => {
  document
    .getElementById("kigo-section")
    .scrollIntoView({ behavior: "smooth" });
});
document.getElementById("back-to-top-btn").addEventListener("click", () => {
  document.getElementById("list-top").scrollIntoView({ behavior: "smooth" });
});

// 投稿処理
document.getElementById("submit-btn").addEventListener("click", async () => {
  const theme = document.getElementById("theme").value;
  const season = document.getElementById("season").value;
  const haigou = document.getElementById("haigou").value.trim();
  const haiku = document.getElementById("haiku").value.trim();
  const kigo = document.getElementById("kigo").value.trim();
  const comments = document.getElementById("comments").value.trim();

  const errorList = document.getElementById("error-messages");
  errorList.innerHTML = "";
  let errors = [];

  if (!haigou || !haiku || !kigo || !comments)
    errors.push("未入力項目があります。");
  if (comments.length > 200) errors.push("解説は200字以内で。");
  if (haiku.length > 0 && haiku.length < 5) errors.push("俳句が短すぎます。");
  if (haiku.length > 30) errors.push("俳句が長すぎます。");

  if (errors.length > 0) {
    errors.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = e;
      errorList.appendChild(li);
    });
    return;
  }

  try {
    await addDoc(collection(db, "haikus"), {
      theme,
      season,
      haigou,
      haiku,
      kigo,
      comments,
      createdAt: serverTimestamp(),
    });
    alert("投稿完了！");
    document.getElementById("haigou").value = "";
    document.getElementById("haiku").value = "";
    document.getElementById("kigo").value = "";
    document.getElementById("comments").value = "";
    showPage("page-list");
    loadHaikus();
  } catch (e) {
    alert("失敗しました。");
  }
});

// データ読み込み
async function loadHaikus() {
  const listContainer = document.getElementById("haiku-list-container");
  listContainer.innerHTML = "読み込み中...";
  try {
    const q = query(collection(db, "haikus"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    allHaikus = [];
    let uniqueKigos = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allHaikus.push({ id: doc.id, ...data });
      if (data.season && data.kigo)
        uniqueKigos.add(`${data.season}：${data.kigo}`);
    });
    allKigos = Array.from(uniqueKigos); // グローバル変数に保存
    displayHaikus(allHaikus);
    displayKigos(allKigos); // 初回はすべて表示
  } catch (e) {
    listContainer.innerHTML = "失敗しました。";
  }
}

function displayHaikus(haikuArray) {
  const listContainer = document.getElementById("haiku-list-container");
  listContainer.innerHTML = "";
  if (haikuArray.length === 0) {
    listContainer.innerHTML = "<p>ありません。</p>";
    return;
  }
  haikuArray.forEach((h) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.textContent = h.haiku;
    a.onclick = () => showDetail(h);
    li.appendChild(a);
    li.append(` （${h.theme}・${h.season}）`);
    listContainer.appendChild(li);
  });
}

// 季語の表示（ソートとフィルタリング機能付き）
function displayKigos(kigoArray, filterSeason = "") {
  const kigoContainer = document.getElementById("kigo-list-container");
  kigoContainer.innerHTML = "";

  const seasonOrder = { 春: 1, 夏: 2, 秋: 3, 冬: 4 };

  // 1. フィルタリング
  let displayArray = kigoArray;
  if (filterSeason !== "") {
    displayArray = kigoArray.filter((k) => k.startsWith(filterSeason));
  }

  // 2. ソート（春夏秋冬の順）
  displayArray
    .sort((a, b) => {
      const sA = a.split("：")[0];
      const sB = b.split("：")[0];
      if (seasonOrder[sA] !== seasonOrder[sB]) {
        return (seasonOrder[sA] || 9) - (seasonOrder[sB] || 9);
      }
      return a.localeCompare(b); // 同じ季節内はあいうえお順
    })
    .forEach((k) => {
      const li = document.createElement("li");
      li.textContent = k;
      kigoContainer.appendChild(li);
    });
}

// 検索ボタン
document.getElementById("search-btn").addEventListener("click", () => {
  const searchTheme = document.getElementById("search-theme").value;
  const searchSeason = document.getElementById("search-season").value;

  const filteredHaikus = allHaikus.filter((h) => {
    return (
      (searchTheme === "" || h.theme === searchTheme) &&
      (searchSeason === "" || h.season === searchSeason)
    );
  });

  displayHaikus(filteredHaikus);
  displayKigos(allKigos, searchSeason); // 季語も同じ季節でフィルタリング

  document.body.className = "";
  if (searchSeason) {
    const themeMap = {
      春: "theme-spring",
      夏: "theme-summer",
      秋: "theme-autumn",
      冬: "theme-winter",
    };
    document.body.classList.add(themeMap[searchSeason]);
  }
});

// 詳細表示
function showDetail(h) {
  const detailContainer = document.getElementById("detail-content");
  const escape = (str) =>
    str
      ? str.replace(
          /[&'`"<>]/g,
          (m) =>
            ({
              "&": "&amp;",
              "'": "&#x27;",
              "`": "&#x60;",
              '"': "&quot;",
              "<": "&lt;",
              ">": "&gt;",
            })[m],
        )
      : "";
  detailContainer.innerHTML = `
    <p><b>題：</b>${escape(h.theme)}</p><p><b>季節：</b>${escape(h.season)}</p><p><b>俳号：</b>${escape(h.haigou)}</p>
    <p><b>俳句：</b><br>${escape(h.haiku)}</p><p><b>季語：</b>${escape(h.kigo)}</p><p><b>解説：</b><br>${escape(h.comments)}</p>`;
  showPage("page-detail");
}
