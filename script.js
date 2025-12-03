/* 小勇者之旅大冒險：穩定完整版 script.js */

/* ---------- 共用工具 ---------- */
function load(key, def) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return def;
    return JSON.parse(v);
  } catch (e) {
    return def;
  }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* ---------- 基礎資料：勇者 ---------- */
const HEROES = [
  {
    key: "warrior",
    name: "戰士 🛡️",
    move: "rock",
    fist: "✊ 石頭",
    line: "我一定會守護大家！",
    ability: "若出石頭並勝利 → 傳達 2 倍好心情",
    story:
      "戰士從小立志保護村莊，雖然有時衝動，但內心非常善良。守護夥伴是他最重要的使命。"
  },
  {
    key: "mage",
    name: "法師 🔮",
    move: "scissors",
    fist: "✌️ 剪刀",
    line: "嘿嘿～我有新點子！",
    ability: "若出剪刀並勝利 → 傳達 2 倍好心情",
    story:
      "法師喜歡研究星星魔法，常常想到奇怪又有用的點子，讓魔物忘記生氣。"
  },
  {
    key: "priest",
    name: "牧師 💖",
    move: "paper",
    fist: "🖐 布",
    line: "別擔心，我來幫你～",
    ability: "若出布並勝利 → 傳達 2 倍好心情",
    story:
      "牧師能聽見心靈深處的聲音，他的治癒讓大家的心都暖暖的。"
  },
  {
    key: "villager",
    name: "勇敢的村民 🌾",
    move: "none",
    fist: "自由出拳",
    line: "我雖然平凡，但不放棄！",
    ability: "魔王戰永不扣血",
    story:
      "雖然沒有特別天賦，但擁有最堅定的心。靠著勇氣，他也能改變世界。"
  }
];

/* ---------- 魔物資料 ---------- */
const MONSTERS = {
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
  boss: {
    name: "惡龍魔王",
    talent: "任意",
    forbid: "無",
    hp: 6,
    emotions: ["憤怒", "恐懼", "嫉妒", "孤單", "不安", "自責"]
  }
};

/* ---------- 遊戲進度 ---------- */
let hero = load("hero", null);
let level = load("level", 1);
let stars = load("stars", 0);
let clearedStages = load("clearedStages", {});
let friends = load("friends", []);

/* 若尚未選勇者，給一個預設 */
if (!hero) {
  hero = HEROES[0];
  save("hero", hero);
}

/* =========================================
   新手村：勇者選擇
========================================= */
function initIndexPage() {
  const list = document.getElementById("heroList");
  if (!list) return;

  const storyBox = document.getElementById("heroStoryBox");
  const storyText = document.getElementById("heroStoryText");
  const lineText = document.getElementById("heroLineText");
  const abilityText = document.getElementById("heroAbilityText");
  const confirmBtn = document.getElementById("confirmHeroBtn");

  list.innerHTML = "";

  HEROES.forEach((h) => {
    const card = document.createElement("div");
    card.className = "hero-card";
    card.innerHTML = `
      <div class="hero-name">${h.name}</div>
      <div class="hero-fist">天賦拳：${h.fist}</div>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".hero-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      storyBox.style.display = "block";
      storyText.textContent = h.story;
      lineText.textContent = "💬 個性語句：" + h.line;
      abilityText.textContent = "⭐ 特殊能力：" + h.ability;
      confirmBtn.style.display = "block";

      hero = h;
      save("hero", hero);
    });

    list.appendChild(card);
  });

  confirmBtn.addEventListener("click", () => {
    window.location.href = "map.html";
  });
}

/* =========================================
   地圖頁
========================================= */
function initMapPage() {
  const grid = document.getElementById("mapGrid");
  if (!grid) return;

  document.getElementById("mapLevel").textContent = "LV." + level;
  document.getElementById("mapStars").textContent = stars + " 顆";

  const tiles = {
    forest: "🌲 森林（獸人）",
    lake: "🌊 湖畔（人魚）",
    cave: "🕳 洞窟（哥布林）",
    grave: "💀 墓地（骷髏兵）",
    boss: "🔥 魔王城（惡龍）"
  };

  Object.keys(tiles).forEach((stage) => {
    const t = document.createElement("div");
    t.className = "map-tile";
    if (stage === "boss") t.classList.add("boss");
    if (clearedStages[stage]) t.classList.add("cleared");
    t.textContent = tiles[stage];

    t.addEventListener("click", () => {
      if (stage === "boss") {
        const allClear = ["forest", "lake", "cave", "grave"].every(s => clearedStages[s]);
        if (!allClear) {
          alert("還不能挑戰魔王喔！請先安撫所有魔物！");
          return;
        }
      }
      save("currentStage", stage);
      window.location.href = "battle.html";
    });

    grid.appendChild(t);
  });

  // 好友名單
  const fb = document.getElementById("friendsBtn");
  const modal = document.getElementById("friendsModal");
  const closeBtn = document.getElementById("friendsCloseBtn");
  const list = document.getElementById("friendsList");

  fb.addEventListener("click", () => {
    list.innerHTML = friends.length
      ? friends.map(f => `<li>${f.name}（⭐ ${f.stars}）</li>`).join("")
      : "<li>尚未有好友，先去安撫魔物吧！</li>";
    modal.classList.add("show");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
  });
}

/* =========================================
   戰鬥頁
========================================= */
function initBattlePage() {
  const stage = load("currentStage", null);
  if (!stage || !MONSTERS[stage]) {
    const r = document.getElementById("roundResult");
    if (r) r.textContent = "請先從地圖選擇一個地點！";
    return;
  }

  const data = MONSTERS[stage];
  let heroHp = 3;
  let monsterHp = data.hp;
  let emotionIndex = 0;

  const heroHpEl = document.getElementById("heroHpText");
  const mHpEl = document.getElementById("monsterHpText");
  const mHp2El = document.getElementById("monsterHpText2");
  const stageEl = document.getElementById("monsterStageText");
  const nameEl = document.getElementById("monsterNameText");
  const talentEl = document.getElementById("monsterTalentText");
  const forbidEl = document.getElementById("monsterForbidText");
  const dialogBox = document.getElementById("dialogBox");
  const roundResult = document.getElementById("roundResult");
  const roundCount = document.getElementById("roundCount");
  const emotionItems = Array.from(document.querySelectorAll("#emotionList li"));

  heroHpEl.textContent = heroHp;
  mHpEl.textContent = monsterHp;
  mHp2El.textContent = monsterHp;
  stageEl.textContent = stage;
  nameEl.textContent = data.name;
  talentEl.textContent = data.talent;
  forbidEl.textContent = data.forbid;

  // 壞情緒名稱
  emotionItems.forEach((li, i) => {
    li.textContent = data.emotions[i] || "";
  });

  function addTalk(text) {
    const p = document.createElement("p");
    p.textContent = text;
    dialogBox.appendChild(p);
    dialogBox.scrollTop = dialogBox.scrollHeight;
  }

  const beats = { rock: "scissors", scissors: "paper", paper: "rock" };

  function monsterMove() {
    if (stage === "boss") {
      return ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
    }
    return {
      "✊": "rock",
      "✌️": "scissors",
      "🖐": "paper"
    }[data.talent];
  }

  function handleRoundResult(result, playerMove) {
    roundCount.textContent = Number(roundCount.textContent) + 1;

    if (result === "win") {
      addTalk("勇者：我相信你能冷靜下來！");
      addTalk(data.name + "：嗯……好像真的沒那麼糟……");

      let dmg = 1;
      if (hero.move === playerMove) dmg = 2;

      monsterHp -= dmg;
      if (monsterHp < 0) monsterHp = 0;
      mHpEl.textContent = monsterHp;
      mHp2El.textContent = monsterHp;

      if (emotionIndex < data.emotions.length) {
        emotionItems[emotionIndex].classList.add("calm");
        emotionIndex++;
      }

      roundResult.textContent = "你安撫了魔物！";

      if (monsterHp <= 0) {
        clearBattle(stage);
      }
    } else if (result === "lose") {
      addTalk(data.name + "：走開啦！我現在心情不好！");

      if (hero.key !== "villager") {
        heroHp -= 1;
        if (heroHp < 0) heroHp = 0;
      }
      heroHpEl.textContent = heroHp;

      if (heroHp <= 0) {
        roundResult.textContent = "你累倒了，但沒關係，下次再來！";
      } else {
        roundResult.textContent = "魔物的壞情緒太強烈了！";
      }
    } else {
      roundResult.textContent = "平手～再試一次！";
    }
  }

  function play(playerMove) {
    const enemyMove = monsterMove();
    let result;
    if (playerMove === enemyMove) result = "tie";
    else if (beats[playerMove] === enemyMove) result = "win";
    else result = "lose";
    handleRoundResult(result, playerMove);
  }

  document.querySelectorAll(".rps-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      play(btn.dataset.move);
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    window.location.reload();
  });
}

function clearBattle(stage) {
  alert("成功安撫魔物！");
  clearedStages[stage] = true;
  save("clearedStages", clearedStages);

  const gain = stage === "boss" ? 3 : 1;
  stars += gain;
  save("stars", stars);

  friends.push({ name: MONSTERS[stage].name, stars: gain });
  save("friends", friends);

  level += 1;
  save("level", level);

  window.location.href = "map.html";
}

/* =========================================
   占卜屋
========================================= */
function initTarotPage() {
  const btn = document.getElementById("tarotDrawBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const deck = ["愚者","魔術師","皇后","力量","隱者","命運之輪","太陽","月亮","審判"];

    function draw() {
      const name = deck[Math.floor(Math.random() * deck.length)];
      const reversed = Math.random() < 0.5;
      return { name, reversed };
    }

    const past = draw();
    const present = draw();
    const future = draw();

    function fill(prefix, card) {
      document.getElementById(prefix + "Name").textContent = card.name;
      document.getElementById(prefix + "Orient").textContent = card.reversed ? "逆位" : "正位";
      document.getElementById(prefix + "Meaning").textContent =
        card.reversed ? "需要重新調整方向" : "能量順利流動中";
    }

    fill("tarotPast", past);
    fill("tarotPresent", present);
    fill("tarotFuture", future);

    document.getElementById("tarotBearMessage").textContent =
      "熊熊村長：不論過去或未來，你現在的努力最閃亮！保持好心情喔～";

    save("heroHp", 3);
  });
}

/* =========================================
   初始化
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "index") initIndexPage();
  if (page === "map") initMapPage();
  if (page === "battle") initBattlePage();
  if (page === "tarot") initTarotPage();
});