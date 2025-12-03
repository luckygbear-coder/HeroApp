// === 全域設定 ===
const STORAGE_KEY = "HeroAppStateV3";

// 六隻普通魔物 + 魔王 Key
const PLAY_MONSTERS = ["slime", "crybat", "fireBull", "mermaid", "goblin", "skeleton"];
const BOSS_KEY = "dragon";

// === 基本資料 ===
const HEROES = {
  warrior: { name: "戰士", talent: "rock", line: "我一定會守護大家！" },
  mage: { name: "法師", talent: "scissors", line: "嘿嘿～我有新點子！" },
  priest: { name: "牧師", talent: "paper", line: "別擔心，我來幫你～" },
  villager: { name: "勇敢的村民", talent: null, line: "我雖然平凡，但不放棄！" }
};

const HERO_LABELS = {
  warrior: "🛡️ 戰士",
  mage: "🔮 法師",
  priest: "💖 牧師",
  villager: "🌾 勇敢的村民"
};

const MONSTERS = {
  shadow: {
    key: "shadow",
    stage: "練習關卡",
    name: "壞情緒之影",
    talent: null,
    forbid: null
  },
  slime: {
    key: "slime",
    stage: "草原",
    name: "史萊姆",
    talent: "scissors",
    forbid: "paper"
  },
  crybat: {
    key: "crybat",
    stage: "森林",
    name: "哭哭蝙蝠",
    talent: "paper",
    forbid: "rock"
  },
  fireBull: {
    key: "fireBull",
    stage: "火山平原",
    name: "火山牛",
    talent: "rock",
    forbid: "paper"
  },
  mermaid: {
    key: "mermaid",
    stage: "湖畔",
    name: "人魚",
    talent: "paper",
    forbid: "rock"
  },
  goblin: {
    key: "goblin",
    stage: "洞窟",
    name: "怪手哥布林",
    talent: "scissors",
    forbid: "rock"
  },
  skeleton: {
    key: "skeleton",
    stage: "墓地",
    name: "骷髏兵",
    talent: "rock",
    forbid: "scissors"
  },
  dragon: {
    key: "dragon",
    stage: "魔王城",
    name: "惡龍",
    talent: null, // 魔王沒有固定拳
    forbid: null
  }
};

// 壞情緒列表
const EMOTIONS3 = ["😡 生氣", "😭 難過", "😱 害怕"];
const EMOTIONS6 = ["😡 生氣", "😭 難過", "😱 害怕", "😒 嫉妒", "😔 孤單", "😖 焦慮"];

// 塔羅牌資料
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

// === 遊戲狀態 ===
function getDefaultState() {
  return {
    level: 1,
    stars: 0,
    heroKey: null,
    heroName: "",
    heroHp: 6,
    monsterKey: "shadow",
    monsterHp: 3, // 練習關卡 3 點壞情緒
    round: 0,
    clearedMonsters: {}, // { key: true }
    friends: [] // [monsterKey]
  };
}

let state = loadState();

// === 儲存 / 讀取 ===
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return getDefaultState();
    if (!parsed.level) parsed.level = 1;
    if (parsed.stars == null) parsed.stars = 0;
    if (!parsed.clearedMonsters) parsed.clearedMonsters = {};
    if (!Array.isArray(parsed.friends)) parsed.friends = [];
    if (!parsed.monsterKey) parsed.monsterKey = "shadow";
    return parsed;
  } catch (e) {
    return getDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

// === 小工具 ===
function getCurrentMonster() {
  return MONSTERS[state.monsterKey] || MONSTERS.shadow;
}

function getMonsterMaxHp(monsterKey) {
  if (monsterKey === BOSS_KEY) return 6;
  return 3;
}

function getHeroMaxHp() {
  return 6;
}

function moveIcon(move) {
  switch (move) {
    case "rock":
      return "✊";
    case "scissors":
      return "✌️";
    case "paper":
      return "🖐";
    default:
      return "—";
  }
}

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

function allBasicCleared() {
  return PLAY_MONSTERS.every((k) => state.clearedMonsters[k]);
}

function allClearedWithBoss() {
  return allBasicCleared() && state.clearedMonsters[BOSS_KEY];
}

function isFriend(key) {
  return state.friends.includes(key);
}

function addFriend(key) {
  if (!key || key === "shadow") return;
  if (!state.friends.includes(key)) {
    state.friends.push(key);
  }
}

// === 共用 UI：導覽與進度摘要 ===
function initCommonUI() {
  const navLinks = document.querySelectorAll(".nav-link");
  const bodyPage = document.body.dataset.page;
  navLinks.forEach((link) => {
    const page = link.dataset.pageLink;
    if (page === bodyPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const summaryLevel = document.getElementById("summaryLevel");
  const summaryStars = document.getElementById("summaryStars");
  if (summaryLevel) summaryLevel.textContent = `LV.${state.level}`;
  if (summaryStars) summaryStars.textContent = String(state.stars);
}

// === Emotion 列表與 HP ===
function renderEmotionList() {
  const listEl = document.getElementById("emotionList");
  const soothedEl = document.getElementById("soothedCount");
  const totalEl = document.getElementById("totalEmotionCount");
  if (!listEl || !soothedEl || !totalEl) return;

  const lis = listEl.querySelectorAll("li");
  const maxHp = getMonsterMaxHp(state.monsterKey);
  const emotionSet = maxHp === 6 ? EMOTIONS6 : EMOTIONS3;
  const soothedCount = Math.max(0, maxHp - state.monsterHp);

  totalEl.textContent = String(maxHp);
  soothedEl.textContent = String(soothedCount);

  lis.forEach((li, index) => {
    if (index < emotionSet.length) {
      li.style.display = "";
      li.classList.remove("calm");
      const originText = emotionSet[index];
      if (index < soothedCount) {
        li.classList.add("calm");
        li.textContent = originText
          .replace("😡", "😊")
          .replace("😭", "😊")
          .replace("😱", "😊")
          .replace("😒", "😊")
          .replace("😔", "😊")
          .replace("😖", "😊");
      } else {
        li.textContent = originText;
      }
    } else {
      li.style.display = "none";
    }
  });
}

function renderMonsterInfo() {
  const monsterStageText = document.getElementById("monsterStageText");
  const monsterNameText = document.getElementById("monsterNameText");
  const monsterTalentText = document.getElementById("monsterTalentText");
  const monsterForbidText = document.getElementById("monsterForbidText");

  const monster = getCurrentMonster();

  if (monsterStageText) monsterStageText.textContent = monster.stage || "練習關卡";
  if (monsterNameText) monsterNameText.textContent = `${monster.name} LV.${state.level}`;
  if (monsterTalentText) {
    monsterTalentText.textContent = monster.talent ? moveIcon(monster.talent) : "（隨機）";
  }
  if (monsterForbidText) {
    monsterForbidText.textContent = monster.forbid ? moveIcon(monster.forbid) : "（無）";
  }
}

function renderHp() {
  const heroHpText = document.getElementById("heroHpText");
  const monsterHpText = document.getElementById("monsterHpText");
  const emotionBar = document.getElementById("emotionBar");
  const emotionLabel = document.getElementById("emotionLabel");

  const heroMax = getHeroMaxHp();
  const maxHp = getMonsterMaxHp(state.monsterKey);

  if (state.heroHp < 0) state.heroHp = 0;
  if (state.heroHp > heroMax) state.heroHp = heroMax;
  if (state.monsterHp < 0) state.monsterHp = 0;
  if (state.monsterHp > maxHp) state.monsterHp = maxHp;

  if (heroHpText) heroHpText.textContent = `${state.heroHp}/${heroMax}`;
  if (monsterHpText) monsterHpText.textContent = `${state.monsterHp}/${maxHp}`;

  const percent = (state.monsterHp / maxHp) * 100;
  if (emotionBar) emotionBar.style.width = percent + "%";

  if (emotionLabel) {
    if (state.monsterHp === maxHp) {
      emotionLabel.textContent = "壞情緒還很強烈……";
    } else if (state.monsterHp >= Math.ceil(maxHp * 0.66)) {
      emotionLabel.textContent = "壞情緒稍微被安撫了。";
    } else if (state.monsterHp >= Math.ceil(maxHp * 0.33)) {
      emotionLabel.textContent = "魔物開始放心一些了。";
    } else if (state.monsterHp === 1) {
      emotionLabel.textContent = "只剩最後一點壞情緒，加油！";
    } else if (state.monsterHp === 0) {
      emotionLabel.textContent = "魔物已經恢復好心情了 ✨";
    }
  }

  renderEmotionList();
  renderMonsterInfo();
}

// === 對話框 ===
function addDialog(text) {
  const dialogBox = document.getElementById("dialogBox");
  if (!dialogBox) return;
  const p = document.createElement("p");
  p.textContent = text;
  dialogBox.appendChild(p);
  dialogBox.scrollTop = dialogBox.scrollHeight;
}

// === 地圖 UI ===
function updateMapUI() {
  const mapStarsText = document.getElementById("mapStarsText");
  const mapLevelText = document.getElementById("mapLevelText");
  const mapSection = document.getElementById("mapSection");
  const tiles = document.querySelectorAll(".map-tile");

  if (mapStarsText) mapStarsText.textContent = String(state.stars);
  if (mapLevelText) mapLevelText.textContent = `地圖等級：LV.${state.level}`;

  tiles.forEach((tile) => {
    const key = tile.dataset.monster;
    if (!key) return;
    if (state.clearedMonsters[key]) {
      tile.classList.add("cleared");
    } else {
      tile.classList.remove("cleared");
    }
  });

  if (mapSection && state.level > 1) {
    mapSection.classList.add("level-up-glow");
    setTimeout(() => mapSection.classList.remove("level-up-glow"), 700);
  }
}

// === 等級提升 ===
function tryLevelUp(monsterJustClearedKey) {
  if (monsterJustClearedKey !== BOSS_KEY) return;
  if (!allBasicCleared()) return;

  const dialogBox = document.getElementById("dialogBox");

  if (state.level < 99) {
    const prevLv = state.level;
    state.level += 1;

    if (dialogBox) {
      addDialog(
        `🐻 村長熊熊：太厲害了！你完成了第 ${prevLv} 輪冒險，整個地圖和所有魔物都升級到 LV.${state.level}！`
      );
      addDialog("🐻 村長熊熊：星星王國開啟新一輪挑戰，你可以再走一遍所有地點喔～");
    }

    state.clearedMonsters = {};
    state.monsterKey = "shadow";
    state.monsterHp = getMonsterMaxHp("shadow");
    state.round = 0;

    saveState();
  } else {
    if (dialogBox) {
      addDialog("🐻 村長熊熊：你已經達到最高等級 LV.99，之後就當成練習場，輕鬆玩就好～");
    }
  }
}

// === 魔物出拳 ===
function monsterMove() {
  const monster = getCurrentMonster();
  const baseMoves = ["rock", "scissors", "paper"];

  let moves = baseMoves.filter((m) => !monster.forbid || m !== monster.forbid);
  if (monster.talent && moves.includes(monster.talent)) {
    moves.push(monster.talent);
  }

  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex];
}

// === 剪刀石頭布判定 ===
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

// === 頁面初始化：index（新手村） ===
function initIndexPage() {
  state.heroHp = getHeroMaxHp();
  saveState();

  const heroCards = document.querySelectorAll(".hero-card");
  const selectedHeroText = document.getElementById("selectedHeroText");

  heroCards.forEach((card) => {
    const key = card.dataset.hero;
    if (!key) return;
    const nameEl = card.querySelector(".hero-name");
    if (nameEl && HERO_LABELS[key]) {
      nameEl.textContent = `${HERO_LABELS[key]} LV.${state.level}`;
    }
  });

  if (state.heroKey && selectedHeroText) {
    const hero = HEROES[state.heroKey];
    selectedHeroText.textContent = `目前勇者：${hero.name} LV.${state.level}（${hero.line}）`;
  }

  heroCards.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.hero;
      const hero = HEROES[key];
      state.heroKey = key;
      state.heroName = hero.name;
      state.heroHp = getHeroMaxHp();
      state.round = 0;
      saveState();

      heroCards.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (selectedHeroText) {
        selectedHeroText.textContent = `目前勇者：${hero.name} LV.${state.level}（${hero.line}）`;
      }
    });
  });
}

// === 頁面初始化：battle（戰鬥） ===
function initBattlePage() {
  const roundCount = document.getElementById("roundCount");
  const roundResult = document.getElementById("roundResult");
  const resetBtn = document.getElementById("resetBtn");
  const monsterInfoBox = document.getElementById("monsterInfoBox");

  const maxHp = getMonsterMaxHp(state.monsterKey);
  if (state.monsterHp == null || state.monsterHp <= 0 || state.monsterHp > maxHp) {
    state.monsterHp = maxHp;
  }
  if (state.heroHp == null || state.heroHp <= 0 || state.heroHp > getHeroMaxHp()) {
    state.heroHp = getHeroMaxHp();
  }
  if (!state.round) state.round = 0;
  saveState();

  if (roundCount) roundCount.textContent = String(state.round);
  renderHp();

  if (!state.heroKey && roundResult) {
    roundResult.textContent = "請先回「新手村」選擇一位勇者，再到地圖挑戰魔物。";
  }

  const rpsButtons = document.querySelectorAll(".rps-btn");

  rpsButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.heroKey) {
        if (roundResult) {
          roundResult.textContent = "請先回「新手村」選擇一位勇者，再到地圖挑戰魔物。";
        }
        return;
      }

      if (state.monsterHp <= 0) {
        if (roundResult) {
          roundResult.textContent = "這隻魔物已經被你安撫好了，可以回地圖挑選其他地點或挑戰魔王城。";
        }
        return;
      }

      if (state.heroHp <= 0) {
        if (roundResult) {
          roundResult.textContent = "勇者的好心情暫時用完了，先回新手村或占卜屋恢復一下吧～";
        }
        return;
      }

      const playerMove = btn.dataset.move;
      const enemyMove = monsterMove();
      const monster = getCurrentMonster();
      const hero = HEROES[state.heroKey];

      state.round += 1;
      if (roundCount) roundCount.textContent = String(state.round);

      let damageToMonster = 0;
      const result = judge(playerMove, enemyMove);

      btn.classList.add("flash");
      setTimeout(() => btn.classList.remove("flash"), 220);

      addDialog(
        `⚔️ LV.${state.level} 的 ${state.heroName || "勇者"} 出了 ${moveToText(
          playerMove
        )}，LV.${state.level} 的 ${monster.name} 出了 ${moveToText(enemyMove)}。`
      );

      if (result === "draw") {
        if (roundResult) roundResult.textContent = "平手！先觀察對方的心情變化。";
        addDialog(`${state.heroName || "勇者"}：看起來我們還在找彼此的節奏。`);
        addDialog(`${monster.name}：哼…我還在猶豫要不要相信你。`);
      } else if (result === "win") {
        damageToMonster = 1;

        if (hero.talent && hero.talent === playerMove) {
          damageToMonster += 1;
          addDialog(`✨ LV.${state.level} 的 ${hero.name} 天賦拳發動！好心情力量加倍！`);
        }

        const remainHp = state.monsterHp - damageToMonster;

        if (roundResult) {
          roundResult.textContent = `你贏了這回合！成功安撫了 ${damageToMonster} 點壞情緒。`;
        }
        addDialog(`${state.heroName || "勇者"}：我有在聽，你的感受很重要。`);

        if (remainHp >= 1) {
          addDialog(`${monster.name}：好像…沒那麼想發脾氣了。`);
        }

        state.monsterHp = remainHp;

        if (monsterInfoBox) {
          monsterInfoBox.classList.add("monster-hit");
          setTimeout(() => monsterInfoBox.classList.remove("monster-hit"), 260);
        }
      } else {
        if (state.heroKey === "villager") {
          if (roundResult) {
            roundResult.textContent = "魔物有點暴走，但你的心非常強韌，沒有受到傷害。";
          }
          addDialog(`${state.heroName || "勇者"}：我有點嚇到，但我知道你只是心情很亂。`);
          addDialog(`${monster.name}：你居然還站在這裡…？`);
        } else {
          state.heroHp -= 1;
          if (roundResult) {
            roundResult.textContent =
              "這回合魔物情緒爆炸了！你的好心情被影響了一點。";
          }
          addDialog(
            `${state.heroName || "勇者"}：哎呀…剛剛被你的壞情緒嚇到了，不過我還是想陪你。`
          );
          addDialog(`${monster.name}：你們都不懂我！都走開啦！`);
        }
      }

      renderHp();
      saveState();

      const maxHpNow = getMonsterMaxHp(state.monsterKey);

      if (state.monsterHp <= 0) {
        if (state.monsterKey !== "shadow") {
          addFriend(monster.key);
          state.clearedMonsters[monster.key] = true;

          let gainStars = 0;
          if (monster.key === BOSS_KEY) {
            gainStars = 3;
          } else {
            gainStars = 1;
          }
          state.stars += gainStars;

          addDialog(
            `😊 ${monster.name}：謝謝你，我覺得好多了。從現在起，我想當你的好朋友！`
          );
          addDialog(
            `🐻 村長熊熊：恭喜你和「${monster.name}」成為好友，並獲得 🌟 勇氣星星 x${gainStars}！`
          );

          if (monster.key === BOSS_KEY) {
            addDialog(
              "🐻 村長熊熊：連魔王都被你安撫了！星星王國的天空再次變得明亮～"
            );
          }
        } else {
          addDialog("😊 壞情緒之影：原來我也可以被好好對待…謝謝你陪我練習。");
        }

        saveState();

        if (roundResult) {
          if (allClearedWithBoss()) {
            roundResult.textContent =
              "本輪全部通關！準備升級到下一個 LV～可以回地圖看看。";
          } else {
            roundResult.textContent =
              "任務完成！可以回地圖選下一個地點，或等待全部完成再挑戰魔王城。";
          }
        }

        tryLevelUp(monster.key);
      } else if (state.heroHp <= 0) {
        addDialog("😢 勇者：我好累…需要一點時間休息。");
        addDialog("🐻 村長熊熊：沒關係，累了就回新手村或占卜屋恢復好心情，再出發也可以。");
        if (roundResult) {
          roundResult.textContent =
            "勇者的好心情暫時用完了～可以回新手村或占卜屋恢復，再繼續挑戰。";
        }
      }
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.heroHp = getHeroMaxHp();
      state.monsterHp = getMonsterMaxHp(state.monsterKey);
      state.round = 0;
      saveState();

      if (roundCount) roundCount.textContent = "0";
      if (roundResult) {
        roundResult.textContent = "重新整頓好心情，可以再試一次這個關卡。";
      }
      const dialogBox = document.getElementById("dialogBox");
      if (dialogBox) dialogBox.innerHTML = "";
      addDialog("🐻 村長熊熊：深呼吸一下，我們再穩穩地出拳就好～");

      renderHp();
    });
  }
}

// === 頁面初始化：map（地圖 + 好友） ===
function initMapPage() {
  updateMapUI();

  const tiles = document.querySelectorAll(".map-tile");
  const openBtn = document.getElementById("openFriendsBtn");
  const modal = document.getElementById("friendsModal");
  const closeBtn = document.getElementById("closeFriendsBtn");
  const backdrop = document.getElementById("friendsBackdrop");
  const listNormal = document.getElementById("friendsNormalList");
  const listBoss = document.getElementById("friendsBossList");

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const action = tile.dataset.action;
      const key = tile.dataset.monster;

      if (action === "start") {
        state.heroHp = getHeroMaxHp();
        saveState();
        window.location.href = "index.html";
        return;
      }

      if (action === "tarot") {
        state.heroHp = getHeroMaxHp();
        saveState();
        window.location.href = "tarot.html";
        return;
      }

      if (key) {
        if (key === BOSS_KEY && !allBasicCleared()) {
          alert("還不能直接衝到魔王城喔！先把其他地點的魔物安撫好，再來挑戰惡龍吧～");
          return;
        }

        const monster = MONSTERS[key];
        if (!monster) return;

        state.monsterKey = key;
        state.monsterHp = getMonsterMaxHp(key);
        state.round = 0;
        saveState();

        window.location.href = "battle.html";
      }
    });
  });

  function renderFriendsList() {
    if (!listNormal || !listBoss) return;
    listNormal.innerHTML = "";
    listBoss.innerHTML = "";

    const normalFriends = state.friends.filter((k) => PLAY_MONSTERS.includes(k));
    const bossFriends = state.friends.filter((k) => k === BOSS_KEY);

    if (normalFriends.length === 0) {
      const li = document.createElement("li");
      li.textContent = "還沒有一般魔物好友，先去地圖走走看看吧～";
      listNormal.appendChild(li);
    } else {
      normalFriends.forEach((key) => {
        const m = MONSTERS[key];
        const li = document.createElement("li");
        li.textContent = `${m.name}（目前等級 LV.${state.level}，提供 🌟1）`;
        listNormal.appendChild(li);
      });
    }

    if (bossFriends.length === 0) {
      const li = document.createElement("li");
      li.textContent = "還沒有魔王好友，等你準備好了再去魔王城看看。";
      listBoss.appendChild(li);
    } else {
      bossFriends.forEach((key) => {
        const m = MONSTERS[key];
        const li = document.createElement("li");
        li.textContent = `${m.name}（目前等級 LV.${state.level}，提供 🌟3）`;
        listBoss.appendChild(li);
      });
    }
  }

  function openModal() {
    if (!modal) return;
    renderFriendsList();
    modal.classList.add("show");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("show");
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);
}

// === 頁面初始化：tarot（占卜屋） ===
function initTarotPage() {
  state.heroHp = getHeroMaxHp();
  saveState();

  const tarotBtn = document.getElementById("tarotDrawBtn");
  const tarotPastName = document.getElementById("tarotPastName");
  const tarotPastOrient = document.getElementById("tarotPastOrient");
  const tarotPastMeaning = document.getElementById("tarotPastMeaning");
  const tarotPresentName = document.getElementById("tarotPresentName");
  const tarotPresentOrient = document.getElementById("tarotPresentOrient");
  const tarotPresentMeaning = document.getElementById("tarotPresentMeaning");
  const tarotFutureName = document.getElementById("tarotFutureName");
  const tarotFutureOrient = document.getElementById("tarotFutureOrient");
  const tarotFutureMeaning = document.getElementById("tarotFutureMeaning");
  const tarotBearMessage = document.getElementById("tarotBearMessage");

  function drawTarotCard() {
    const index = Math.floor(Math.random() * TAROT_CARDS.length);
    const card = TAROT_CARDS[index];
    const isUpright = Math.random() < 0.5;
    return {
      name: card.name,
      orientationText: isUpright ? "正位" : "逆位",
      meaning: isUpright ? card.upright : card.reversed,
      isUpright
    };
  }

  function drawTarotSpread() {
    const past = drawTarotCard();
    const present = drawTarotCard();
    const future = drawTarotCard();

    if (tarotPastName) {
      tarotPastName.textContent = past.name;
      tarotPastOrient.textContent = past.orientationText;
      tarotPastMeaning.textContent = past.meaning;
    }
    if (tarotPresentName) {
      tarotPresentName.textContent = present.name;
      tarotPresentOrient.textContent = present.orientationText;
      tarotPresentMeaning.textContent = present.meaning;
    }
    if (tarotFutureName) {
      tarotFutureName.textContent = future.name;
      tarotFutureOrient.textContent = future.orientationText;
      tarotFutureMeaning.textContent = future.meaning;
    }

    if (tarotBearMessage) {
      tarotBearMessage.textContent =
        `🐻 村長熊熊：過去的你正在慢慢學會「${
          past.isUpright ? "相信自己" : "照顧自己的心"
        }」，` +
        `現在的你正站在「${
          present.isUpright ? "成長的路口" : "調整步伐的小休息站"
        }」，` +
        `未來還有「${
          future.isUpright ? "很多新的機會" : "更多認識自己的旅程"
        }」在等著你。` +
        `記得，不管抽到什麼牌，你都值得被好好對待，也可以慢慢來。`;
    }
  }

  if (tarotBtn) {
    tarotBtn.addEventListener("click", () => {
      drawTarotSpread();
    });
  }
}

// === DOM Ready ===
document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();

  const page = document.body.dataset.page;
  if (page === "index") {
    initIndexPage();
  } else if (page === "battle") {
    initBattlePage();
  } else if (page === "map") {
    initMapPage();
  } else if (page === "tarot") {
    initTarotPage();
  }
});