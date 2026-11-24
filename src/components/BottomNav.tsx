import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, Settings, HelpCircle, Camera } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
}

const leftItems: NavItem[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/history', label: 'History', icon: Clock },
];

const rightItems: NavItem[] = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help', icon: HelpCircle },
];

function NavTab({ to, label, icon: Icon }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === '/home'}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center
         min-w-[60px] min-h-[56px] py-2 px-2 rounded-xl transition-colors duration-200
         ${isActive ? 'text-cyan-400' : 'text-white/50 hover:text-white/80'}`
      }
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"
              aria-hidden="true"
            />
          )}
          <Icon
            className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
            aria-hidden="true"
          />
          <span className="text-[10px] mt-0.5 font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
}

const BottomNav: React.FC = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 backdrop-blur-xl bg-[#0a1633]/90"
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {leftItems.map((item) => (
          <NavTab key={item.to} {...item} />
        ))}

        {/* Centre Scan FAB — prominent camera shortcut */}
        <NavLink
          to="/scan"
          aria-label="Scan currency note"
          className="relative flex flex-col items-center justify-center -mt-5 mx-1"
        >
          {({ isActive }) => (
            <span
              className={`
                w-14 h-14 rounded-full flex items-center justify-center
                bg-gradient-to-br from-cyan-400 to-teal-500
                shadow-lg shadow-cyan-400/40
                transition-all duration-200
                ${isActive
                  ? 'ring-4 ring-cyan-400/50 scale-105'
                  : 'hover:scale-105 active:scale-95'}
              `}
            >
              <Camera className="w-7 h-7 text-gray-950" aria-hidden="true" />
            </span>
          )}
        </NavLink>

        {rightItems.map((item) => (
          <NavTab key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
