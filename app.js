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

// 画面を切り替える関数
function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// ナビゲーションのイベント設定
document
  .getElementById("nav-post")
  .addEventListener("click", () => showPage("page-post"));
document.getElementById("nav-list").addEventListener("click", () => {
  showPage("page-list");
  loadHaikus(); // 一覧画面を開くときにデータを読み込む
});
document
  .getElementById("back-to-list-btn")
  .addEventListener("click", () => showPage("page-list"));

// ==============================
// 投稿処理 (posted_haiku.rb の代わり)
// ==============================
document.getElementById("submit-btn").addEventListener("click", async () => {
  const theme = document.getElementById("theme").value;
  const season = document.getElementById("season").value;
  const haigou = document.getElementById("haigou").value.trim();
  const haiku = document.getElementById("haiku").value.trim();
  const kigo = document.getElementById("kigo").value.trim();
  const comments = document.getElementById("comments").value.trim();

  const errorList = document.getElementById("error-messages");
  errorList.innerHTML = ""; // エラーをリセット
  let errors = [];

  // バリデーション（入力チェック）
  if (!haigou || !haiku || !kigo || !comments) {
    errors.push("俳号、俳句、季語、解説のいずれかが入力されていません。");
  }
  if (comments.length > 200) {
    errors.push("解説は200字以内で入力してください。");
  }
  if (haiku.length > 0 && haiku.length < 5) {
    errors.push("俳句が短すぎます（5文字以上にしてください）");
  } else if (haiku.length > 30) {
    errors.push("俳句が長すぎます（30文字以内にしてください）");
  }

  // エラーがあれば表示して終了
  if (errors.length > 0) {
    errors.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = e;
      errorList.appendChild(li);
    });
    return;
  }

  // Firebaseにデータを保存
  try {
    await addDoc(collection(db, "haikus"), {
      theme: theme,
      season: season,
      haigou: haigou,
      haiku: haiku,
      kigo: kigo,
      comments: comments,
      createdAt: serverTimestamp(), // 投稿時間を記録
    });

    alert("俳句の投稿が完了しました！");
    // 入力欄を空にする
    document.getElementById("haigou").value = "";
    document.getElementById("haiku").value = "";
    document.getElementById("kigo").value = "";
    document.getElementById("comments").value = "";

    // 一覧画面に移動
    showPage("page-list");
    loadHaikus();
  } catch (error) {
    console.error("エラー:", error);
    alert("投稿に失敗しました。");
  }
});

// ==============================
// 一覧・検索処理 (view_haiku.rb, search_haiku.rb の代わり)
// ==============================
let allHaikus = []; // 読み込んだすべての俳句を保持しておく変数

async function loadHaikus() {
  const listContainer = document.getElementById("haiku-list-container");
  listContainer.innerHTML = "読み込み中...";

  try {
    // データベースから新しい順(createdAtの降順)でデータを取得
    const q = query(collection(db, "haikus"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    allHaikus = [];
    let uniqueKigos = new Set(); // 重複しない季語を集めるためのセット

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allHaikus.push({ id: doc.id, ...data });
      if (data.season && data.kigo) {
        uniqueKigos.add(`${data.season}：${data.kigo}`);
      }
    });

    displayHaikus(allHaikus);
    displayKigos(Array.from(uniqueKigos));
  } catch (error) {
    console.error("読み込みエラー:", error);
    listContainer.innerHTML = "データの読み込みに失敗しました。";
  }
}

// 俳句を画面に表示する関数
function displayHaikus(haikuArray) {
  const listContainer = document.getElementById("haiku-list-container");
  listContainer.innerHTML = "";

  if (haikuArray.length === 0) {
    listContainer.innerHTML = "<p>該当する俳句がありません。</p>";
    return;
  }

  haikuArray.forEach((haikuData) => {
    const li = document.createElement("li");
    // リンク風のテキストを作成（クリックで詳細画面へ）
    const a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.textContent = haikuData.haiku;
    a.onclick = () => showDetail(haikuData);

    li.appendChild(a);
    li.append(` （${haikuData.theme}・${haikuData.season}）`);
    listContainer.appendChild(li);
  });
}

// 季語を画面に表示する関数
function displayKigos(kigoArray) {
  const kigoContainer = document.getElementById("kigo-list-container");
  kigoContainer.innerHTML = "";
  // 季節順に並び替え
  kigoArray.sort().forEach((kigoText) => {
    const li = document.createElement("li");
    li.textContent = kigoText;
    kigoContainer.appendChild(li);
  });
}

// 検索ボタンの処理
// 検索ボタンの処理
document.getElementById("search-btn").addEventListener("click", () => {
  const searchTheme = document.getElementById("search-theme").value;
  const searchSeason = document.getElementById("search-season").value;

  // 読み込み済みのデータから条件に合うものを絞り込む
  const filtered = allHaikus.filter((h) => {
    const matchTheme = searchTheme === "" || h.theme === searchTheme;
    const matchSeason = searchSeason === "" || h.season === searchSeason;
    return matchTheme && matchSeason;
  });

  displayHaikus(filtered);

  // ▼▼ ここから追加：選択された季節に合わせて背景色を変える処理 ▼▼
  document.body.className = ""; // 一度すべての季節クラスをリセット

  if (searchSeason === "春") {
    document.body.classList.add("theme-spring");
  } else if (searchSeason === "夏") {
    document.body.classList.add("theme-summer");
  } else if (searchSeason === "秋") {
    document.body.classList.add("theme-autumn");
  } else if (searchSeason === "冬") {
    document.body.classList.add("theme-winter");
  }
  // 「すべて」を選んだ場合は、基本の緑（何もクラスをつけない）に戻ります
});

// ▼おまけ：「投稿画面」や「一覧」を開き直したときに、元の緑色に戻す処理
document.getElementById("nav-post").addEventListener("click", () => {
  document.body.className = "";
  showPage("page-post");
});
// ==============================
// 詳細表示処理 (haiku_detail.rb の代わり)
// ==============================
function showDetail(haikuData) {
  const detailContainer = document.getElementById("detail-content");

  // HTMLエスケープ処理（安全に表示するため）
  const escapeHTML = (str) => {
    if (!str) return "";
    return str.replace(/[&'`"<>]/g, function (match) {
      return {
        "&": "&amp;",
        "'": "&#x27;",
        "`": "&#x60;",
        '"': "&quot;",
        "<": "&lt;",
        ">": "&gt;",
      }[match];
    });
  };

  detailContainer.innerHTML = `
    <p><b>題：</b>${escapeHTML(haikuData.theme)}</p>
    <p><b>季節：</b>${escapeHTML(haikuData.season)}</p>
    <p><b>俳号：</b>${escapeHTML(haikuData.haigou)}</p>
    <p><b>俳句：</b><br>${escapeHTML(haikuData.haiku)}</p>
    <p><b>季語：</b>${escapeHTML(haikuData.kigo)}</p>
    <p><b>解説：</b><br>${escapeHTML(haikuData.comments)}</p>
  `;

  showPage("page-detail");
}
