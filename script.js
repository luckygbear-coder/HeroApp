// 簡單狀態
const state = {
  heroKey: null,
  heroName: "",
  heroHp: 6,
  monsterHp: 6,
  phraseUsedThisTurn: false,
};

// 勇者資料
const HEROES = {
  warrior: { name: "戰士", talent: "rock", line: "我一定會守護大家！" },
  mage: { name: "法師", talent: "scissors", line: "嘿嘿～我有新點子！" },
  priest: { name: "牧師", talent: "paper", line: "別擔心，我來幫你～" },
  villager: { name: "勇敢的村民", talent: null, line: "我雖然平凡，但不放棄！" }
};

// DOM
const heroCards = document.querySelectorAll(".hero-card");
const selectedHeroText = document.getElementById("selectedHeroText");
const heroHpText = document.getElementById("heroHpText");
const monsterHpText = document.getElementById("monsterHpText");
const phraseSelect = document.getElementById("phraseSelect");
const usePhraseBtn = document.getElementById("usePhraseBtn");
const rpsButtons = document.querySelectorAll(".rps-btn");
const roundResult = document.getElementById("roundResult");
const dialogBox = document.getElementById("dialogBox");
const emotionBar = document.getElementById("emotionBar");
const emotionLabel = document.getElementById("emotionLabel");

// 更新血量顯示
function renderHp() {
  heroHpText.textContent = `${state.heroHp}/6`;
  monsterHpText.textContent = `${state.monsterHp}/6`;

  const percent = (state.monsterHp / 6) * 100;
  emotionBar.style.width = percent + "%";

  if (state.monsterHp === 6) emotionLabel.textContent = "壞情緒還很強烈……";
  else if (state.monsterHp >= 4) emotionLabel.textContent = "壞情緒稍微被安撫了。";
  else if (state.monsterHp >= 2) emotionLabel.textContent = "魔物開始放心一些了。";
  else if (state.monsterHp === 1) emotionLabel.textContent = "只剩最後一點壞情緒！";
  else emotionLabel.textContent = "魔物已經恢復好心情了 ✨";
}

// 加一行文字到對話框
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
    dialogBox.innerHTML = "";
    addDialog(`🐻 村長熊熊：${hero.name}，歡迎加入冒險！`);

    renderHp();
  });
});

// 使用語句
usePhraseBtn.addEventListener("click", () => {
  if (!state.heroKey) return (roundResult.textContent = "請先選擇勇者");

  const phrase = phraseSelect.value;
  if (!phrase) return (roundResult.textContent = "請先選擇一句語句");

  state.phraseUsedThisTurn = true;
  addDialog(`🧡 勇者：${phrase}`);

  if (state.heroHp < 6) {
    state.heroHp++;
    addDialog("💖 你的好心情恢復了一點！");
  }

  renderHp();
  roundResult.textContent = "語句已說完，可以出拳囉！";
});

// 魔物出拳
function monsterMove() {
  return ["rock", "scissors", "paper"][Math.floor(Math.random() * 3)];
}

// 結果判定
function judge(p, m) {
  if (p === m) return "draw";
  if (
    (p === "rock" && m === "scissors") ||
    (p === "scissors" && m === "paper") ||
    (p === "paper" && m === "rock")
  ) return "win";
  return "lose";
}

// 轉換文字
function moveText(m) {
  return m === "rock" ? "✊ 石頭" : m === "scissors" ? "✌️ 剪刀" : "🖐 布";
}

// 出拳邏輯
rpsButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!state.heroKey) return (roundResult.textContent = "請先選擇勇者");

    const p = btn.dataset.move;
    const m = monsterMove();

    addDialog(`⚔️ 勇者出了 ${moveText(p)}，魔物出了 ${moveText(m)}。`);

    const result = judge(p, m);

    // 勝
    if (result === "win") {
      let dmg = 1;

      const hero = HEROES[state.heroKey];
      if (hero.talent === p) {
        dmg++;
        addDialog("✨ 天賦拳加成！");
      }

      if (state.phraseUsedThisTurn) {
        dmg++;
        addDialog("🌈 安撫語句的力量加成！");
      }

      state.monsterHp -= dmg;
      if (state.monsterHp < 0) state.monsterHp = 0;

      roundResult.textContent = `成功安撫 ${dmg} 點壞情緒！`;
      addDialog("魔物：咦…為什麼有點暖暖的？");
    }

    // 負
    else if (result === "lose") {
      state.heroHp--;
      if (state.heroHp < 0) state.heroHp = 0;

      roundResult.textContent = "魔物的壞情緒爆發了！你被影響了一點。";
      addDialog("魔物：都別靠近我！");
    }

    // 平手
    else {
      roundResult.textContent = "平手～大家先冷靜一下。";
    }

    state.phraseUsedThisTurn = false;
    renderHp();

    if (state.monsterHp === 0) {
      addDialog("😊 魔物：謝謝你…我覺得好多了！");
      roundResult.textContent = "任務完成！魔物恢復好心情！";
    }

    if (state.heroHp === 0) {
      addDialog("😢 勇者：我需要休息一下…");
      roundResult.textContent = "勇者的好心情用完了，可以換一位勇者。";
    }
  });
});

// 初始
renderHp();
