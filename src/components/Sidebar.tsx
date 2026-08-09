import React from 'react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, collapsed }) => {
  const { userRole } = useApp();

  const menuItems = [
    { id: 'landing', label: 'Landing Experience', role: 'All', group: 'Welcome', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )},
    { id: 'dashboard', label: 'Main Dashboard', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    )},
    { id: 'patients', label: 'Patient Records', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )},
    { id: 'preoperative', label: 'Pre-Op Evaluator', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )},
    { id: 'planner', label: 'AI Anesthesia Planner', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'drugcalc', label: 'Drug Calculator', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    )},
    { id: 'airway', label: 'Airway Module', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )},
    { id: 'liveot', label: 'Live OT Monitor', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'anesthesiarecord', label: 'Anesthesia Record', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )},
    { id: 'pacu', label: 'PACU Recovery', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )},
    { id: 'postoperative', label: 'Postoperative Care', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )},
    { id: 'clinicalmodels', label: 'Clinical AI Models', role: 'Clinician', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )},
    { id: 'student', label: 'Student Portal', role: 'Student', group: 'Clinical Workspace', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    )},
    
    // Safety & Quality items
    { id: 'safety-overview', label: 'Safety Overview', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )},
    { id: 'pre-anesthesia', label: 'Pre-Anaesthesia', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )},
    { id: 'machine-check', label: 'Machine Check', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    )},
    { id: 'pre-induction', label: 'Pre-Induction', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    )},
    { id: 'timeout', label: 'Time-Out', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )},
    { id: 'intraop-safety', label: 'Intraoperative Safety', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )},
    { id: 'recovery-safety', label: 'Recovery Safety', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )},
    { id: 'report-incident', label: 'Report Incident', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    )},
    { id: 'incident-reports', label: 'Incident Reports', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )},
    { id: 'safety-analytics', label: 'Safety Analytics', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )},
    { id: 'audit-history', label: 'Audit History', role: 'Clinician', group: 'Safety & Quality', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )},

    { id: 'analytics', label: 'Audit Analytics', role: 'Admin', group: 'Administration', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )},
    { id: 'admin', label: 'Admin Settings', role: 'Admin', group: 'Administration', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )}
  ];

  // Filter items based on current active user role to prevent screen clutter
  const filteredItems = menuItems.filter(item => {
    if (item.id === 'landing') return true;
    if (userRole === 'Hospital Admin') return true;
    
    if (item.role === 'All') return true;
    if (item.role === 'Student' && userRole === 'Student') return true;
    if (item.role === 'Admin' && userRole === 'Researcher') return true;
    if (item.role === 'Clinician') {
      return ['Anesthesiologist', 'Doctor', 'Resident', 'OT Nurse', 'PACU Nurse'].includes(userRole as any);
    }
    return false;
  });

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--med-cyan)' }}>
            <line x1="22" y1="12" x2="2" y2="12"/>
            <path d="M5.4 12h2.2l2.3-6 3.3 12 2.3-8 1.1 4.5 2 2.5h2"/>
          </svg>
          {!collapsed && <span>AnesthAI SafeDose</span>}
        </div>
      </div>
      
      <ul className="sidebar-menu" style={{ overflowY: 'auto' }}>
        {(() => {
          let lastGroup = '';
          return filteredItems.map(item => {
            const showHeader = item.group !== lastGroup;
            lastGroup = item.group || '';
            return (
              <React.Fragment key={item.id}>
                {showHeader && !collapsed && (
                  <div style={{
                    padding: '12px 14px 4px',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--med-cyan)',
                    letterSpacing: '0.05em',
                    opacity: 0.8,
                    marginTop: '8px'
                  }}>
                    {item.group}
                  </div>
                )}
                {showHeader && collapsed && (
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
                )}
                <li 
                  className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => setView(item.id)}
                  title={item.label}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  {!collapsed && <span style={{ fontFamily: 'var(--font-nav)', fontWeight: 600 }}>{item.label}</span>}
                </li>
              </React.Fragment>
            );
          });
        })()}
      </ul>
      
      <div className="sidebar-footer">
        <div className="user-avatar">
          {userRole.substring(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="user-details">
            <span className="user-name">Staff ID #4289</span>
            <span className="user-role">{userRole}</span>
          </div>
        )}
      </div>
    </div>
  );
};
