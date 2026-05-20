import { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { load, save, currentMonthKey } from './store';
import Home from './pages/Home';
import InputPage from './pages/InputPage';
import GoalsPage from './pages/GoalsPage';
import ReportPage from './pages/ReportPage';
import BottomNav from './components/BottomNav';
import UserMenu from './components/UserMenu';

function KakeiboApp({ signOut }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('home');
  const [inputMonth, setInputMonth] = useState(currentMonthKey);

  useEffect(() => {
    load().then(setData);
  }, []);

  async function update(next) {
    setData(next);
    await save(next);
  }

  function updateMonth(variable) {
    update({
      ...data,
      months: { ...data.months, [inputMonth]: { ...data.months[inputMonth], variable } },
    });
  }

  function updateSettings(settings) {
    update({ ...data, settings });
  }

  function updateGoals(goals) {
    update({ ...data, goals });
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#999' }}>
        読み込み中...
      </div>
    );
  }

  const monthData = data.months[inputMonth] || { variable: {} };
  const pages = { home: Home, input: InputPage, goals: GoalsPage, report: ReportPage };
  const Page = pages[tab];

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', paddingBottom: 72 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
        <UserMenu signOut={signOut} />
      </div>
      <Page
        data={data}
        monthData={monthData}
        monthKey={inputMonth}
        onUpdateMonth={updateMonth}
        onUpdateSettings={updateSettings}
        onUpdateGoals={updateGoals}
        onChangeInputMonth={setInputMonth}
      />
      <BottomNav tab={tab} onTab={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut }) => <KakeiboApp signOut={signOut} />}
    </Authenticator>
  );
}
