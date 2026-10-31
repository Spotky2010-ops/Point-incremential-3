const STORAGE_KEY = 'point-incremential-3-save-v2';
const THEME_KEY = 'point-incremential-3-theme';
const SAVE_VERSION = 2;
const PRESTIGE_THRESHOLD = 1000;
const BASE_PER_CLICK = 1;
const BASE_PER_SECOND = 0;
const RANK_START_THRESHOLD = 1000;
const RANK_GROWTH = 1.35;
const RANK_TITLES = ['Rookie', 'Pro', 'Elite', 'Legend', 'Mythic', 'Ascendant', 'Grandmaster', 'Supermaster'];
const TIER_BURST_REWARDS = [500, 2000, 10000, 100000, 1000000, 10000000];

const pointsEl = document.getElementById('points');
const perClickEl = document.getElementById('per-click');
const perSecondEl = document.getElementById('per-second');
const prestigeDisplayEl = document.getElementById('prestige-display');
const rankDisplayEl = document.getElementById('rank-display');
const prestigeInfoEl = document.getElementById('prestige-info');
const rankInfoEl = document.getElementById('rank-info');
const gainButton = document.getElementById('gain-points');
const upgradesEl = document.getElementById('upgrades');
const startButton = document.getElementById('start-button');
const prestigeButton = document.getElementById('prestige-button');
const rankUpButton = document.getElementById('rank-up-button');
const resetSaveButton = document.getElementById('reset-save');
const startScreen = document.getElementById('start-screen');
const gameApp = document.getElementById('game-app');
const settingsToggle = document.getElementById('settings-toggle');
const settingsDropdown = document.getElementById('settings-dropdown');
const themeButton = document.getElementById('theme-toggle');
const themeModeButton = document.getElementById('theme-mode');
const themeStatusBadge = document.getElementById('theme-status-badge');

let points = 0;
let pointsPerClick = BASE_PER_CLICK;
let pointsPerSecond = BASE_PER_SECOND;
let prestige = 0;
let rank = 0;
let gameStarted = false;
let themePreference = 'auto';

const upgrades = [
  {
    id: 'cursor',
    name: 'Basic Cursor',
    description: 'A stronger cursor gives +1 point per click.',
    baseCost: 12,
    costScale: 1.05,
    clickBonus: 1,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'manual',
    name: 'Manual Power',
    description: 'Extra hand strength adds +2 points per click.',
    baseCost: 35,
    costScale: 1.1,
    clickBonus: 2,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'printer',
    name: 'Point Printer',
    description: 'Printers begin producing passive points.',
    baseCost: 90,
    costScale: 1.15,
    clickBonus: 0,
    passiveBonus: 1,
    owned: 0,
  },
  {
    id: 'operator',
    name: 'Operator Crew',
    description: 'Hire a few workers for +3 per click.',
    baseCost: 180,
    costScale: 1.2,
    clickBonus: 3,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'factory',
    name: 'Mini Factory',
    description: 'Automated production creates +5 per second.',
    baseCost: 320,
    costScale: 1.25,
    clickBonus: 0,
    passiveBonus: 5,
    owned: 0,
  },
  {
    id: 'research',
    name: 'Research Lab',
    description: 'New science improves your click power by +5.',
    baseCost: 500,
    costScale: 1.3,
    clickBonus: 5,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'drone',
    name: 'Drone Squad',
    description: 'Drones add +8 per second.',
    baseCost: 800,
    costScale: 1.35,
    clickBonus: 0,
    passiveBonus: 8,
    owned: 0,
  },
  {
    id: 'orbital',
    name: 'Orbital Relay',
    description: 'Space infrastructure gives +12 per click.',
    baseCost: 1200,
    costScale: 1.4,
    clickBonus: 12,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'quantum',
    name: 'Quantum Engine',
    description: 'Quantum power creates +20 per second.',
    baseCost: 1800,
    costScale: 1.425,
    clickBonus: 0,
    passiveBonus: 20,
    owned: 0,
  },
  {
    id: 'legend',
    name: 'Legendary Core',
    description: 'adds +25 per click and +35 per second.',
    baseCost: 2500,
    costScale: 1.45,
    clickBonus: 25,
    passiveBonus: 35,
    owned: 0,
  },
  {
    id: 'Master',
    name: 'Master Core',
    description: 'adds +50 per click and +100 per second.',
    baseCost: 5000,
    costScale: 1.475,
    clickBonus: 50,
    passiveBonus: 100,
    owned: 0,
  },
  {
    id: 'Genius',
    name: 'Genius',
    description: 'adds +150 per click and +500 per second.',
    baseCost: 7500,
    costScale: 1.45,
    clickBonus: 150,
    passiveBonus: 500,
    owned: 0,
  },
  {
    id: 'Super Genius',
    name: ' Super Genius',
    description: 'adds +500 per click and +1000 per second.',
    baseCost: 10000,
    costScale: 1.40,
    clickBonus: 500,
    passiveBonus: 1000,
    owned: 0,
  },
  {
    id: 'Upgrade 14',
    name: 'Upgrade 14',
    description: 'adds +1.5K per click and +3K per second.',
    baseCost: 50000,
    costScale: 1.35,
    clickBonus: 1500,
    passiveBonus: 3000,
    owned: 0,
  },
    {
    id: 'Upgrade 15',
    name: ' Upgrade 15',
    description: 'adds +5K per click and +10K per second.',
    baseCost: 100000,
    costScale: 1.325,
    clickBonus: 5000,
    passiveBonus: 10000,
    owned: 0,
  },
    {
    id: 'Upgrade 16',
    name: 'Upgrade 16',
    description: 'adds +20K per click and +50K per second.',
    baseCost: 150000,
    costScale: 1.3,
    clickBonus: 20000,
    passiveBonus: 50000,
    owned: 0,
  },
  {
    id: 'Upgrade 17',
    name: 'Upgrade 17',
    description: 'adds +50K per click and +100K per second.',
    baseCost: 150000,
    costScale: 1.3,
    clickBonus: 50000,
    passiveBonus: 100000,
    owned: 0,
  },
  {
    id: 'Upgrade 18',
    name: 'Upgrade 18',
    description: 'adds +200K per click and +500K per second.',
    baseCost: 150000,
    costScale: 1.3,
    clickBonus: 200000,
    passiveBonus: 500000,
    owned: 0,
  },
  {
    id: 'Upgrade 19',
    name: 'Upgrade 19',
    description: 'adds +500K per click and +1M per second.',
    baseCost: 150000,
    costScale: 1.3,
    clickBonus: 500000,
    passiveBonus: 1000000,
    owned: 0,
  },
  {
    id: 'Upgrade 20',
    name: 'Upgrade 20',
    description: 'The final upgrade adds +7.5M per click and +15M per second.',
    baseCost: 150000,
    costScale: 1.3,
    clickBonus: 7500000,
    passiveBonus: 15000000,
    owned: 0,
  },
];

function getRankTitle(level) {
  return RANK_TITLES[Math.min(Math.max(level, 0), RANK_TITLES.length - 1)];
}

function getRankRequirement(level) {
  return Math.floor(RANK_START_THRESHOLD * Math.pow(RANK_GROWTH, Math.max(level, 0)));
}

function getRankReward(level) {
  const burstTier = Math.min(Math.floor(level / 2), TIER_BURST_REWARDS.length - 1);
  return TIER_BURST_REWARDS[burstTier];
}

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

function showTierBurstPopup(amount) {
  const existingPopup = document.querySelector('.tier-burst-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement('div');
  popup.className = 'tier-burst-popup';
  popup.textContent = `Tier Burst! +${formatNumber(amount)}`;

  popup.style.position = 'fixed';
  popup.style.top = '20px';
  popup.style.right = '20px';
  popup.style.zIndex = '9999';
  popup.style.padding = '12px 18px';
  popup.style.borderRadius = '14px';
  popup.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.96), rgba(34,197,94,0.96), rgba(250,204,21,0.9))';
  popup.style.color = '#fff';
  popup.style.fontWeight = '800';
  popup.style.fontSize = '1rem';
  popup.style.letterSpacing = '0.04em';
  popup.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.52), 0 0 18px rgba(124,58,237,0.8), 0 0 30px rgba(250,204,21,0.6), 0 0 50px rgba(34,197,94,0.45)';
  popup.style.border = '1px solid rgba(255,255,255,0.7)';
  popup.style.opacity = '0';
  popup.style.transform = 'translateY(-18px) scale(0.92) rotate(-3deg)';
  popup.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
  popup.style.filter = 'saturate(1.5)';
  popup.style.textShadow = '0 0 12px rgba(255,255,255,0.5)';

  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0) scale(1.08) rotate(0deg)';
  });

  window.setTimeout(() => {
    popup.style.opacity = '0';
    popup.style.transform = 'translateY(-8px) scale(0.98) rotate(1deg)';
    window.setTimeout(() => popup.remove(), 200);
  }, 1200);
}

function getUpgradeCost(upgrade) {
  const owned = Number.isFinite(upgrade.owned) ? Math.max(0, Math.floor(upgrade.owned)) : 0;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, owned));
}

function syncDerivedStats() {
  let clickPower = BASE_PER_CLICK + prestige + rank * 2;
  let passivePower = BASE_PER_SECOND + prestige + rank * 3;

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

  return upgrades.map((upgrade) => ({
    id: upgrade.id,
    owned: upgrade.owned,
  }));
}

function migrateSaveData(rawSave) {
  const fallback = {
    version: SAVE_VERSION,
    points: 0,
    prestige: 0,
    rank: 0,
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

  if (typeof rawSave.rank === 'number' && Number.isFinite(rawSave.rank)) {
    migrated.rank = Math.max(0, rawSave.rank);
  }

  if (typeof rawSave.gameStarted === 'boolean') {
    migrated.gameStarted = rawSave.gameStarted;
  }

  return migrated;
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function updateThemeStatusBadge() {
  if (!themeStatusBadge) return;

  const label = themePreference === 'auto' ? 'Auto' : themePreference.charAt(0).toUpperCase() + themePreference.slice(1);
  const themeName = themePreference === 'auto' ? `${getSystemTheme()} (system)` : themePreference;
  themeStatusBadge.textContent = `Saved: ${label}`;
  themeStatusBadge.title = `Theme saved as ${themeName}`;
}

function updateThemeControls() {
  if (!themeButton || !themeModeButton) return;

  const activeTheme = themePreference === 'auto' ? getSystemTheme() : themePreference;
  const isLight = activeTheme === 'light';

  themeButton.setAttribute('aria-pressed', String(isLight));
  themeButton.innerHTML = `
    <span class="theme-toggle__icon">${isLight ? '☀️' : '🌙'}</span>
    <span class="theme-toggle__label">${isLight ? 'Light' : 'Dark'}</span>
  `;

  const modeLabel = themePreference === 'auto' ? 'Auto' : themePreference.charAt(0).toUpperCase() + themePreference.slice(1);
  themeModeButton.innerHTML = `
    <span class="theme-mode__icon">${themePreference === 'auto' ? '◐' : isLight ? '☀️' : '🌙'}</span>
    <span class="theme-mode__label">${modeLabel}</span>
  `;

  updateThemeStatusBadge();
}

function applyTheme(nextPreference) {
  const normalizedPreference = nextPreference === 'light' || nextPreference === 'dark' || nextPreference === 'auto'
    ? nextPreference
    : 'auto';

  themePreference = normalizedPreference;
  const activeTheme = normalizedPreference === 'auto' ? getSystemTheme() : normalizedPreference;

  document.body.setAttribute('data-theme', activeTheme);
  updateThemeControls();

  try {
    localStorage.setItem(THEME_KEY, normalizedPreference);
  } catch (error) {
    console.warn('Could not save theme preference:', error);
  }
}

function toggleTheme() {
  const activeTheme = themePreference === 'auto' ? getSystemTheme() : themePreference;
  const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
  applyTheme(nextTheme);
}

function cycleThemeMode() {
  const modes = ['auto', 'light', 'dark'];
  const currentIndex = modes.indexOf(themePreference);
  const nextIndex = (currentIndex + 1) % modes.length;
  applyTheme(modes[nextIndex]);
}

function setDropdownOpen(isOpen) {
  if (!settingsDropdown || !settingsToggle) return;
  settingsDropdown.classList.toggle('is-open', isOpen);
  settingsToggle.setAttribute('aria-expanded', String(isOpen));
}

function toggleDropdown() {
  if (!settingsDropdown) return;
  const isOpen = settingsDropdown.classList.contains('is-open');
  setDropdownOpen(!isOpen);
}

function saveGame() {
  try {
    const payload = {
      version: SAVE_VERSION,
      points,
      prestige,
      rank,
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
  rank = 0;
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
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
      applyTheme(savedTheme);
    } else {
      applyTheme('auto');
    }

    const saveData = localStorage.getItem(STORAGE_KEY);
    if (!saveData) {
      resetGameState();
      return;
    }

    const parsed = JSON.parse(saveData);
    const migrated = migrateSaveData(parsed);

    points = migrated.points;
    prestige = migrated.prestige;
    rank = migrated.rank;
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

  if (rankDisplayEl) {
    rankDisplayEl.textContent = `${formatNumber(rank)} (${getRankTitle(rank)})`;
  }

  const rebirthGain = Math.floor(points / PRESTIGE_THRESHOLD);
  if (prestigeInfoEl) {
    if (points >= PRESTIGE_THRESHOLD) {
      prestigeInfoEl.textContent = `Ready to rebirth for +${formatNumber(rebirthGain)} prestige.`;
    } else {
      prestigeInfoEl.textContent = `Need ${formatNumber(PRESTIGE_THRESHOLD)} points to rebirth.`;
    }
  }

  const nextRankRequirement = getRankRequirement(rank);
  const nextRankTitle = getRankTitle(rank + 1);
  const nextTierReward = getRankReward(rank);
  if (rankInfoEl) {
    if (points >= nextRankRequirement) {
      rankInfoEl.textContent = `Ready to rank up to ${nextRankTitle} and earn a Tier Burst bonus of +${formatNumber(nextTierReward)}.`;
    } else {
      rankInfoEl.textContent = `Need ${formatNumber(nextRankRequirement)} points to rank up to ${nextRankTitle} for +${formatNumber(nextTierReward)} bonus.`;
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

  if (rankUpButton) {
    rankUpButton.disabled = !gameStarted || points < nextRankRequirement;
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

function performRankUp() {
  if (!gameStarted) return;

  const nextRequirement = getRankRequirement(rank);
  if (points < nextRequirement) return;

  const reward = getRankReward(rank);
  rank += 1;
  points += reward;
  prestige = 0;

  showTierBurstPopup(reward);

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

if (rankUpButton) {
  rankUpButton.addEventListener('click', performRankUp);
}

if (resetSaveButton) {
  resetSaveButton.addEventListener('click', resetSave);
}

if (settingsToggle) {
  settingsToggle.addEventListener('click', toggleDropdown);
}

if (themeButton) {
  themeButton.addEventListener('click', () => {
    toggleTheme();
    setDropdownOpen(false);
  });
}

if (themeModeButton) {
  themeModeButton.addEventListener('click', () => {
    cycleThemeMode();
    setDropdownOpen(false);
  });
}

document.addEventListener('click', (event) => {
  if (!settingsDropdown || !settingsToggle) return;

  const clickedInside = settingsDropdown.contains(event.target) || settingsToggle.contains(event.target);
  if (!clickedInside) {
    setDropdownOpen(false);
  }
});

const prefersColorScheme = window.matchMedia('(prefers-color-scheme: light)');
if (typeof prefersColorScheme.addEventListener === 'function') {
  prefersColorScheme.addEventListener('change', () => {
    if (themePreference === 'auto') {
      applyTheme('auto');
    }
  });
} else if (typeof prefersColorScheme.addListener === 'function') {
  prefersColorScheme.addListener(() => {
    if (themePreference === 'auto') {
      applyTheme('auto');
    }
  });
}

renderUpgrades();
loadGame();
setInterval(gameLoop, 1000);
