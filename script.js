/* ==========================================================
   小勇者之旅大冒險 ｜ script.js（最新完整版本）
   ========================================================== */

/* ===== 基礎資料存取 ===== */
function load(key, fallback) {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : fallback;
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ===== 全域資料 ===== */
let hero = load("hero", null);
let level = load("level", 1);
let stars = load("stars", 0);
let items = load("items", {
  appleSmall: 0,
  appleBig: 0,
  revive: 0,
  honey: 0
});
let clearedStages = load("clearedStages", {});
let friends = load("friends", []);

/* ===== 勇者資料 ===== */
const HERO_DATA = {
  warrior: {
    name: "戰士",
    talent: "✊",
    story: "勇敢又有責任感，總是站在第一線保護大家。",
    line: "我一定會守護大家！",
    ability: "若出 ✊ 並勝利 → 好心情 2 倍效果",
    baseHp: 6
  },
  mage: {
    name: "法師",
    talent: "✌️",
    story: "聰明有創意，總會想到出其不意的方法。",
    line: "嘿嘿～我有新點子！",
    ability: "若出 ✌️ 並勝利 → 好心情 2 倍效果",
    baseHp: 5
  },
  priest: {
    name: "牧師",
    talent: "🖐",
    story: "溫柔善解人意，擅長安撫與療癒。",
    line: "別擔心，我來幫你～",
    ability: "若出 🖐 並勝利 → 好心情 2 倍效果",
    baseHp: 5
  },
  villager: {
    name: "勇敢的村民",
    talent: "無固定拳",
    story: "平凡但堅韌，只要相信自己也能成為英雄！",
    line: "我雖然平凡，但不放棄！",
    ability: "魔王戰 → 不受壞情緒影響（不扣血）",
    baseHp: 7
  }
};

/* ===== 魔物資料 ===== */
const MONSTER_DATA = {
  forest: { name: "獸人", talent: "✊", forbid: "🖐", emotions: 3 },
  lake: { name: "人魚", talent: "🖐", forbid: "✊", emotions: 3 },
  cave: { name: "哥布林", talent: "✌️", forbid: "🖐", emotions: 3 },
  grave: { name: "骷髏兵", talent: "✊", forbid: "✌️", emotions: 3 },
  dungeon: { name: "異教徒", talent: "🖐", forbid: "✌️", emotions: 3 },
  ruins: { name: "石像魔像", talent: "✌️", forbid: "✊", emotions: 3 },

  /* 魔王 */
  boss: { name: "惡龍", talent: "無", forbid: "無", emotions: 6 }
};

const MONSTER_STAGES = [
  "forest",
  "lake",
  "cave",
  "grave",
  "dungeon",
  "ruins"
];

/* ===== 遊戲狀態 ===== */
let battleState = {
  heroHp: 0,
  heroMax: 0,
  monsterHp: 0,
  monsterMax: 0,
  emotions: [],
  round: 0
};

/* ==========================================================
   頁面載入
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  switch (page) {
    case "index":
      initIndexPage();
      break;
    case "map":
      initMapPage();
      break;
    case "battle":
      initBattlePage();
      break;
    case "tarot":
      initTarotPage();
      break;
    case "shop":
      initShopPage();
      break;
  }
});

/* ==========================================================
   新手村（index.html）
   ========================================================== */
function initIndexPage() {
  const heroListDiv = document.getElementById("heroList");
  const storyBox = document.getElementById("heroStoryBox");
  const storyText = document.getElementById("heroStoryText");
  const lineText = document.getElementById("heroLineText");
  const abilityText = document.getElementById("heroAbilityText");
  const confirmBtn = document.getElementById("confirmHeroBtn");

  Object.entries(HERO_DATA).forEach(([key, h]) => {
    const div = document.createElement("div");
    div.className = "hero-card";
    div.innerHTML = `
      <div class="hero-name">${h.name}</div>
      <div class="hero-fist">天賦拳：${h.talent}</div>
    `;
    div.addEventListener("click", () => {
      hero = { key, ...h, level: level };
      save("hero", hero);

      [...heroListDiv.children].forEach(c => c.classList.remove("active"));
      div.classList.add("active");

      storyBox.style.display = "block";
      storyText.textContent = h.story;
      lineText.textContent = "口頭禪：" + h.line;
      abilityText.textContent = "能力：" + h.ability;
      confirmBtn.style.display = "block";
    });
    heroListDiv.appendChild(div);
  });

  confirmBtn.addEventListener("click", () => {
    window.location.href = "map.html";
  });
}

/* ==========================================================
   地圖（map.html）
   ========================================================== */
function initMapPage() {
  const grid = document.getElementById("mapGrid");
  if (!grid) return;

  document.getElementById("mapLevel").textContent = "LV." + level;
  document.getElementById("mapStars").textContent = stars;

  const cells = [
    { id: "start", label: "🏡 新手村", kind: "start" },
    { id: "forest", label: "🌲 森林（獸人）", kind: "monster" },
    { id: "boss", label: "🔥 魔王城", kind: "boss" },

    { id: "lake", label: "🌊 湖畔（人魚）", kind: "monster" },
    { id: "tarot", label: "🔮 占卜屋", kind: "tarot" },
    { id: "cave", label: "🕳 洞窟（哥布林）", kind: "monster" },

    { id: "grave", label: "💀 墓地（骷髏兵）", kind: "monster" },
    { id: "dungeon", label: "🕸 地窖（異教徒）", kind: "monster" },
    { id: "ruins", label: "🏛 遺跡（魔像）", kind: "monster" }
  ];

  grid.innerHTML = "";

  cells.forEach(cell => {
    const t = document.createElement("div");
    t.className = "map-tile";
    t.textContent = cell.label;

    if (cell.kind === "boss") t.classList.add("boss");
    if (cell.kind === "start" || cell.kind === "tarot") t.classList.add("special");

    const isCleared = clearedStages && clearedStages[cell.id];

    if ((cell.kind === "monster" || cell.kind === "boss") && isCleared) {
      t.classList.add("cleared");
    }

    t.addEventListener("click", () => {
      if (isCleared && (cell.kind === "monster" || cell.kind === "boss")) {
        alert("這個地點已完成，要等下一輪地圖升級才能重新挑戰！");
        return;
      }

      switch (cell.kind) {
        case "start":
          window.location.href = "index.html";
          break;

        case "tarot":
          window.location.href = "tarot.html";
          break;

        case "boss":
          const allClear = MONSTER_STAGES.every(s => clearedStages[s]);
          if (!allClear) {
            alert("請先安撫所有魔物才能挑戰魔王！");
            return;
          }
          save("currentStage", "boss");
          window.location.href = "battle.html";
          break;

        case "monster":
          save("currentStage", cell.id);
          window.location.href = "battle.html";
          break;
      }
    });

    grid.appendChild(t);
  });

  /* ===== 好友名單 ===== */
  const fb = document.getElementById("friendsBtn");
  const modal = document.getElementById("friendsModal");
  const closeBtn = document.getElementById("friendsCloseBtn");
  const list = document.getElementById("friendsList");

  fb.addEventListener("click", () => {
    list.innerHTML = friends.length
      ? friends.map(f => `<li>${f.name}（⭐ ${f.stars}）</li>`).join("")
      : "<li>尚未有好友，探索更多魔物吧！</li>";
    modal.classList.add("show");
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("show"));
}

/* ==========================================================
   戰鬥（battle.html）
   ========================================================== */
function initBattlePage() {
  const stageId = load("currentStage", null);
  if (!stageId) {
    alert("請先從地圖選擇地點");
    window.location.href = "map.html";
    return;
  }

  const h = hero;
  if (!h) {
    alert("請先選擇小勇者！");
    window.location.href = "index.html";
    return;
  }

  const m = MONSTER_DATA[stageId];

  /* ===== 設定血量與壞情緒條 ===== */
  battleState.heroMax = h.baseHp + (level - 1);
  battleState.heroHp = battleState.heroMax;

  battleState.monsterMax = m.emotions;
  battleState.monsterHp = m.emotions;

  battleState.emotions = Array(m.emotions).fill(false); // false = 壞情緒

  updateBattleUI(h, m);

  /* ===== 綁定按鈕 ===== */
  document.querySelectorAll(".rps-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playRound(btn.dataset.move, h, m, stageId);
    });
  });

  document.getElementById("itemBagBtn").addEventListener("click", openItemBag);
  document.getElementById("closeItemModal").addEventListener("click", closeItemBag);

  document.querySelectorAll(".item-use-btn").forEach(btn => {
    btn.addEventListener("click", () => useItem(btn.dataset.item));
  });

  document.getElementById("backToMapBtn").addEventListener("click", () => {
    window.location.href = "map.html";
  });
}

/* ===== 戰鬥畫面更新 ===== */
function updateBattleUI(h, m) {
  document.getElementById("heroHpText").textContent =
    `${battleState.heroHp} / ${battleState.heroMax}`;

  document.getElementById("monsterStageText").textContent = h.key;
  document.getElementById("monsterNameText").textContent = m.name;
  document.getElementById("monsterLevelText").textContent = level;

  document.getElementById("heroTalentText").textContent = h.talent;
  document.getElementById("monsterTalentText").textContent = m.talent;
  document.getElementById("monsterForbidText").textContent = m.forbid;

  const list = document.getElementById("emotionList");
  list.innerHTML = "";
  battleState.emotions.forEach(ok => {
    const li = document.createElement("li");
    if (ok) li.classList.add("calm");
    li.textContent = ok ? "💚" : "💢";
    list.appendChild(li);
  });
}

/* ===== 魔物 AI ===== */
function monsterMove(m) {
  const talent = m.talent;
  const forbid = m.forbid;

  if (m.name === "惡龍") {
    const arr = ["✊", "✌️", "🖐"];
    return arr[Math.floor(Math.random() * 3)];
  }

  const pool = [];
  for (let i = 0; i < 75; i++) pool.push(talent);

  let other = ["✊", "✌️", "🖐"].filter(x => x !== talent && x !== forbid)[0];
  for (let i = 0; i < 25; i++) pool.push(other);

  return pool[Math.floor(Math.random() * pool.length)];
}

/* ===== 進行一回合 ===== */
function playRound(playerMove, h, m, stageId) {
  battleState.round++;
  document.getElementById("roundCount").textContent = battleState.round;

  const monsterMoveValue = monsterMove(m);
  const dialogBox = document.getElementById("dialogBox");

  /* 自動對話 */
  dialogBox.innerHTML += `<p>小勇者：我出 ${playerMove}！</p>`;
  dialogBox.innerHTML += `<p>${m.name}：我出 ${monsterMoveValue}...</p>`;

  const result = judge(playerMove, monsterMoveValue);
  handleRoundResult(result, h, m, stageId);
  dialogBox.scrollTop = dialogBox.scrollHeight;
}

/* ===== 比勝負 ===== */
function judge(p, m) {
  if (p === m) return "tie";
  if (
    (p === "✊" && m === "✌️") ||
    (p === "✌️" && m === "🖐") ||
    (p === "🖐" && m === "✊")
  )
    return "win";
  return "lose";
}

/* ===== 處理勝負 ===== */
function handleRoundResult(result, h, m, stageId) {
  const resultBox = document.getElementById("roundResult");
  const dialogBox = document.getElementById("dialogBox");

  if (result === "tie") {
    resultBox.textContent = "平手，再試試！";
    return;
  }

  if (result === "win") {
    let dmg = 1;

    if (h.talent === playerMove) dmg = 2;

    stars += 1;
    save("stars", stars);

    battleState.monsterHp -= dmg;
    for (let i = 0; i < dmg; i++) {
      const idx = battleState.emotions.indexOf(false);
      if (idx !== -1) battleState.emotions[idx] = true;
    }

    dialogBox.innerHTML += `<p>小勇者安撫成功！魔物壞情緒減少💚</p>`;
  } else {
    if (h.key === "villager" && stageId === "boss") {
      dialogBox.innerHTML += `<p>勇敢的村民心態超強！不受壞情緒影響！</p>`;
    } else {
      battleState.heroHp -= 1;
    }
  }

  if (battleState.monsterHp <= 0) return clearBattle(stageId, m);
  if (battleState.heroHp <= 0) return heroDefeated(h, m, stageId);

  updateBattleUI(h, m);
}

/* ===== 清除戰鬥 ===== */
function clearBattle(stageId, m) {
  const dialogBox = document.getElementById("dialogBox");

  dialogBox.innerHTML += `<p>成功安撫 ${m.name}！牠成為了你的朋友🐾</p>`;

  let gain = m.name === "惡龍" ? 3 : 1;
  stars += gain;
  save("stars", stars);

  friends.push({
    name: m.name,
    stars: gain,
    level
  });
  save("friends", friends);

  clearedStages[stageId] = true;
  save("clearedStages", clearedStages);

  if (stageId === "boss") {
    level += 1;
    save("level", level);

    clearedStages = {};
    save("clearedStages", clearedStages);

    alert(`🎉 恭喜打倒魔王！地圖升級到 LV.${level}`);
  } else {
    alert(`安撫成功！回到地圖繼續冒險！`);
  }

  window.location.href = "map.html";
}

/* ===== 英雄死亡 ===== */
function heroDefeated(h, m, stageId) {
  if (items.revive > 0) {
    items.revive -= 1;
    save("items", items);
    alert("⭐ 使用復活星星！小勇者重新站起來！");
    battleState.heroHp = battleState.heroMax;
    updateBattleUI(h, m);
    return;
  }

  alert("小勇者累倒了... 回新手村休息吧！");
  window.location.href = "index.html";
}

/* ==========================================================
   道具籃
   ========================================================== */
function openItemBag() {
  document.getElementById("appleSmallCount").textContent = items.appleSmall;
  document.getElementById("appleBigCount").textContent = items.appleBig;
  document.getElementById("reviveCount").textContent = items.revive;

  document.getElementById("itemModal").classList.add("show");
}

function closeItemBag() {
  document.getElementById("itemModal").classList.remove("show");
}

function useItem(type) {
  const h = hero;

  if (items[type] <= 0) {
    alert("沒有這個道具！");
    return;
  }

  if (type === "appleSmall") {
    battleState.heroHp = Math.min(
      battleState.heroHp + 1,
      battleState.heroMax
    );
  }

  if (type === "appleBig") {
    battleState.heroHp = battleState.heroMax;
  }

  if (type === "revive") {
    battleState.heroHp = battleState.heroMax;
  }

  items[type] -= 1;
  save("items", items);

  updateBattleUI(h, MONSTER_DATA[load("currentStage", "")]);
  closeItemBag();
}

/* ==========================================================
   占卜（tarot.html）
   ========================================================== */
const TAROT_CARDS = [
  {
    name: "太陽",
    upright: "成功、活力、樂觀，自信將帶領你前進。",
    reverse: "暫時迷茫，需要給自己更多休息。",
    bear: "保持開朗的心，小太陽會再次照亮你喔～"
  },
  {
    name: "星星",
    upright: "希望、療癒，願望正在慢慢實現。",
    reverse: "信念動搖，別忘了你一直努力著。",
    bear: "相信自己正在前進，熊熊會陪著你。"
  },
  {
    name: "力量",
    upright: "勇氣與耐心會戰勝困難。",
    reverse: "需要重新整理情緒與步伐。",
    bear: "你比自己想像的更強大喔！"
  }
];

function initTarotPage() {
  document.getElementById("honeyCount").textContent = items.honey;
  document.getElementById("tarotStars").textContent = stars;

  document.getElementById("bearHugBtn").addEventListener("click", () => {
    alert("熊熊抱抱！HP恢復全滿！");
    if (hero) {
      hero.hp = hero.baseHp + (level - 1);
      save("hero", hero);
    }
  });

  document.getElementById("tarotDrawBtn").addEventListener("click", doTarot);
}

function doTarot() {
  if (items.honey <= 0) {
    alert("需要 🍯 嗡嗡蜂蜜！");
    return;
  }

  items.honey -= 1;
  save("items", items);
  document.getElementById("honeyCount").textContent = items.honey;

  const past = drawOneTarot();
  const present = drawOneTarot();
  const future = drawOneTarot();

  showTarotCard("Past", past);
  showTarotCard("Present", present);
  showTarotCard("Future", future);

  document.getElementById("tarotBearMessage").textContent =
    `熊熊村長：${future.bear}`;
}

function drawOneTarot() {
  const c = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  const isUpright = Math.random() < 0.5;

  return {
    name: c.name,
    orientation: isUpright ? "正位" : "逆位",
    meaning: isUpright ? c.upright : c.reverse,
    bear: c.bear
  };
}

function showTarotCard(pos, card) {
  document.getElementById(`tarot${pos}Name`).textContent = card.name;
  document.getElementById(`tarot${pos}Orient`).textContent =
    card.orientation;
  document.getElementById(`tarot${pos}Meaning`).textContent =
    card.meaning;
}

/* ==========================================================
   商店（shop.html）
   ========================================================== */
function initShopPage() {
  document.getElementById("shopStars").textContent = stars;
  document.getElementById("shopHoneyCount").textContent = items.honey;
  document.getElementById("shopAppleSmallCount").textContent =
    items.appleSmall;
  document.getElementById("shopAppleBigCount").textContent =
    items.appleBig;
  document.getElementById("shopReviveCount").textContent = items.revive;

  document.querySelectorAll(".shop-buy-btn").forEach(btn => {
    btn.addEventListener("click", () =>
      buyItem(btn.dataset.item, btn.dataset.label)
    );
  });
}

function buyItem(type, label) {
  const COST = {
    appleSmall: 1,
    appleBig: 5,
    revive: 10,
    honey: 6
  };

  const cost = COST[type];

  if (stars < cost) {
    alert("勇氣星星不足！");
    return;
  }

  stars -= cost;
  items[type] += 1;

  save("stars", stars);
  save("items", items);

  alert(`成功購買 ${label}！`);

  initShopPage();
}