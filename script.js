// === 遊戲狀態 ===
const state = {
  heroKey: null,
  heroName: "",
  heroHp: 6,
  monsterHp: 6,
  phraseUsedThisTurn: false,
  round: 0
};

// === 勇者資料 ===
const HEROES = {
  warrior: { name: "戰士",    talent: "rock",     line: "我一定會守護大家！" },
  mage:    { name: "法師",    talent: "scissors", line: "嘿嘿～我有新點子！" },
  priest:  { name: "牧師",    talent: "paper",    line: "別擔心，我來幫你～" },
  villager:{ name: "勇敢的村民", talent: null,   line: "我雖然平凡，但不放棄！" }
};

// === 六種壞情緒（魔王用） ===
const EMOTIONS = [
  "😡 生氣",
  "😭 難過",
  "😱 害怕",
  "😒 嫉妒",
  "😔 孤單",
  "😖 焦慮"
];

// === 塔羅牌資料（簡化小牌組） ===
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

// === DOM 元素 ===
const heroCards        = document.querySelectorAll(".hero-card");
const selectedHeroText = document.getElementById("selectedHeroText");
const heroHpText       = document.getElementById("heroHpText");
const monsterHpText    = document.getElementById("monsterHpText");
const phraseSelect     = document.getElementById("phraseSelect");
const usePhraseBtn     = document.getElementById("usePhraseBtn");
const rpsButtons       = document.querySelectorAll(".rps-btn");
const roundResult      = document.getElementById("roundResult");
const dialogBox        = document.getElementById("dialogBox");
const emotionBar       = document.getElementById("emotionBar");
const emotionLabel     = document.getElementById("emotionLabel");
const emotionList      = document.getElementById("emotionList");
const roundCount       = document.getElementById("roundCount");
const soothedCountText = document.getElementById("soothedCount");
const resetBtn         = document.getElementById("resetBtn");

// 分頁 DOM
const tabButtons  = document.querySelectorAll(".tab-btn");
const battleArea  = document.getElementById("battleArea");
const tarotArea   = document.getElementById("tarotArea");

// 塔羅相關 DOM
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

// === 初始化壞情緒列表 ===
function renderEmotionList() {
  if (!emotionList) return;

  const items = emotionList.querySelectorAll("li");
  if (!items.length) return;

  const soothedCount = Math.max(0, 6 - state.monsterHp);

  items.forEach((li, index) => {
    if (index < soothedCount) {
      li.classList.add("calm");
      li.textContent = EMOTIONS[index]
        .replace("😡", "😊")
        .replace("😭", "😊")
        .replace("😱", "😊")
        .replace("😒", "😊")
        .replace("😔", "😊")
        .replace("😖", "😊");
    } else {
      li.classList.remove("calm");
      li.textContent = EMOTIONS[index];
    }
  });

  if (soothedCountText) {
    soothedCountText.textContent = soothedCount;
  }
}

// === 更新血量顯示 & 進度條 ===
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
}

// === 對話框加一行 ===
function addDialog(text) {
  if (!dialogBox) return;
  const p = document.createElement("p");
  p.textContent = text;
  dialogBox.appendChild(p);
  dialogBox.scrollTop = dialogBox.scrollHeight;
}

// === 選擇勇者 ===
heroCards.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key  = btn.dataset.hero;
    const hero = HEROES[key];

    state.heroKey            = key;
    state.heroName           = hero.name;
    state.heroHp             = 6;
    state.monsterHp          = 6;
    state.phraseUsedThisTurn = false;
    state.round              = 0;

    heroCards.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    if (selectedHeroText) {
      selectedHeroText.textContent = `目前勇者：${hero.name}（${hero.line}）`;
    }
    if (roundResult) {
      roundResult.textContent = "先說一句溫暖的話，再出拳安撫魔物吧～";
    }

    if (dialogBox) dialogBox.innerHTML = "";
    addDialog(`🐻 村長熊熊：${hero.name}，歡迎加入！一起去安撫壞情緒魔物吧～`);

    if (roundCount) roundCount.textContent = "0";

    renderHp();
  });
});

// === 使用安撫語句 ===
if (usePhraseBtn) {
  usePhraseBtn.addEventListener("click", () => {
    if (!state.heroKey) {
      if (roundResult) roundResult.textContent = "請先選擇一位勇者。";
      return;
    }

    const phrase = phraseSelect ? phraseSelect.value : "";
    if (!phrase) {
      if (roundResult) roundResult.textContent = "請先從下拉選單選擇一句安撫語句。";
      return;
    }

    state.phraseUsedThisTurn = true;
    addDialog(`🧡 勇者：${phrase}`);

    if (state.heroHp < 6) {
      state.heroHp += 1;
      addDialog("💖 勇者的好心情恢復了一點！");
    } else {
      addDialog("💖 你的心情已經滿滿的了，可以把這份溫暖分享給魔物～");
    }

    renderHp();
    if (roundResult) roundResult.textContent = "溫暖的話說完了，現在可以出拳囉！";
  });
}

// === 魔物隨機出拳 ===
function monsterMove() {
  const moves = ["rock", "scissors", "paper"];
  const random = Math.floor(Math.random() * moves.length);
  return moves[random];
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

// === 把 move 轉成圖示文字 ===
function moveToText(move) {
  switch (move) {
    case "rock":     return "✊ 石頭";
    case "scissors": return "✌️ 剪刀";
    case "paper":    return "🖐 布";
    default:         return move;
  }
}

// === 出拳 ===
rpsButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!state.heroKey) {
      if (roundResult) roundResult.textContent = "請先選擇一位勇者。";
      return;
    }

    if (state.monsterHp <= 0) {
      if (roundResult) roundResult.textContent = "魔物已經恢復好心情囉，可以重新開始冒險～";
      return;
    }

    if (state.heroHp <= 0) {
      if (roundResult) roundResult.textContent = "勇者的好心情用完了，可以換一位勇者再試試看～";
      return;
    }

    const playerMove = btn.dataset.move;
    const enemyMove  = monsterMove();

    state.round += 1;
    if (roundCount) roundCount.textContent = String(state.round);

    let damageToMonster = 0;

    const result = judge(playerMove, enemyMove);

    addDialog(
      `⚔️ 勇者出了 ${moveToText(playerMove)}，魔物出了 ${moveToText(enemyMove)}。`
    );

    if (result === "draw") {
      if (roundResult) roundResult.textContent = "平手！大家先冷靜一下。";
      addDialog("魔物：哼…我還是很不爽！");
    } else if (result === "win") {
      damageToMonster = 1;

      const hero = HEROES[state.heroKey];
      if (hero.talent && hero.talent === playerMove) {
        damageToMonster += 1;
        addDialog("✨ 天賦拳發動！你的好心情力量變強了！");
      }

      if (state.phraseUsedThisTurn) {
        damageToMonster += 1;
        addDialog("🌈 你的溫暖話語讓壞情緒更快消散！");
      }

      state.monsterHp -= damageToMonster;

      if (roundResult) {
        roundResult.textContent = `你贏了這回合！成功安撫了 ${damageToMonster} 點壞情緒。`;
      }
      addDialog("魔物：咦…為什麼心裡好像有一點暖暖的…？");
    } else {
      state.heroHp -= 1;

      if (roundResult) {
        roundResult.textContent = "這回合魔物情緒爆炸了！你的好心情被影響了一點。";
      }
      addDialog("魔物：你們都不懂我！都走開啦！");
    }

    state.phraseUsedThisTurn = false;
    renderHp();

    if (state.monsterHp <= 0) {
      addDialog("😊 魔物：謝謝你願意聽我說話…我覺得好多了。");
      addDialog("🐻 村長熊熊：太棒了！你成功安撫了所有壞情緒！");
      if (roundResult) {
        roundResult.textContent = "任務完成！魔物恢復成快樂的朋友了～";
      }
    } else if (state.heroHp <= 0) {
      addDialog("😢 勇者：我好累…需要一點時間休息。");
      addDialog("🐻 村長熊熊：沒關係，累了就休息一下，再出發也可以。");
      if (roundResult) {
        roundResult.textContent =
          "勇者的好心情暫時用完了～可以換一位勇者再試試看。";
      }
    }
  });
});

// === 重新開始冒險 ===
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    state.heroKey            = null;
    state.heroName           = "";
    state.heroHp             = 6;
    state.monsterHp          = 6;
    state.phraseUsedThisTurn = false;
    state.round              = 0;

    heroCards.forEach((b) => b.classList.remove("active"));

    if (selectedHeroText) {
      selectedHeroText.textContent = "目前尚未選擇勇者";
    }
    if (roundResult) {
      roundResult.textContent = "請先選勇者，再說一句話，然後出拳。";
    }
    if (dialogBox) dialogBox.innerHTML = "";
    addDialog("🐻 村長熊熊：重新集合！再選一位勇者一起冒險吧～");

    if (roundCount) roundCount.textContent = "0";

    renderHp();
  });
}

// === 熊熊塔羅占卜：抽牌 ===
function drawTarotCard() {
  const index = Math.floor(Math.random() * TAROT_CARDS.length);
  const card  = TAROT_CARDS[index];

  const isUpright = Math.random() < 0.5; // true 正位 / false 逆位

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

// 綁定占卜按鈕
if (tarotBtn) {
  tarotBtn.addEventListener("click", () => {
    drawTarotSpread();
  });
}

// === 分頁切換：戰鬥 / 占卜 ===
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.target;

    if (target === "battleArea") {
      battleArea && battleArea.classList.remove("hidden");
      tarotArea  && tarotArea.classList.add("hidden");
    } else if (target === "tarotArea") {
      tarotArea  && tarotArea.classList.remove("hidden");
      battleArea && battleArea.classList.add("hidden");
    }
  });
});

// === 一開始先顯示血量與情緒 ===
renderHp();