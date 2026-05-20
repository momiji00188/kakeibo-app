import { calcSummary, goalMonthly, remainingMonths, availableForVariable, VARIABLE_LABELS } from '../calc';
import { currentMonthKey } from '../store';

function MonthNav({ month, onChange }) {
  const [y, m] = month.split('-').map(Number);
  const prev = () => {
    const d = new Date(y, m - 2, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const next = () => {
    const d = new Date(y, m, 1);
    const nxt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (nxt <= currentMonthKey()) onChange(nxt);
  };
  const isCurrentMonth = month === currentMonthKey();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 12px' }}>
      <button onClick={prev} style={{ background: 'none', border: 'none', fontSize: 22, color: '#555', cursor: 'pointer', padding: '0 4px' }}>‹</button>
      <h2 style={{ fontSize: 17, color: '#333', fontWeight: 'bold' }}>
        {y}年{m}月のサマリー{isCurrentMonth ? '' : ' (過去)'}
      </h2>
      <button onClick={next} disabled={isCurrentMonth} style={{ background: 'none', border: 'none', fontSize: 22, color: isCurrentMonth ? '#ddd' : '#555', cursor: isCurrentMonth ? 'default' : 'pointer', padding: '0 4px' }}>›</button>
    </div>
  );
}

export default function Home({ data, monthData, monthKey, onChangeInputMonth }) {
  const { fixed, variable, goalsMonthly, total, income, balance } = calcSummary(data.settings, monthData, data.goals);
  const plus = balance >= 0;

  const available = availableForVariable(data.settings, data.goals);
  const budgets = data.settings.variableBudgets || {};
  const hasBudgets = Object.values(budgets).some(v => Number(v) > 0);

  const missingIncome = !income;
  const missingRent = !data.settings.fixedCosts.rent;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <MonthNav month={monthKey} onChange={onChangeInputMonth} />

      {/* 警告 */}
      {(missingIncome || missingRent) && (
        <div style={{ background: '#fff3e0', borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#e65100' }}>
          {missingIncome && <div>・収入が未入力です（入力タブから設定してください）</div>}
          {missingRent && <div>・家賃が未入力です（固定費タブから設定してください）</div>}
        </div>
      )}

      {/* 損益 */}
      <div style={{
        background: plus ? '#e8f5e9' : '#ffebee',
        borderRadius: 16, padding: '20px 20px 16px', marginBottom: 12, textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>損益</div>
        <div style={{ fontSize: 40, fontWeight: 'bold', color: plus ? '#2e7d32' : '#c62828', letterSpacing: -1 }}>
          {plus ? '+' : ''}{balance.toLocaleString()}
          <span style={{ fontSize: 16, fontWeight: 'normal' }}>円</span>
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
          収入 {income.toLocaleString()}円 ー 総計 {total.toLocaleString()}円
        </div>
      </div>

      {/* 内訳 */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 10 }}>内訳</div>
        {[
          { label: '固定費', value: fixed, color: '#1976D2' },
          { label: '変動費', value: variable, color: '#F57C00' },
          { label: '目標積立', value: goalsMonthly, color: '#7B1FA2' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 14, color: '#555' }}>{label}</span>
            </div>
            <span style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{value.toLocaleString()}円</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 2px', fontWeight: 'bold' }}>
          <span style={{ fontSize: 14, color: '#333' }}>合計</span>
          <span style={{ fontSize: 14, color: '#333' }}>{total.toLocaleString()}円</span>
        </div>
      </div>

      {/* 変動費カテゴリ別 */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>変動費の内訳</div>
          <div style={{ fontSize: 12, color: '#999' }}>使える額 {available.toLocaleString()}円</div>
        </div>
        {Object.entries(VARIABLE_LABELS).map(([key, label]) => {
          const spent = Number(monthData.variable?.[key] || 0);
          const budget = Number(budgets[key] || 0);
          if (!hasBudgets && spent === 0) return null;
          const pct = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : null;
          const over = budget > 0 && spent > budget;
          return (
            <div key={key} style={{ marginBottom: hasBudgets ? 10 : 0, paddingBottom: hasBudgets ? 0 : 4, borderBottom: !hasBudgets ? '1px solid #f5f5f5' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: hasBudgets ? 4 : 0 }}>
                <span style={{ fontSize: 13, color: '#555' }}>{label}</span>
                <span style={{ fontSize: 13, color: over ? '#c62828' : '#333' }}>
                  {spent.toLocaleString()}円{budget > 0 ? ` / ${budget.toLocaleString()}円` : ''}
                </span>
              </div>
              {hasBudgets && budget > 0 && (
                <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: over ? '#ef5350' : '#4CAF50', width: `${pct}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
              )}
            </div>
          );
        })}
        {!hasBudgets && variable === 0 && (
          <div style={{ fontSize: 12, color: '#ccc', textAlign: 'center', padding: '10px 0' }}>まだ変動費が入力されていません</div>
        )}
        {!hasBudgets && (
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 8, textAlign: 'center' }}>「予算設定」タブで各カテゴリの目標を設定できます</div>
        )}
      </div>

      {/* やりたいこと */}
      {data.goals.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 10 }}>やりたいこと</div>
          {data.goals.map(g => {
            const months = remainingMonths(g.targetYearMonth);
            const monthly = goalMonthly(g);
            const pct = Math.min(100, Math.round((g.saved || 0) / g.amount * 100));
            return (
              <div key={g.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: '#333' }}>{g.name}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>月{monthly.toLocaleString()}円・あと{months}ヶ月</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                  <div style={{ background: '#4CAF50', width: `${pct}%`, height: '100%', borderRadius: 6, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 2 }}>
                  {(g.saved || 0).toLocaleString()}円 / {g.amount.toLocaleString()}円
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
