/* ===========================================
   小勇者之旅大冒險 script.js
   全功能整合版（勇者選擇 / 地圖 / 戰鬥 / 占卜 / 好友）
=========================================== */

/* ---------- 基礎資料：勇者 ---------- */

const heroes = [
  {
    key: "warrior",
    name: "戰士 🛡️",
    move: "rock",
    fist: "✊ 石頭",
    line: "我一定會守護大家！",
    ability: "若出石頭並勝利 → 傳達 2 倍好心情",
    story:
      "戰士從小立志保護村莊，雖然有時衝動，但內心非常善良。對他來說，守護同伴比什麼都重要。"
  },
  {
    key: "mage",
    name: "法師 🔮",
    move: "scissors",
    fist: "✌️ 剪刀",
    line: "嘿嘿～我有新點子！",
    ability: "若出剪刀並勝利 → 傳達 2 倍好心情",
    story:
      "法師喜歡研究星星魔法，他的腦袋裡總是有奇怪、但很有效的點子。魔物常被他逗得忘記生氣。"
  },
  {
    key: "priest",
    name: "牧師 💖",
    move: "paper",
    fist: "🖐 布",
    line: "別擔心，我來幫你～",
    ability: "若出布並勝利 → 傳達 2 倍好心情",
    story:
      "牧師能聽見心靈深處的聲音，他的治癒力量溫暖又可靠。魔物在他面前很難保持壞情緒。"
  },
  {
    key: "villager",
    name: "勇敢的村民 🌾",
    move: "none",
    fist: "自由出拳",
    line: "我雖然平凡，但不放棄！",
    ability: "魔王戰永不扣血",
    story:
      "雖然沒有天賦拳，但擁有最堅定的心。靠著勇氣，他能戰勝任何壞情緒。"
  }
];

/* ---------- 魔物資料 ---------- */

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
  boss: {
    name: "惡龍魔王",
    talent: "任意",
    forbid: "無",
    hp: 6,
    emotions: ["憤怒", "恐懼", "嫉妒", "孤單", "不安", "自責"]
  }
];

/* ---------- LocalStorage ---------- */

function load(key, def) { return JSON.parse(localStorage.getItem(key)) ?? def; }
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

let hero = load("hero", null);
let level = load("level", 1);
let stars = load("stars", 0);
let clearedStages = load("clearedStages", {});
let friends = load("friends", []);

/* ===========================================
   新手村：勇者選擇
=========================================== */

function initIndexPage() {
  const list = document.getElementById("heroList");
  if (!list) return;

  const storyBox = document.getElementById("heroStoryBox");
  const story = document.getElementById("heroStoryText");
  const line = document.getElementById("heroLineText");
  const ability = document.getElementById("heroAbilityText");
  const confirmBtn = document.getElementById("confirmHeroBtn");

  list.innerHTML = "";

  heroes.forEach((h) => {
    const div = document.createElement("div");
    div.className = "hero-card";
    div.innerHTML = `
      <div class="hero-name">${h.name}</div>
      <div class="hero-fist">天賦拳：${h.fist}</div>
    `;

    div.addEventListener("click", () => {
      document.querySelectorAll(".hero-card").forEach((c) => c.classList.remove("active"));
      div.classList.add("active");

      storyBox.style.display = "block";
      story.textContent = h.story;
      line.textContent = "💬 個性語句：" + h.line;
      ability.textContent = "⭐ 特殊能力：" + h.ability;

      confirmBtn.style.display = "block";
      hero = h;
      save("hero", hero);
    });

    list.appendChild(div);
  });

  confirmBtn.addEventListener("click", () => {
    window.location.href = "map.html";
  });
}

/* ===========================================
   地圖頁
=========================================== */

function initMapPage() {
  const g = document.getElementById("mapGrid");
  if (!g) return;

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
        const allClear = ["forest", "lake", "cave", "grave"].every((s) => clearedStages[s]);
        if (!allClear) {
          alert("還不能挑戰魔王喔！請先安撫所有魔物！");
          return;
        }
      }
      save("currentStage", stage);
      window.location.href = "battle.html";
    });

    g.appendChild(t);
  });

  // 好友名單
  const btn = document.getElementById("friendsBtn");
  btn.addEventListener("click", () => {
    document.getElementById("friendsModal").classList.add("show");
    renderFriendsList();
  });

  document.getElementById("friendsCloseBtn")
    .addEventListener("click", () => {
      document.getElementById("friendsModal").classList.remove("show");
    });
}

function renderFriendsList() {
  const ul = document.getElementById("friendsList");
  ul.innerHTML = friends.map(f => `<li>${f.name}（⭐ ${f.stars}）</li>`).join("");
}

/* ===========================================
   戰鬥
=========================================== */

function initBattlePage() {
  const stage = load("currentStage", null);
  if (!stage) return;

  const m = monsterData[stage];

  let heroHp = 3;
  let monsterHp = m.hp;
  let emotionIndex = 0;

  const items = Array.from(document.querySelectorAll("#emotionList li"));
  for (let i = 0; i < items.length; i++) {
    items[i].textContent = m.emotions[i] ?? "";
  }

  const dialog = document.getElementById("dialogBox");

  function talk(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    dialog.appendChild(p);
    dialog.scrollTop = dialog.scrollHeight;
  }

  // 填入魔物資訊
  document.getElementById("monsterNameText").textContent = m.name;
  document.getElementById("monsterTalentText").textContent = m.talent;
  document.getElementById("monsterForbidText").textContent = m.forbid;
  document.getElementById("monsterStageText").textContent = stage;

  document.getElementById("monsterHpText").textContent = monsterHp;
  document.getElementById("monsterHpText2").textContent = monsterHp;
  document.getElementById("heroHpText").textContent = heroHp;

  const beats = {
    rock: "scissors",
    scissors: "paper",
    paper: "rock"
  };

  function monsterMove() {
    if (stage === "boss") {
      return ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
    }
    return {
      "✊": "rock",
      "✌️": "scissors",
      "🖐": "paper"
    }[m.talent];
  }

  function play(move) {
    const enemy = monsterMove();
    let result = "";

    if (move === enemy) result = "tie";
    else if (beats[move] === enemy) result = "win";
    else result = "lose";

    resolve(result, move);
  }

  function resolve(result, move) {
    const round = document.getElementById("roundResult");
    const cnt = document.getElementById("roundCount");

    cnt.textContent = Number(cnt.textContent) + 1;

    if (result === "win") {
      talk("勇者：我相信你能冷靜下來！");
      talk(`${m.name}：嗯……好像沒有那麼糟了……`);

      let dmg = 1;
      if (hero.move === move) dmg = 2;

      monsterHp -= dmg;
      if (monsterHp < 0) monsterHp = 0;

      document.getElementById("monsterHpText").textContent = monsterHp;
      document.getElementById("monsterHpText2").textContent = monsterHp;

      if (emotionIndex < m.emotions.length) {
        items[emotionIndex].classList.add("calm");
        emotionIndex++;
      }

      if (monsterHp <= 0) return clearBattle(stage);

      round.textContent = "你安撫了魔物！";

    } else if (result === "lose") {
      talk(`${m.name}：走開啦！我現在心情不好！`);

      if (hero.key !== "villager") heroHp--;

      if (heroHp < 0) heroHp = 0;
      document.getElementById("heroHpText").textContent = heroHp;

      if (heroHp <= 0) {
        round.textContent = "你累倒了！再調整好心情回來挑戰吧！";
      } else {
        round.textContent = "魔物的壞情緒太強烈了！";
      }

    } else {
      round.textContent = "平手～再來一次！";
    }
  }

  document.querySelectorAll(".rps-btn").forEach((b) =>
    b.addEventListener("click", () => play(b.dataset.move))
  );

  document.getElementById("resetBtn")
    .addEventListener("click", () => window.location.reload());
}

function clearBattle(stage) {
  alert("成功安撫魔物！");

  clearedStages[stage] = true;
  save("clearedStages", clearedStages);

  let gain = stage === "boss" ? 3 : 1;
  stars += gain;
  save("stars", stars);

  friends.push({ name: monsterData[stage].name, stars: gain });
  save("friends", friends);

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
    const deck = [
      "愚者", "魔術師", "皇后", "力量",
      "隱者", "命運之輪", "太陽", "月亮", "審判"
    ];

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
      document.getElementById(prefix + "Orient").textContent =
        card.reversed ? "逆位" : "正位";
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

/* ===========================================
   初始化
=========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "index") initIndexPage();
  if (page === "map") initMapPage();
  if (page === "battle") initBattlePage();
  if (page === "tarot") initTarotPage();
});