const STORAGE_KEY = 'point-incremential-3-save-v2';
const SAVE_VERSION = 2;
const PRESTIGE_THRESHOLD = 1000;
const BASE_PER_CLICK = 1;
const BASE_PER_SECOND = 0;

const pointsEl = document.getElementById('points');
const perClickEl = document.getElementById('per-click');
const perSecondEl = document.getElementById('per-second');
const prestigeDisplayEl = document.getElementById('prestige-display');
const prestigeInfoEl = document.getElementById('prestige-info');
const gainButton = document.getElementById('gain-points');
const upgradesEl = document.getElementById('upgrades');
const startButton = document.getElementById('start-button');
const prestigeButton = document.getElementById('prestige-button');
const resetSaveButton = document.getElementById('reset-save');
const startScreen = document.getElementById('start-screen');
const gameApp = document.getElementById('game-app');

let points = 0;
let pointsPerClick = BASE_PER_CLICK;
let pointsPerSecond = BASE_PER_SECOND;
let prestige = 0;
let gameStarted = false;

const upgrades = [
  {
    id: 'cursor',
    name: 'Cursor Boost',
    description: 'A stronger cursor gives +1 point per click.',
    baseCost: 12,
    costScale: 1.22,
    clickBonus: 1,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'manual',
    name: 'Manual Power',
    description: 'Extra hand strength adds +2 points per click.',
    baseCost: 30,
    costScale: 1.3,
    clickBonus: 2,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'printer',
    name: 'Point Printer',
    description: 'Printers begin producing passive points.',
    baseCost: 80,
    costScale: 1.35,
    clickBonus: 0,
    passiveBonus: 1,
    owned: 0,
  },
  {
    id: 'operator',
    name: 'Operator Crew',
    description: 'Hire a few workers for +3 per click.',
    baseCost: 150,
    costScale: 1.42,
    clickBonus: 3,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'factory',
    name: 'Mini Factory',
    description: 'Automated production creates +5 per second.',
    baseCost: 260,
    costScale: 1.5,
    clickBonus: 0,
    passiveBonus: 5,
    owned: 0,
  },
  {
    id: 'research',
    name: 'Research Lab',
    description: 'New science improves your click power by +5.',
    baseCost: 420,
    costScale: 1.57,
    clickBonus: 5,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'drone',
    name: 'Drone Squad',
    description: 'Drones add +8 per second.',
    baseCost: 650,
    costScale: 1.62,
    clickBonus: 0,
    passiveBonus: 8,
    owned: 0,
  },
  {
    id: 'orbital',
    name: 'Orbital Relay',
    description: 'Space infrastructure gives +12 per click.',
    baseCost: 980,
    costScale: 1.68,
    clickBonus: 12,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'quantum',
    name: 'Quantum Engine',
    description: 'Quantum power creates +20 per second.',
    baseCost: 1400,
    costScale: 1.72,
    clickBonus: 0,
    passiveBonus: 20,
    owned: 0,
  },
  {
    id: 'legend',
    name: 'Legendary Core',
    description: 'The final upgrade adds +25 per click and +35 per second.',
    baseCost: 2200,
    costScale: 1.78,
    clickBonus: 25,
    passiveBonus: 35,
    owned: 0,
  },
];

function setGameVisibility(visible) {
  if (startScreen) {
    startScreen.classList.toggle('hidden', !visible);
    startScreen.classList.toggle('visible', visible);
  }

  if (gameApp) {
    gameApp.classList.toggle('hidden', visible);
    gameApp.classList.toggle('visible', !visible);
  }
}

function formatNumber(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.floor(safeValue)).toLocaleString();
}

function getUpgradeCost(upgrade) {
  const owned = Number.isFinite(upgrade.owned) ? Math.max(0, Math.floor(upgrade.owned)) : 0;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, owned));
}

function syncDerivedStats() {
  let clickPower = BASE_PER_CLICK + prestige;
  let passivePower = BASE_PER_SECOND + prestige;

  upgrades.forEach((upgrade) => {
    const owned = Number.isFinite(upgrade.owned) ? Math.max(0, Math.floor(upgrade.owned)) : 0;
    clickPower += owned * upgrade.clickBonus;
    passivePower += owned * upgrade.passiveBonus;
  });

  pointsPerClick = clickPower;
  pointsPerSecond = passivePower;
}

function normalizeUpgradeList(rawUpgrades) {
  const normalized = upgrades.map((upgrade) => ({
    id: upgrade.id,
    owned: 0,
  }));

  if (!Array.isArray(rawUpgrades)) return normalized;

  rawUpgrades.forEach((rawUpgrade) => {
    if (!rawUpgrade || typeof rawUpgrade.id !== 'string') return;
    const matchingUpgrade = upgrades.find((upgrade) => upgrade.id === rawUpgrade.id);
    if (!matchingUpgrade) return;
    const owned = Number(rawUpgrade.owned);
    if (Number.isFinite(owned)) {
      matchingUpgrade.owned = Math.max(0, Math.floor(owned));
    }
  });

  return upgrades.map((upgrade) => ({ id: upgrade.id, owned: upgrade.owned }));
}

function migrateSaveData(rawSave) {
  const fallback = {
    version: SAVE_VERSION,
    points: 0,
    prestige: 0,
    gameStarted: false,
    upgrades: normalizeUpgradeList([]),
  };

  if (!rawSave || typeof rawSave !== 'object') {
    return fallback;
  }

  const migrated = {
    ...fallback,
    ...rawSave,
    version: SAVE_VERSION,
    upgrades: normalizeUpgradeList(rawSave.upgrades),
  };

  if (typeof rawSave.points === 'number' && Number.isFinite(rawSave.points)) {
    migrated.points = Math.max(0, rawSave.points);
  }

  if (typeof rawSave.prestige === 'number' && Number.isFinite(rawSave.prestige)) {
    migrated.prestige = Math.max(0, rawSave.prestige);
  }

  if (typeof rawSave.gameStarted === 'boolean') {
    migrated.gameStarted = rawSave.gameStarted;
  }

  return migrated;
}

function saveGame() {
  try {
    const payload = {
      version: SAVE_VERSION,
      points,
      prestige,
      gameStarted,
      upgrades: upgrades.map((upgrade) => ({
        id: upgrade.id,
        owned: Number.isFinite(upgrade.owned) ? Math.max(0, Math.floor(upgrade.owned)) : 0,
      })),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Could not save game state:', error);
  }
}

function resetGameState() {
  points = 0;
  prestige = 0;
  gameStarted = false;
  upgrades.forEach((upgrade) => {
    upgrade.owned = 0;
  });
  syncDerivedStats();
  setGameVisibility(true);
  renderUpgrades();
  updateDisplay();
  saveGame();
}

function loadGame() {
  try {
    const saveData = localStorage.getItem(STORAGE_KEY);
    if (!saveData) {
      resetGameState();
      return;
    }

    const parsed = JSON.parse(saveData);
    const migrated = migrateSaveData(parsed);

    points = migrated.points;
    prestige = migrated.prestige;
    gameStarted = !!migrated.gameStarted;

    upgrades.forEach((upgrade) => {
      const savedUpgrade = migrated.upgrades.find((item) => item.id === upgrade.id);
      upgrade.owned = savedUpgrade ? Math.max(0, Math.floor(savedUpgrade.owned)) : 0;
    });

    syncDerivedStats();
    renderUpgrades();
    updateDisplay();
    setGameVisibility(!gameStarted);
    saveGame();
  } catch (error) {
    console.warn('Could not load save data:', error);
    resetGameState();
  }
}

function updateDisplay() {
  if (pointsEl) {
    pointsEl.textContent = formatNumber(points);
  }

  if (perClickEl) {
    perClickEl.textContent = formatNumber(pointsPerClick);
  }

  if (perSecondEl) {
    perSecondEl.textContent = formatNumber(pointsPerSecond);
  }

  if (prestigeDisplayEl) {
    prestigeDisplayEl.textContent = formatNumber(prestige);
  }

  const rebirthGain = Math.floor(points / PRESTIGE_THRESHOLD);
  if (prestigeInfoEl) {
    if (points >= PRESTIGE_THRESHOLD) {
      prestigeInfoEl.textContent = `Ready to rebirth for +${formatNumber(rebirthGain)} prestige.`;
    } else {
      prestigeInfoEl.textContent = `Need ${formatNumber(PRESTIGE_THRESHOLD)} points to rebirth.`;
    }
  }

  upgrades.forEach((upgrade) => {
    const button = document.querySelector(`[data-upgrade-id="${upgrade.id}"]`);
    if (!button) return;

    const cost = getUpgradeCost(upgrade);
    button.disabled = !gameStarted || points < cost;
    button.textContent = `Buy for ${formatNumber(cost)}`;
  });

  if (prestigeButton) {
    prestigeButton.disabled = !gameStarted || points < PRESTIGE_THRESHOLD;
  }
}

function gainPoints() {
  if (!gameStarted) return;
  points += pointsPerClick;
  updateDisplay();
  saveGame();
}

function buyUpgrade(upgradeId) {
  if (!gameStarted) return;

  const upgrade = upgrades.find((item) => item.id === upgradeId);
  if (!upgrade) return;

  const cost = getUpgradeCost(upgrade);
  if (points < cost) return;

  points -= cost;
  upgrade.owned += 1;
  syncDerivedStats();
  updateDisplay();
  saveGame();
}

function renderUpgrades() {
  if (!upgradesEl) return;

  upgradesEl.innerHTML = upgrades
    .map(
      (upgrade, index) => `
        <article class="upgrade">
          <h3>${index + 1}. ${upgrade.name}</h3>
          <p>${upgrade.description}</p>
          <div class="meta">
            <span class="cost">Cost: ${formatNumber(getUpgradeCost(upgrade))}</span>
            <span>Owned: ${upgrade.owned}</span>
          </div>
          <button data-upgrade-id="${upgrade.id}" type="button">Buy for ${formatNumber(getUpgradeCost(upgrade))}</button>
        </article>
      `
    )
    .join('');

  upgradesEl.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      buyUpgrade(button.dataset.upgradeId);
    });
  });

  updateDisplay();
}

function performPrestige() {
  if (!gameStarted || points < PRESTIGE_THRESHOLD) return;

  const prestigeGain = Math.floor(points / PRESTIGE_THRESHOLD);
  prestige += prestigeGain;
  points = 0;

  upgrades.forEach((upgrade) => {
    upgrade.owned = 0;
  });

  syncDerivedStats();
  renderUpgrades();
  updateDisplay();
  saveGame();
}

function startGame() {
  gameStarted = true;
  setGameVisibility(false);
  renderUpgrades();
  updateDisplay();
  saveGame();
}

function resetSave() {
  const confirmed = window.confirm('Reset your save and start over?');
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  resetGameState();
}

function gameLoop() {
  if (!gameStarted) return;
  points += pointsPerSecond;
  updateDisplay();
  saveGame();
}

if (gainButton) {
  gainButton.addEventListener('click', gainPoints);
}

if (startButton) {
  startButton.addEventListener('click', startGame);
}

if (prestigeButton) {
  prestigeButton.addEventListener('click', performPrestige);
}

if (resetSaveButton) {
  resetSaveButton.addEventListener('click', resetSave);
}

renderUpgrades();
loadGame();
setInterval(gameLoop, 1000);
