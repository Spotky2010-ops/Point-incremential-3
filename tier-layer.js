(() => {
  'use strict';

  const SAVE_KEY = 'point-incremential-3-save-v2';
  const TIER_UNLOCK_RANK = 40;
  const TIER_RESET_REQUIREMENT = 1_000_000_000;
  const TIER_POWER_PER_LEVEL = 10;
  const numberFormat = new Intl.NumberFormat();
  let tier = 0;

  function readSave() {
    try {
      const save = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      if (!save || typeof save !== 'object' || Array.isArray(save)) return {};
      return save;
    } catch (error) {
      console.warn('Could not read the TIER save data:', error);
      return {};
    }
  }

  function persistTier(save = readSave()) {
    save.tier = tier;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (error) {
      console.warn('Could not save TIER progress:', error);
    }
  }

  const initialSave = readSave();
  tier = Number.isFinite(initialSave.tier) ? Math.max(0, Math.floor(initialSave.tier)) : 0;

  // Keep the new currency inside the existing save file so older save data migrates cleanly.
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function setItemWithTier(key, value) {
    if (key === SAVE_KEY) {
      try {
        const save = JSON.parse(value);
        if (save && typeof save === 'object' && !Array.isArray(save)) {
          save.tier = tier;
          value = JSON.stringify(save);
        }
      } catch (error) {
        // Leave malformed values untouched; the original storage call will report any errors.
      }
    }
    return originalSetItem.call(this, key, value);
  };

  const card = document.createElement('section');
  card.className = 'prestige-panel';
  card.setAttribute('aria-labelledby', 'tier-reset-title');
  card.innerHTML = `
    <div>
      <p class="eyebrow">New Reset Layer</p>
      <h3 id="tier-reset-title">TIER Reset</h3>
      <p id="tier-reset-info" class="muted"></p>
    </div>
    <button id="tier-reset-button" class="prestige-layer-button" type="button">TIER Reset</button>
    <p id="tier-power-info" class="prestige-layer-caption"></p>
  `;

  const prestigeContent = document.querySelector('[data-panel="prestige"]');
  if (prestigeContent) prestigeContent.appendChild(card);

  const tierResetButton = document.getElementById('tier-reset-button');
  const tierInfo = document.getElementById('tier-reset-info');
  const tierPowerInfo = document.getElementById('tier-power-info');

  function refreshTierPanel() {
    const save = readSave();
    const rank = Number.isFinite(save.rank) ? save.rank : 0;
    const points = Number.isFinite(save.points) ? save.points : 0;
    const unlocked = rank >= TIER_UNLOCK_RANK;
    const resetGain = Math.floor(points / TIER_RESET_REQUIREMENT);

    if (tierInfo) {
      if (!unlocked) {
        tierInfo.textContent = `Unlocks at Rank ${TIER_UNLOCK_RANK}. A TIER reset clears points, Prestige, Rank, Super Prestige, and upgrades.`;
      } else if (points >= TIER_RESET_REQUIREMENT) {
        tierInfo.textContent = `Ready to reset for +${numberFormat.format(resetGain)} TIER. This resets all lower layers.`;
      } else {
        tierInfo.textContent = `Need ${numberFormat.format(TIER_RESET_REQUIREMENT)} points for a TIER reset. Current TIER: ${numberFormat.format(tier)}.`;
      }
    }

    if (tierPowerInfo) {
      tierPowerInfo.textContent = `Each TIER adds +${numberFormat.format(TIER_POWER_PER_LEVEL)} passive points per second. Current TIER power: +${numberFormat.format(tier * TIER_POWER_PER_LEVEL)} per second.`;
    }

    if (tierResetButton) {
      tierResetButton.disabled = !save.gameStarted || !unlocked || points < TIER_RESET_REQUIREMENT;
      tierResetButton.textContent = `TIER Reset (+${numberFormat.format(Math.max(0, resetGain))})`;
    }
  }

  if (tierResetButton) {
    tierResetButton.addEventListener('click', () => {
      const save = readSave();
      const rank = Number.isFinite(save.rank) ? save.rank : 0;
      const points = Number.isFinite(save.points) ? save.points : 0;
      if (!save.gameStarted || rank < TIER_UNLOCK_RANK || points < TIER_RESET_REQUIREMENT) return;

      const gain = Math.floor(points / TIER_RESET_REQUIREMENT);
      const confirmed = window.confirm(
        `TIER Reset for +${numberFormat.format(gain)} TIER? This will reset points, Prestige, Rank, Super Prestige, and all upgrades.`
      );
      if (!confirmed) return;

      tier += gain;
      save.points = 0;
      save.prestige = 0;
      save.superPrestige = 0;
      save.rank = 0;
      save.prestigeLayer = 0;
      if (Array.isArray(save.upgrades)) {
        save.upgrades = save.upgrades.map((upgrade) => ({ ...upgrade, owned: 0 }));
      }
      save.tier = tier;
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(save));
        window.location.reload();
      } catch (error) {
        console.warn('Could not complete the TIER reset:', error);
      }
    });
  }

  // Apply TIER power as passive production while keeping the main game save format intact.
  document.getElementById('gain-points')?.addEventListener('click', () => {
    if (tier <= 0) return;
    const save = readSave();
    if (!save.gameStarted) return;
    save.points = (Number.isFinite(save.points) ? save.points : 0) + tier;
    persistTier(save);
  });

  document.getElementById('reset-save')?.addEventListener('click', () => {
    // The main game's confirmation and reset handler run after this listener.
    const confirm = window.confirm;
    window.confirm = function confirmAndClearTier(message) {
      const accepted = confirm.call(this, message);
      if (accepted) tier = 0;
      window.confirm = confirm;
      return accepted;
    };
  }, true);

  window.setInterval(() => {
    if (tier > 0) {
      const save = readSave();
      if (save.gameStarted) {
        save.points = (Number.isFinite(save.points) ? save.points : 0) + tier * TIER_POWER_PER_LEVEL;
        persistTier(save);
      }
    }
    refreshTierPanel();
  }, 1000);

  refreshTierPanel();
})();
