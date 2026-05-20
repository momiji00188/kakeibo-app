import { useState } from 'react';
import { FIXED_LABELS, VARIABLE_LABELS, availableForVariable } from '../calc';
import { currentMonthKey } from '../store';

const TAB_STYLE_BASE = {
  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, transition: 'all 0.15s',
};

function AmountRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span style={{ fontSize: 14, color: '#333' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number" inputMode="numeric" min="0"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={{ width: 100, textAlign: 'right', border: '1px solid #e0e0e0', borderRadius: 8, padding: '7px 10px', fontSize: 14 }}
        />
        <span style={{ fontSize: 13, color: '#999', minWidth: 14 }}>円</span>
      </div>
    </div>
  );
}

function VariableRow({ label, value, budget, onChange }) {
  const spent = Number(value) || 0;
  const diff = budget > 0 ? budget - spent : null;
  const over = diff !== null && diff < 0;
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, color: '#333' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="number" inputMode="numeric" min="0"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder="0"
            style={{ width: 100, textAlign: 'right', border: '1px solid #e0e0e0', borderRadius: 8, padding: '7px 10px', fontSize: 14 }}
          />
          <span style={{ fontSize: 13, color: '#999', minWidth: 14 }}>円</span>
        </div>
      </div>
      {diff !== null && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 11, marginTop: 3, color: over ? '#c62828' : '#888' }}>
          予算{budget.toLocaleString()}円 ／ 残{over ? '' : '+'}{diff.toLocaleString()}円
        </div>
      )}
    </div>
  );
}

function MonthNav({ month, onChange }) {
  const [y, m] = month.split('-').map(Number);
  const prev = () => {
    const d = new Date(y, m - 2, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const next = () => {
    const d = new Date(y, m, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (next <= currentMonthKey()) onChange(next);
  };
  const isCurrentMonth = month === currentMonthKey();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderRadius: 12, padding: '10px 16px', marginBottom: 16 }}>
      <button onClick={prev} style={{ background: 'none', border: 'none', fontSize: 22, color: '#555', cursor: 'pointer', padding: '0 8px' }}>‹</button>
      <span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{y}年{m}月</span>
      <button onClick={next} disabled={isCurrentMonth} style={{ background: 'none', border: 'none', fontSize: 22, color: isCurrentMonth ? '#ddd' : '#555', cursor: isCurrentMonth ? 'default' : 'pointer', padding: '0 8px' }}>›</button>
    </div>
  );
}

export default function InputPage({ data, monthData, monthKey, onUpdateMonth, onUpdateSettings, onChangeInputMonth }) {
  const [tab, setTab] = useState('income');
  const variable = monthData.variable || {};
  const { fixedCosts, income, variableBudgets } = data.settings;

  const available = availableForVariable(data.settings, data.goals);
  const budgetTotal = Object.values(variableBudgets || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  const budgetOver = budgetTotal > available && available > 0;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <h2 style={{ padding: '20px 0 12px', fontSize: 17, color: '#333' }}>収支入力</h2>

      <MonthNav month={monthKey} onChange={onChangeInputMonth} />

      {/* タブ */}
      <div style={{ display: 'flex', background: 'white', borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>
        {[['income', '収入'], ['budget', '予算設定'], ['fixed', '固定費'], ['variable', '変動費']].map(([key, label]) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              ...TAB_STYLE_BASE,
              background: active ? '#4CAF50' : 'transparent',
              color: active ? 'white' : '#888',
              fontWeight: active ? 'bold' : 'normal',
            }}>{label}</button>
          );
        })}
      </div>

      {tab === 'budget' && (
        <div style={{ background: available > 0 ? (budgetOver ? '#fff3e0' : '#e8f5e9') : '#f5f5f5', borderRadius: 12, padding: '10px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#666' }}>変動費として使える額</span>
          <span style={{ fontSize: 15, fontWeight: 'bold', color: available > 0 ? '#2e7d32' : '#999' }}>{available.toLocaleString()}円</span>
        </div>
      )}
      {tab === 'budget' && budgetOver && (
        <div style={{ background: '#fff3e0', borderRadius: 10, padding: '8px 14px', marginBottom: 10, fontSize: 12, color: '#e65100' }}>
          予算合計 {budgetTotal.toLocaleString()}円 が使える額を超えています
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, padding: '4px 16px' }}>
        {tab === 'income' && (
          <AmountRow label="今月の収入" value={income}
            onChange={v => onUpdateSettings({ ...data.settings, income: Number(v) || 0 })}
          />
        )}

        {tab === 'budget' && Object.entries(VARIABLE_LABELS).map(([key, label]) => (
          <AmountRow key={key} label={label} value={variableBudgets?.[key]}
            onChange={v => onUpdateSettings({
              ...data.settings,
              variableBudgets: { ...variableBudgets, [key]: Number(v) || 0 },
            })}
          />
        ))}

        {tab === 'fixed' && Object.entries(FIXED_LABELS).map(([key, label]) => (
          <AmountRow key={key} label={label} value={fixedCosts[key]}
            onChange={v => onUpdateSettings({
              ...data.settings,
              fixedCosts: { ...fixedCosts, [key]: Number(v) || 0 },
            })}
          />
        ))}

        {tab === 'variable' && Object.entries(VARIABLE_LABELS).map(([key, label]) => (
          <VariableRow
            key={key} label={label} value={variable[key]}
            budget={Number(variableBudgets?.[key] || 0)}
            onChange={v => onUpdateMonth({ ...variable, [key]: Number(v) || 0 })}
          />
        ))}
      </div>
    </div>
  );
}
