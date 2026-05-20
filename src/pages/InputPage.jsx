import { useState } from 'react';
import { FIXED_LABELS, VARIABLE_LABELS } from '../calc';

const TAB_STYLE_BASE = {
  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, transition: 'all 0.15s',
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

export default function InputPage({ data, monthData, onUpdateMonth, onUpdateSettings }) {
  const [tab, setTab] = useState('variable');
  const variable = monthData.variable || {};
  const { fixedCosts, income } = data.settings;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <h2 style={{ padding: '20px 0 12px', fontSize: 17, color: '#333' }}>収支入力</h2>

      {/* タブ */}
      <div style={{ display: 'flex', background: 'white', borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>
        {[['variable', '変動費'], ['fixed', '固定費'], ['income', '収入']].map(([key, label]) => {
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

      <div style={{ background: 'white', borderRadius: 16, padding: '4px 16px' }}>
        {tab === 'variable' && Object.entries(VARIABLE_LABELS).map(([key, label]) => (
          <AmountRow key={key} label={label} value={variable[key]}
            onChange={v => onUpdateMonth({ ...variable, [key]: Number(v) || 0 })}
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

        {tab === 'income' && (
          <AmountRow label="今月の収入" value={income}
            onChange={v => onUpdateSettings({ ...data.settings, income: Number(v) || 0 })}
          />
        )}
      </div>
    </div>
  );
}
