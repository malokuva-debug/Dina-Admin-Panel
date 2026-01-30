interface NavbarProps {
  activeTab: 'appointments' | 'settings' | 'finance';
  onTabChange: (tab: 'appointments' | 'settings' | 'finance') => void;
  hideFinance?: boolean; // optional prop to hide finance tab
}

export default function Navbar({ activeTab, onTabChange, hideFinance }: NavbarProps) {
  // Build the tab list dynamically
  const tabs: { key: 'appointments' | 'settings' | 'finance'; label: string; svg: JSX.Element }[] = [
    {
      key: 'appointments',
      label: 'Appointments',
      svg: (
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      key: 'settings',
      label: 'Settings',
      svg: (
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
  ];

  // Add finance tab only if hideFinance is false
  if (!hideFinance) {
    tabs.push({
      key: 'finance',
      label: 'Finance',
      svg: (
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1v22"></path>
          <path d="M17 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6"></path>
        </svg>
      ),
    });
  }

  return (
    <div className="navbar flex justify-around border-t mt-4 pt-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`nav-item px-4 py-2 ${
            activeTab === tab.key ? 'font-bold border-b-2 border-blue-500' : ''
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.svg}
        </button>
      ))}
    </div>
  );
}