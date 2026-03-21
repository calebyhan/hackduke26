import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const LandingNavbar: React.FC = () => {
  const { pathname } = useLocation();
  const isTech = pathname === '/technology';

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md">
      <div className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-emerald-500 uppercase font-headline">
          GridGhost
        </Link>
        <div className="hidden md:flex items-center space-x-12">
          <Link
            to="/"
            className={`font-headline tracking-tight transition-colors pb-1 border-b-2 ${!isTech ? 'text-emerald-400 font-bold border-emerald-500' : 'text-slate-400 hover:text-emerald-300 border-transparent'}`}
          >
            The Mission
          </Link>
          <Link
            to="/technology"
            className={`font-headline tracking-tight transition-colors pb-1 border-b-2 ${isTech ? 'text-emerald-400 font-bold border-emerald-500' : 'text-slate-400 hover:text-emerald-300 border-transparent'}`}
          >
            Technology
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;