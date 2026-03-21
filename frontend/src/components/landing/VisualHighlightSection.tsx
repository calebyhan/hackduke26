import React from 'react';

const VisualHighlightSection: React.FC = () => {
  return (
    <section className="py-20 overflow-hidden bg-background">
      <div className="container mx-auto px-8 relative">
        <div className="absolute -right-20 top-0 w-2/3 h-full opacity-20 pointer-events-none">
          <img className="object-cover w-full h-full rounded-full blur-3xl" data-alt="Abstract glowing network digital representation" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXrjm3Xyv77iIxWVsXkRwZHu3pl2ektHzjNYJKqyJrP-yKYS9BuUaAx7BdUQOzdxULs9LinXV_uO399sgE3o3gJja3zMKw_jbj2CcN6dtGaMgL3RniaNOc0kuXr67ZU2zID1p8zNtcGAzbFF1XdniOU6iHiNTnXeJV_UDdAAA9C2qQfYX_dEnR02lJoCqzmVMhAvzw4rsXUCKvnXRLN5yrBO8-eDvFrsTkhSNbOD44mzMLxdgP6V6NR4uK8lLPr2T6O1p7385XLtY1"/>
        </div>
        <div className="glass-card p-12 md:p-20 relative z-10 overflow-hidden rounded-xl border-primary/10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-headline font-bold mb-8 leading-tight">The Grid is moving. <br/>Join the movement.</h2>
              <p className="text-on-surface-variant text-xl mb-10 leading-relaxed">
                Be part of the first 1,000 users to access the GridGhost Alpha. Help us build the future of autonomous, planet-first energy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input className="bg-surface-container-lowest border border-outline-variant/30 px-6 py-4 rounded-sm focus:border-primary focus:ring-0 text-on-surface w-full" placeholder="Enter your email" type="email"/>
                <button className="bg-primary text-on-primary font-bold px-8 py-4 rounded-sm whitespace-nowrap hover:bg-primary-container transition-colors">
                  Join Alpha
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest">Limited capacity remaining for Q4 2024</p>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[80px]"></div>
                <div className="relative bg-surface-container-lowest border border-outline-variant/50 p-8 rounded-sm rotate-3">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono text-primary">GHOST_TERMINAL_V.1.0</span>
                    <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-surface-container-highest rounded-full"></div>
                    <div className="h-2 w-3/4 bg-surface-container-highest rounded-full"></div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="h-20 bg-primary/10 border border-primary/20 rounded-sm"></div>
                      <div className="h-20 bg-secondary/10 border border-secondary/20 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualHighlightSection;