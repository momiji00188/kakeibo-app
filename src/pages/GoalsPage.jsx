import { useState } from 'react';
import { goalMonthly, remainingMonths } from '../calc';

const EMPTY_FORM = { name: '', amount: '', months: '' };

export default function GoalsPage({ data, onUpdateGoals }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  function add() {
    const { name, amount, months } = form;
    if (!name.trim() || !Number(amount) || !Number(months)) return;
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + Number(months), 1);
    const targetYearMonth = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    onUpdateGoals([...data.goals, {
      id: String(Date.now()),
      name: name.trim(),
      amount: Number(amount),
      targetYearMonth,
      saved: 0,
    }]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function remove(id) {
    onUpdateGoals(data.goals.filter(g => g.id !== id));
  }

  function addSaved(id, delta) {
    onUpdateGoals(data.goals.map(g =>
      g.id === id ? { ...g, saved: Math.min(g.amount, Math.max(0, (g.saved || 0) + delta)) } : g
    ));
  }

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 12px' }}>
        <h2 style={{ fontSize: 17, color: '#333' }}>やりたいこと</h2>
        <button onClick={() => setShowForm(v => !v)} style={{
          background: '#4CAF50', color: 'white', border: 'none', borderRadius: 20,
          padding: '8px 18px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
        }}>+ 追加</button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <input placeholder="例：バイク教習所" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', padding: '11px 12px', border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 14, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input placeholder="必要金額" type="number" inputMode="numeric" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              style={{ flex: 1, padding: '11px 12px', border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 14 }}
            />
            <span style={{ alignSelf: 'center', color: '#999', fontSize: 13 }}>円</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input placeholder="何ヶ月後" type="number" inputMode="numeric" value={form.months}
              onChange={e => setForm({ ...form, months: e.target.value })}
              style={{ flex: 1, padding: '11px 12px', border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 14 }}
            />
            <span style={{ alignSelf: 'center', color: '#999', fontSize: 13 }}>ヶ月後</span>
          </div>
          {form.name && form.amount && form.months && (
            <div style={{ background: '#f9fbe7', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#558B2F' }}>
              月{Math.ceil(Number(form.amount) / Math.max(1, Number(form.months))).toLocaleString()}円の積立で達成できます
            </div>
          )}
          <button onClick={add} style={{
            width: '100%', padding: 13, background: '#4CAF50', color: 'white',
            border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer',
          }}>登録する</button>
        </div>
      )}

      {data.goals.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: '#ccc', padding: '50px 0', fontSize: 14 }}>
          「+ 追加」でやりたいことを登録しましょう
        </div>
      )}

      {data.goals.map(g => {
        const months = remainingMonths(g.targetYearMonth);
        const monthly = goalMonthly(g);
        const pct = Math.min(100, Math.round((g.saved || 0) / g.amount * 100));
        return (
          <div key={g.id} style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{g.name}</span>
              <button onClick={() => remove(g.id)} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
              目標 {g.amount.toLocaleString()}円 ／ 月{monthly.toLocaleString()}円 × {months}ヶ月
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ background: pct >= 100 ? '#FF9800' : '#4CAF50', width: `${pct}%`, height: '100%', borderRadius: 6, transition: 'width 0.3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#aaa' }}>{(g.saved || 0).toLocaleString()}円 貯まった</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => addSaved(g.id, -monthly)} style={btnStyle('#f5f5f5', '#888')}>－</button>
                <button onClick={() => addSaved(g.id, monthly)} style={btnStyle('#e8f5e9', '#2e7d32')}>＋今月分</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    background: bg, color, border: 'none', borderRadius: 8,
    padding: '6px 12px', fontSize: 13, cursor: 'pointer', fontWeight: 'bold',
  };
}
