const pointsEl = document.getElementById('points');
const perClickEl = document.getElementById('per-click');
const perSecondEl = document.getElementById('per-second');
const gainButton = document.getElementById('gain-points');
const upgradesEl = document.getElementById('upgrades');

let points = 0;
let pointsPerClick = 1;
let pointsPerSecond = 0;

const upgrades = [
  {
    id: 'cursor',
    name: 'Cursor Boost',
    description: 'A stronger cursor gives +1 point per click.',
    baseCost: 15,
    costScale: 1.25,
    clickBonus: 1,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'manual',
    name: 'Manual Power',
    description: 'Extra hand strength adds +2 points per click.',
    baseCost: 40,
    costScale: 1.35,
    clickBonus: 2,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'printer',
    name: 'Point Printer',
    description: 'Printers begin producing passive points.',
    baseCost: 75,
    costScale: 1.4,
    clickBonus: 0,
    passiveBonus: 1,
    owned: 0,
  },
  {
    id: 'operator',
    name: 'Operator Crew',
    description: 'Hire a few workers for +3 per click.',
    baseCost: 130,
    costScale: 1.5,
    clickBonus: 3,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'factory',
    name: 'Mini Factory',
    description: 'Automated production creates +5 per second.',
    baseCost: 220,
    costScale: 1.55,
    clickBonus: 0,
    passiveBonus: 5,
    owned: 0,
  },
  {
    id: 'research',
    name: 'Research Lab',
    description: 'New science improves your click power by +5.',
    baseCost: 350,
    costScale: 1.6,
    clickBonus: 5,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'drone',
    name: 'Drone Squad',
    description: 'Drones add +8 per second.',
    baseCost: 520,
    costScale: 1.65,
    clickBonus: 0,
    passiveBonus: 8,
    owned: 0,
  },
  {
    id: 'orbital',
    name: 'Orbital Relay',
    description: 'Space infrastructure gives +12 per click.',
    baseCost: 780,
    costScale: 1.7,
    clickBonus: 12,
    passiveBonus: 0,
    owned: 0,
  },
  {
    id: 'quantum',
    name: 'Quantum Engine',
    description: 'Quantum power creates +20 per second.',
    baseCost: 1100,
    costScale: 1.75,
    clickBonus: 0,
    passiveBonus: 20,
    owned: 0,
  },
  {
    id: 'legend',
    name: 'Legendary Core',
    description: 'The final upgrade adds +25 per click and +35 per second.',
    baseCost: 1600,
    costScale: 1.8,
    clickBonus: 25,
    passiveBonus: 35,
    owned: 0,
  },
];

function formatNumber(value) {
  return Math.floor(value).toLocaleString();
}

function getUpgradeCost(upgrade) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, upgrade.owned));
}

function updateDisplay() {
  pointsEl.textContent = formatNumber(points);
  perClickEl.textContent = formatNumber(pointsPerClick);
  perSecondEl.textContent = formatNumber(pointsPerSecond);

  upgrades.forEach((upgrade) => {
    const button = document.querySelector(`[data-upgrade-id="${upgrade.id}"]`);
    if (!button) return;

    const cost = getUpgradeCost(upgrade);
    button.disabled = points < cost;
    button.textContent = `Buy for ${formatNumber(cost)}`;
  });
}

function gainPoints() {
  points += pointsPerClick;
  updateDisplay();
}

function buyUpgrade(upgradeId) {
  const upgrade = upgrades.find((item) => item.id === upgradeId);
  if (!upgrade) return;

  const cost = getUpgradeCost(upgrade);
  if (points < cost) return;

  points -= cost;
  upgrade.owned += 1;
  pointsPerClick += upgrade.clickBonus;
  pointsPerSecond += upgrade.passiveBonus;

  updateDisplay();
}

function renderUpgrades() {
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

function gameLoop() {
  points += pointsPerSecond;
  updateDisplay();
}

gainButton.addEventListener('click', gainPoints);

renderUpgrades();
setInterval(gameLoop, 1000);
