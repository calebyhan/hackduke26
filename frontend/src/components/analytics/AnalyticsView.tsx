import { useForecast } from "../../hooks/useForecast";
import { useGenerationMix } from "../../hooks/useGenerationMix";

export default function AnalyticsView() {
  const { forecast } = useForecast();
  const { data: genMix } = useGenerationMix();

  return (
    <div className="pt-4 pb-10 px-6 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(78,222,163,0.6)]"></span>
              <span className="text-[10px] font-mono tracking-widest text-primary/80 uppercase">Live Telemetry Active</span>
            </div>
            <h1 className="text-4xl font-headline font-bold tracking-tight text-on-surface">Grid Analytics</h1>
          </div>
          <div className="flex gap-4 font-mono text-[11px]">
            <div className="text-right">
              <div className="text-on-surface-variant uppercase">Zone Identifier</div>
              <div className="text-primary">CAISO_NORTH_04</div>
            </div>
            <div className="text-right border-l border-outline-variant/20 pl-4">
              <div className="text-on-surface-variant uppercase">System Time</div>
              <div className="text-on-surface tabular">2026-03-21 14:42:01 PST</div>
            </div>
          </div>
        </div>
        {/* Top Section: Dual Signal Forecast Comparison */}
        <section className="bg-surface-container-low border-l-2 border-primary p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-headline font-semibold flex items-center gap-2">
                Dual Signal Forecast Comparison
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm tracking-tighter">24H PROJECTION</span>
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">Overlay of CO2 Marginal Operating Emissions Rate vs. Health Damage Signal</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-primary"></span>
                <span className="text-[10px] font-mono text-on-surface-variant">CO2 MOER (lb/MWh)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-tertiary border-b border-dashed border-tertiary"></span>
                <span className="text-[10px] font-mono text-on-surface-variant">HEALTH DAMAGE ($/MWh)</span>
              </div>
            </div>
          </div>
          {/* Forecast Chart Visualization */}
          <div className="h-[360px] w-full relative group">
            {/* Background Grid */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="border-b border-outline-variant/5 h-0 w-full"></div>
              <div className="border-b border-outline-variant/5 h-0 w-full"></div>
              <div className="border-b border-outline-variant/5 h-0 w-full"></div>
              <div className="border-b border-outline-variant/5 h-0 w-full"></div>
              <div className="border-b border-outline-variant/5 h-0 w-full"></div>
            </div>
            {/* Divergence Window Highlight */}
            <div className="absolute left-[40%] right-[35%] inset-y-0 bg-tertiary/5 border-x border-dashed border-tertiary/20 flex items-center justify-center">
              <div className="absolute top-2 px-2 py-1 bg-tertiary-container text-on-tertiary-container text-[9px] font-bold uppercase tracking-widest">Divergence Window</div>
            </div>
            <div className="absolute inset-0 flex items-end px-2">
              {/* Simulated Chart Content (CSS Drawing) */}
              <div className="w-full h-full relative overflow-hidden">
                {/* MOER Line (Green) - Solid */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <polyline fill="none" points="0,200 100,180 200,220 300,150 400,100 500,280 600,240 700,180 800,120 900,90 1000,140 1100,190 1200,210" stroke="#4edea3" strokeWidth="2.5" vectorEffect="non-scaling-stroke"></polyline>
                  {/* Area under MOER */}
                  <path d="M0,200 L100,180 L200,220 L300,150 L400,100 L500,280 L600,240 L700,180 L800,120 L900,90 L1000,140 L1100,190 L1200,210 V360 H0 Z" fill="url(#gradient-primary)" opacity="0.1"></path>
                  {/* Health Signal Line (Red) - Dashed */}
                  <polyline fill="none" points="0,150 100,160 200,140 300,130 400,220 500,120 600,110 700,130 800,140 900,160 1000,170 1100,150 1200,140" stroke="#ffb3ad" strokeDasharray="8 6" strokeWidth="2.5" vectorEffect="non-scaling-stroke"></polyline>
                  <defs>
                    <linearGradient id="gradient-primary" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3"></stop>
                      <stop offset="100%" stopColor="transparent"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            {/* X-Axis Labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between font-mono text-[9px] text-on-surface-variant">
              <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>23:59</span>
            </div>
          </div>
        </section>
        {/* Bottom Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bottom Left: Live Generation Mix (EIA) */}
          <section className="bg-surface-container border-l-2 border-secondary p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-headline font-semibold">Live Generation Mix (EIA)</h2>
                <p className="text-xs text-on-surface-variant tabular">CAISO_NORTH // Current Total: 18,442 MW</p>
              </div>
              <span className="material-symbols-outlined text-secondary">bar_chart</span>
            </div>
            <div className="space-y-4 flex-grow">
              {/* Source Rows */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-on-surface uppercase">Natural Gas</span>
                  <span className="text-secondary tabular font-bold">42.4%</span>
                </div>
                <div className="h-2 bg-surface-container-highest w-full rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container" style={{width: '42.4%'}}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-on-surface uppercase">Solar</span>
                  <span className="text-primary tabular font-bold">28.1%</span>
                </div>
                <div className="h-2 bg-surface-container-highest w-full rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{width: '28.1%'}}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-on-surface uppercase">Wind</span>
                  <span className="text-primary tabular font-bold">12.5%</span>
                </div>
                <div className="h-2 bg-surface-container-highest w-full rounded-full overflow-hidden">
                  <div className="h-full bg-primary-fixed-dim" style={{width: '12.5%'}}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-on-surface uppercase">Hydro</span>
                  <span className="text-on-surface-variant tabular font-bold">8.2%</span>
                </div>
                <div className="h-2 bg-surface-container-highest w-full rounded-full overflow-hidden">
                  <div className="h-full bg-outline" style={{width: '8.2%'}}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-on-surface uppercase">Imports</span>
                  <span className="text-on-surface-variant tabular font-bold">5.3%</span>
                </div>
                <div className="h-2 bg-surface-container-highest w-full rounded-full overflow-hidden">
                  <div className="h-full bg-outline-variant" style={{width: '5.3%'}}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-on-surface uppercase">Nuclear</span>
                  <span className="text-on-surface-variant tabular font-bold">3.5%</span>
                </div>
                <div className="h-2 bg-surface-container-highest w-full rounded-full overflow-hidden">
                  <div className="h-full bg-surface-variant" style={{width: '3.5%'}}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center text-[9px] font-mono uppercase text-on-surface-variant">
              <span>Source: US EIA Real-Time Dashboard</span>
              <span className="text-secondary">Refreshed: 120s ago</span>
            </div>
          </section>
          {/* Bottom Right: Historical Baseline (7-Day) */}
          <section className="bg-surface-container border-l-2 border-outline-variant p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-headline font-semibold">Historical Baseline (7-Day)</h2>
                <p className="text-xs text-on-surface-variant">Moving Average MOER Context</p>
              </div>
              <span className="material-symbols-outlined text-outline">history</span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end flex-grow h-[140px] mb-4">
              {/* Placeholder bars */}
              <div className="flex flex-col items-center gap-2 group">
                <div className="text-[9px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">840</div>
                <div className="w-full bg-surface-container-high hover:bg-primary-container transition-colors rounded-sm" style={{height: '60%'}}></div>
                <span className="text-[9px] font-mono text-on-surface-variant uppercase">Mon</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="text-[9px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">910</div>
                <div className="w-full bg-surface-container-high hover:bg-primary-container transition-colors rounded-sm" style={{height: '75%'}}></div>
                <span className="text-[9px] font-mono text-on-surface-variant uppercase">Tue</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="text-[9px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">880</div>
                <div className="w-full bg-surface-container-high hover:bg-primary-container transition-colors rounded-sm" style={{height: '70%'}}></div>
                <span className="text-[9px] font-mono text-on-surface-variant uppercase">Wed</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="text-[9px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">720</div>
                <div className="w-full bg-primary/40 border-t border-primary rounded-sm" style={{height: '45%'}}></div>
                <span className="text-[9px] font-mono text-primary uppercase font-bold">Thu</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="text-[9px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">980</div>
                <div className="w-full bg-surface-container-high hover:bg-primary-container transition-colors rounded-sm" style={{height: '90%'}}></div>
                <span className="text-[9px] font-mono text-on-surface-variant uppercase">Fri</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="text-[9px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">650</div>
                <div className="w-full bg-surface-container-high hover:bg-primary-container transition-colors rounded-sm" style={{height: '35%'}}></div>
                <span className="text-[9px] font-mono text-on-surface-variant uppercase">Sat</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="text-[9px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">620</div>
                <div className="w-full bg-surface-container-high hover:bg-primary-container transition-colors rounded-sm" style={{height: '30%'}}></div>
                <span className="text-[9px] font-mono text-on-surface-variant uppercase">Sun</span>
              </div>
            </div>
            {/* Statistics Module */}
            <div className="bg-surface-container-lowest p-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">7D Weekly Average</span>
                <span className="text-xl font-mono text-on-surface font-bold tabular">794.2 <span className="text-xs font-normal text-on-surface-variant uppercase">lb/MWh</span></span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Current vs Base</span>
                <span className="text-xl font-mono text-error font-bold tabular">+12.4%</span>
              </div>
            </div>
          </section>
        </div>
        {/* Dashboard Footer Info */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 items-center justify-between opacity-60">
          <div className="flex items-center gap-6 text-[10px] font-mono text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>ENCRYPTED_STREAM_AES256</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">database</span>
              <span>NODE: SAN_FRAN_HUB_01</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[9px] font-headline uppercase tracking-widest text-on-surface-variant">GridGhost Tactical Interface v4.2.0-stable</div>
          </div>
        </div>
      </div>
    </div>
  );
}
