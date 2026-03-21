import React from 'react';

const LandingNavbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md">
      <div className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-emerald-500 uppercase font-headline">
          GridGhost
        </div>
        <div className="hidden md:flex items-center space-x-12">
          <a className="text-emerald-400 font-bold border-b-2 border-emerald-500 pb-1 font-headline tracking-tight" href="#">The Mission</a>
          <a className="text-slate-400 hover:text-emerald-300 transition-colors font-headline tracking-tight" href="#">Technology</a>
        </div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-bold px-6 py-2 rounded-sm hover:scale-95 active:scale-90 transition-transform shadow-lg shadow-primary/20">
          Get Early Access
        </button>
      </div>
    </nav>
  );
};

export default LandingNavbar;