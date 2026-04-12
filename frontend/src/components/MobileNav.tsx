import { Link, useLocation } from 'react-router-dom';
const links = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/dashboard', icon: '📊', label: 'Groups' },
];
export default function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-app-border flex">
      {links.map(l => (
        <Link key={l.path} to={l.path}
          className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors ${pathname === l.path ? 'text-accent-indigo' : 'text-text-dim'}`}>
          <span className="text-xl">{l.icon}</span>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
