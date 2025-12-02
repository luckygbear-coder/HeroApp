// 簡單狀態
const state = {
  heroKey: null,
  heroName: "",
  heroHp: 6, // 代表 6 份好心情
  monsterHp: 6, // 代表 6 個壞情緒
  phraseUsedThisTurn: false, // 本回合是否說過話
};

// 勇者資料
const HEROES = {
  warrior: {
    name: "戰士",
    talent: "rock", // 石頭
    line: "我一定會守護大家！",
  },
  mage: {
    name: "法師",
    talent: "scissors", // 剪刀
    line: "嘿嘿～我有新點子！",
  },
  priest: {
    name: "牧師",
    talent: "paper", // 布
    line: "別擔心，我來幫你～",
  },
  villager: {
    name: "勇敢的村民",
    talent: null,
    line: "我雖然平凡，但不放棄！",
  },
};

// DOM 元素
const heroCards = document.querySelectorAll(".hero-card");
const selectedHeroText = document.getElementById("selectedHeroText");
const heroHpText = document.getElementById("heroHpText");
const monsterHpText = document.getElementById("monsterHpText");
const emotionBar = document.getElementById("emotionBar");
const emotionLabel = document.getElementById("emotionLabel");
const phraseSelect = document.getElementById("phraseSelect");
const usePhraseBtn = document.getElementById("usePhraseBtn");
const rpsButtons = document.querySelectorAll(".rps-btn");
const roundResult = document.getElementById("roundResult");
const dialogBox = document.getElementById("dialogBox");

// 初始化血量顯示
function renderHp() {
  heroHpText.textContent = `${state.heroHp}/6`;
  monsterHpText.textContent = `${state.monsterHp}/6`;

  const percentage = (state.monsterHp / 6) * 100;
  emotionBar.style.width = `${percentage}%`;

  if (state.monsterHp === 6) {
    emotionLabel.textContent = "壞情緒還很強烈……";
  } else if (state.monsterHp >= 4) {
    emotionLabel.textContent = "壞情緒有一點被安撫了。";
  } else if (state.monsterHp >= 2) {
    emotionLabel.textContent = "魔物好像開始放心一點了。";
  } else if (state.monsterHp === 1) {
    emotionLabel.textContent = "只剩最後一點壞情緒，加油！";
  } else if (state.monsterHp <= 0) {
    emotionLabel.textContent = "魔物已經恢復好心情了！✨";
  }
}

// 對話框加一行
function addDialog(text) {
  const p = document.createElement("p");
  p.textContent = text;
  dialogBox.appendChild(p);
  dialogBox.scrollTop = dialogBox.scrollHeight;
}

// 選擇勇者
heroCards.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.hero;
    const hero = HEROES[key];

    state.heroKey = key;
    state.heroName = hero.name;
    state.heroHp = 6;
    state.monsterHp = 6;
    state.phraseUsedThisTurn = false;

    heroCards.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    selectedHeroText.textContent = `目前勇者：${hero.name}（${hero.line}）`;
    roundResult.textContent =
      "已選擇勇者！先說一句溫暖的話，再出拳安撫魔物吧。";
    dialogBox.innerHTML = "";
    addDialog(`🐻 村長熊熊：${hero.name}，歡迎加入！一起去安撫壞情緒魔物吧～`);
    renderHp();
  });
});

// 使用安撫語句
usePhraseBtn.addEventListener("click", () => {
  if (!state.heroKey) {
    roundResult.textContent = "請先選擇一位勇者。";
    return;
  }

  const phrase = phraseSelect.value;
  if (!phrase) {
    roundResult.textContent = "請先從下拉選單選擇一句安撫語句。";
    return;
  }

  state.phraseUsedThisTurn = true;
  addDialog(`🧡 勇者：${phrase}`);

  // 使用語句可以恢復 1 點好心情（最多 6）
  if (state.heroHp < 6) {
    state.heroHp += 1;
    addDialog("💖 勇者的好心情恢復了一點！");
  } else {
    addDialog("💖 你的心情已經滿滿的了！可以把這份溫暖分享給魔物～");
  }

  renderHp();
  roundResult.textContent = "你已經說完溫暖的話，可以出拳囉！";
});

// 魔物隨機出拳
function monsterMove() {
  const moves = ["rock", "scissors", "paper"];
  const random = Math.floor(Math.random() * moves.length);
  return moves[random];
}

// 剪刀石頭布判定
function judge(player, enemy) {
  if (player === enemy) return "draw";
  if (
    (player === "rock" && enemy === "scissors") ||
    (player === "scissors" && enemy === "paper") ||
    (player === "paper" && enemy === "rock")
  ) {
    return "win";
  }
  return "lose";
}

// 把 move 轉成圖示文字
function moveToText(move) {
  switch (move) {
    case "rock":
      return "✊ 石頭";
    case "scissors":
      return "✌️ 剪刀";
    case "paper":
      return "🖐 布";
    default:
      return move;
  }
}

// 出拳
rpsButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!state.heroKey) {
      roundResult.textContent = "請先選擇一位勇者。";
      return;
    }

    if (state.monsterHp <= 0) {
      roundResult.textContent = "魔物已經恢復好心情囉，可以重新選勇者再玩一次～";
      return;
    }

    if (state.heroHp <= 0) {
      roundResult.textContent =
        "勇者的好心情用完了…可以換一位勇者再試試看～";
      return;
    }

    const playerMove = btn.dataset.move;
    const enemyMove = monsterMove();

    // 天賦拳加成（若有說過語句，本回合傷害再加一）
    let damageToMonster = 0;
    let damageToHero = 0;

    const result = judge(playerMove, enemyMove);

    addDialog(
      `⚔️ 勇者出了 ${moveToText(playerMove)}，魔物出了 ${moveToText(
        enemyMove
      )}。`
    );

    if (result === "draw") {
      roundResult.textContent = "平手！大家先冷靜一下。";
      addDialog("魔物：哼…我還是很不爽！");
    } else if (result === "win") {
      // 基礎傷害 1
      damageToMonster = 1;

      // 若使用的是勇者天賦拳，再＋1
      const hero = HEROES[state.heroKey];
      if (hero.talent && hero.talent === playerMove) {
        damageToMonster += 1;
        addDialog("✨ 天賦拳發動！你的好心情力量變強了！");
      }

      // 若本回合有說安撫語句，再＋1
      if (state.phraseUsedThisTurn) {
        damageToMonster += 1;
        addDialog("🌈 你的溫暖話語讓壞情緒更快消散！");
      }

      state.monsterHp -= damageToMonster;
      if (state.monsterHp < 0) state.monsterHp = 0;

      roundResult.textContent = `你贏了這回合！成功安撫了 ${damageToMonster} 點壞情緒。`;
      addDialog("魔物：咦…為什麼心裡好像有一點暖暖的…？");
    } else {
      // 勇者輸了，扣好心情 1
      damageToHero = 1;
      state.heroHp -= damageToHero;
      if (state.heroHp < 0) state.heroHp = 0;

      roundResult.textContent = "這回合魔物情緒爆炸了！你的好心情被影響了一點。";
      addDialog("魔物：你們都不懂我！都走開啦！");
    }

    // 回合結束，清除「本回合有沒有說過話」判定
    state.phraseUsedThisTurn = false;

    renderHp();

    // 勝敗判定
    if (state.monsterHp <= 0) {
      addDialog(
        "😊 魔物：謝謝你願意聽我說話…我覺得好多了。可以跟你做朋友嗎？"
      );
      addDialog("🐻 村長