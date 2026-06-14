import React, { useState } from 'react';
import { useApp, type UserRole } from '../context/AppContext';

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
  onEmergencyTrigger: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, setSidebarCollapsed, onEmergencyTrigger }) => {
  const { 
    userRole, 
    setUserRole, 
    theme, 
    toggleTheme, 
    setIsSearchOpen, 
    notifications, 
    dismissNotification 
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const activeNotifs = notifications.filter(n => !n.dismissed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'sticky', top: 0, zIndex: 90 }}>
      {/* Topbar layout matching Clinic-1.0.0 */}
      <div className="header-topbar" style={{
        height: '36px',
        backgroundColor: 'var(--med-blue)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        fontSize: '0.75rem',
        fontWeight: 500,
        fontFamily: 'var(--font-nav)',
        boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <a href="mailto:safedose-support@anesthai.org" style={{ color: 'white', textDecoration: 'none' }}>safedose-support@anesthai.org</a>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>SECURE WARD SYNC</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffd5d5', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#df1529', borderRadius: '50%', display: 'inline-block', animation: 'heart-pulse 1s infinite' }}></span>
            CRISIS DIRECT: +1 (555) 911-2468
          </span>
        </div>
      </div>

      <header className="header" style={{ borderBottom: '1px solid var(--border-color)', height: 'var(--header-height)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)', padding: '0 24px' }}>
        <div className="header-left">
          <button 
            className="toggle-sidebar-btn" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="header-search" onClick={() => setIsSearchOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search patients, drugs...</span>
            <span className="search-shortcut">Ctrl+K</span>
          </div>
        </div>

        <div className="header-right">
          {/* Ward Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--med-green)', borderRadius: '50%', display: 'inline-block', animation: 'heart-pulse 1.5s infinite' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OT-B SECURE</span>
          </div>

          {/* Emergency Portal HUD Button */}
          <button className="emergency-hud-btn" onClick={onEmergencyTrigger}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            CRISIS MODE
          </button>

          {/* Role Selector */}
          <select 
            className="role-selector" 
            value={userRole} 
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            title="Switch User Role"
          >
            <option value="Anesthesiologist">Anesthesiologist (MD)</option>
            <option value="Doctor">Surgeon (MD)</option>
            <option value="Resident">Anesthesia Resident</option>
            <option value="OT Nurse">Operating Room Nurse</option>
            <option value="PACU Nurse">PACU Recovery Nurse</option>
            <option value="Hospital Admin">Hospital Admin</option>
            <option value="Researcher">Medical Researcher</option>
            <option value="Student">Medical Student</option>
          </select>

          {/* Theme Toggle */}
          <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Notifications Icon and Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              className="icon-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications Feed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {activeNotifs.length > 0 && <span className="btn-indicator"></span>}
            </button>

            {showNotifications && (
              <div 
                className="glass" 
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: '200',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Active Notifications</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeNotifs.length} warnings</span>
                </div>
                
                {activeNotifs.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No warnings active. System stable.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeNotifs.map(n => (
                      <div 
                        key={n.id} 
                        style={{ 
                          padding: '10px', 
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderLeft: `4px solid ${n.type === 'critical' ? 'var(--med-red)' : n.type === 'warning' ? 'var(--med-orange)' : 'var(--med-blue)'}`,
                          fontSize: '0.8125rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                          <span>{n.title}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.3', marginBottom: '8px' }}>{n.message}</p>
                        <button 
                          onClick={() => dismissNotification(n.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--med-blue)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Acknowledge & Mute
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
