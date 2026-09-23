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
import { ClinicalModels } from './views/ClinicalModels';

// Safety & Quality views
import { SafetyOverview } from './views/SafetyOverview';
import { PreAnesthesia } from './views/PreAnesthesia';
import { MachineCheck } from './views/MachineCheck';
import { PreInduction } from './views/PreInduction';
import { ProcedureTimeout } from './views/ProcedureTimeout';
import { IntraopSafety } from './views/IntraopSafety';
import { RecoverySafety } from './views/RecoverySafety';
import { ReportIncident } from './views/ReportIncident';
import { IncidentReports } from './views/IncidentReports';
import { SafetyAnalytics } from './views/SafetyAnalytics';
import { AuditHistory } from './views/AuditHistory';
import { ModelValidation } from './views/ModelValidation';
import { DatasetGovernance } from './views/DatasetGovernance';
import { LimitationsSafety } from './views/LimitationsSafety';
import { ClinicalReferences } from './views/ClinicalReferences';

const AppContent: React.FC = () => {
  const getInitialState = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view') || window.location.hash.replace('#', '');
      const authParam = searchParams.get('auth');
      const emergencyParam = searchParams.get('emergency') === 'true' || viewParam === 'emergency';
      if (viewParam) {
        return {
          view: viewParam === 'emergency' ? 'dashboard' : viewParam,
          auth: authParam === 'true' || (viewParam !== 'landing' && viewParam !== 'auth'),
          emergency: emergencyParam
        };
      }
    } catch {
      // fallback to defaults
    }
    return { view: 'landing', auth: false, emergency: false };
  };

  const initial = getInitialState();
  const [currentView, setView] = useState<string>(initial.view);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initial.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(initial.emergency || false);

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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('auth');
  };

  const triggerEmergency = () => {
    setIsEmergencyActive(true);
  };

  const closeEmergency = () => {
    setIsEmergencyActive(false);
  };

  // Render view based on navigation state (Strictly gated)
  const renderActiveView = () => {
    if (!isAuthenticated) {
      if (currentView === 'landing') {
        return <Landing onGetStarted={handleGetStarted} />;
      }
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
      case 'clinicalmodels':
        return <ClinicalModels />;
      case 'safety-overview':
        return <SafetyOverview setView={setView} />;
      case 'pre-anesthesia':
        return <PreAnesthesia />;
      case 'machine-check':
        return <MachineCheck />;
      case 'pre-induction':
        return <PreInduction />;
      case 'timeout':
        return <ProcedureTimeout />;
      case 'intraop-safety':
        return <IntraopSafety />;
      case 'recovery-safety':
        return <RecoverySafety />;
      case 'report-incident':
        return <ReportIncident />;
      case 'incident-reports':
        return <IncidentReports setView={setView} />;
      case 'safety-analytics':
        return <SafetyAnalytics />;
      case 'audit-history':
        return <AuditHistory />;
      case 'model-validation':
        return <ModelValidation />;
      case 'dataset-governance':
        return <DatasetGovernance />;
      case 'limitations-safety':
        return <LimitationsSafety />;
      case 'clinical-references':
        return <ClinicalReferences />;
      default:
        return <Dashboard setView={setView} onEmergencyTrigger={triggerEmergency} />;
    }
  };

  // Full-screen layout for Landing and Auth pages, or whenever user is unauthenticated
  const isFullscreenView = !isAuthenticated || ['landing', 'auth'].includes(currentView);

  if (isFullscreenView) {
    return (
      <div className="app-container fullscreen-layout">
        <main className="main-wrapper fullscreen-scroll">
          {renderActiveView()}
        </main>
        {/* Render Floating AI assistant on Landing to showcase capabilities */}
        {currentView === 'landing' && <FloatingAIAssistant />}
      </div>
    );
  }

  return (
    <div className="app-container authenticated-layout">
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
          onLogout={handleLogout}
        />
        
        {/* Primary Vertical Scroll Region */}
        <div className="content-scroll-area">
          {renderActiveView()}
        </div>
      </main>

      {/* Floating AI Assistant Widgets */}
      <FloatingAIAssistant />

      {/* Ctrl+K Command Palette overlay */}
      <GlobalSearch setView={setView} />

      {/* Screen-covering Emergency ACLS HUD */}
      {isEmergencyActive && (
        <EmergencyPortal onClose={closeEmergency} setView={setView} />
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
