const NOTATION_TIERS = [
  { value: 1e3, suffix: "K" },
  { value: 1e6, suffix: "M" },
  { value: 1e9, suffix: "B" },
  { value: 1e12, suffix: "T" },
  { value: 1e15, suffix: "Qa" },
  { value: 1e18, suffix: "Qi" },
  { value: 1e21, suffix: "Sx" },
  { value: 1e24, suffix: "Sp" },
  { value: 1e27, suffix: "Oc" },
  { value: 1e30, suffix: "N" },
  { value: 1e33, suffix: "D" },
  { value: 1e36, suffix: "UD" },
  { value: 1e39, suffix: "DD" },
  { value: 1e42, suffix: "TD" },
  { value: 1e45, suffix: "qD" },
  { value: 1e48, suffix: "QD" },
  { value: 1e51, suffix: "sD" },
  { value: 1e54, suffix: "SD" },
  { value: 1e57, suffix: "OD" },
  { value: 1e60, suffix: "ND" },
  { value: 1e63, suffix: "aa" },
  { value: 1e66, suffix: "ab" },
  { value: 1e69, suffix: "ac" },
  { value: 1e72, suffix: "ad" }
];

function formatTieredNumber(value) {
  if (value < 1e3) return Math.floor(value).toString();

  for (let i = NOTATION_TIERS.length - 1; i >= 0; i--) {
    const tier = NOTATION_TIERS[i];
    if (value >= tier.value) {
      const scaled = value / tier.value;
      return `${scaled.toFixed(2)} ${tier.suffix}`;
    }
  }

  return value.toExponential(2);
}
