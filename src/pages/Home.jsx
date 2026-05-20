import { calcSummary, goalMonthly, remainingMonths } from '../calc';

export default function Home({ data, monthData }) {
  const { fixed, variable, goalsMonthly, total, income, balance } = calcSummary(data.settings, monthData, data.goals);
  const plus = balance >= 0;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <h2 style={{ padding: '20px 0 12px', fontSize: 17, color: '#333' }}>今月のサマリー</h2>

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

      {/* やりたいこと */}
      {data.goals.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 10 }}>🎯 やりたいこと</div>
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
