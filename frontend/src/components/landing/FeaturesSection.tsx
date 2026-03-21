import React from 'react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-headline font-bold tracking-tight mb-4">Precision Engineering</h2>
          <p className="text-on-surface-variant">Three pillars of the ghost protocol.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-10 flex flex-col justify-between group hover:border-primary/50 transition-all">
            <div>
              <span className="material-symbols-outlined text-4xl text-primary mb-6" style={{fontVariationSettings: "'FILL' 1"}}>analytics</span>
              <h3 className="text-2xl font-headline font-bold mb-4">Marginal Emissions Forecast</h3>
              <p className="text-on-surface-variant leading-relaxed">Most apps use average data. We track the 'marginal' generator—the exact power plant that spins up when you click 'on'.</p>
            </div>
            <div className="mt-12 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Live Prediction</span>
              <span className="text-primary font-headline">99.4% Acc.</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="glass-card p-10 flex flex-col justify-between group bg-gradient-to-br from-surface-container to-surface-container-high border-primary/20 hover:border-primary/50 transition-all">
            <div>
              <span className="material-symbols-outlined text-4xl text-secondary mb-6" style={{fontVariationSettings: "'FILL' 1"}}>health_and_safety</span>
              <h3 className="text-2xl font-headline font-bold mb-4">Dual Signal Optimization</h3>
              <p className="text-on-surface-variant leading-relaxed">Balancing CO2 intensity with local health impact. We prioritize times when regional air quality is at its safest for everyone.</p>
            </div>
            <div className="mt-12 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Signal: Health + Carbon</span>
              <span className="text-secondary font-headline">Synced</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="glass-card p-10 flex flex-col justify-between group hover:border-primary/50 transition-all">
            <div>
              <span className="material-symbols-outlined text-4xl text-primary mb-6" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
              <h3 className="text-2xl font-headline font-bold mb-4">Gemini-Powered Carbon Briefs</h3>
              <p className="text-on-surface-variant leading-relaxed">No more staring at raw data. Gemini translates complex grid physics into actionable, human insights every morning.</p>
            </div>
            <div className="mt-12 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">AI Narrative Engine</span>
              <span className="text-primary font-headline">Online</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;