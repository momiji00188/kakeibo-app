import { useState } from 'react';
import { calcSummary, FIXED_LABELS, VARIABLE_LABELS, goalMonthly, availableForVariable } from '../calc';
import { currentMonthKey } from '../store';

function exportCsv(data) {
  const varKeys = Object.keys(VARIABLE_LABELS);
  const fixedKeys = Object.keys(FIXED_LABELS);
  const headers = [
    '月', '収入', '固定費合計', '変動費合計', '目標積立合計', '損益',
    ...Object.values(VARIABLE_LABELS),
    ...Object.values(FIXED_LABELS),
  ];

  const rows = Object.entries(data.months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthData]) => {
      const { fixed, variable, goalsMonthly, income, balance } = calcSummary(data.settings, monthData, data.goals);
      const varValues = varKeys.map(k => monthData.variable?.[k] || 0);
      const fixedValues = fixedKeys.map(k => data.settings.fixedCosts[k] || 0);
      return [month, income, fixed, variable, goalsMonthly, balance, ...varValues, ...fixedValues];
    });

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const bom = '﻿'; // Excel用UTF-8 BOM
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kakeibo.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function Section({ title, total, rows }) {
  const hasRows = rows.some(r => r.value > 0);
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasRows ? 10 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>{title}</span>
        <span style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>{total.toLocaleString()}円</span>
      </div>
      {hasRows && rows.filter(r => r.value > 0).map(({ label, value, budget }) => (
        <div key={label} style={{ padding: '6px 0', borderTop: '1px solid #f5f5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#777' }}>
            <span>{label}</span>
            <span style={{ color: budget > 0 && value > budget ? '#c62828' : '#777' }}>
              {value.toLocaleString()}円{budget > 0 ? ` / ${budget.toLocaleString()}円` : ''}
            </span>
          </div>
          {budget > 0 && (
            <div style={{ background: '#f0f0f0', borderRadius: 3, height: 4, overflow: 'hidden', marginTop: 4 }}>
              <div style={{
                background: value > budget ? '#ef5350' : '#4CAF50',
                width: `${Math.min(100, Math.round(value / budget * 100))}%`,
                height: '100%', borderRadius: 3,
              }} />
            </div>
          )}
        </div>
      ))}
      {!hasRows && <div style={{ fontSize: 12, color: '#ccc', marginTop: 6 }}>まだ入力がありません</div>}
    </div>
  );
}

function MonthNav({ months, selected, onSelect }) {
  const keys = Object.keys(months).sort();
  const cur = currentMonthKey();
  if (!keys.includes(cur)) keys.push(cur);
  keys.sort();
  const idx = keys.indexOf(selected);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderRadius: 12, padding: '10px 16px', marginBottom: 12 }}>
      <button
        onClick={() => idx > 0 && onSelect(keys[idx - 1])}
        disabled={idx <= 0}
        style={{ background: 'none', border: 'none', fontSize: 20, color: idx <= 0 ? '#ddd' : '#555', cursor: idx <= 0 ? 'default' : 'pointer', padding: '0 8px' }}
      >‹</button>
      <span style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>
        {selected.replace('-', '年')}月{selected === cur ? '（今月）' : ''}
      </span>
      <button
        onClick={() => idx < keys.length - 1 && onSelect(keys[idx + 1])}
        disabled={idx >= keys.length - 1}
        style={{ background: 'none', border: 'none', fontSize: 20, color: idx >= keys.length - 1 ? '#ddd' : '#555', cursor: idx >= keys.length - 1 ? 'default' : 'pointer', padding: '0 8px' }}
      >›</button>
    </div>
  );
}

export default function ReportPage({ data }) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const reportMonthData = data.months[selectedMonth] || { variable: {} };
  const { fixed, variable, goalsMonthly, total, income, balance } = calcSummary(data.settings, reportMonthData, data.goals);
  const plus = balance >= 0;

  const available = availableForVariable(data.settings, data.goals);
  const budgets = data.settings.variableBudgets || {};

  const fixedRows = Object.entries(FIXED_LABELS).map(([k, label]) => ({ label, value: data.settings.fixedCosts[k] || 0 }));
  const varRows = Object.entries(VARIABLE_LABELS).map(([k, label]) => ({
    label, value: reportMonthData.variable?.[k] || 0, budget: budgets[k] || 0,
  }));
  const goalRows = data.goals.map(g => ({ label: g.name, value: goalMonthly(g) }));

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 12px' }}>
        <h2 style={{ fontSize: 17, color: '#333' }}>月次レポート</h2>
        <button
          onClick={() => exportCsv(data)}
          disabled={Object.keys(data.months).length === 0}
          style={{
            background: Object.keys(data.months).length === 0 ? '#e0e0e0' : '#1976D2',
            color: 'white', border: 'none', borderRadius: 20,
            padding: '7px 14px', fontSize: 12, fontWeight: 'bold', cursor: Object.keys(data.months).length === 0 ? 'default' : 'pointer',
          }}
        >CSV出力</button>
      </div>

      <MonthNav months={data.months} selected={selectedMonth} onSelect={setSelectedMonth} />

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
            今月は黒字です
          </div>
        )}
      </div>

      {/* 変動費の使える残額 */}
      {available > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>変動費の残り</span>
            <span style={{ fontSize: 15, fontWeight: 'bold', color: available - variable >= 0 ? '#2e7d32' : '#c62828' }}>
              {(available - variable).toLocaleString()}円
            </span>
          </div>
          <div style={{ background: '#f0f0f0', borderRadius: 6, height: 8, overflow: 'hidden', marginTop: 8 }}>
            <div style={{
              background: variable > available ? '#ef5350' : '#4CAF50',
              width: `${Math.min(100, Math.round(variable / available * 100))}%`,
              height: '100%', borderRadius: 6, transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 4 }}>
            {variable.toLocaleString()}円 / {available.toLocaleString()}円
          </div>
        </div>
      )}

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
