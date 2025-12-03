/* ===========================================
   小勇者之旅大冒險 script.js
   全功能整合版（勇者選擇 / 地圖 / 戰鬥 / 占卜 / 好友）
=========================================== */

/* ---------- 基礎資料 ---------- */

const heroes = [
  {
    key: "warrior",
    name: "戰士 🛡️",
    fist: "✊ 石頭",
    move: "rock",
    line: "我一定會守護大家！",
    ability: "若出石頭並勝利 → 傳達 2 倍好心情",
    story:
      "戰士從小立志保護村莊，雖然有時衝動，但內心非常善良。對他來說，守護同伴比什麼都重要。"
  },
  {
    key: "mage",
    name: "法師 🔮",
    fist: "✌️ 剪刀",
    move: "scissors",
    line: "嘿嘿～我有新點子！",
    ability: "若出剪刀並勝利 → 傳達 2 倍好心情",
    story:
      "法師喜歡研究星星魔法，他的腦袋裡總是有奇怪、但很有效的點子。魔物常被他逗得忘記生氣。"
  },
  {
    key: "priest",
    name: "牧師 💖",
    fist: "🖐 布",
    move: "paper",
    line: "別擔心，我來幫你～",
    ability: "若出布並勝利 → 傳達 2 倍好心情",
    story:
      "牧師能聽見心靈深處的聲音，他的治癒力量溫暖又可靠。魔物在他面前很難保持壞情緒。"
  },
  {
    key: "villager",
    name: "勇敢的村民 🌾",
    fist: "自由出拳",
    move: "none",
    line: "我雖然平凡，但不放棄！",
    ability: "魔王戰永不扣血",
    story:
      "雖然沒有天賦拳，但擁有最堅定的心。靠著勇氣，他能戰勝任何壞情緒。"
  }
];

/* ---------------- 魔物資料 ---------------- */
const monsterData = {
  forest: {
    name: "獸人",
    talent: "✊",
    forbid: "✌️",
    hp: 3,
    emotions: ["生氣", "嫉妒", "不安"]
  },
  lake: {
    name: "人魚",
    talent: "🖐",
    forbid: "✊",
    hp: 3,
    emotions: ["害怕", "孤單", "難過"]
  },
  cave: {
    name: "哥布林",
    talent: "✌️",
    forbid: "🖐",
    hp: 3,
    emotions: ["不爽", "緊張", "疑惑"]
  },
  grave: {
    name: "骷髏兵",
    talent: "✊",
    forbid: "🖐",
    hp: 3,
    emotions: ["憤怒", "焦慮", "失落"]
  },

  /* 魔王 */
  boss: {
    name: "惡龍魔王",
    talent: "任意",
    forbid: "無",
    hp: 6,
    emotions: ["憤怒", "恐懼", "嫉妒", "孤單", "不安", "自責"]
  }
};

/* ---------- LocalStorage ---------- */

function load(key, def) {
  return JSON.parse(localStorage.getItem(key)) ?? def;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let hero = load("hero", null);
let level = load("level", 1);
let stars = load("stars", 0);
let clearedStages = load("clearedStages", {}); // ex: { forest: true }
let friends = load("friends", []);

/* ===========================================
   新手村：勇者選擇
=========================================== */

function initIndexPage() {
  const heroList = document.getElementById("heroList");
  if (!heroList) return;

  const storyBox = document.getElementById("heroStoryBox");
  const storyText = document.getElementById("heroStoryText");
  const lineText = document.getElementById("heroLineText");
  const abilityText = document.getElementById("heroAbilityText");
  const confirmBtn = document.getElementById("confirmHeroBtn");

  heroList.innerHTML = "";

  heroes.forEach((h) => {
    const div = document.createElement("div");
    div.className = "hero-card";
    div.innerHTML = `
      <div class="hero-name">${h.name}</div>
      <div class="hero-fist">天賦拳：${h.fist}</div>
    `;

    div.addEventListener("click", () => {
      document.querySelectorAll(".hero-card").forEach((c) => {
        c.classList.remove("active");
      });
      div.classList.add("active");

      // 顯示故事區
      storyBox.style.display = "block";
      storyText.textContent = h.story;
      lineText.textContent = `💬 個性語句：${h.line}`;
      abilityText.textContent = `⭐ 特殊能力：${h.ability}`;
      confirmBtn.style.display = "block";

      hero = h;
      save("hero", hero);
    });

    heroList.appendChild(div);
  });

  confirmBtn.addEventListener("click", () => {
    window.location.href = "map.html";
  });
}

/* ===========================================
   地圖頁
=========================================== */

function initMapPage() {
  const grid = document.getElementById("mapGrid");
  if (!grid) return;

  document.getElementById("mapLevel").textContent = `LV.${level}`;
  document.getElementById("mapStars").textContent = `${stars} 顆`;

  function openStage(stage) {
    if (stage === "boss") {
      const allCleared = ["forest", "lake", "cave", "grave"].every(
        (s) => clearedStages[s]
      );
      if (!allCleared) {
        alert("還不能挑戰魔王喔！先把其他魔物安撫吧！");
        return;
      }
    }

    save("currentStage", stage);
    window.location.href = "battle.html";
  }

  const tiles = {
    forest: "🌲 森林（獸人）",
    lake: "🌊 湖畔（人魚）",
    cave: "🕳 洞窟（哥布林）",
    grave: "💀 墓地（骷髏兵）",
    boss: "🔥 魔王城（惡龍）"
  };

  Object.keys(tiles).forEach((stage) => {
    const div = document.createElement("div");
    div.className = "map-tile";
    if (stage === "boss") div.classList.add("boss");

    if (clearedStages[stage]) div.classList.add("cleared");

    div.textContent = tiles[stage];

    div.addEventListener("click", () => openStage(stage));
    grid.appendChild(div);
  });

  // 好友名單
  document.getElementById("friendsBtn")?.addEventListener("click", () => {
    const modal = document.getElementById("friendsModal");
    modal.classList.add("show");
    renderFriendsList();
  });

  document.getElementById("friendsCloseBtn")?.addEventListener("click", () => {
    document.getElementById("friendsModal").classList.remove("show");
  });
}

function renderFriendsList() {
  const list = document.getElementById("friendsList");
  list.innerHTML = friends
    .map((f) => `<li>${f.name}（⭐ ${f.stars}）</li>`)
    .join("");
}

/* ===========================================
   戰鬥系統
=========================================== */

function initBattlePage() {
  const stage = load("currentStage", null);
  if (!stage) return;

  const data = monsterData[stage];

  let heroHp = 3;
  let monsterHp = data.hp;
  let emotionIndex = 0;

  const dialogBox = document.getElementById("dialogBox");

  function addTalk(text) {
    const p = document.createElement("p");
    p.textContent = text;
    dialogBox.appendChild(p);
    dialogBox.scrollTop = dialogBox.scrollHeight;
  }

  // 填入基本資料
  document.getElementById("monsterNameText").textContent = data.name;
  document.getElementById("monsterTalentText").textContent = data.talent;
  document.getElementById("monsterForbidText").textContent = data.forbid;
  document.getElementById("monsterStageText").textContent = stage;
  document.getElementById("heroHpText").textContent = heroHp;
  document.getElementById("monsterHpText").textContent = monsterHp;
  document.getElementById("monsterHpText2").textContent = monsterHp;

  // 壞情緒清單
  const emotionList = document.getElementById("emotionList");
  const emotionItems = Array.from(emotionList.children);

  emotionItems.forEach((li, i) => {
    li.textContent = data.emotions[i] ?? "";
  });

  function monsterAttackMove() {
    if (stage === "boss") {
      // 魔王會隨機出拳
      return ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
    }
    return {
      "✊": "rock",
      "✌️": "scissors",
      "🖐": "paper"
    }[data.talent];
  }

  function playRound(playerMove) {
    const enemyMove = monsterAttackMove();

    let result = "";

    const beats = {
      rock: "scissors",
      scissors: "paper",
      paper: "rock"
    };

    if (playerMove === enemyMove) {
      result = "tie";
    } else if (beats[playerMove] === enemyMove) {
      result = "win";
    } else {
      result = "lose";
    }

    handleBattleResult(result, playerMove);
  }

  function handleBattleResult(result, playerMove) {
    const roundText = document.getElementById("roundResult");
    let countText = document.getElementById("roundCount");

    countText.textContent = Number(countText.textContent) + 1;

    // 勝利處理
    if (result === "win") {
      addTalk(`勇者：我相信你能冷靜下來！`);
      addTalk(`${data.name}：嗯……好像真的沒那麼糟……`);

      let dmg = 1;
      if (hero && hero.move === playerMove) dmg = 2;

      monsterHp -= dmg;
      if (monsterHp < 0) monsterHp = 0;

      document.getElementById("monsterHpText").textContent = monsterHp;
      document.getElementById("monsterHpText2").textContent = monsterHp;

      // 情緒被安撫
      if (emotionIndex < data.emotions.length) {
        emotionItems[emotionIndex].classList.add("calm");
        emotionIndex++;
      }

      // 通關
      if (monsterHp <= 0) return battleClear(stage);

      roundText.textContent = "你安撫了魔物！";

    } else if (result === "lose") {
      addTalk(`${data.name}：走開啦！我現在心情不好！`);

      if (hero.key !== "villager") {
        heroHp -= 1;
        if (heroHp < 0) heroHp = 0;
      }

      document.getElementById("heroHpText").textContent = heroHp;

      if (heroHp <= 0) {
        roundText.textContent = "你累倒了，但沒關係，再試一次吧！";
      } else {
        roundText.textContent = "魔物的壞情緒太強了！";
      }

    } else {
      roundText.textContent = "平手～再試一次！";
    }
  }

  document.querySelectorAll(".rps-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const move = btn.dataset.move;
      playRound(move);
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    window.location.reload();
  });
}

function battleClear(stage) {
  alert("成功安撫魔物！");

  clearedStages[stage] = true;
  save("clearedStages", clearedStages);

  let gained = stage === "boss" ? 3 : 1;
  stars += gained;
  save("stars", stars);

  friends.push({
    name: monsterData[stage].name,
    stars: gained
  });
  save("friends", friends);

  // 升級
  level++;
  save("level", level);

  window.location.href = "map.html";
}

/* ===========================================
   占卜屋
=========================================== */

function initTarotPage() {
  const btn = document.getElementById("tarotDrawBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const cards = [
      "愚者",
      "魔術師",
      "皇后",
      "力量",
      "隱者",
      "命運之輪",
      "太陽",
      "月亮",
      "審判"
    ];

    function draw() {
      const name = cards[Math.floor(Math.random() * cards.length)];
      const isReversed = Math.random() < 0.5;
      return { name, reversed: isReversed };
    }

    const past = draw();
    const present = draw();
    const future = draw();

    function fill(id, card) {
      document.getElementById(id + "Name").textContent = card.name;
      document.getElementById(id + "Orient").textContent = card.reversed
        ? "逆位"
        : "正位";
      document.getElementById(id + "Meaning").textContent =
        card.reversed ? "需要重新調整方向" : "能量順利流動中";
    }

    fill("tarotPast", past);
    fill("tarotPresent", present);
    fill("tarotFuture", future);

    document.getElementById(
      "tarotBearMessage"
    ).textContent = `熊熊村長：不論過去與未來，你現在的努力最閃亮！記得保持好心情喔～`;

    // 回血
    save("heroHp", 3);
  });
}

/* ===========================================
   網頁初始化
=========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "index") initIndexPage();
  if (page === "map") initMapPage();
  if (page === "battle") initBattlePage();
  if (page === "tarot") initTarotPage();
});