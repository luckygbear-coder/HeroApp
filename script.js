// === 遊戲狀態 ===
const state = {
  heroKey: null,
  heroName: "",
  heroHp: 6,
  monsterHp: 6,
  round: 0,
  monsterKey: "shadow"
};

// 要通關的普通魔物 + 魔王
const PLAY_MONSTERS = ["slime", "crybat", "fireBull", "mermaid", "goblin", "skeleton"];
const BOSS_KEY = "dragon";
const clearedMonsters = {}; // key: true 代表已通關

// === 勇者資料 ===
const HEROES = {
  warrior: { name: "戰士",    talent: "rock",     line: "我一定會守護大家！" },
  mage:    { name: "法師",    talent: "scissors", line: "嘿嘿～我有新點子！" },
  priest:  { name: "牧師",    talent: "paper",    line: "別擔心，我來幫你～" },
  villager:{ name: "勇敢的村民", talent: null,   line: "我雖然平凡，但不放棄！" }
};

// === 魔物資料 ===
const MONSTERS = {
  shadow: {
    key: "shadow",
    stage: "練習關卡",
    name: "壞情緒之影",
    talent: null,
    forbid: null,
    desc: "用來熟悉規則的練習魔物，出拳完全隨機。"
  },
  slime: {
    key: "slime",
    stage: "草原",
    name: "史萊姆",
    talent: "scissors",
    forbid: "paper",
    desc: "黏呼呼、心情常常一團糊。喜歡偷偷剪斷煩惱的小尾巴。"
  },
  crybat: {
    key: "crybat",
    stage: "森林",
    name: "哭哭蝙蝠",
    talent: "paper",
    forbid: "rock",
    desc: "常常被自己的心情嚇到，只好把自己包起來。"
  },
  fireBull: {
    key: "fireBull",
    stage: "火山平原",
    name: "火山牛",
    talent: "rock",
    forbid: "paper",
    desc: "脾氣一上來就像火山爆發，但其實內心很柔軟。"
  },
  mermaid: {
    key: "mermaid",
    stage: "湖畔",
    name: "人魚",
    talent: "paper",
    forbid: "rock",
    desc: "心情像水一樣起伏，有時安靜、有時大浪。"
  },
  goblin: {
    key: "goblin",
    stage: "洞窟",
    name: "怪手哥布林",
    talent: "scissors",
    forbid: "rock",
    desc: "手腳多又亂，常常一不小心就把事情搞複雜。"
  },
  skeleton: {
    key: "skeleton",
    stage: "墓地",
    name: "骷髏兵",
    talent: "rock",
    forbid: "scissors",
    desc: "看起來很可怕，其實只是怕被遺忘。"
  },
  dragon: {
    key: "dragon",
    stage: "魔王城",
    name: "惡龍",
    talent: "rock",
    forbid: "paper",
    desc: "被巨大壓力壓得喘不過氣，只好把自己武裝成可怕的樣子。"
  }
};

// === 塔羅牌資料 ===
const TAROT_CARDS = [
  {
    name: "太陽 The Sun",
    upright: "充滿活力與希望，你的努力正在被看見，前方有很多溫暖的機會。",
    reversed: "最近可能有點累，太陽被雲遮住了。先好好休息，能量回來後一切會再亮起來。"
  },
  {
    name: "月亮 The Moon",
    upright: "感受力很敏銳，直覺在提醒你慢一點、聽一聽內心真正的聲音。",
    reversed: "可能有些擔心與想太多，先分辨哪些是真實的，哪些只是想像的怪獸。"
  },
  {
    name: "星星 The Star",
    upright: "你有溫柔的光，哪怕很小，也正在默默鼓勵著身邊的人。",
    reversed: "暫時看不太到希望，但並不是沒有光，只是雲層有點厚，請再多給自己一點時間。"
  },
  {
    name: "力量 Strength",
    upright: "真正的勇敢不是逞強，而是願意溫柔地面對自己的情緒。",
    reversed: "最近可能對自己有點嚴格，記得溫柔跟自己說聲「辛苦了」。"
  },
  {
    name: "戀人 The Lovers",
    upright: "身邊有在乎你的人，你也正在學習如何好好在關係裡表達自己。",
    reversed: "也許有一點小摩擦，其實只是彼此需要更多理解與好好說話的時間。"
  },
  {
    name: "命運之輪 Wheel of Fortune",
    upright: "事情正在慢慢變好，有些轉機會在不經意的時候出現。",
    reversed: "目前像是卡在停滯期，但這也是宇宙叫你先整理好自己、再出發的小休息。"
  }
];

// === DOM 選取 ===
const heroCards        = document.querySelectorAll(".hero-card");
const selectedHeroText = document.getElementById("selectedHeroText");
const heroHpText       = document.getElementById("heroHpText");
const monsterHpText    = document.getElementById("monsterHpText");
const roundResult      = document.getElementById("roundResult");
const dialogBox        = document.getElementById("dialogBox");
const emotionBar       = document.getElementById("emotionBar");
const emotionLabel     = document.getElementById("emotionLabel");
const emotionList      = document.getElementById("emotionList");
const roundCount       = document.getElementById("roundCount");
const soothedCountText = document.getElementById("soothedCount");
const resetBtn         = document.getElementById("resetBtn");

const monsterStageText  = document.getElementById("monsterStageText");
const monsterNameText   = document.getElementById("monsterNameText");
const monsterTalentText = document.getElementById("monsterTalentText");
const monsterForbidText = document.getElementById("monsterForbidText");

const tabButtons  = document.querySelectorAll(".tab-btn");
const tabPages    = document.querySelectorAll(".tab-page");
const battleArea  = document.getElementById("battleArea");
const mapArea     = document.getElementById("mapArea");
const tarotArea   = document.getElementById("tarotArea");

const mapTiles     = document.querySelectorAll(".map-tile");
const mapSection   = document.getElementById("mapSection");
const mapLevelText = document.getElementById("mapLevelText");

const rpsButtons = document.querySelectorAll(".rps-btn");

// 塔羅 DOM
const tarotBtn            = document.getElementById("tarotDrawBtn");
const tarotPastName       = document.getElementById("tarotPastName");
const tarotPastOrient     = document.getElementById("tarotPastOrient");
const tarotPastMeaning    = document.getElementById("tarotPastMeaning");
const tarotPresentName    = document.getElementById("tarotPresentName");
const tarotPresentOrient  = document.getElementById("tarotPresentOrient");
const tarotPresentMeaning = document.getElementById("tarotPresentMeaning");
const tarotFutureName     = document.getElementById("tarotFutureName");
const tarotFutureOrient   = document.getElementById("tarotFutureOrient");
const tarotFutureMeaning  = document.getElementById("tarotFutureMeaning");
const tarotBearMessage    = document.getElementById("tarotBearMessage");

// === 小工具 ===
function getCurrentMonster() {
  return MONSTERS[state.monsterKey] || MONSTERS.shadow;
}

function moveIcon(move) {
  switch (move) {
    case "rock":     return "✊";
    case "scissors": return "✌️";
    case "paper":    return "🖐";
    default:         return "—";
  }
}

function moveToText(move) {
  switch (move) {
    case "rock":     return "✊ 石頭";
    case "scissors": return "✌️ 剪刀";
    case "paper":    return "🖐 布";
    default:         return move;
  }
}

function allBasicCleared() {
  return PLAY_MONSTERS.every((k) => clearedMonsters[k]);
}

function allClearedWithBoss() {
  return allBasicCleared() && clearedMonsters[BOSS_KEY];
}

// === 更新魔物顯示 ===
function renderMonsterInfo() {
  const monster = getCurrentMonster();

  if (monsterStageText)  monsterStageText.textContent  = monster.stage || "練習關卡";
  if (monsterNameText)   monsterNameText.textContent   = monster.name;
  if (monsterTalentText) {
    monsterTalentText.textContent = monster.talent ? moveIcon(monster.talent) : "（隨機）";
  }
  if (monsterForbidText) {
    monsterForbidText.textContent = monster.forbid ? moveIcon(monster.forbid) : "（無）";
  }
}

// === 更新壞情緒清單 ===
function renderEmotionList() {
  if (!emotionList) return;
  const items = emotionList.querySelectorAll("li");
  if (!items.length) return;

  const soothedCount = Math.max(0, 6 - state.monsterHp);

  items.forEach((li, index) => {
    if (index < soothedCount) {
      li.classList.add("calm");
      li.textContent = ["😡 生氣","😭 難過","😱 害怕","😒 嫉妒","😔 孤單","😖 焦慮"][index]
        .replace("😡", "😊")
        .replace("😭", "😊")
        .replace("😱", "😊")
        .replace("😒", "😊")
        .replace("😔", "😊")
        .replace("😖", "😊");
    } else {
      li.classList.remove("calm");
      li.textContent = ["😡 生氣","😭 難過","😱 害怕","😒 嫉妒","😔 孤單","😖 焦慮"][index];
    }
  });

  if (soothedCountText) {
    soothedCountText.textContent = soothedCount;
  }
}

// === 血量 & 進度條 ===
function renderHp() {
  if (state.heroHp < 0) state.heroHp = 0;
  if (state.monsterHp < 0) state.monsterHp = 0;

  if (heroHpText)    heroHpText.textContent    = `${state.heroHp}/6`;
  if (monsterHpText) monsterHpText.textContent = `${state.monsterHp}/6`;

  const percent = (state.monsterHp / 6) * 100;
  if (emotionBar) emotionBar.style.width = percent + "%";

  if (emotionLabel) {
    if (state.monsterHp === 6)      emotionLabel.textContent = "壞情緒還很強烈……";
    else if (state.monsterHp >= 4)  emotionLabel.textContent = "壞情緒稍微被安撫了。";
    else if (state.monsterHp >= 2)  emotionLabel.textContent = "魔物開始放心一些了。";
    else if (state.monsterHp === 1) emotionLabel.textContent = "只剩最後一點壞情緒，加油！";
    else                            emotionLabel.textContent = "魔物已經恢復好心情了 ✨";
  }

  renderEmotionList();
  renderMonsterInfo();
}

// === 對話框加一行 ===
function addDialog(text) {
  if (!dialogBox) return;
  const p = document.createElement("p");
  p.textContent = text;
  dialogBox.appendChild(p);
  dialogBox.scrollTop = dialogBox.scrollHeight;
}

// === 地圖進度顯示 ===
function updateMapProgress() {
  mapTiles.forEach((tile) => {
    const key = tile.dataset.monster;
    if (key && clearedMonsters[key]) {
      tile.classList.add("cleared");
    }
  });

  if (mapSection && mapLevelText) {
    if (allClearedWithBoss()) {
      mapSection.classList.add("upgraded");
      mapLevelText.textContent = "地圖等級：Lv.2（全地圖通關！）";
    } else if (allBasicCleared()) {
      mapSection.classList.add("upgraded");
      mapLevelText.textContent = "地圖等級：Lv.2（魔王待挑戰）";
    } else {
      mapSection.classList.remove("upgraded");
      mapLevelText.textContent = "地圖等級：Lv.1";
    }
  }
}

// === 分頁切換 ===
function switchTab(targetId) {
  tabButtons.forEach((b) => {
    if (b.dataset.target === targetId) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  tabPages.forEach((page) => {
    if (page.id === targetId) {
      page.classList.remove("hidden");
    } else {
      page.classList.add("hidden");
    }
  });
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.target);
  });
});

// === 選擇勇者 ===
heroCards.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key  = btn.dataset.hero;
    const hero = HEROES[key];

    state.heroKey  = key;
    state.heroName = hero.name;
    state.heroHp   = 6;
    state.monsterHp = 6;
    state.round    = 0;

    heroCards.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    if (selectedHeroText) {
      selectedHeroText.textContent = `目前勇者：${hero.name}（${hero.line}）`;
    }
    if (roundResult) {
      roundResult.textContent = "到地圖選一個關卡，再回來出拳安撫魔物吧～";
    }

    if (dialogBox) dialogBox.innerHTML = "";
    addDialog(`🐻 村長熊熊：${hero.name}，歡迎加入！去新手村外的地圖看看要先挑戰哪裡吧～`);

    if (roundCount) roundCount.textContent = "0";

    renderHp();
  });
});

// === 魔物出拳（考慮天賦＋禁出拳） ===
function monsterMove() {
  const monster = getCurrentMonster();
  const baseMoves = ["rock", "scissors", "paper"];

  let moves = baseMoves.filter((m) => !monster.forbid || m !== monster.forbid);
  if (monster.talent && moves.includes(monster.talent)) {
    moves.push(monster.talent); // 增加權重
  }

  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex];
}

// === 剪刀石頭布判定 ===
function judge(player, enemy) {
  if (player === enemy) return "draw";
  if (
    (player === "rock"     && enemy === "scissors") ||
    (player === "scissors" && enemy === "paper")    ||
    (player === "paper"    && enemy === "rock")
  ) {
    return "win";
  }
  return "lose";
}

// === 出拳 ===
rpsButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!state.heroKey) {
      if (roundResult) roundResult.textContent = "請先在新手村選擇一位勇者。";
      return;
    }

    if (state.monsterHp <= 0) {
      if (roundResult) roundResult.textContent = "這隻魔物已經被你安撫好了，可以換其他地點或挑戰魔王城！";
      return;
    }

    if (state.heroHp <= 0) {
      if (roundResult) roundResult.textContent = "勇者的好心情用完了，回新手村換一位勇者吧～";
      return;
    }

    const playerMove = btn.dataset.move;
    const enemyMove  = monsterMove();
    const monster    = getCurrentMonster();

    state.round += 1;
    if (roundCount) roundCount.textContent = String(state.round);

    let damageToMonster = 0;

    const result = judge(playerMove, enemyMove);

    addDialog(
      `⚔️ ${state.heroName || "勇者"} 出了 ${moveToText(playerMove)}，${monster.name} 出了 ${moveToText(enemyMove)}。`
    );

    if (result === "draw") {
      if (roundResult) roundResult.textContent = "平手！先觀察對方的心情變化。";
      addDialog(`${state.heroName || "勇者"}：看起來我們還在找彼此的節奏。`);
      addDialog(`${monster.name}：哼…我還在猶豫要不要相信你。`);
    } else if (result === "win") {
      damageToMonster = 1;

      const hero = HEROES[state.heroKey];
      if (hero.talent && hero.talent === playerMove) {
        damageToMonster += 1;
        addDialog(`✨ ${hero.name} 的天賦拳發動！好心情力量加倍！`);
      }

      const remainHp = state.monsterHp - damageToMonster;

      if (roundResult) {
        roundResult.textContent = `你贏了這回合！成功安撫了 ${damageToMonster} 點壞情緒。`;
      }
      addDialog(`${state.heroName || "勇者"}：我有在聽，你的感受很重要。`);

      if (remainHp >= 3) {
        addDialog(`${monster.name}：咦…為什麼心裡好像有一點點暖暖的…？`);
      } else if (remainHp >= 1) {
        addDialog(`${monster.name}：好像…沒那麼想發脾氣了。`);
      } else {
        addDialog(`${monster.name}：原來我可以被這樣好好對待…謝謝你。`);
      }

      state.monsterHp = remainHp;
    } else {
      state.heroHp -= 1;

      if (roundResult) {
        roundResult.textContent = "這回合魔物情緒爆炸了！你的好心情被影響了一點。";
      }
      addDialog(`${state.heroName || "勇者"}：哎呀…剛剛被你的壞情緒嚇到了，不過我還是想陪你。`);
      addDialog(`${monster.name}：你們都不懂我！都走開啦！`);
    }

    renderHp();

    if (state.monsterHp <= 0) {
      clearedMonsters[monster.key] = true;
      updateMapProgress();

      addDialog(`😊 ${monster.name}：謝謝你願意聽我說話…我覺得好多了。`);
      if (monster.key === BOSS_KEY) {
        addDialog("🐻 村長熊熊：恭喜你！連魔王都被你安撫了，星星王國的天空再次變得明亮～");
      } else {
        addDialog("🐻 村長熊熊：太棒了！這個地點的壞情緒已經被你安撫完成。");
      }

      if (roundResult) {
        if (allClearedWithBoss()) {
          roundResult.textContent = "全地圖通關！你是星星王國的傳說小勇者！";
        } else {
          roundResult.textContent = "任務完成！可以回地圖選下一個地點，或準備前往魔王城。";
        }
      }
    } else if (state.heroHp <= 0) {
      addDialog("😢 勇者：我好累…需要一點時間休息。");
      addDialog("🐻 村長熊熊：沒關係，累了就回新手村換個勇者，再出發也可以。");
      if (roundResult) {
        roundResult.textContent =
          "勇者的好心情暫時用完了～可以回新手村換一位勇者，或先去占卜看看。";
      }
    }
  });
});

// === 重新整理心情 ===
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    state.heroHp    = 6;
    state.monsterHp = 6;
    state.round     = 0;

    if (roundCount) roundCount.textContent = "0";
    if (roundResult) {
      roundResult.textContent = "重新整頓好心情，可以再試一次這個關卡。";
    }
    if (dialogBox) dialogBox.innerHTML = "";
    addDialog("🐻 村長熊熊：深呼吸一下，我們再穩穩地出拳就好～");

    renderHp();
  });
}

// === 地圖：點擊行為 ===
mapTiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    const action = tile.dataset.action;
    const key    = tile.dataset.monster;

    if (action === "start") {
      // 新手村：切到戰鬥分頁，提示選勇者
      switchTab("battleArea");
      if (!state.heroKey && roundResult) {
        roundResult.textContent = "請先在上方選擇一位勇者，再回地圖挑戰魔物。";
      }
      if (dialogBox) {
        dialogBox.innerHTML = "";
        addDialog("🐻 村長熊熊：歡迎回到新手村～慢慢選一位你想一起冒險的勇者吧！");
      }
      return;
    }

    if (action === "witch") {
      // 女巫小屋：切到占卜分頁
      switchTab("tarotArea");
      if (tarotBearMessage) {
        tarotBearMessage.textContent =
          "🐻 村長熊熊：這裡是女巫小屋，也是我開的占卜角落～抽三張牌，我們一起看看你的心情地圖。";
      }
      return;
    }

    if (key) {
      // 魔王鎖定機制
      if (key === BOSS_KEY && !allBasicCleared()) {
        if (dialogBox) {
          dialogBox.innerHTML = "";
        }
        addDialog("🐻 村長熊熊：還不能直接衝到魔王城喔！先把其他地點的魔物安撫好，再來挑戰惡龍吧～");
        if (roundResult) {
          roundResult.textContent = "先完成草原、森林、火山、湖畔、洞窟、墓地的挑戰，再回來吧。";
        }
        return;
      }

      const monster = MONSTERS[key];
      if (!monster) return;

      state.monsterKey = key;
      state.monsterHp  = 6;
      state.round      = 0;

      if (roundCount) roundCount.textContent = "0";

      renderHp();

      if (dialogBox) dialogBox.innerHTML = "";
      addDialog(`🐻 村長熊熊：你來到了「${monster.stage}」，這裡住著「${monster.name}」。`);
      addDialog(`🐻 村長熊熊：他有自己的天賦拳，也有害怕出的拳，觀察一下再出拳吧！`);

      if (roundResult) {
        roundResult.textContent = "切回戰鬥分頁，讓勇者用剪刀石頭布安撫他的壞情緒吧～";
      }

      // 自動切回戰鬥
      switchTab("battleArea");
    }
  });
});

// === 熊熊塔羅占卜 ===
function drawTarotCard() {
  const index = Math.floor(Math.random() * TAROT_CARDS.length);
  const card  = TAROT_CARDS[index];

  const isUpright = Math.random() < 0.5;

  return {
    name: card.name,
    orientationText: isUpright ? "正位" : "逆位",
    meaning: isUpright ? card.upright : card.reversed,
    isUpright
  };
}

function drawTarotSpread() {
  const past    = drawTarotCard();
  const present = drawTarotCard();
  const future  = drawTarotCard();

  if (tarotPastName) {
    tarotPastName.textContent    = past.name;
    tarotPastOrient.textContent  = past.orientationText;
    tarotPastMeaning.textContent = past.meaning;
  }
  if (tarotPresentName) {
    tarotPresentName.textContent    = present.name;
    tarotPresentOrient.textContent  = present.orientationText;
    tarotPresentMeaning.textContent = present.meaning;
  }
  if (tarotFutureName) {
    tarotFutureName.textContent    = future.name;
    tarotFutureOrient.textContent  = future.orientationText;
    tarotFutureMeaning.textContent = future.meaning;
  }

  if (tarotBearMessage) {
    tarotBearMessage.textContent =
      `🐻 村長熊熊：過去的你正在慢慢學會「${past.isUpright ? "相信自己" : "照顧自己的心"}」，` +
      `現在的你正站在「${present.isUpright ? "成長的路口" : "調整步伐的小休息站"}」，` +
      `未來還有「${future.isUpright ? "很多新的機會" : "更多認識自己的旅程"}」在等著你。` +
      `記得，不管抽到什麼牌，你都值得被好好對待，也可以慢慢來。`;
  }
}

if (tarotBtn) {
  tarotBtn.addEventListener("click", () => {
    drawTarotSpread();
  });
}

// === 初始化 ===
renderHp();
updateMapProgress();
switchTab("battleArea");