import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Grid layout
const GRID = 48;

// Passive wave — grid lines slowly undulate
const WAVE_AMP   = 5;    // max pixel displacement
const WAVE_FREQ  = 0.016;
const WAVE_SPEED = 0.28; // radians per frame (slow breathing)

// Passive sparks — random intersection nodes briefly flare
const SPARK_CHANCE   = 0.018; // probability per frame of spawning a spark
const SPARK_MAX_LIFE = 55;    // frames until fully faded

// Cursor interaction
const ATTRACT_RADIUS   = 200;
const ATTRACT_STRENGTH = 0.26;
const GLOW_RADIUS      = 290;

// Colors (emerald-500)
const R = 16, G = 185, B = 129;
const BASE_ALPHA = 0.13;
const PEAK_ALPHA = 0.60;

interface Spark { i: number; j: number; life: number }

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cursorRef  = useRef({ x: -9999, y: -9999 });
  const animRef    = useRef<number>(0);
  const sparksRef  = useRef<Spark[]>([]);
  const timeRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    // Track global mouse movement
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      // Update cursor even if outside canvas (to create effect in blank space below)
      cursorRef.current = { x: canvasX, y: canvasY };
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);

    const draw = () => {
      const t  = timeRef.current += 0.016;
      const w  = canvas.offsetWidth;
      const h  = canvas.offsetHeight;
      const cx = cursorRef.current.x;
      const cy = cursorRef.current.y;
      const cursorActive = cx !== -9999;

      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / GRID) + 1;
      const rows = Math.ceil(h / GRID) + 1;

      // -- Spawn passive sparks --
      if (Math.random() < SPARK_CHANCE) {
        sparksRef.current.push({
          i: Math.floor(Math.random() * cols),
          j: Math.floor(Math.random() * rows),
          life: SPARK_MAX_LIFE,
        });
      }
      // Spawn extra sparks near cursor
      if (cursorActive && Math.random() < 0.12) {
        const nearI = Math.round((cx + (Math.random() - 0.5) * ATTRACT_RADIUS) / GRID);
        const nearJ = Math.round((cy + (Math.random() - 0.5) * ATTRACT_RADIUS) / GRID);
        if (nearI >= 0 && nearI < cols && nearJ >= 0 && nearJ < rows) {
          sparksRef.current.push({ i: nearI, j: nearJ, life: SPARK_MAX_LIFE });
        }
      }

      // -- Build a lookup for spark intensity at each node --
      const sparkMap = new Map<string, number>();
      sparksRef.current = sparksRef.current.filter(s => {
        s.life--;
        if (s.life <= 0) return false;
        const norm = s.life / SPARK_MAX_LIFE; // 1 = fresh, 0 = dead
        // bell curve: ramps up fast, fades slowly
        const intensity = norm < 0.3
          ? norm / 0.3
          : (1 - norm) / 0.7;
        const key = `${s.i},${s.j}`;
        sparkMap.set(key, Math.max(sparkMap.get(key) ?? 0, intensity));
        return true;
      });

      // Helper: displaced position for a grid node
      const nodePos = (baseX: number, baseY: number) => {
        // Passive wave — two overlapping sine waves for organic feel
        const wx = Math.sin(baseY * WAVE_FREQ + t * WAVE_SPEED) * WAVE_AMP
                 + Math.sin(baseX * WAVE_FREQ * 0.7 + t * WAVE_SPEED * 1.3) * WAVE_AMP * 0.4;
        const wy = Math.cos(baseX * WAVE_FREQ + t * WAVE_SPEED * 0.9) * WAVE_AMP
                 + Math.cos(baseY * WAVE_FREQ * 0.8 + t * WAVE_SPEED * 1.1) * WAVE_AMP * 0.4;

        // Cursor attraction
        let dx = 0, dy = 0;
        if (cursorActive) {
          const cdx = cx - baseX;
          const cdy = cy - baseY;
          const dist = Math.sqrt(cdx * cdx + cdy * cdy);
          const inf  = Math.max(0, 1 - dist / ATTRACT_RADIUS);
          const pull = inf * inf * ATTRACT_STRENGTH;
          dx = cdx * pull;
          dy = cdy * pull;
        }

        return { x: baseX + wx + dx, y: baseY + wy + dy };
      };

      // Helper: alpha for a line near the cursor
      const lineAlpha = (perpDist: number, sparkBoost = 0) => {
        const cursorInf = cursorActive
          ? Math.max(0, 1 - perpDist / GLOW_RADIUS)
          : 0;
        const breath = 0.5 + 0.5 * Math.sin(t * 0.6);
        return BASE_ALPHA * (0.7 + 0.3 * breath)
             + (PEAK_ALPHA - BASE_ALPHA) * cursorInf
             + 0.35 * sparkBoost;
      };

      // -- Draw vertical lines --
      for (let i = 0; i < cols; i++) {
        const baseX = i * GRID;
        const segCount = Math.ceil(h / 8);
        ctx.beginPath();
        for (let s = 0; s <= segCount; s++) {
          const baseY = (s / segCount) * h;
          const { x, y } = nodePos(baseX, baseY);
          s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        // Distance to nearest point on this vertical line
        const dist = cursorActive 
          ? Math.abs(baseX - cx)
          : 9999;
        const alpha = lineAlpha(dist);
        ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // -- Draw horizontal lines --
      for (let j = 0; j < rows; j++) {
        const baseY = j * GRID;
        const segCount = Math.ceil(w / 8);
        ctx.beginPath();
        for (let s = 0; s <= segCount; s++) {
          const baseX = (s / segCount) * w;
          const { x, y } = nodePos(baseX, baseY);
          s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        // Distance to nearest point on this horizontal line
        const dist = cursorActive 
          ? Math.abs(baseY - cy)
          : 9999;
        const alpha = lineAlpha(dist);
        ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // -- Draw intersection nodes (sparks + cursor glow) --
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * GRID;
          const baseY = j * GRID;
          const spark = sparkMap.get(`${i},${j}`) ?? 0;

          let cursorInf = 0;
          if (cursorActive) {
            const dx   = cx - baseX;
            const dy   = cy - baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            cursorInf  = Math.max(0, 1 - dist / GLOW_RADIUS);
          }

          const totalIntensity = Math.min(1, spark + cursorInf * cursorInf);
          if (totalIntensity < 0.04) continue;

          const { x, y } = nodePos(baseX, baseY);
          const radius = 1 + 3.5 * totalIntensity;
          const alpha  = 0.2 + 0.8 * totalIntensity;

          // Outer halo for bright sparks
          if (totalIntensity > 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${R},${G},${B},${alpha * 0.15})`;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${R},${G},${B},${alpha})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
      {/* Pulsing Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full"></div>

      <div className="relative z-20 container mx-auto px-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-surface-container-low px-4 py-1.5 rounded-sm border border-outline-variant/30 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-evident-blink mx-1"></span>
          <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-primary">System Online: Grid Pulse Active</span>
        </div>
        <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter mb-6 text-white max-w-5xl mx-auto leading-none">
          The Grid Is Alive.<br/>Make It Clean.
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Real-time carbon intelligence for the modern home. Shift your energy use to save the planet without changing your life.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 relative">
          {/* Ambient pulse effect behind the button */}
          <div className="absolute inset-0 bg-primary blur-[60px] opacity-20 animate-pulse rounded-full w-3/4 mx-auto pointer-events-none"></div>
          
          <Link
            to="/dashboard"
            className="group relative w-full md:w-auto px-12 py-5 bg-primary text-bg-dark font-extrabold rounded-full text-lg overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_-10px_rgba(78,222,163,0.8)] hover:scale-105 active:scale-95 text-center inline-flex items-center justify-center gap-3 border border-white/10"
          >
            {/* Gradient Background that shifts on hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#06b6d4] opacity-90 group-hover:opacity-100 transition-opacity duration-500"></span>
            
            {/* Flashing Sweep Effect */}
            <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-[150%] group-hover:translate-x-[50%] transition-transform duration-1000 ease-in-out skew-x-[-20deg]"></span>
            
            {/* Inner Border Glow */}
            <span className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/50 transition-colors duration-300 pointer-events-none"></span>

            <span className="relative z-10 tracking-wide drop-shadow-sm">See the Grid Live</span>
            <span className="material-symbols-outlined relative z-10 text-xl transition-transform duration-500 group-hover:translate-x-2 drop-shadow-sm" style={{fontVariationSettings: "'FILL' 1"}}>arrow_forward</span>
          </Link>
        </div>
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
