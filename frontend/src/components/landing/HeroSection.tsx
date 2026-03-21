import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Living Grid Background */}
      <div className="absolute inset-0 living-grid z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
      {/* Pulsing Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full"></div>
      <div className="relative z-20 container mx-auto px-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-surface-container-low px-4 py-1.5 rounded-sm border border-outline-variant/30 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary glow-pulse"></span>
          <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-primary">System Online: Grid Pulse Active</span>
        </div>
        <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-on-surface to-on-surface-variant bg-clip-text text-transparent max-w-5xl mx-auto leading-none">
          The Grid Is Alive.<br/>Make It Clean.
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Real-time carbon intelligence for the modern home. Shift your energy use to save the planet without changing your life.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-sm text-lg hover:shadow-[0_0_30px_-5px_rgba(78,222,163,0.5)] transition-all">
            Join the Alpha
          </button>
          <button className="w-full md:w-auto px-10 py-4 bg-surface-container-highest border border-primary/20 text-primary font-medium rounded-sm text-lg hover:bg-primary/5 transition-colors">
            Watch System Demo
          </button>
        </div>
        {/* Floating Data Points Decoration */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-4 text-left">
            <span className="block text-[10px] text-slate-500 uppercase mb-1">Grid Intensity</span>
            <span className="text-xl font-headline font-bold text-primary">342 gCO2/kWh</span>
          </div>
          <div className="glass-card p-4 text-left">
            <span className="block text-[10px] text-slate-500 uppercase mb-1">Clean Energy Mix</span>
            <span className="text-xl font-headline font-bold text-secondary">64.2% Solar</span>
          </div>
          <div className="glass-card p-4 text-left border-l-2 border-l-error">
            <span className="block text-[10px] text-slate-500 uppercase mb-1">Peak Forecast</span>
            <span className="text-xl font-headline font-bold text-error">18:45 Critical</span>
          </div>
          <div className="glass-card p-4 text-left border-l-2 border-l-primary">
            <span className="block text-[10px] text-slate-500 uppercase mb-1">Ghost Savings</span>
            <span className="text-xl font-headline font-bold text-primary">12.4 kg This Month</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;