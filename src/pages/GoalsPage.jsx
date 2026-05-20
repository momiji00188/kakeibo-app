import { useState } from 'react';
import { goalMonthly, remainingMonths } from '../calc';
import { currentMonthKey } from '../store';

const EMPTY_FORM = { name: '', amount: '', targetYearMonth: '' };

function GoalForm({ initial, onSave, onCancel, saveLabel }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');

  function handleSave() {
    setError('');
    if (!form.name.trim()) { setError('名前を入力してください'); return; }
    if (!Number(form.amount) || Number(form.amount) <= 0) { setError('必要金額を入力してください'); return; }
    if (!form.targetYearMonth || form.targetYearMonth < currentMonthKey()) { setError('期限は今月以降を設定してください'); return; }
    onSave(form);
  }

  return (
    <div>
      <input placeholder="例：海外旅行" value={form.name}
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
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>達成したい月</div>
        <input type="month" value={form.targetYearMonth} min={currentMonthKey()}
          onChange={e => setForm({ ...form, targetYearMonth: e.target.value })}
          style={{ width: '100%', padding: '11px 12px', border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 14 }}
        />
      </div>
      {form.amount && form.targetYearMonth && form.targetYearMonth >= currentMonthKey() && (
        <div style={{ background: '#f9fbe7', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#558B2F' }}>
          月{Math.ceil(Number(form.amount) / Math.max(1, remainingMonths(form.targetYearMonth))).toLocaleString()}円の積立で達成できます
        </div>
      )}
      {error && (
        <div style={{ background: '#ffebee', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#c62828' }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {onCancel && (
          <button onClick={onCancel} style={{ flex: 1, padding: 13, background: '#f5f5f5', color: '#888', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}>
            キャンセル
          </button>
        )}
        <button onClick={handleSave} style={{ flex: 2, padding: 13, background: '#4CAF50', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' }}>
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

export default function GoalsPage({ data, onUpdateGoals }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function add(form) {
    onUpdateGoals([...data.goals, {
      id: String(Date.now()),
      name: form.name.trim(),
      amount: Number(form.amount),
      targetYearMonth: form.targetYearMonth,
      saved: 0,
    }]);
    setShowForm(false);
  }

  function saveEdit(form) {
    onUpdateGoals(data.goals.map(g =>
      g.id === editingId
        ? { ...g, name: form.name.trim(), amount: Number(form.amount), targetYearMonth: form.targetYearMonth }
        : g
    ));
    setEditingId(null);
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
        <button onClick={() => { setShowForm(v => !v); setEditingId(null); }} style={{
          background: '#4CAF50', color: 'white', border: 'none', borderRadius: 20,
          padding: '8px 18px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
        }}>+ 追加</button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <GoalForm
            initial={EMPTY_FORM}
            onSave={add}
            onCancel={() => setShowForm(false)}
            saveLabel="登録する"
          />
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
        const isEditing = editingId === g.id;

        return (
          <div key={g.id}
            onDoubleClick={() => { if (!isEditing) { setEditingId(g.id); setShowForm(false); } }}
            style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 10, cursor: isEditing ? 'default' : 'pointer' }}
          >
            {isEditing ? (
              <GoalForm
                initial={{ name: g.name, amount: String(g.amount), targetYearMonth: g.targetYearMonth }}
                onSave={saveEdit}
                onCancel={() => setEditingId(null)}
                saveLabel="保存する"
              />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{g.name}</span>
                  <button onClick={() => remove(g.id)} style={{ background: '#ffebee', border: 'none', borderRadius: 8, color: '#e53935', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', padding: '4px 10px' }}>削除</button>
                </div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
                  目標 {g.amount.toLocaleString()}円 ／ {g.targetYearMonth.replace('-', '年')}月まで ／ 月{monthly.toLocaleString()}円 × {months}ヶ月
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
              </>
            )}
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
