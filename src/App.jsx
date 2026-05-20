import { useState } from 'react';
import { load, save, currentMonthKey } from './store';
import Home from './pages/Home';
import InputPage from './pages/InputPage';
import GoalsPage from './pages/GoalsPage';
import ReportPage from './pages/ReportPage';
import BottomNav from './components/BottomNav';

export default function App() {
  const [data, setData] = useState(load);
  const [tab, setTab] = useState('home');
  const [inputMonth, setInputMonth] = useState(currentMonthKey);

  function update(next) {
    setData(next);
    save(next);
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

  const monthData = data.months[inputMonth] || { variable: {} };

  const pages = { home: Home, input: InputPage, goals: GoalsPage, report: ReportPage };
  const Page = pages[tab];

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', paddingBottom: 72 }}>
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
