const KEY = 'kakeibo_v1';

const DEFAULT = {
  settings: {
    income: 200000,
    fixedCosts: {
      rent: 0, water: 0, gas: 0, electricity: 0, phone: 0, wifi: 0, nisa: 0,
    },
    variableBudgets: {
      grocery: 0, dining: 0, daily_goods: 0, transport: 0, car: 0,
      sports: 0, entertainment: 0, social: 0, beauty: 0, education: 0, clothing: 0, medical: 0,
    },
  },
  goals: [],
  months: {},
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const parsed = JSON.parse(raw);
    const def = structuredClone(DEFAULT);
    return {
      ...def,
      ...parsed,
      settings: {
        ...def.settings,
        ...parsed.settings,
        fixedCosts: { ...def.settings.fixedCosts, ...parsed.settings?.fixedCosts },
        variableBudgets: { ...def.settings.variableBudgets, ...parsed.settings?.variableBudgets },
      },
    };
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
