/* 小勇者之旅大冒險 - 完整版 script.js
 * 功能：
 * - 勇者選擇（含故事 / 天賦）
 * - 九宮格地圖、LV 1~99 多周目
 * - 魔物與魔王戰鬥（天賦拳 2 倍效果 + AI 機率 75/25/0）
 * - 勇者 / 魔物 / 魔王隨 LV 提升 HP 與攻擊
 * - 友情名單 & 星星累積
 * - 道具系統：小蘋果、大蘋果、復活星星、嗡嗡蜂蜜
 * - 占卜系統：消耗蜂蜜抽 3 張塔羅牌＋正逆位解讀＋熊熊村長提醒
 * - 熊熊抱抱：不花蜂蜜，恢復勇者 HP 滿
 */

/* =============== 通用工具 =============== */
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

/* =============== 基礎常數 =============== */
const MAX_LEVEL = 99;

const HEROES = [
  {
    key: "warrior",
    name: "戰士 🛡️",
    talentMove: "rock",
    fistText: "✊ 石頭",
    line: "我一定會守護大家！",
    ability: "若出石頭並勝利 → 傳達 2 倍好心情",
    story:
      "戰士從小立志保護村莊，雖然有時衝動，但內心非常善良。守護夥伴是他最重要的使命。"
  },
  {
    key: "mage",
    name: "法師 🔮",
    talentMove: "scissors",
    fistText: "✌️ 剪刀",
    line: "嘿嘿～我有新點子！",
    ability: "若出剪刀並勝利 → 傳達  2 倍好心情",
    story:
      "法師喜歡研究星星魔法，常常想到奇怪又有用的點子，讓魔物忘記生氣。"
  },
  {
    key: "priest",
    name: "牧師 💖",
    talentMove: "paper",
    fistText: "🖐 布",
    line: "別擔心，我來幫你～",
    ability: "若出布並勝利 → 傳達 2 倍好心情",
    story:
      "牧師能聽見心靈深處的聲音，他的治癒讓大家的心都暖暖的。"
  },
  {
    key: "villager",
    name: "勇敢的村民 🌾",
    talentMove: null, // 無固定拳
    fistText: "自由出拳",
    line: "我雖然平凡，但不放棄！",
    ability: "魔王戰時不會受到任何傷害",
    story:
      "雖然沒有特別天賦，但擁有最堅定的心。靠著勇氣，他也能改變世界。"
  }
];

/* move -> emoji / 文字 */
const MOVE_EMOJI = {
  rock: "✊",
  scissors: "✌️",
  paper: "🖐"
};

/* 所有普通魔物與魔王的基礎資料（HP 會依 LV 再加成） */
const MONSTERS = {
  forest: {
    name: "獸人",
    baseHp: 3,
    talentMove: "rock",
    forbidMove: "scissors",
    emotions: ["生氣", "嫉妒", "不安"]
  },
  lake: {
    name: "人魚",
    baseHp: 3,
    talentMove: "paper",
    forbidMove: "rock",
    emotions: ["害怕", "孤單", "難過"]
  },
  cave: {
    name: "哥布林",
    baseHp: 3,
    talentMove: "scissors",
    forbidMove: "paper",
    emotions: ["不爽", "緊張", "疑惑"]
  },
  grave: {
    name: "骷髏兵",
    baseHp: 3,
    talentMove: "rock",
    forbidMove: "paper",
    emotions: ["憤怒", "焦慮", "失落"]
  },
  dungeon: {
    name: "異教徒",
    baseHp: 3,
    talentMove: "scissors",
    forbidMove: "rock",
    emotions: ["迷惘", "孤單", "不安"]
  },
  ruins: {
    name: "石像魔像",
    baseHp: 3,
    talentMove: "paper",
    forbidMove: "scissors",
    emotions: ["僵硬", "害怕改變", "疑惑"]
  },
  boss: {
    name: "惡龍魔王",
    baseHp: 6,
    talentMove: "any", // 任意
    forbidMove: null,
    emotions: ["憤怒", "恐懼", "嫉妒", "孤單", "不安", "自責"]
  }
};

/* 方便使用的陣列 */
const MONSTER_STAGES = ["forest", "lake", "cave", "grave", "dungeon", "ruins"];

/* 道具價格（使用勇氣星星） */
const ITEM_PRICES = {
  appleSmall: 1,  // 小蘋果
  appleBig: 5,    // 大蘋果
  revive: 10,     // 復活星星
  honey: 6        // 嗡嗡蜂蜜
};

/* =============== 狀態（localStorage） =============== */
let hero = load("hero", null);
let level = load("level", 1); // 周目 LV
if (level < 1) level = 1;
if (level > MAX_LEVEL) level = MAX_LEVEL;

let stars = load("stars", 0); // 可用勇氣星星（貨幣）
let clearedStages = load("clearedStages", {}); // 當前 LV 已通關的關卡
let friends = load("friends", []); // 好友名單

/* 勇者 HP 狀態 */
let heroHpCurrent = load("heroHpCurrent", null);

/* 道具數量 */
let items = load("items", {
  appleSmall: 0,
  appleBig: 0,
  revive: 0,
  honey: 0
});

/* 初始勇者預設為戰士 */
if (!hero) {
  hero = HEROES[0];
  save("hero", hero);
}

/* 依 LV 計算 HP / 攻擊力 */
function getHeroMaxHp() {
  return 3 + (level - 1); // 每升級 +1
}
function getMonsterMaxHp(stageKey) {
  const m = MONSTERS[stageKey];
  if (!m) return 3 + (level - 1);
  return m.baseHp + (level - 1);
}
function getHeroBaseDamage() {
  return 1 + (level - 1);
}
function getMonsterDamage() {
  return 1 + (level - 1);
}

/* 初始化勇者 HP（第一次遊玩或 LV 變動） */
(function ensureHeroHp() {
  const maxHp = getHeroMaxHp();
  if (heroHpCurrent === null || heroHpCurrent > maxHp) {
    heroHpCurrent = maxHp;
    save("heroHpCurrent", heroHpCurrent);
  }
})();

/* =============== 新手村：選擇勇者 =============== */
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
      <div class="hero-fist">天賦拳：${h.fistText}</div>
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
    // 選好勇者後，HP 也回滿
    heroHpCurrent = getHeroMaxHp();
    save("heroHpCurrent", heroHpCurrent);
    window.location.href = "map.html";
  });
}

/* =============== 地圖頁（九宮格 + LV 系統） =============== */
function initMapPage() {
  const grid = document.getElementById("mapGrid");
  if (!grid) return;

  // LV & 星星
  const mapLevel = document.getElementById("mapLevel");
  const mapStars = document.getElementById("mapStars");
  if (mapLevel) mapLevel.textContent = "LV." + level;
  if (mapStars) mapStars.textContent = stars + " 顆";

  // 九宮格配置
  const cells = [
    { id: "start",   label: "🏡 新手村",           kind: "start"   },
    { id: "forest",  label: "🌲 森林（獸人）",     kind: "monster" },
    { id: "boss",    label: "🔥 魔王城（惡龍）",  kind: "boss"    },

    { id: "lake",    label: "🌊 湖畔（人魚）",     kind: "monster" },
    { id: "tarot",   label: "🔮 占卜屋",           kind: "tarot"   },
    { id: "cave",    label: "🕳 洞窟（哥布林）",   kind: "monster" },

    { id: "grave",   label: "💀 墓地（骷髏兵）",   kind: "monster" },
    { id: "dungeon", label: "🕸 地窖（異教徒）",   kind: "monster" },
    { id: "ruins",   label: "🏛 遺跡（石像魔像）", kind: "monster" }
  ];

  grid.innerHTML = "";

  cells.forEach(cell => {
    const t = document.createElement("div");
    t.className = "map-tile";
    t.textContent = cell.label;

    if (cell.kind === "boss") t.classList.add("boss");
    if (cell.kind === "start" || cell.kind === "tarot") t.classList.add("special");

    if ((cell.kind === "monster" || cell.kind === "boss") && clearedStages[cell.id]) {
      t.classList.add("cleared");
    }

    t.addEventListener("click", () => {
      switch (cell.kind) {
        case "start":
          window.location.href = "index.html";
          break;
        case "tarot":
          window.location.href = "tarot.html";
          break;
        case "boss": {
          const allClear = MONSTER_STAGES.every(s => clearedStages[s]);
          if (!allClear) {
            alert("還不能挑戰魔王喔！請先安撫所有魔物！");
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

    grid.appendChild(t);
  });

  // 好友名單
  const fb = document.getElementById("friendsBtn");
  const modal = document.getElementById("friendsModal");
  const closeBtn = document.getElementById("friendsCloseBtn");
  const list = document.getElementById("friendsList");

  if (fb && modal && closeBtn && list) {
    fb.addEventListener("click", () => {
      list.innerHTML = friends.length
        ? friends.map(f => `<li>${f.name}（⭐ ${f.stars}，在 LV.${f.level} 成為好友）</li>`).join("")
        : "<li>尚未有好友，先去安撫魔物吧！</li>";
      modal.classList.add("show");
    });

    closeBtn.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }
}

/* =============== 戰鬥頁 =============== */
function initBattlePage() {
  const pageBody = document.body;
  if (!pageBody || pageBody.dataset.page !== "battle") return;

  const stage = load("currentStage", null);
  if (!stage || !MONSTERS[stage]) {
    const r = document.getElementById("roundResult");
    if (r) r.textContent = "請先從地圖選擇一個地點再來戰鬥！";
    return;
  }

  const data = MONSTERS[stage];
  const heroMaxHp = getHeroMaxHp();
  const monsterMaxHp = getMonsterMaxHp(stage);
  let heroHp = Math.min(heroHpCurrent, heroMaxHp);
  let monsterHp = monsterMaxHp;
  let emotionIndex = 0;
  let round = 0;

  // 基本 DOM
  const heroHpEl = document.getElementById("heroHpText");
  const heroTalentEl = document.getElementById("heroTalentText");
  const stageEl = document.getElementById("monsterStageText");
  const nameEl = document.getElementById("monsterNameText");
  const levelEl = document.getElementById("monsterLevelText");
  const talentEl = document.getElementById("monsterTalentText");
  const forbidEl = document.getElementById("monsterForbidText");
  const dialogBox = document.getElementById("dialogBox");
  const roundResult = document.getElementById("roundResult");
  const roundCount = document.getElementById("roundCount");
  const emotionItems = Array.from((document.getElementById("emotionList") || {}).children || []);

  function updateHeroHpDisplay() {
    if (heroHpEl) heroHpEl.textContent = heroHp + " / " + heroMaxHp;
  }
  function updateMonsterEmotionDisplay() {
    if (emotionItems.length) {
      emotionItems.forEach((li, i) => {
        li.textContent = data.emotions[i] || "";
        if (i < emotionIndex) li.classList.add("calm");
        else li.classList.remove("calm");
      });
    }
  }

  updateHeroHpDisplay();
  updateMonsterEmotionDisplay();

  // 填入資訊
  if (heroTalentEl) {
    heroTalentEl.textContent = hero.talentMove
      ? MOVE_EMOJI[hero.talentMove] + "（" + hero.fistText + "）"
      : "自由出拳";
  }
  if (stageEl) stageEl.textContent = stage === "boss" ? "魔王城" : stage;
  if (nameEl) nameEl.textContent = data.name;
  if (levelEl) levelEl.textContent = level;
  if (talentEl) {
    talentEl.textContent =
      data.talentMove === "any" ? "任意" : (MOVE_EMOJI[data.talentMove] || "—");
  }
  if (forbidEl) {
    forbidEl.textContent = data.forbidMove ? MOVE_EMOJI[data.forbidMove] : "無";
  }
  if (roundResult) roundResult.textContent = "選一個拳，小勇者會自動與魔物互動！";

  function addTalk(text) {
    if (!dialogBox) return;
    const p = document.createElement("p");
    p.textContent = text;
    dialogBox.appendChild(p);
    dialogBox.scrollTop = dialogBox.scrollHeight;
  }

  const beats = { rock: "scissors", scissors: "paper", paper: "rock" };

  function randomMonsterMove() {
    if (stage === "boss" || data.talentMove === "any") {
      const moves = ["rock", "paper", "scissors"];
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const talent = data.talentMove;
    const forbid = data.forbidMove;
    const allMoves = ["rock", "paper", "scissors"];
    const other = allMoves.find(m => m !== talent && m !== forbid);

    const r = Math.random();
    if (r < 0.75) return talent; // 75% 天賦拳
    return other;                // 25% 另一個拳；弱點拳不會出
  }

  function handleRoundResult(result, playerMove, monsterMove) {
    round += 1;
    if (roundCount) roundCount.textContent = String(round);

    const heroBaseDmg = getHeroBaseDamage();
    const monsterDmg = getMonsterDamage();
    let heroDmg = heroBaseDmg;

    if (result === "win") {
      addTalk("勇者：「" + friendlyHeroLine() + "」");
      addTalk(data.name + "：咦？好像真的沒那麼糟……");

      // 天賦拳兩倍效果（非村民）
      if (hero.talentMove && playerMove === hero.talentMove) {
        heroDmg = heroBaseDmg * 2;
      }

      monsterHp -= heroDmg;
      if (monsterHp < 0) monsterHp = 0;

      if (emotionIndex < data.emotions.length) {
        emotionIndex++;
      }
      updateMonsterEmotionDisplay();

      if (roundResult) {
        roundResult.textContent = `你安撫了 ${data.name}！(造成 ${heroDmg} 點好心情傷害)`;
      }

      if (monsterHp <= 0) {
        clearBattle(stage);
        return;
      }
    } else if (result === "lose") {
      addTalk(data.name + "：「走開啦！我現在心情不好！」");

      // 勇敢的村民在魔王戰不會扣血
      if (!(hero.key === "villager" && stage === "boss")) {
        heroHp -= monsterDmg;
        if (heroHp < 0) heroHp = 0;
        heroHpCurrent = heroHp;
        save("heroHpCurrent", heroHpCurrent);
      }

      updateHeroHpDisplay();

      if (heroHp <= 0) {
        if (roundResult) {
          roundResult.textContent =
            "你累倒了……可以使用 ⭐ 復活星星，或先回去休息一下！";
        }
      } else {
        if (roundResult) {
          roundResult.textContent =
            `魔物的壞情緒太強烈了！（受到 ${monsterDmg} 點傷害）`;
        }
      }
    } else {
      if (roundResult) roundResult.textContent = "平手～再試一次！";
      addTalk("勇者與魔物同時出了一樣的拳，互相看了一眼。");
    }
  }

  function friendlyHeroLine() {
    const lines = [
      "我在聽，你可以慢慢說。",
      "沒關係，我會陪你一起想辦法！",
      "其實你很好，只是今天有點累。",
      "謝謝你願意說出來，我覺得你很勇敢。"
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function playRound(playerMove) {
    if (heroHp <= 0 || monsterHp <= 0) return;

    const mMove = randomMonsterMove();
    let result;
    if (playerMove === mMove) result = "tie";
    else if (beats[playerMove] === mMove) result = "win";
    else result = "lose";

    handleRoundResult(result, playerMove, mMove);
  }

  // 綁定出拳按鈕
  document.querySelectorAll(".rps-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const mv = btn.dataset.move;
      if (!mv) return;
      playRound(mv);
    });
  });

  // 回地圖
  const backBtn = document.getElementById("backToMapBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "map.html";
    });
  }

  /* ====== 道具籃 Modal ====== */
  const itemBtn = document.getElementById("itemBagBtn");
  const itemModal = document.getElementById("itemModal");
  const closeItemModal = document.getElementById("closeItemModal");

  function refreshItemDisplay() {
    const s = document.getElementById("appleSmallCount");
    const b = document.getElementById("appleBigCount");
    const r = document.getElementById("reviveCount");
    if (s) s.textContent = items.appleSmall || 0;
    if (b) b.textContent = items.appleBig || 0;
    if (r) r.textContent = items.revive || 0;
  }

  if (itemBtn && itemModal && closeItemModal) {
    itemBtn.addEventListener("click", () => {
      refreshItemDisplay();
      itemModal.classList.add("show");
    });
    closeItemModal.addEventListener("click", () => {
      itemModal.classList.remove("show");
    });

    document.querySelectorAll(".item-use-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.item;
        if (!type) return;

        if (type === "appleSmall") {
          if (items.appleSmall <= 0) {
            alert("沒有小蘋果了，可以去找喵喵商人購買！");
            return;
          }
          if (heroHp <= 0) {
            alert("勇者已經倒下了，請先使用復活星星 ⭐");
            return;
          }
          if (heroHp >= heroMaxHp) {
            alert("血量已經是滿的囉！");
            return;
          }
          items.appleSmall -= 1;
          heroHp = Math.min(heroHp + 1, heroMaxHp);
          heroHpCurrent = heroHp;
          save("items", items);
          save("heroHpCurrent", heroHpCurrent);
          updateHeroHpDisplay();
          refreshItemDisplay();
        } else if (type === "appleBig") {
          if (items.appleBig <= 0) {
            alert("沒有大蘋果了，可以去找喵喵商人購買！");
            return;
          }
          if (heroHp <= 0) {
            alert("勇者已經倒下了，請先使用復活星星 ⭐");
            return;
          }
          if (heroHp >= heroMaxHp) {
            alert("血量已經是滿的囉！");
            return;
          }
          items.appleBig -= 1;
          heroHp = heroMaxHp;
          heroHpCurrent = heroHp;
          save("items", items);
          save("heroHpCurrent", heroHpCurrent);
          updateHeroHpDisplay();
          refreshItemDisplay();
        } else if (type === "revive") {
          if (items.revive <= 0) {
            alert("沒有復活星星了，可以去找喵喵商人購買！");
            return;
          }
          if (heroHp > 0) {
            alert("還站得好好的，先不用復活星星～");
            return;
          }
          items.revive -= 1;
          heroHp = heroMaxHp;
          heroHpCurrent = heroHp;
          save("items", items);
          save("heroHpCurrent", heroHpCurrent);
          updateHeroHpDisplay();
          refreshItemDisplay();
          if (roundResult) {
            roundResult.textContent = "⭐ 復活星星啟動！小勇者重新站了起來！";
          }
        }
      });
    });
  }
}

/* 勝利後處理：加星星、加好友、升級判定 */
function clearBattle(stage) {
  const data = MONSTERS[stage];
  if (!data) return;

  const isBoss = stage === "boss";
  const gainStars = isBoss ? 3 : 1;
  stars += gainStars;
  save("stars", stars);

  // 通關紀錄
  clearedStages[stage] = true;
  save("clearedStages", clearedStages);

  // 好友名單
  friends.push({
    name: data.name,
    stars: gainStars,
    level
  });
  save("friends", friends);

  // 勝利後勇者 HP 直接回滿
  heroHpCurrent = getHeroMaxHp();
  save("heroHpCurrent", heroHpCurrent);

  // 若是魔王，檢查是否升級
  if (isBoss) {
    const allClear = MONSTER_STAGES.every(s => clearedStages[s]) && clearedStages["boss"];
    if (allClear && level < MAX_LEVEL) {
      level += 1;
      save("level", level);
      clearedStages = {};
      save("clearedStages", clearedStages);
      alert(
        "恭喜打敗惡龍魔王！地圖升級到 LV." +
          level +
          "，所有魔物與勇者都變得更強，可以再次挑戰一輪！"
      );
    } else if (allClear) {
      alert("你已經征服 LV.99 的所有魔物與魔王！太厲害了～");
    } else {
      alert("成功安撫魔王的一部分壞情緒！");
    }
  } else {
    alert("成功安撫了 " + data.name + "！他成為你的好友了 ⭐");
  }

  window.location.href = "map.html";
}

/* =============== 占卜屋（嗡嗡蜂蜜＋塔羅） =============== */

const TAROT_DECK = [
  {
    name: "愚者",
    upright: "代表新的開始與勇敢的嘗試，你願意踏出第一步，這是非常棒的勇氣。",
    reversed: "可能有點衝動或不確定自己在做什麼，先停下來深呼吸，再決定下一步。"
  },
  {
    name: "魔術師",
    upright: "代表你有足夠的能力與資源，只要專心，就能把想法變成現實。",
    reversed: "提醒你不要同時做太多事，先選一件最重要的，好好完成。"
  },
  {
    name: "女皇",
    upright: "象徵溫柔與照顧，你正在給予或接受很多愛與支持。",
    reversed: "別忘了照顧自己，你也需要休息與被擁抱。"
  },
  {
    name: "力量",
    upright: "你很勇敢，即使心裡害怕，也願意慢慢面對。",
    reversed: "最近可能有點累，力量還在，只是需要多一點休息與安慰。"
  },
  {
    name: "隱者",
    upright: "代表你正在思考、整理自己，很適合安靜一下、與自己相處。",
    reversed: "也許悶在心裡太久了，試著找一個信任的人聊聊。"
  },
  {
    name: "命運之輪",
    upright: "事情正在改變，有機會迎來好轉，相信自己的努力會被看見。",
    reversed: "變化讓你不安，但不代表變壞，而是提醒你要更有彈性。"
  },
  {
    name: "太陽",
    upright: "充滿開心與活力，代表你有很多光亮可以分享給世界。",
    reversed: "也許暫時看不見陽光，但太陽一直都在，只是被雲遮住了。"
  },
  {
    name: "月亮",
    upright: "情緒比較敏感的時期，直覺很強，適合聽聽自己心裡真正的聲音。",
    reversed: "容易胡思亂想，別讓想像嚇到自己，多確認一下事實。"
  },
  {
    name: "審判",
    upright: "代表新的階段到來，你正在成長、學會用不同角度看事情。",
    reversed: "不要太嚴厲地責備自己，錯誤是成長的一部分。"
  },
  {
    name: "世界",
    upright: "一個階段即將完成，你有很多值得驕傲的地方，可以好好慶祝。",
    reversed: "事情還沒結束，可能只差最後一步，再撐一下就到了。"
  }
];

function initTarotPage() {
  const honeyEl = document.getElementById("honeyCount");
  const starsEl = document.getElementById("tarotStars");
  const bearMsg = document.getElementById("tarotBearMessage");

  const pastName = document.getElementById("tarotPastName");
  const pastOrient = document.getElementById("tarotPastOrient");
  const pastMeaning = document.getElementById("tarotPastMeaning");

  const presentName = document.getElementById("tarotPresentName");
  const presentOrient = document.getElementById("tarotPresentOrient");
  const presentMeaning = document.getElementById("tarotPresentMeaning");

  const futureName = document.getElementById("tarotFutureName");
  const futureOrient = document.getElementById("tarotFutureOrient");
  const futureMeaning = document.getElementById("tarotFutureMeaning");

  const bearHugBtn = document.getElementById("bearHugBtn");
  const tarotBtn = document.getElementById("tarotDrawBtn");

  if (!honeyEl || !starsEl) return;

  function refreshResourceDisplay() {
    honeyEl.textContent = items.honey || 0;
    starsEl.textContent = stars;
  }
  refreshResourceDisplay();

  // 熊熊抱抱：不消耗蜂蜜，直接回滿 HP
  if (bearHugBtn) {
    bearHugBtn.addEventListener("click", () => {
      heroHpCurrent = getHeroMaxHp();
      save("heroHpCurrent", heroHpCurrent);
      if (bearMsg) {
        bearMsg.textContent =
          "熊熊村長：辛苦了～來，熊熊抱抱一下 ❤️ 你的心情和體力都慢慢回來了。";
      }
      alert("小勇者恢復到滿滿好心情與體力！");
    });
  }

  // 塔羅占卜：消耗 1 蜂蜜
  if (tarotBtn) {
    tarotBtn.addEventListener("click", () => {
      if (items.honey <= 0) {
        alert("沒有嗡嗡蜂蜜了，可以去喵喵商人那裡用星星購買喔！");
        return;
      }
      items.honey -= 1;
      save("items", items);
      refreshResourceDisplay();

      // 從牌組抽 3 張不重複
      const pool = TAROT_DECK.slice();
      function drawOne() {
        const idx = Math.floor(Math.random() * pool.length);
        const card = pool.splice(idx, 1)[0];
        const reversed = Math.random() < 0.5;
        return { card, reversed };
      }
      const p = drawOne();
      const c = drawOne();
      const f = drawOne();

      function fill(domName, domOrient, domMeaning, result) {
        if (!result) return;
        const { card, reversed } = result;
        if (domName) domName.textContent = card.name;
        if (domOrient) domOrient.textContent = reversed ? "逆位" : "正位";
        if (domMeaning) domMeaning.textContent = reversed ? card.reversed : card.upright;
      }

      fill(pastName, pastOrient, pastMeaning, p);
      fill(presentName, presentOrient, presentMeaning, c);
      fill(futureName, futureOrient, futureMeaning, f);

      // 熊熊村長總結
      if (bearMsg) {
        bearMsg.textContent =
          "熊熊村長：從這三張牌來看，你正在慢慢成長中。不要急著一下子變得很厲害，" +
          "每一次面對情緒，都已經是在前進了。累的時候記得多休息，開心的時候也別忘了夸獎自己 💛";
      }

      // 占卜完也順便回滿血
      heroHpCurrent = getHeroMaxHp();
      save("heroHpCurrent", heroHpCurrent);
    });
  }
}

/* =============== 之後可以擴充：喵喵商人商店頁 =============== */
/* 若將來新增 shop.html，記得在 <body data-page="shop"> 中呼叫這個 */
function initShopPage() {
  const starsEl = document.getElementById("shopStars");
  const honeyEl = document.getElementById("shopHoneyCount");
  const sSmall = document.getElementById("shopAppleSmallCount");
  const sBig = document.getElementById("shopAppleBigCount");
  const sRev = document.getElementById("shopReviveCount");

  if (!starsEl) return;

  function refresh() {
    starsEl.textContent = stars;
    if (honeyEl) honeyEl.textContent = items.honey || 0;
    if (sSmall) sSmall.textContent = items.appleSmall || 0;
    if (sBig) sBig.textContent = items.appleBig || 0;
    if (sRev) sRev.textContent = items.revive || 0;
  }
  refresh();

  document.querySelectorAll(".shop-buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.dataset.item;
      if (!item || !ITEM_PRICES[item]) return;
      const price = ITEM_PRICES[item];
      if (stars < price) {
        alert("勇氣星星不足，先去多安撫幾個魔物吧～");
        return;
      }
      stars -= price;
      items[item] = (items[item] || 0) + 1;
      save("stars", stars);
      save("items", items);
      refresh();
      alert("購買成功！已獲得一個「" + btn.dataset.label + "」");
    });
  });
}

/* =============== 初始化入口 =============== */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "index") initIndexPage();
  if (page === "map") initMapPage();
  if (page === "battle") initBattlePage();
  if (page === "tarot") initTarotPage();
  if (page === "shop") initShopPage();
});