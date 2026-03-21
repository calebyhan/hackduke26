import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-emerald-500/15 bg-[#111319]">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full max-w-7xl mx-auto">
        <div className="text-emerald-500 font-bold mb-4 md:mb-0 uppercase tracking-tighter font-headline">
          GridGhost
        </div>
        <div className="flex space-x-8 mb-4 md:mb-0">
          <a className="font-['Inter'] text-[10px] uppercase tracking-[0.05em] text-slate-500 hover:text-emerald-400 transition-colors" href="#">Security Protocol</a>
          <a className="font-['Inter'] text-[10px] uppercase tracking-[0.05em] text-slate-500 hover:text-emerald-400 transition-colors" href="#">API Documentation</a>
          <a className="font-['Inter'] text-[10px] uppercase tracking-[0.05em] text-slate-500 hover:text-emerald-400 transition-colors" href="#">System Status</a>
        </div>
        <div className="font-['Inter'] text-[10px] uppercase tracking-[0.05em] text-slate-500 opacity-80">
          © 2024 GRIDGHOST TERMINAL. ALL SYSTEMS OPERATIONAL.
        </div>
      </div>
    </footer>
  );
};

export default Footer;