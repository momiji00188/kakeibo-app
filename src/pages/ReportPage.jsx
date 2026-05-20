import { calcSummary, FIXED_LABELS, VARIABLE_LABELS, goalMonthly, remainingMonths } from '../calc';

function Section({ title, total, rows }) {
  const hasRows = rows.some(r => r.value > 0);
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasRows ? 10 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>{title}</span>
        <span style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>{total.toLocaleString()}円</span>
      </div>
      {hasRows && rows.filter(r => r.value > 0).map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#777', borderTop: '1px solid #f5f5f5' }}>
          <span>{label}</span><span>{value.toLocaleString()}円</span>
        </div>
      ))}
      {!hasRows && <div style={{ fontSize: 12, color: '#ccc', marginTop: 6 }}>まだ入力がありません</div>}
    </div>
  );
}

export default function ReportPage({ data, monthData }) {
  const { fixed, variable, goalsMonthly, total, income, balance } = calcSummary(data.settings, monthData, data.goals);
  const plus = balance >= 0;

  const fixedRows = Object.entries(FIXED_LABELS).map(([k, label]) => ({ label, value: data.settings.fixedCosts[k] || 0 }));
  const varRows = Object.entries(VARIABLE_LABELS).map(([k, label]) => ({ label, value: monthData.variable?.[k] || 0 }));
  const goalRows = data.goals.map(g => ({ label: g.name, value: goalMonthly(g) }));

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <h2 style={{ padding: '20px 0 12px', fontSize: 17, color: '#333' }}>月次レポート</h2>

      {/* 損益サマリー */}
      <div style={{
        background: plus ? '#e8f5e9' : '#ffebee',
        borderRadius: 16, padding: 20, marginBottom: 12, textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>損益</div>
        <div style={{ fontSize: 38, fontWeight: 'bold', color: plus ? '#2e7d32' : '#c62828' }}>
          {plus ? '+' : ''}{balance.toLocaleString()}
          <span style={{ fontSize: 16, fontWeight: 'normal' }}>円</span>
        </div>
        {!plus && (
          <div style={{ fontSize: 13, color: '#e53935', marginTop: 8, background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '6px 12px', display: 'inline-block' }}>
            あと{Math.abs(balance).toLocaleString()}円 削るか稼ぐと黒字
          </div>
        )}
        {plus && (
          <div style={{ fontSize: 13, color: '#388e3c', marginTop: 8 }}>
            今月は黒字です 🎉
          </div>
        )}
      </div>

      {/* 収入 */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>収入</span>
          <span style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>{income.toLocaleString()}円</span>
        </div>
      </div>

      <Section title="固定費" total={fixed} rows={fixedRows} />
      <Section title="変動費" total={variable} rows={varRows} />
      {data.goals.length > 0 && <Section title="目標積立" total={goalsMonthly} rows={goalRows} />}

      {/* 総計 */}
      <div style={{ background: '#333', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#ccc' }}>総計（支出）</span>
          <span style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>{total.toLocaleString()}円</span>
        </div>
      </div>
    </div>
  );
}
