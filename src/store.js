import { generateClient } from 'aws-amplify/data';

const client = generateClient();

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

let cachedId = null;

export async function load() {
  try {
    const { data: items, errors } = await client.models.UserData.list();
    if (errors) { console.error('load error:', JSON.stringify(errors)); return structuredClone(DEFAULT); }
    if (!items || items.length === 0) return structuredClone(DEFAULT);
    cachedId = items[0].id;
    const raw = items[0].payload;
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const def = structuredClone(DEFAULT);
    return {
      ...def,
      ...payload,
      settings: {
        ...def.settings,
        ...payload.settings,
        fixedCosts: { ...def.settings.fixedCosts, ...payload.settings?.fixedCosts },
        variableBudgets: { ...def.settings.variableBudgets, ...payload.settings?.variableBudgets },
      },
    };
  } catch (e) {
    console.error('load exception:', e);
    return structuredClone(DEFAULT);
  }
}

export async function save(data) {
  try {
    if (cachedId) {
      const { errors } = await client.models.UserData.update({ id: cachedId, payload: JSON.stringify(data) });
      if (errors) console.error('save update error:', JSON.stringify(errors));
    } else {
      const { data: item, errors } = await client.models.UserData.create({ payload: JSON.stringify(data) });
      if (errors) {
        console.error('save create error:', JSON.stringify(errors));
      } else if (item) {
        cachedId = item.id;
      } else {
        console.error('save create: data is null, unknown error');
      }
    }
  } catch (e) {
    console.error('save exception:', e);
  }
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
