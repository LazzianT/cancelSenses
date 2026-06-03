import { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import Analytics from './pages/Analytics';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'prediction':
        return <Prediction />;
      case 'analytics':
        return <Analytics />;
      default:
        return null;
    }
  };

  return (
    <MainLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </MainLayout>
  );
}