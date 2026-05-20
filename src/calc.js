export const FIXED_LABELS = {
  rent: '家賃',
  water: '水道',
  wifi: 'WiFi',
  gas: 'ガス',
  electricity: '電気',
  rakuten: '楽天',
  phone: 'スマホ',
  nisa: 'NISA',
  gym: 'Gym',
  pc_loan: 'PC（福銀）',
};

export const VARIABLE_LABELS = {
  grocery: '食費',
  dining: '外食費',
  daily_goods: '日用雑貨',
  transport: '交通費',
  car: '車代',
  sports: 'スポーツ',
  entertainment: '娯楽',
  social: '交際費',
  beauty: '美容',
  education: '教養',
  clothing: '衣服',
  medical: '医療',
};

export function calcFixed(settings) {
  return Object.values(settings.fixedCosts).reduce((s, v) => s + (Number(v) || 0), 0);
}

export function calcVariable(monthData) {
  return Object.values(monthData.variable || {}).reduce((s, v) => s + (Number(v) || 0), 0);
}

export function remainingMonths(targetYearMonth) {
  const now = new Date();
  const [y, m] = targetYearMonth.split('-').map(Number);
  return Math.max(1, (y - now.getFullYear()) * 12 + (m - (now.getMonth() + 1)));
}

export function goalMonthly(g) {
  return Math.ceil(g.amount / remainingMonths(g.targetYearMonth));
}

export function calcGoalsMonthly(goals) {
  return goals.reduce((s, g) => s + goalMonthly(g), 0);
}

export function calcSummary(settings, monthData, goals) {
  const fixed = calcFixed(settings);
  const variable = calcVariable(monthData);
  const goalsMonthly = calcGoalsMonthly(goals);
  const total = fixed + variable + goalsMonthly;
  const income = Number(settings.income) || 0;
  return { fixed, variable, goalsMonthly, total, income, balance: income - total };
}
