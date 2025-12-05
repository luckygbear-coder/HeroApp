/* ==========================================================
   小勇者之旅大冒險 ｜ script.js
   （首頁＝村長的家＋九宮格地圖＋裝備升級＋熊熊暖心占卜紀錄）
   ========================================================== */

/* ---------- LocalStorage 工具 ---------- */
function load(key, fallback) {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : fallback;
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- 全域狀態 ---------- */
let hero = load("hero", null);
let level = load("level", 1);        // 也是勇者等級
let stars = load("stars", 0);
let items = load("items", {
  appleSmall: 0,
  appleBig: 0,
  revive: 0,
  honey: 0
});
let clearedStages = load("clearedStages", {}); // { forest:true, boss:true ... }
let friends = load("friends", []);

// 目前穿著的裝備（只記 ID）
let equips = load("equips", {
  weapon: null,
  armor: null,
  accessory: null,
  boots: null
});

// 每一件裝備自己的等級（可升級）
let equipLevels = load("equipLevels", {}); // 例如 { wood_sword: 2, cotton_armor: 1 }

/* ---------- 勇者資料 ---------- */
const HERO_DATA = {
  warrior: {
    key: "warrior",
    name: "戰士",
    talentEmoji: "✊",
    story: "勇敢又有責任感，總是站在第一線保護大家。",
    line: "我一定會守護大家！",
    ability: "若出 ✊ 並勝利 → 好心情 2 倍效果",
    baseHp: 6
  },
  mage: {
    key: "mage",
    name: "法師",
    talentEmoji: "✌️",
    story: "聰明有創意，總會想到出其不意的方法。",
    line: "嘿嘿～我有新點子！",
    ability: "若出 ✌️ 並勝利 → 好心情 2 倍效果",
    baseHp: 5
  },
  priest: {
    key: "priest",
    name: "牧師",
    talentEmoji: "🖐",
    story: "溫柔善解人意，擅長安撫與療癒。",
    line: "別擔心，我來幫你～",
    ability: "若出 🖐 並勝利 → 好心情 2 倍效果",
    baseHp: 5
  },
  villager: {
    key: "villager",
    name: "勇敢的村民",
    talentEmoji: null, // 無固定拳
    story: "平凡但堅韌，只要相信自己也能成為英雄！",
    line: "我雖然平凡，但不放棄！",
    ability: "魔王戰 → 不受壞情緒影響（不扣血）",
    baseHp: 7
  }
};

/* ---------- 魔物資料（九宮格 9 隻 + 魔王） ---------- */
const MONSTER_DATA = {
  forest: {
    stageName: "森林",
    name: "獸人",
    talentEmoji: "✊",
    forbidEmoji: "🖐",
    emotions: 3
  },
  lake: {
    stageName: "湖畔",
    name: "人魚",
    talentEmoji: "🖐",
    forbidEmoji: "✊",
    emotions: 3
  },
  cave: {
    stageName: "洞窟",
    name: "哥布林",
    talentEmoji: "✌️",
    forbidEmoji: "🖐",
    emotions: 3
  },
  grave: {
    stageName: "墓地",
    name: "骷髏兵",
    talentEmoji: "✊",
    forbidEmoji: "✌️",
    emotions: 3
  },
  dungeon: {
    stageName: "地窖",
    name: "異教徒",
    talentEmoji: "🖐",
    forbidEmoji: "✌️",
    emotions: 3
  },
  ruins: {
    stageName: "遺跡",
    name: "石像魔像",
    talentEmoji: "✌️",
    forbidEmoji: "✊",
    emotions: 3
  },
  meadow: {
    stageName: "草原",
    name: "史萊姆",
    talentEmoji: "✊",
    forbidEmoji: "🖐",
    emotions: 3
  },
  mountain: {
    stageName: "雪山",
    name: "雪怪",
    talentEmoji: "🖐",
    forbidEmoji: "✌️",
    emotions: 3
  },
  swamp: {
    stageName: "沼澤",
    name: "毒沼怪",
    talentEmoji: "✌️",
    forbidEmoji: "✊",
    emotions: 3
  },
  boss: {
    stageName: "魔王城",
    name: "惡龍",
    talentEmoji: null, // 不固定拳
    forbidEmoji: null,
    emotions: 6
  }
};

/* 所有普通魔物關卡（不含魔王） */
const MONSTER_STAGES = [
  "forest",
  "lake",
  "cave",
  "grave",
  "dungeon",
  "ruins",
  "meadow",
  "mountain",
  "swamp"
];

/* ---------- 兔兔工匠裝備資料 ---------- */
const EQUIP_ITEMS = {
  weapon: [
    {
      id: "wood_sword",
      name: "木製勇氣劍",
      price: 5,
      atk: 1,
      desc: "攻擊力 +1，適合剛出發的小勇者。"
    },
    {
      id: "star_sword",
      name: "星光騎士劍",
      price: 12,
      atk: 2,
      desc: "攻擊力 +2，天賦拳發動時會更有感。"
    }
  ],
  armor: [
    {
      id: "cotton_armor",
      name: "棉花保暖披風",
      price: 5,
      def: 1,
      desc: "防禦力 +1，被壞情緒打到也比較不痛。"
    }
  ],
  accessory: [
    {
      id: "clover_charm",
      name: "四葉幸運草吊飾",
      price: 8,
      luck: 1,
      desc: "幸運 +1，以後可以用來影響戰鬥機率（預留）。"
    }
  ],
  boots: [
    {
      id: "soft_boots",
      name: "毛茸茸靈巧靴",
      price: 8,
      agi: 1,
      desc: "敏捷 +1，以後可以用來閃避傷害（預留）。"
    }
  ]
};

/* ---------- 等級加成：每 5 級攻擊 +1、防禦 +1 ---------- */
function getLevelBonus() {
  const lvBonus = Math.floor((level - 1) / 5); // LV.1~5 = 0，LV.6~10 = 1 ...
  return {
    atk: lvBonus,
    def: lvBonus
  };
}

/* ---------- 裝備總加成（含等級） ---------- */
function getEquipStats() {
  let atk = 0, def = 0, luck = 0, agi = 0;
  ["weapon", "armor", "accessory", "boots"].forEach(slot => {
    const id = equips[slot];
    if (!id) return;
    const item = EQUIP_ITEMS[slot].find(it => it.id === id);
    if (!item) return;

    let lv = equipLevels[id];
    if (lv == null) lv = 1; // 舊存檔預設 Lv.1

    atk  += (item.atk  || 0) * lv;
    def  += (item.def  || 0) * lv;
    luck += (item.luck || 0) * lv;
    agi  += (item.agi  || 0) * lv;
  });
  return { atk, def, luck, agi };
}

/* ---------- 出拳 key ↔ emoji ---------- */
const MOVE_ICON = {
  rock: "✊",
  scissors: "✌️",
  paper: "🖐"
};

/* ---------- 戰鬥狀態 ---------- */
let battleState = {
  heroHp: 0,
  heroMax: 0,
  heroAtk: 1,
  heroDef: 0,
  heroLuck: 0,
  heroAgi: 0,
  monsterHp: 0,
  monsterMax: 0,
  monsterAtk: 1,
  round: 0
};

/* ==========================================================
   入口：依頁面啟動
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "index";

  switch (page) {
    case "index":
      initHomePage();         // 村長的家：小故事＋主選單
      break;
    case "chooseHero":
      initChooseHeroPage();   // 選擇小勇者專用頁面
      break;
    case "map":
      initMapPage();
      break;
    case "battle":
      initBattlePage();
      break;
    case "equip":
      initEquipPage();
      break;
    case "tarot":
      initTarotPage();
      break;
    case "shop":
      // 同一頁同時準備「補給商店」和「裝備坊」
      initShopPage();
      initEquipPage();
      break;
});

/* ==========================================================
   首頁：村長的家 index.html
   ========================================================== */
function initHomePage() {
  const adventureBtn = document.getElementById("goAdventureBtn");

  // 點「小勇者大冒險」：沒選勇者 → 去 choose-hero；有勇者 → 直接去地圖
  if (adventureBtn) {
    adventureBtn.addEventListener("click", () => {
      const heroData = localStorage.getItem("hero");
      if (!heroData) {
        window.location.href = "choose-hero.html";
      } else {
        window.location.href = "map.html";
      }
    });
  }
}

/* ==========================================================
   選擇小勇者頁：choose-hero.html
   ========================================================== */
function initChooseHeroPage() {
  const heroListDiv = document.getElementById("heroList");
  const storyBox    = document.getElementById("heroStoryBox");
  const storyText   = document.getElementById("heroStoryText");
  const lineText    = document.getElementById("heroLineText");
  const abilityText = document.getElementById("heroAbilityText");
  const confirmBtn  = document.getElementById("confirmHeroBtn");

  if (!heroListDiv) return;

  heroListDiv.innerHTML = "";

  Object.values(HERO_DATA).forEach(h => {
    const div = document.createElement("div");
    div.className = "hero-card";
    div.innerHTML = `
      <div class="hero-name">${h.name}</div>
      <div class="hero-fist">天賦拳：${h.talentEmoji || "任意拳"}</div>
    `;
    div.addEventListener("click", () => {
      hero = { ...h };
      save("hero", hero);

      [...heroListDiv.children].forEach(c => c.classList.remove("active"));
      div.classList.add("active");

      if (storyBox)   storyBox.style.display = "block";
      if (storyText)  storyText.textContent  = h.story;
      if (lineText)   lineText.textContent   = "口頭禪：" + h.line;
      if (abilityText) abilityText.textContent = "能力：" + h.ability;
      if (confirmBtn) confirmBtn.style.display = "block";
    });
    heroListDiv.appendChild(div);
  });

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      window.location.href = "map.html";
    });
  }
}

/* ==========================================================
   地圖 map.html（九宮格 9 魔物＋魔王解鎖）
   ========================================================== */
function initMapPage() {
  // 保護：如果還沒有選勇者，就導回選角頁
  if (!hero) {
    alert("請先選擇一位小勇者！");
    window.location.href = "choose-hero.html";
    return;
  }

  const grid = document.getElementById("mapGrid");
  if (!grid) return;

  // 舊版本保護：若魔物+魔王都打完卻沒升級，補一次
  const allMonstersCleared = MONSTER_STAGES.every(id => clearedStages[id]);
  const bossCleared = !!clearedStages.boss;
  if (allMonstersCleared && bossCleared) {
    level += 1;
    save("level", level);
    clearedStages = {};
    save("clearedStages", clearedStages);
    alert(`🎉 補上一次升級！地圖提升到 LV.${level}，可以重新挑戰所有地點了！`);
  }

  // 顯示地圖等級 & 星星
  const levelSpan = document.getElementById("mapLevel");
  const starSpan  = document.getElementById("mapStars");
  if (levelSpan) levelSpan.textContent = "LV." + level;
  if (starSpan)  starSpan.textContent  = stars;

  // 九宮格：全部都是魔物
  const cells = [
    { id: "forest",   label: "🌲 森林（獸人）" },
    { id: "lake",     label: "🌊 湖畔（人魚）" },
    { id: "cave",     label: "🕳 洞窟（哥布林）" },

    { id: "grave",    label: "💀 墓地（骷髏兵）" },
    { id: "dungeon",  label: "🕸 地窖（異教徒）" },
    { id: "ruins",    label: "🏛 遺跡（魔像）" },

    { id: "meadow",   label: "🌾 草原（史萊姆）" },
    { id: "mountain", label: "🏔 雪山（雪怪）" },
    { id: "swamp",    label: "🦠 沼澤（毒沼怪）" }
  ];

  grid.innerHTML = "";

  cells.forEach(cell => {
    const tile = document.createElement("div");
    tile.className = "map-tile";
    tile.textContent = cell.label;

    const isCleared = !!clearedStages[cell.id];
    if (isCleared) {
      tile.classList.add("cleared");
    }

    tile.addEventListener("click", () => {
      if (isCleared) {
        alert("這個地點已經安撫完成了，等打倒魔王、地圖升級後再來挑戰吧！");
        return;
      }
      save("currentStage", cell.id);
      window.location.href = "battle.html";
    });

    grid.appendChild(tile);
  });

  /* --- 魔王城解鎖區 --- */
  const bossSection = document.getElementById("bossSection");
  const bossHint    = document.getElementById("bossHintText");
  const bossBtn     = document.getElementById("bossBtn");

  if (bossSection && bossHint && bossBtn) {
    const ready = MONSTER_STAGES.every(id => clearedStages[id]);

    if (ready) {
      bossSection.style.display = "block";
      bossHint.textContent = "所有魔物都成為你的好朋友了！可以挑戰魔王城囉 ✨";
      bossBtn.disabled = false;

      bossBtn.addEventListener("click", () => {
        save("currentStage", "boss");
        window.location.href = "battle.html";
      });
    } else {
      bossSection.style.display = "none"; // 還沒打完 9 格就不顯示
    }
  }

  /* --- 好友名單 Modal --- */
  const fbBtn   = document.getElementById("friendsBtn");
  const fbModal = document.getElementById("friendsModal");
  const fbClose = document.getElementById("friendsCloseBtn");
  const fbList  = document.getElementById("friendsList");

  if (fbBtn && fbModal && fbClose && fbList) {
    fbBtn.addEventListener("click", () => {
      if (!friends.length) {
        fbList.innerHTML = "<li>目前還沒有好友～多多安撫魔物吧！</li>";
      } else {
        fbList.innerHTML = friends
          .map(f => `<li>${f.name}（⭐ ${f.stars}）LV.${f.level}</li>`)
          .join("");
      }
      fbModal.classList.add("show");
    });
    fbClose.addEventListener("click", () => fbModal.classList.remove("show"));
  }
}

/* ==========================================================
   戰鬥 battle.html
   ========================================================== */
function initBattlePage() {
  const stageId = load("currentStage", null);
  if (!stageId) {
    alert("請先回地圖選擇地點！");
    window.location.href = "map.html";
    return;
  }
  if (!hero) {
    alert("請先選擇小勇者！");
    window.location.href = "choose-hero.html";
    return;
  }

  const m = MONSTER_DATA[stageId];
  const h = hero;

  // 勇者最大 HP：基礎 HP + 好朋友數
  battleState.heroMax = h.baseHp + friends.length;
  battleState.heroHp = battleState.heroMax;

  // 勇者攻擊力：基礎 + 等級 + 等級加成 + 裝備加成
  battleState.heroAtk = 1 + (level - 1);
  const lvBonus = getLevelBonus();
  battleState.heroAtk += lvBonus.atk;

  const es = getEquipStats();
  battleState.heroAtk += es.atk || 0;

  // 勇者防禦＆其他能力（目前只在扣血時用到防禦）
  battleState.heroDef  = lvBonus.def + (es.def || 0);
  battleState.heroLuck = es.luck || 0;
  battleState.heroAgi  = es.agi  || 0;

  // 魔物 / 魔王壞情緒 HP & 攻擊（隨 LV 成長）
  if (stageId === "boss") {
    battleState.monsterMax = m.emotions + (level - 1) * 2;
    battleState.monsterAtk = 2 + (level - 1);
  } else {
    battleState.monsterMax = m.emotions + (level - 1);
    battleState.monsterAtk = 1 + Math.floor((level - 1) / 2);
  }
  battleState.monsterHp = battleState.monsterMax;

  battleState.round = 0;

  updateBattleUI(h, m, stageId);

  // 出拳按鈕（rock / scissors / paper）
  document.querySelectorAll(".rps-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.move; // "rock" / "scissors" / "paper"
      playRound(key, h, m, stageId);
    });
  });

  // 道具籃
  const itemBtn = document.getElementById("itemBagBtn");
  const itemClose = document.getElementById("closeItemModal");
  if (itemBtn && itemClose) {
    itemBtn.addEventListener("click", openItemBag);
    itemClose.addEventListener("click", closeItemBag);
  }
  document.querySelectorAll(".item-use-btn").forEach(btn => {
    btn.addEventListener("click", () => useItem(btn.dataset.item, h, m, stageId));
  });

  // 回地圖
  const backBtn = document.getElementById("backToMapBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "map.html";
    });
  }
}

/* --- 更新戰鬥 UI（新版：HP 數字＋頭像） --- */
function updateBattleUI(h, m, stageId) {
  const heroHpText        = document.getElementById("heroHpText");
  const heroLevelText     = document.getElementById("heroLevelText");
  const heroTalentText    = document.getElementById("heroTalentText");
  const heroNameText      = document.getElementById("heroNameText");
  const heroEquipText     = document.getElementById("heroEquipText");
  const heroBuffText      = document.getElementById("heroBuffText");
  const heroAvatar        = document.getElementById("heroAvatar");

  const monsterStageText  = document.getElementById("monsterStageText");
  const monsterNameText   = document.getElementById("monsterNameText");
  const monsterLevelText  = document.getElementById("monsterLevelText");
  const monsterTalentText = document.getElementById("monsterTalentText");
  const monsterForbidText = document.getElementById("monsterForbidText");
  const monsterHpText     = document.getElementById("monsterHpText");
  const monsterAvatar     = document.getElementById("monsterAvatar");

  // 勇者
  if (heroNameText)   heroNameText.textContent   = h.name;
  if (heroLevelText)  heroLevelText.textContent  = "LV." + level;
  if (heroTalentText) heroTalentText.textContent = h.talentEmoji || "任意拳";
  if (heroHpText) {
    heroHpText.textContent =
      `好心情 HP：${battleState.heroHp} / ${battleState.heroMax}`;
  }

  // 頭像用 emoji 先頂著，以後可以改成圖片
  if (heroAvatar) {
    const heroIconMap = {
      warrior: "🛡️",
      mage: "🔮",
      priest: "💖",
      villager: "🌾"
    };
    heroAvatar.textContent = heroIconMap[h.key] || "🧒";
  }

  // 魔物 / 魔王
  if (monsterStageText)  monsterStageText.textContent  = m.stageName;
  if (monsterNameText)   monsterNameText.textContent   = m.name;
  if (monsterLevelText)  monsterLevelText.textContent  = "LV." + level;
  if (monsterTalentText) monsterTalentText.textContent = m.talentEmoji || "任意拳";
  if (monsterForbidText) monsterForbidText.textContent = m.forbidEmoji || "—";
  if (monsterHpText) {
    monsterHpText.textContent =
      `壞情緒 HP：${battleState.monsterHp} / ${battleState.monsterMax}`;
  }

  if (monsterAvatar) {
    const monsterIconMap = {
      forest:   "👹",
      lake:     "🧜‍♀️",
      cave:     "🧌",
      grave:    "💀",
      dungeon:  "🕸️",
      ruins:    "🗿",
      meadow:   "🟢",
      mountain: "👾",
      swamp:    "🦠",
      boss:     "🐉"
    };
    monsterAvatar.textContent = monsterIconMap[stageId] || "👾";
  }

  // 裝備名稱顯示（含等級）——沿用你原本的邏輯
  if (heroEquipText) {
    const names = [];
    ["weapon", "armor", "accessory", "boots"].forEach(slot => {
      const id = equips[slot];
      if (!id) return;
      const item = EQUIP_ITEMS[slot].find(it => it.id === id);
      if (!item) return;
      let lv = equipLevels[id];
      if (lv == null) lv = 1;
      names.push(`${item.name} Lv.${lv}`);
    });
    heroEquipText.textContent = names.length ? names.join("／") : "尚未裝備";
  }

  // 裝備＋等級加成說明——沿用你原本的邏輯
  if (heroBuffText) {
    const s   = getEquipStats();
    const lvB = getLevelBonus();
    const buffs = [];
    if (lvB.atk || lvB.def) {
      buffs.push(`等級加成：攻擊 +${lvB.atk}、防禦 +${lvB.def}`);
    }
    if (s.atk)  buffs.push(`裝備攻擊 +${s.atk}`);
    if (s.def)  buffs.push(`裝備防禦 +${s.def}`);
    if (s.luck) buffs.push(`幸運 +${s.luck}`);
    if (s.agi)  buffs.push(`敏捷 +${s.agi}`);
    heroBuffText.textContent = buffs.length
      ? buffs.join("；")
      : "目前沒有額外加成";
  }
}

/* --- 魔物出拳（55% 天賦拳 / 45% 另一個可用拳） --- */
function monsterMove(m) {
  // 魔王：三種隨機出，無弱點拳
  if (m.name === "惡龍") {
    const icons = ["✊", "✌️", "🖐"];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  const talent = m.talentEmoji;
  const forbid = m.forbidEmoji;
  const all = ["✊", "✌️", "🖐"];
  const other = all.find(e => e !== talent && e !== forbid);

  const r = Math.random();
  return r < 0.55 ? talent : other;
}

/* --- 判定勝負（全部用 emoji） --- */
function judge(playerEmoji, monsterEmoji) {
  if (playerEmoji === monsterEmoji) return "tie";

  if (
    (playerEmoji === "✊" && monsterEmoji === "✌️") ||
    (playerEmoji === "✌️" && monsterEmoji === "🖐") ||
    (playerEmoji === "🖐" && monsterEmoji === "✊")
  ) {
    return "win";
  }
  return "lose";
}

/* --- 一回合戰鬥 --- */
function playRound(moveKey, h, m, stageId) {
  const dialogBox = document.getElementById("dialogBox");
  const roundText = document.getElementById("roundCount");

  battleState.round++;
  if (roundText) roundText.textContent = battleState.round;

  const playerEmoji  = MOVE_ICON[moveKey] || "✊";
  const monsterEmoji = monsterMove(m);

  if (dialogBox) {
    dialogBox.innerHTML += `<p>小勇者：我出 ${playerEmoji}！</p>`;
    dialogBox.innerHTML += `<p>${m.name}：我出 ${monsterEmoji}...</p>`;
  }

  const result = judge(playerEmoji, monsterEmoji);
  handleRoundResult(result, playerEmoji, h, m, stageId);

  if (dialogBox) {
    dialogBox.scrollTop = dialogBox.scrollHeight;
  }
}

/* --- 處理勝負結果 --- */
function handleRoundResult(result, playerEmoji, h, m, stageId) {
  const roundResult = document.getElementById("roundResult");
  const dialogBox   = document.getElementById("dialogBox");

  if (result === "tie") {
    if (roundResult) roundResult.textContent = "平手～再試一次！";
    return;
  }

  if (result === "win") {
    let dmg = battleState.heroAtk;

    if (h.talentEmoji && h.talentEmoji === playerEmoji) {
      dmg *= 2;
      if (dialogBox) {
        dialogBox.innerHTML += `<p>天賦拳發動！安撫效果 x2 ✨（傷害 ${dmg}）</p>`;
      }
    }

    stars += 1;
    save("stars", stars);

    battleState.monsterHp = Math.max(0, battleState.monsterHp - dmg);

    if (roundResult) {
      roundResult.textContent = `安撫成功！壞情緒減少 ${dmg} 點 💚`;
    }
  } else if (result === "lose") {
    if (h.key === "villager" && stageId === "boss") {
      if (dialogBox) {
        dialogBox.innerHTML += `<p>勇敢的村民心超強！壞情緒無法傷害他！</p>`;
      }
      if (roundResult) {
        roundResult.textContent = "雖然這回合沒贏，但你的心情很穩定。";
      }
    } else {
      let dmg = battleState.monsterAtk;
      if (battleState.heroDef) {
        dmg = Math.max(1, dmg - battleState.heroDef);
      }
      battleState.heroHp = Math.max(0, battleState.heroHp - dmg);
      if (roundResult) {
        roundResult.textContent = `這回合被壞情緒影響了，HP -${dmg}。`;
      }
    }
  }

  if (battleState.monsterHp <= 0) {
    clearBattle(stageId, m);
    return;
  }
  if (battleState.heroHp <= 0) {
    heroDefeated(h, m, stageId);
    return;
  }

  updateBattleUI(h, m, stageId);
}

/* --- 通關流程 --- */
function clearBattle(stageId, m) {
  const dialogBox = document.getElementById("dialogBox");
  if (dialogBox) {
    dialogBox.innerHTML += `<p>成功安撫 ${m.name}！牠成為你的好朋友 🐾</p>`;
  }

  const isBoss = stageId === "boss";
  const gain = isBoss ? 3 : 1;
  stars += gain;
  save("stars", stars);

  friends.push({ name: m.name, stars: gain, level });
  save("friends", friends);

  clearedStages[stageId] = true;
  save("clearedStages", clearedStages);

  if (isBoss) {
    level += 1;
    save("level", level);
    clearedStages = {};
    save("clearedStages", clearedStages);
    alert(`🎉 恭喜打倒魔王！地圖升級到 LV.${level}，所有地點都可以重新挑戰囉！`);
  } else {
    alert("安撫成功！回到地圖選下一個地點冒險吧～");
  }

  window.location.href = "map.html";
}

/* --- 勇者倒下 --- */
function heroDefeated(h, m, stageId) {
  if (items.revive > 0) {
    items.revive -= 1;
    save("items", items);
    alert("⭐ 使用復活星星，小勇者重新站起來！");
    battleState.heroHp = battleState.heroMax;
    updateBattleUI(h, m, stageId);
    return;
  }

  alert("小勇者累壞了…先回村長的家好好休息一下吧！");
  window.location.href = "index.html";
}

/* ==========================================================
   戰鬥中道具籃
   ========================================================== */
function openItemBag() {
  document.getElementById("appleSmallCount").textContent = items.appleSmall;
  document.getElementById("appleBigCount").textContent   = items.appleBig;
  document.getElementById("reviveCount").textContent     = items.revive;
  document.getElementById("itemModal").classList.add("show");
}
function closeItemBag() {
  document.getElementById("itemModal").classList.remove("show");
}
function useItem(type, h, m, stageId) {
  if (items[type] <= 0) {
    alert("沒有這個道具！");
    return;
  }

  if (type === "appleSmall") {
    battleState.heroHp = Math.min(battleState.heroHp + 1, battleState.heroMax);
  } else if (type === "appleBig" || type === "revive") {
    battleState.heroHp = battleState.heroMax;
  }

  items[type] -= 1;
  save("items", items);
  updateBattleUI(h, m, stageId);
  closeItemBag();
}

/* ==========================================================
   熊熊暖心語錄（熊熊抱抱）
   ========================================================== */

const BEAR_HUG_MESSAGES = [
  "你已經很棒很努力了，熊熊為你感到好驕傲 💛",
  "就算今天有點累，明天的你還是充滿可能喔！",
  "犯錯沒關係，代表你正在學習新東西。",
  "如果覺得難過，可以先停下來抱抱自己一下。",
  "你不需要變成別人眼中的完美，只要做喜歡的自己就好。",
  "慢慢來也沒關係，每一步都是在前進。",
  "遇到不開心的事，記得跟信任的大人或朋友說說。",
  "即使現在看不到，未來還是有很多美好的驚喜在等你。",
  "你值得被溫柔對待，也值得好好對自己溫柔。",
  "謝謝你一直沒有放棄，熊熊會一直陪你一起走。"
];

function getRandomBearHugMessage() {
  const i = Math.floor(Math.random() * BEAR_HUG_MESSAGES.length);
  return BEAR_HUG_MESSAGES[i];
}

/* ==========================================================
   占卜 tarot.html（22 張大秘儀）
   ========================================================== */

const TAROT_CARDS = [
  {
    name: "0 愚者",
    upright: "新的開始、自由、勇敢踏出第一步。適合嘗試新計畫，不必把一切想得太可怕。",
    reverse: "衝動、沒想清楚、容易迷路。行動前要多問幾個為什麼，確認自己真的準備好了。",
    bear: "有時候勇氣就是「先踏出一小步」，剩下的我們慢慢一起想。"
  },
  {
    name: "I 魔術師",
    upright: "專注、溝通順利、手上有完成事情的資源。只要好好運用就能做出成果。",
    reverse: "分心、說一套做一套、計畫不夠清楚。需要整理思緒，說到的事情要慢慢做到。",
    bear: "你的點子很多很棒，把它們寫下來，一件一件完成就會變成真正的魔法。"
  },
  {
    name: "II 女祭司",
    upright: "直覺敏銳、適合安靜思考、觀察周圍。先聽聽自己心裡的聲音再做決定。",
    reverse: "太壓抑自己、不敢說出真實感受，或是只猜別人想法卻不溝通。",
    bear: "如果心裡有話說不出口，可以先寫在紙上或跟熊熊說說，慢慢練習表達。"
  },
  {
    name: "III 皇后",
    upright: "溫暖、照顧、創造力豐富。適合好好愛自己、做喜歡的事，享受被關心與關心別人。",
    reverse: "太照顧別人而忘了自己，或是有點依賴、懶得行動。",
    bear: "對別人溫柔的同時，也別忘了留一點力氣給自己，補充愛的能量。"
  },
  {
    name: "IV 皇帝",
    upright: "穩定、負責任、有計畫地前進。適合訂目標、一步一步完成。",
    reverse: "太想控制一切、固執、不肯聽意見，或是覺得事情太多快扛不住。",
    bear: "你不需要一個人扛起全部的世界，願意開口求助，也是很成熟的表現。"
  },
  {
    name: "V 教皇",
    upright: "得到長輩或老師的指引、遵守規則、一起學習。適合請教懂的人。",
    reverse: "被規則綁住、害怕犯錯，或是只照別人說的做，忘了問自己真正想要什麼。",
    bear: "規則是用來保護你的，不是要限制你。如果覺得不舒服，可以試著溫柔地提出來。"
  },
  {
    name: "VI 戀人",
    upright: "選擇、關係和諧、愛與支持。適合做出真心的選擇。",
    reverse: "猶豫不決、太在意別人想法。",
    bear: "做選擇前問問自己：「哪一個讓我更做自己？」"
  },
  {
    name: "VII 戰車",
    upright: "向前衝刺、意志堅定、把目標往前推進的好時機。",
    reverse: "太急、太硬、忽略情緒或休息。",
    bear: "真正的勇敢不是一直往前衝，而是知道何時該停下來看地圖。"
  },
  {
    name: "VIII 力量",
    upright: "溫柔但堅定，能好好面對壞情緒而不被吞沒。",
    reverse: "對自己太嚴格或覺得不夠好。",
    bear: "不需要完美，你願意努力、願意誠實，就是你的超能力。"
  },
  {
    name: "IX 隱者",
    upright: "適合獨處、整理心情、慢慢找答案。",
    reverse: "太封閉、孤單，把自己關在小房間裡。",
    bear: "安靜一下很好，但如果覺得孤單，記得打開門找找願意聽你說話的人。"
  },
  {
    name: "X 命運之輪",
    upright: "運氣轉變、機會來臨，新篇章要開始。",
    reverse: "卡住、反覆遇到同樣問題，需要換方式面對。",
    bear: "運氣不好不代表你不好，只是故事還沒演到轉折。"
  },
  {
    name: "XI 正義",
    upright: "公平、理性、做出負責任的決定。",
    reverse: "覺得不公平、過度責怪自己或別人。",
    bear: "如果覺得被誤會，試著冷靜說清楚，你的感受很重要。"
  },
  {
    name: "XII 吊人",
    upright: "暫停、等待、換角度思考，是成長的過程。",
    reverse: "覺得被卡住、心悶、沒進展。",
    bear: "停下來不代表失敗，可能是在為更好的路讓出空間。"
  },
  {
    name: "XIII 死神",
    upright: "結束舊階段、迎接新的開始。",
    reverse: "害怕改變、不敢放手。",
    bear: "說再見很難，但新的美好也會因為這個空位而靠近你。"
  },
  {
    name: "XIV 節制",
    upright: "平衡、剛剛好、調整生活節奏。",
    reverse: "過度或不足、失衡、情緒不穩。",
    bear: "每天一點小小的調整就很好，不需要一下做到完美。"
  },
  {
    name: "XV 惡魔",
    upright: "欲望、壞習慣、被困住的感覺。",
    reverse: "開始看清束縛，準備離開不健康的狀態。",
    bear: "你永遠可以重新選擇，即使只是一小步，也是走向自由。"
  },
  {
    name: "XVI 高塔",
    upright: "突發事件、真相浮現、舊的結構被打破。",
    reverse: "問題其實早就存在，只是一直被忽略。",
    bear: "雖然現在很亂，但之後你會蓋一座更安全、更喜歡的新塔。"
  },
  {
    name: "XVII 星星",
    upright: "希望、療癒、慢慢變好，是溫柔而長期的好轉。",
    reverse: "信心動搖、暫時看不到亮光。",
    bear: "哪怕只有一點點微光，它也是希望，請幫自己把它留著。"
  },
  {
    name: "XVIII 月亮",
    upright: "直覺敏銳、情緒細膩、適合觀察內心。",
    reverse: "擔心太多、想像過頭、感到不安。",
    bear: "把害怕說出來，很多時候它就沒那麼可怕了。"
  },
  {
    name: "XIX 太陽",
    upright: "成功、開心、充滿活力，是非常幸運與快樂的訊號。",
    reverse: "累了、壓力大、暫時失去光。",
    bear: "太陽有時會被雲遮住，但它從未消失，你的光也是。"
  },
  {
    name: "XX 審判",
    upright: "覺醒、理解過去、重新開始。",
    reverse: "困在過去、對自己太嚴厲。",
    bear: "承認錯誤很勇敢，但也請給自己第二次機會。"
  },
  {
    name: "XXI 世界",
    upright: "圓滿、達成、完成一個階段。",
    reverse: "接近成功但有點拖延、不敢踏出最後一步。",
    bear: "你已經走了很遠，再跨出小小一步就會看到新的風景。"
  }
];

// 占卜歷史記錄 key
const TAROT_HISTORY_KEY = "tarotHistory";

function loadTarotHistory() {
  return load(TAROT_HISTORY_KEY, []);
}
function saveTarotHistory(list) {
  save(TAROT_HISTORY_KEY, list);
}

// 把一段文字切成「短說明」用在卡片初始顯示
function makeShortText(text) {
  const idx = text.indexOf("。");
  if (idx !== -1) {
    return text.slice(0, idx + 1); // 第一個句號為止
  }
  return text;
}

/* ---------- 占卜頁初始化 ---------- */
function initTarotPage() {
  const honeyLabel   = document.getElementById("honeyCount");
  const starLabel    = document.getElementById("tarotStars");
  const hugBtn       = document.getElementById("bearHugBtn");
  const drawBtn      = document.getElementById("tarotDrawBtn");
  const historyBtn   = document.getElementById("openTarotHistoryBtn");
  const historyModal = document.getElementById("tarotHistoryModal");
  const historyClose = document.getElementById("closeTarotHistoryBtn");

  if (honeyLabel) honeyLabel.textContent = items.honey;
  if (starLabel)  starLabel.textContent  = stars;

  // 熊熊抱抱：隨機暖心語錄
  if (hugBtn) {
    hugBtn.addEventListener("click", () => {
      const msg = getRandomBearHugMessage();
      alert("🐻 熊熊抱抱～\n\n" + msg);
      const bearMsgBox = document.getElementById("tarotBearMessage");
      if (bearMsgBox) {
        bearMsgBox.textContent = "熊熊村長：" + msg;
      }
    });
  }

  // 抽牌按鈕
  if (drawBtn) {
    drawBtn.addEventListener("click", doTarot);
  }

  // 打開／關閉占卜紀錄視窗
  if (historyBtn && historyModal && historyClose) {
    historyBtn.addEventListener("click", () => {
      historyModal.classList.add("show");
      renderTarotHistory();   // 每次打開都重新畫一次
    });
    historyClose.addEventListener("click", () => {
      historyModal.classList.remove("show");
    });
  }

  // 進入占卜頁時，就先把歷史清單準備好
  renderTarotHistory();
}

/* ---------- 抽一次塔羅牌（過去／現在／未來） ---------- */
function doTarot() {
  if (items.honey <= 0) {
    alert("需要 1 份 🍯 嗡嗡蜂蜜才能請熊熊村長占卜喔！");
    return;
  }

  // 扣蜂蜜並更新畫面
  items.honey -= 1;
  save("items", items);
  const honeyLabel = document.getElementById("honeyCount");
  if (honeyLabel) honeyLabel.textContent = items.honey;

  const section = document.querySelector(".tarot-section");
  const pastName    = document.getElementById("tarotPastName");
  const presentName = document.getElementById("tarotPresentName");
  const futureName  = document.getElementById("tarotFutureName");

  // 洗牌中的小提示
  if (pastName)    pastName.textContent    = "洗牌中…";
  if (presentName) presentName.textContent = "洗牌中…";
  if (futureName)  futureName.textContent  = "洗牌中…";

  if (section) {
    section.classList.add("tarot-drawing"); // 這個 class 可以在 CSS 做震動 / 閃爍動畫
  }

  // 抽三張牌（資料先準備好）
  const past    = drawTarotCard();
  const present = drawTarotCard();
  const future  = drawTarotCard();

  // 模擬洗牌動畫時間，之後才翻開
  setTimeout(() => {
    if (section) section.classList.remove("tarot-drawing");

    showTarotCard("Past", past);
    showTarotCard("Present", present);
    showTarotCard("Future", future);

    const bearMsg = document.getElementById("tarotBearMessage");
    if (bearMsg) bearMsg.textContent = "熊熊村長：" + future.bear;

    // 存入歷史紀錄
    const history = loadTarotHistory();
    const now = new Date();
    history.push({
      time: now.toLocaleString(),  // 例如：2025/12/05 21:30:12
      past,
      present,
      future
    });
    saveTarotHistory(history);

    renderTarotHistory();
  }, 700); // 0.7 秒的「洗牌中」感覺
}

/* ---------- 抽一張卡（隨機＋正逆位） ---------- */
function drawTarotCard() {
  const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  const upright = Math.random() < 0.5;
  return {
    name: card.name,
    orientation: upright ? "正位" : "逆位",
    meaning: upright ? card.upright : card.reverse,
    bear: card.bear
  };
}

/* ---------- 顯示單張卡片＋「更多說明」按鈕＋翻牌動畫 ---------- */
function showTarotCard(pos, card) {
  // pos 為 "Past" / "Present" / "Future"
  const nameEl    = document.getElementById(`tarot${pos}Name`);
  const orientEl  = document.getElementById(`tarot${pos}Orient`);
  const meaningEl = document.getElementById(`tarot${pos}Meaning`);

  if (!nameEl || !meaningEl) return;

  const shortText = makeShortText(card.meaning);

  // 文字內容
  nameEl.textContent    = card.name;
  if (orientEl) orientEl.textContent = card.orientation;
  meaningEl.textContent = shortText;

  // 把完整文字存在 data-* 裡，給「更多說明」用
  meaningEl.dataset.full     = card.meaning;
  meaningEl.dataset.short    = shortText;
  meaningEl.dataset.expanded = "0";

  // 找到外層卡片元素（用來加翻牌動畫 class）
  const cardBox = meaningEl.closest(".tarot-card");

  // ------- 更多說明按鈕 -------
  let moreBtn = document.getElementById(`tarot${pos}More`);
  if (!moreBtn) {
    moreBtn = document.createElement("button");
    moreBtn.id = `tarot${pos}More`;
    moreBtn.className = "tarot-more-btn";
    moreBtn.type = "button";

    if (cardBox) {
      cardBox.appendChild(moreBtn);
    }
  }

  moreBtn.textContent = "更多說明";
  moreBtn.onclick = () => {
    const expanded = meaningEl.dataset.expanded === "1";
    if (expanded) {
      meaningEl.textContent       = meaningEl.dataset.short;
      meaningEl.dataset.expanded  = "0";
      moreBtn.textContent         = "更多說明";
    } else {
      meaningEl.textContent       = meaningEl.dataset.full;
      meaningEl.dataset.expanded  = "1";
      moreBtn.textContent         = "收合說明";
    }
  };

  // ------- 翻牌動畫 -------
  if (cardBox) {
    // 先移除再加上，讓每次抽牌都會重新播放動畫
    cardBox.classList.remove("flipped");
    // 讀一次 offsetWidth 觸發 reflow，讓瀏覽器認為狀態重來
    void cardBox.offsetWidth;
    cardBox.classList.add("flipped");
  }
}

/* ---------- 占卜紀錄列表（右上角按鈕打開的 Modal） ---------- */
function renderTarotHistory() {
  const listEl = document.getElementById("tarotHistoryList");
  if (!listEl) return;

  const history = loadTarotHistory();
  if (!history.length) {
    listEl.innerHTML = '<li class="tarot-history-empty">目前還沒有占卜紀錄～</li>';
    return;
  }

  const rows = history
    .slice()
    .reverse()
    .map(entry => `
      <li class="tarot-history-item">
        <div class="tarot-history-time">📅 ${entry.time}</div>
        <div class="tarot-history-cards">
          <div>過去：${entry.past.name}（${entry.past.orientation}）－ ${entry.past.meaning}</div>
          <div>現在：${entry.present.name}（${entry.present.orientation}）－ ${entry.present.meaning}</div>
          <div>未來：${entry.future.name}（${entry.future.orientation}）－ ${entry.future.meaning}</div>
        </div>
      </li>
    `);

  listEl.innerHTML = rows.join("");
}
/* ==========================================================
   商店＋裝備坊（同頁分頁） shop.html
   ========================================================== */
function initShopPage() {
  const starText   = document.getElementById("shopStars");
  const honeyText  = document.getElementById("shopHoneyCount");
  const honeyText2 = document.getElementById("shopHoneyCount2");
  const sSmall     = document.getElementById("shopAppleSmallCount");
  const sBig       = document.getElementById("shopAppleBigCount");
  const sRevive    = document.getElementById("shopReviveCount");

  // 數字顯示（補給商店）
  if (starText)   starText.textContent   = stars;
  if (honeyText)  honeyText.textContent  = items.honey;
  if (honeyText2) honeyText2.textContent = items.honey;
  if (sSmall)     sSmall.textContent     = items.appleSmall;
  if (sBig)       sBig.textContent       = items.appleBig;
  if (sRevive)    sRevive.textContent    = items.revive;

  // 綁定購買按鈕
  document.querySelectorAll(".shop-buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      buyItem(btn.dataset.item, btn.dataset.label);
    });
  });

  // 分頁切換：補給商店 ↔ 裝備坊
  const shopTabBtn   = document.getElementById("shopTabBtn");
  const equipTabBtn  = document.getElementById("equipTabBtn");
  const shopSection  = document.getElementById("shopSection");
  const equipSection = document.getElementById("equipSection");

  if (shopTabBtn && equipTabBtn && shopSection && equipSection) {
    const switchTo = (panel) => {
      const toShop  = panel === "shop";

      shopTabBtn.classList.toggle("active", toShop);
      equipTabBtn.classList.toggle("active", !toShop);

      shopSection.classList.toggle("active", toShop);
      equipSection.classList.toggle("active", !toShop);
    };

    // 小彈跳動畫（加上 pop class，再在動畫結束後移除）
    const addPop = (btn) => {
      btn.classList.remove("pop");
      void btn.offsetWidth;   // 強制重排，讓動畫可以重播
      btn.classList.add("pop");
    };

    shopTabBtn.addEventListener("click", () => {
      switchTo("shop");
      addPop(shopTabBtn);
    });
    equipTabBtn.addEventListener("click", () => {
      switchTo("equip");
      addPop(equipTabBtn);
    });
  }
}
/* ==========================================================
   兔兔工匠的裝備坊 equip.html（可升級版＋可切換）
   ========================================================== */
function initEquipPage() {
  const starText = document.getElementById("equipStars");
  if (starText) starText.textContent = stars;

  renderEquipList("weapon", "equipWeaponList");
  renderEquipList("armor", "equipArmorList");
  renderEquipList("accessory", "equipAccessoryList");
  renderEquipList("boots", "equipBootsList");
}

function renderEquipList(slot, containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;

  box.innerHTML = EQUIP_ITEMS[slot].map(item => {
    const lv = equipLevels[item.id] || 0;   // 0 = 尚未購買
    const nextLv = lv + 1;
    const price = item.price * nextLv;      // 每級價格遞增

    const isEquipped = equips[slot] === item.id;
    const owned = lv > 0;

    const lvText = owned ? `（目前 Lv.${lv}）` : "（尚未購買）";

    // 按鈕模式：未購買 = buy；已購買未使用 = switch；已購買且使用中 = upgrade
    let mode, btnLabel;
    if (!owned) {
      mode = "buy";
      btnLabel = `用 ${price}⭐ 購買並裝備`;
    } else if (isEquipped) {
      mode = "upgrade";
      btnLabel = `升級到 Lv.${nextLv}（需 ${price}⭐）`;
    } else {
      mode = "switch";
      btnLabel = "切換為使用中（不需星星）";
    }

    return `
      <div class="equip-item">
        <div class="equip-name">
          ${item.name} ${lvText} ${isEquipped ? "✅ 使用中" : ""}
        </div>
        <div class="equip-desc">${item.desc}</div>
        <button
          class="equip-btn"
          data-slot="${slot}"
          data-id="${item.id}"
          data-price="${price}"
          data-mode="${mode}"
        >
          ${btnLabel}
        </button>
      </div>
    `;
  }).join("");

  // 綁定按鈕事件（購買／升級／切換）
  box.querySelectorAll(".equip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const slotName = btn.dataset.slot;
      const id       = btn.dataset.id;
      const price    = Number(btn.dataset.price);
      const mode     = btn.dataset.mode;

      if (mode === "buy") {
        // 第一次購買
        if (stars < price) {
          alert("勇氣星星不足，先多安撫幾隻魔物吧！");
          return;
        }
        stars -= price;
        save("stars", stars);

        equipLevels[id] = 1;       // Lv.1
        equips[slotName] = id;     // 直接裝上

        save("equipLevels", equipLevels);
        save("equips", equips);

        alert(`兔兔工匠：幫你穿上「${itemNameFromId(id)}」，現在是 Lv.1！`);

      } else if (mode === "upgrade") {
        // 已穿著 → 升級
        if (stars < price) {
          alert("勇氣星星不足，先多安撫幾隻魔物吧！");
          return;
        }
        stars -= price;
        save("stars", stars);

        const currentLv = equipLevels[id] || 1;
        const newLv = currentLv + 1;
        equipLevels[id] = newLv;

        save("equipLevels", equipLevels);

        alert(`兔兔工匠：裝備升級到 Lv.${newLv}，效果更棒了！`);

      } else if (mode === "switch") {
        // 已購買、未使用 → 免費切換
        equips[slotName] = id;
        save("equips", equips);
        alert(`兔兔工匠：已切換為「${itemNameFromId(id)}」！`);
      }

      // 重新刷新列表 & 星星數字
      initEquipPage();
      const starText = document.getElementById("equipStars");
      if (starText) starText.textContent = stars;
    });
  });
}

/* 小工具：透過 ID 找中文名稱（只是讓提示文字好看一點） */
function itemNameFromId(id) {
  for (const slot of ["weapon", "armor", "accessory", "boots"]) {
    const found = EQUIP_ITEMS[slot].find(it => it.id === id);
    if (found) return found.name;
  }
  return id;
}

