const KEY = 'kakeibo_v1';

const DEFAULT = {
  settings: {
    income: 200000,
    fixedCosts: {
      rent: 0,
      water: 0,
      wifi: 0,
      gas: 0,
      electricity: 0,
      rakuten: 0,
      phone: 0,
      nisa: 0,
      gym: 0,
      pc_loan: 0,
    },
  },
  goals: [],
  months: {},
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    return { ...structuredClone(DEFAULT), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT);
  }
}

export function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
