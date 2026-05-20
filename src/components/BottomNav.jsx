const ITEMS = [
  { key: 'home',   label: 'ホーム',      icon: '🏠' },
  { key: 'input',  label: '入力',        icon: '✏️' },
  { key: 'goals',  label: 'やりたいこと', icon: '🎯' },
  { key: 'report', label: 'レポート',    icon: '📊' },
];

export default function BottomNav({ tab, onTab }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'white', borderTop: '1px solid #e8e8e8',
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {ITEMS.map(({ key, label, icon }) => {
        const active = tab === key;
        return (
          <button key={key} onClick={() => onTab(key)} style={{
            flex: 1, padding: '10px 0 8px', border: 'none', background: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 10, color: active ? '#4CAF50' : '#aaa', fontWeight: active ? 'bold' : 'normal' }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
