import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const getCommandForPath = (path: string) => {
    switch (path) {
      case '/':
        return './dashboard --month=2025-09';
      case '/expenses':
        return './expenses --month=2025-09';
      case '/expenses/add':
        return './add-expense';
      case '/users':
        return './users --list';
      case '/import-export':
        return './import-export';
      case '/reports':
        return './reports --generate --type=monthly';
      default:
        return './dashboard';
    }
  };

  const navigationCommands = [
    { path: '/', label: 'dashboard', command: 'dashboard' },
    { path: '/expenses', label: 'expenses', command: 'expenses' },
    { path: '/expenses/add', label: 'add', command: 'add' },
    { path: '/users', label: 'users', command: 'users' },
    { path: '/import-export', label: 'import', command: 'import' },
    { path: '/reports', label: 'reports', command: 'reports' },
  ];

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-title">
          budget-tracker:~$ {getCommandForPath(location.pathname)}
        </div>
      </div>
      
      <div className="terminal-border">
        <div className="terminal-content">
          {children}
        </div>
        
        <div className="terminal-footer">
          <div className="command-line">
            budget-tracker:~$ [
            {navigationCommands.map((nav, index) => (
              <React.Fragment key={nav.path}>
                <Link 
                  to={nav.path} 
                  className={`command-link ${location.pathname === nav.path ? 'active' : ''}`}
                >
                  {nav.label}
                </Link>
                {index < navigationCommands.length - 1 && '] ['}
              </React.Fragment>
            ))}
            ]
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;