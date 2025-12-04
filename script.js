/* ==========================================================
   小勇者之旅大冒險 ｜ script.js（穩定版）
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
let level = load("level", 1);
let stars = load("stars", 0);
let items = load("items", {
  appleSmall: 0,
  appleBig: 0,
  revive: 0,
  honey: 0
});
let clearedStages = load("clearedStages", {}); // { forest:true, boss:true ... }
let friends = load("friends", []);
// 裝備狀態（之後在裝備坊改這個物件就好）
let equipment = load("equipment", {
  weapon: null,    // { name: "木製勇氣劍", atk: 1, ... }
  armor: null,     // { name: "棉花保暖披風", def: 1, ... }
  accessory: null, // { name: "四葉幸運草吊飾", luck: 1, ... }
  shoes: null,     // { name: "輕盈步伐靴", dodge: 0.2, ... }
  bonus: {
    atk: 0,
    def: 0,
    luck: 0,
    dodge: 0       // 0.2 代表 20% 閃避機率（只是顯示用）
  }
});
let equips = load("equips", {
  weapon: null,
  armor: null,
  accessory: null,
  boots: null
});
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

/* ---------- 魔物資料（維持原本 6 隻 + 魔王） ---------- */
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
  boss: {
    stageName: "魔王城",
    name: "惡龍",
    talentEmoji: null, // 不固定拳
    forbidEmoji: null,
    emotions: 6
  }
};

/* 所有普通魔物關卡（不含魔王） */
const MONSTER_STAGES = ["forest", "lake", "cave", "grave", "dungeon", "ruins"];
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

// 之後要算戰鬥加成會用到的工具（目前只用在攻擊力）
function getEquipStats() {
  let atk = 0, def = 0, luck = 0, agi = 0;
  ["weapon", "armor", "accessory", "boots"].forEach(slot => {
    const id = equips[slot];
    if (!id) return;
    const item = EQUIP_ITEMS[slot].find(it => it.id === id);
    if (!item) return;
    atk  += item.atk  || 0;
    def  += item.def  || 0;
    luck += item.luck || 0;
    agi  += item.agi  || 0;
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
  monsterHp: 0,
  monsterMax: 0,
  monsterAtk: 1,
  round: 0
};

/* ==========================================================
   入口：依頁面啟動
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
    case "equip":
      initEquipPage();
      break;
    case "tarot":
      initTarotPage();
      break;
    case "shop":
      initShopPage();
      break;
  }
});/* ==========================================================
   新手村 index.html
   ========================================================== */
function initIndexPage() {
  const heroListDiv = document.getElementById("heroList");
  const storyBox = document.getElementById("heroStoryBox");
  const storyText = document.getElementById("heroStoryText");
  const lineText = document.getElementById("heroLineText");
  const abilityText = document.getElementById("heroAbilityText");
  const confirmBtn = document.getElementById("confirmHeroBtn");

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
   地圖 map.html（維持原本 3x3 佈局）
   ========================================================== */
function initMapPage() {
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

  document.getElementById("mapLevel").textContent = "LV." + level;
  document.getElementById("mapStars").textContent = stars;

  const cells = [
    { id: "start", label: "🏡 新手村", kind: "start" },
    { id: "forest", label: "🌲 森林（獸人）", kind: "monster" },
    { id: "boss", label: "🔥 魔王城（惡龍）", kind: "boss" },

    { id: "lake", label: "🌊 湖畔（人魚）", kind: "monster" },
    { id: "tarot", label: "🔮 占卜屋", kind: "tarot" },
    { id: "cave", label: "🕳 洞窟（哥布林）", kind: "monster" },

    { id: "grave", label: "💀 墓地（骷髏兵）", kind: "monster" },
    { id: "dungeon", label: "🕸 地窖（異教徒）", kind: "monster" },
    { id: "ruins", label: "🏛 遺跡（魔像）", kind: "monster" }
  ];

  grid.innerHTML = "";

  cells.forEach(cell => {
    const tile = document.createElement("div");
    tile.className = "map-tile";
    tile.textContent = cell.label;

    if (cell.kind === "boss") tile.classList.add("boss");
    if (cell.kind === "start" || cell.kind === "tarot") tile.classList.add("special");

    const isCleared = !!clearedStages[cell.id];
    if ((cell.kind === "monster" || cell.kind === "boss") && isCleared) {
      tile.classList.add("cleared");
    }

    tile.addEventListener("click", () => {
      // 已通關的魔物／魔王，在這一輪內不能再進入
      if ((cell.kind === "monster" || cell.kind === "boss") && isCleared) {
        alert("這個地點已完成，要等打倒魔王、地圖升級後才能重新挑戰喔！");
        return;
      }

      switch (cell.kind) {
        case "start":
          window.location.href = "index.html";
          break;
        case "tarot":
          window.location.href = "tarot.html";
          break;
        case "boss": {
          const ready = MONSTER_STAGES.every(id => clearedStages[id]);
          if (!ready) {
            alert("請先安撫所有魔物，再來挑戰魔王城！");
            return;
          }
          save("currentStage", "boss");
          window.location.href = "battle.html";
          break;
        }
        case "monster":
          save("currentStage", cell.id);
          window.location.href = "battle.html";
          break;
      }
    });

    grid.appendChild(tile);
  });

  /* --- 好友名單 Modal --- */
  const fbBtn = document.getElementById("friendsBtn");
  const fbModal = document.getElementById("friendsModal");
  const fbClose = document.getElementById("friendsCloseBtn");
  const fbList = document.getElementById("friendsList");

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
    alert("請先在新手村選擇小勇者！");
    window.location.href = "index.html";
    return;
  }

  const m = MONSTER_DATA[stageId];
  const h = hero;

    // 勇者最大 HP：基礎 HP + 好朋友數
  battleState.heroMax = h.baseHp + friends.length;
  battleState.heroHp = battleState.heroMax;

  // 勇者攻擊力：1 + (level - 1) + 武器加成
  battleState.heroAtk = 1 + (level - 1);
  const es = getEquipStats();
  battleState.heroAtk += es.atk || 0;
  
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

/* --- 更新戰鬥 UI --- */
function updateBattleUI(h, m, stageId) {
  const heroHpText = document.getElementById("heroHpText");
  const monsterStageText = document.getElementById("monsterStageText");
  const monsterNameText = document.getElementById("monsterNameText");
  const monsterLevelText = document.getElementById("monsterLevelText");
  const heroTalentText = document.getElementById("heroTalentText");
  const monsterTalentText = document.getElementById("monsterTalentText");
  const monsterForbidText = document.getElementById("monsterForbidText");
  const emotionList = document.getElementById("emotionList");

  const heroNameText = document.getElementById("heroNameText");
  const heroEquipText = document.getElementById("heroEquipText");
  const heroBuffText = document.getElementById("heroBuffText");

  // 勇者相關
  if (heroNameText) heroNameText.textContent = h.name;
  if (heroHpText) {
    heroHpText.textContent = `${battleState.heroHp} / ${battleState.heroMax}`;
  }
  if (heroTalentText) heroTalentText.textContent = h.talentEmoji || "任意拳";

  // 魔物相關
  if (monsterStageText) monsterStageText.textContent = m.stageName;
  if (monsterNameText) monsterNameText.textContent = m.name;
  if (monsterLevelText) monsterLevelText.textContent = "LV." + level;
  if (monsterTalentText) monsterTalentText.textContent = m.talentEmoji || "任意拳";
  if (monsterForbidText) {
    monsterForbidText.textContent = m.forbidEmoji || "—";
  }

  // 壞情緒條
  if (emotionList) {
    emotionList.innerHTML = "";
    battleState.emotions.forEach(ok => {
      const li = document.createElement("li");
      if (ok) li.classList.add("calm");
      li.textContent = ok ? "💚" : "💢";
      emotionList.appendChild(li);
    });
  }

  // ===== 裝備名稱顯示 =====
  if (heroEquipText) {
    const names = [];
    if (equipment.weapon && equipment.weapon.name) {
      names.push(equipment.weapon.name);
    }
    if (equipment.armor && equipment.armor.name) {
      names.push(equipment.armor.name);
    }
    if (equipment.accessory && equipment.accessory.name) {
      names.push(equipment.accessory.name);
    }
    if (equipment.shoes && equipment.shoes.name) {
      names.push(equipment.shoes.name);
    }
    heroEquipText.textContent = names.length ? names.join("／") : "尚未裝備";
  }

  // ===== 裝備效果說明（數值加成）=====
  if (heroBuffText) {
    const b = equipment.bonus || {};
    const buffs = [];
    if (b.atk) buffs.push(`攻擊 +${b.atk}`);
    if (b.def) buffs.push(`防禦 +${b.def}`);
    if (b.luck) buffs.push(`幸運 +${b.luck}`);
    if (b.dodge) {
      const percent = Math.round(b.dodge * 100);
      buffs.push(`閃避 ${percent}%`);
    }
    heroBuffText.textContent = buffs.length
      ? buffs.join("、")
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

  const talent = m.talentEmoji;   // 天賦拳
  const forbid = m.forbidEmoji;   // 弱點拳（不會出）
  const all = ["✊", "✌️", "🖐"];
  const other = all.find(e => e !== talent && e !== forbid);

  const r = Math.random();
  return r < 0.55 ? talent : other;
}/* --- 判定勝負（全部用 emoji） --- */
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

  const playerEmoji = MOVE_ICON[moveKey] || "✊"; // 勇者出拳 emoji
  const monsterEmoji = monsterMove(m);           // 魔物出拳 emoji

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
  const dialogBox = document.getElementById("dialogBox");

  if (result === "tie") {
    if (roundResult) roundResult.textContent = "平手～再試一次！";
    return;
  }

  if (result === "win") {
    // ✅ 勝利：安撫魔物，會扣壞情緒 HP
    let dmg = battleState.heroAtk; // 勇者基礎攻擊

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
    // ❌ 只有輸的時候才會扣勇者血
    if (h.key === "villager" && stageId === "boss") {
      if (dialogBox) {
        dialogBox.innerHTML += `<p>勇敢的村民心超強！壞情緒無法傷害他！</p>`;
      }
      if (roundResult) {
        roundResult.textContent = "雖然這回合沒贏，但你的心情很穩定。";
      }
    } else {
      const dmg = battleState.monsterAtk;
      battleState.heroHp = Math.max(0, battleState.heroHp - dmg);
      if (roundResult) {
        roundResult.textContent = `這回合被壞情緒影響了，HP -${dmg}。`;
      }
    }
  }

  // 結束判定
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
    // 打倒魔王 → 升級並清空所有通關紀錄
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

  alert("小勇者累壞了…先回新手村好好休息一下吧！");
  window.location.href = "index.html";
}

/* ==========================================================
   戰鬥中道具籃
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
function useItem(type, h, m, stageId) {
  if (items[type] <= 0) {
    alert("沒有這個道具！");
    return;
  }

  if (type === "appleSmall") {
    battleState.heroHp = Math.min(battleState.heroHp + 1, battleState.heroMax);
  } else if (type === "appleBig") {
    battleState.heroHp = battleState.heroMax;
  } else if (type === "revive") {
    battleState.heroHp = battleState.heroMax;
  }

  items[type] -= 1;
  save("items", items);
  updateBattleUI(h, m, stageId);
  closeItemBag();
}

/* ==========================================================
   占卜 tarot.html
   ========================================================== */
const TAROT_CARDS = [
  {
    name: "太陽",
    upright: "成功、活力、樂觀，自信將帶領你前進。",
    reverse: "暫時迷惘，需要給自己更多休息與調整。",
    bear: "就算今天有烏雲，小太陽也一直在你心裡發光。"
  },
  {
    name: "星星",
    upright: "希望、療癒，願望正在慢慢實現。",
    reverse: "信念有點動搖，提醒你別忘了初衷。",
    bear: "熊熊相信，只要你還在努力，星星就會替你發亮。"
  },
  {
    name: "力量",
    upright: "勇氣與耐心將戰勝所有壞情緒。",
    reverse: "有點累了，適合溫柔對待自己。",
    bear: "能說出『我不喜歡這樣』，本身就是一種很大的勇氣。"
  }
];

function initTarotPage() {
  const honeyLabel = document.getElementById("honeyCount");
  const starLabel = document.getElementById("tarotStars");
  if (honeyLabel) honeyLabel.textContent = items.honey;
  if (starLabel) starLabel.textContent = stars;

  const hugBtn = document.getElementById("bearHugBtn");
  const drawBtn = document.getElementById("tarotDrawBtn");

  if (hugBtn) {
    hugBtn.addEventListener("click", () => {
      alert("熊熊抱抱～小勇者恢復滿滿好心情！");
    });
  }
  if (drawBtn) {
    drawBtn.addEventListener("click", doTarot);
  }
}

function doTarot() {
  if (items.honey <= 0) {
    alert("需要 🍯 嗡嗡蜂蜜才能請熊熊村長占卜喔！");
    return;
  }

  items.honey -= 1;
  save("items", items);
  const honeyLabel = document.getElementById("honeyCount");
  if (honeyLabel) honeyLabel.textContent = items.honey;

  const past = drawTarotCard();
  const present = drawTarotCard();
  const future = drawTarotCard();

  showTarotCard("Past", past);
  showTarotCard("Present", present);
  showTarotCard("Future", future);

  const bearMsg = document.getElementById("tarotBearMessage");
  if (bearMsg) bearMsg.textContent = "熊熊村長：" + future.bear;
}

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

function showTarotCard(pos, card) {
  const nameEl = document.getElementById(`tarot${pos}Name`);
  const orientEl = document.getElementById(`tarot${pos}Orient`);
  const meaningEl = document.getElementById(`tarot${pos}Meaning`);
  if (nameEl) nameEl.textContent = card.name;
  if (orientEl) orientEl.textContent = card.orientation;
  if (meaningEl) meaningEl.textContent = card.meaning;
}
/* ==========================================================
   兔兔工匠的裝備坊 equip.html
   ========================================================== */

function initEquipPage() {
  const starText = document.getElementById("equipStars");
  if (starText) starText.textContent = stars;

  // 所有「裝備」按鈕
  document.querySelectorAll(".equip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const slot = btn.dataset.slot;    // weapon / armor / accessory / shoes
      const cost = parseInt(btn.dataset.cost || "0", 10);
      const name = btn.dataset.name || "神秘裝備";

      // 各能力加成（沒有就視為 0）
      const atk   = parseInt(btn.dataset.atk   || "0", 10);
      const def   = parseInt(btn.dataset.def   || "0", 10);
      const luck  = parseInt(btn.dataset.luck  || "0", 10);
      const dodge = parseFloat(btn.dataset.dodge || "0");

      if (!slot) {
        alert("裝備欄位未設定（slot）");
        return;
      }

      // 檢查星星是否足夠
      if (stars < cost) {
        alert("勇氣星星不足，無法裝備這件道具～");
        return;
      }

      // 扣星星
      stars -= cost;
      save("stars", stars);
      if (starText) starText.textContent = stars;

      // 設定該欄位的裝備
      equipment[slot] = { name, atk, def, luck, dodge };

      // 重新計算總加成
      const total = { atk: 0, def: 0, luck: 0, dodge: 0 };
      ["weapon", "armor", "accessory", "shoes"].forEach(s => {
        const it = equipment[s];
        if (!it) return;
        if (it.atk)   total.atk   += it.atk;
        if (it.def)   total.def   += it.def;
        if (it.luck)  total.luck  += it.luck;
        if (it.dodge) total.dodge += it.dodge;
      });
      equipment.bonus = total;

      save("equipment", equipment);

      alert(`已裝備「${name}」！\n下次進入戰鬥畫面就會看到裝備效果囉～`);
    });
  });
}
/* ==========================================================
   商店 shop.html
   ========================================================== */
function initShopPage() {
  const starText = document.getElementById("shopStars");
  const honeyText = document.getElementById("shopHoneyCount");
  const sSmall = document.getElementById("shopAppleSmallCount");
  const sBig = document.getElementById("shopAppleBigCount");
  const sRevive = document.getElementById("shopReviveCount");

  if (starText) starText.textContent = stars;
  if (honeyText) honeyText.textContent = items.honey;
  if (sSmall) sSmall.textContent = items.appleSmall;
  if (sBig) sBig.textContent = items.appleBig;
  if (sRevive) sRevive.textContent = items.revive;

  document.querySelectorAll(".shop-buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      buyItem(btn.dataset.item, btn.dataset.label);
    });
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
  if (cost == null) return;

  if (stars < cost) {
    alert("勇氣星星不足，先多安撫幾隻魔物吧！");
    return;
  }

  stars -= cost;
  items[type] += 1;
  save("stars", stars);
  save("items", items);

  alert(`成功購買 ${label}！`);
  }
  initShopPage();
/* ==========================================================
   兔兔工匠的裝備坊 equip.html
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

  const currentId = equips[slot];

  box.innerHTML = EQUIP_ITEMS[slot].map(item => {
    const owned = currentId === item.id;
    const btnLabel = owned ? "已裝備" : `用 ${item.price}⭐ 裝備`;
    const disabled = owned ? "disabled" : "";
    return `
      <div class="equip-item">
        <div class="equip-name">${item.name}</div>
        <div class="equip-desc">${item.desc}</div>
        <button class="equip-btn" data-slot="${slot}" data-id="${item.id}" data-price="${item.price}" ${disabled}>
          ${btnLabel}
        </button>
      </div>
    `;
  }).join("");

  box.querySelectorAll(".equip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const price = Number(btn.dataset.price);
      const slotName = btn.dataset.slot;
      const id = btn.dataset.id;

      if (equips[slotName] === id) return; // 已裝備
      if (stars < price) {
        alert("勇氣星星不足，先多安撫幾隻魔物吧！");
        return;
      }

      stars -= price;
      equips[slotName] = id;
      save("stars", stars);
      save("equips", equips);

      alert("兔兔工匠：裝備裝好了，之後戰鬥會更有自信喔！");
      initEquipPage(); // 重新刷新畫面（按鈕會變成「已裝備」）
    });
  });

}