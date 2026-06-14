import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GlobalSearch } from './components/GlobalSearch';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';

// Views
import { Landing } from './views/Landing';
import { Auth } from './views/Auth';
import { Dashboard } from './views/Dashboard';
import { Patients } from './views/Patients';
import { Preoperative } from './views/Preoperative';
import { Planner } from './views/Planner';
import { DrugCalculator } from './views/DrugCalculator';
import { Airway } from './views/Airway';
import { LiveOT } from './views/LiveOT';
import { EmergencyPortal } from './views/EmergencyPortal';
import { AnesthesiaRecord } from './views/AnesthesiaRecord';
import { PACU } from './views/PACU';
import { Postoperative } from './views/Postoperative';
import { StudentPortal } from './views/StudentPortal';
import { AnalyticsPanel } from './views/AnalyticsPanel';
import { AdminPanel } from './views/AdminPanel';

const AppContent: React.FC = () => {
  const [currentView, setView] = useState<string>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);

  // Authentication gate redirect
  const handleGetStarted = () => {
    if (isAuthenticated) {
      setView('dashboard');
    } else {
      setView('auth');
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const triggerEmergency = () => {
    setIsEmergencyActive(true);
  };

  const closeEmergency = () => {
    setIsEmergencyActive(false);
  };

  // Render view based on navigation state
  const renderActiveView = () => {
    if (!isAuthenticated && currentView !== 'landing' && currentView !== 'auth') {
      return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentView) {
      case 'landing':
        return <Landing onGetStarted={handleGetStarted} />;
      case 'auth':
        return <Auth onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return <Dashboard setView={setView} onEmergencyTrigger={triggerEmergency} />;
      case 'patients':
        return <Patients />;
      case 'preoperative':
        return <Preoperative />;
      case 'planner':
        return <Planner />;
      case 'drugcalc':
        return <DrugCalculator />;
      case 'airway':
        return <Airway />;
      case 'liveot':
        return <LiveOT />;
      case 'anesthesiarecord':
        return <AnesthesiaRecord />;
      case 'pacu':
        return <PACU />;
      case 'postoperative':
        return <Postoperative />;
      case 'student':
        return <StudentPortal />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard setView={setView} onEmergencyTrigger={triggerEmergency} />;
    }
  };

  // Full-screen layout for Landing and Auth pages
  const isFullscreenView = ['landing', 'auth'].includes(currentView);

  if (isFullscreenView) {
    return (
      <div className="app-container">
        <main className="main-wrapper" style={{ minHeight: '100vh' }}>
          {renderActiveView()}
        </main>
        {/* Render Floating AI assistant on Landing to showcase capabilities */}
        {currentView === 'landing' && <FloatingAIAssistant />}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        <Header 
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed} 
          onEmergencyTrigger={triggerEmergency}
        />
        
        <div style={{ flex: 1 }}>
          {renderActiveView()}
        </div>
      </main>

      {/* Floating AI Assistant Widgets */}
      <FloatingAIAssistant />

      {/* Ctrl+K Command Palette overlay */}
      <GlobalSearch setView={setView} />

      {/* Screen-covering Emergency ACLS HUD */}
      {isEmergencyActive && (
        <EmergencyPortal onClose={closeEmergency} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
