import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GRID_SIZE = 48;
const GLOW_RADIUS = 260;
const DISTORT_RADIUS = 160;
const DISTORT_STRENGTH = 0.22;
const BASE_ALPHA = 0.05;
const PEAK_ALPHA = 0.55;
const EM_R = 16, EM_G = 185, EM_B = 129; // emerald

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    setSize();

    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const { x: cx, y: cy } = cursorRef.current;
      const active = cx !== -9999;

      const cols = Math.ceil(w / GRID_SIZE) + 1;
      const rows = Math.ceil(h / GRID_SIZE) + 1;

      // Vertical lines — each drawn as a path with per-point distortion
      for (let i = 0; i < cols; i++) {
        const baseX = i * GRID_SIZE;
        const segments = Math.ceil(h / 8);
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const baseY = (s / segments) * h;
          let px = baseX, py = baseY;
          if (active) {
            const dx = cx - baseX;
            const dy = cy - baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const inf = Math.max(0, 1 - dist / DISTORT_RADIUS);
            const pull = inf * inf * DISTORT_STRENGTH;
            px += dx * pull;
            py += dy * pull;
          }
          s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        const colDist = active ? Math.abs(baseX - cx) : 9999;
        const alpha = BASE_ALPHA + (PEAK_ALPHA - BASE_ALPHA) * Math.max(0, 1 - colDist / GLOW_RADIUS);
        ctx.strokeStyle = `rgba(${EM_R},${EM_G},${EM_B},${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Horizontal lines — same treatment
      for (let j = 0; j < rows; j++) {
        const baseY = j * GRID_SIZE;
        const segments = Math.ceil(w / 8);
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const baseX = (s / segments) * w;
          let px = baseX, py = baseY;
          if (active) {
            const dx = cx - baseX;
            const dy = cy - baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const inf = Math.max(0, 1 - dist / DISTORT_RADIUS);
            const pull = inf * inf * DISTORT_STRENGTH;
            px += dx * pull;
            py += dy * pull;
          }
          s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        const rowDist = active ? Math.abs(baseY - cy) : 9999;
        const alpha = BASE_ALPHA + (PEAK_ALPHA - BASE_ALPHA) * Math.max(0, 1 - rowDist / GLOW_RADIUS);
        ctx.strokeStyle = `rgba(${EM_R},${EM_G},${EM_B},${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Intersection dots — distorted position + glow
      if (active) {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const baseX = i * GRID_SIZE;
            const baseY = j * GRID_SIZE;
            const dx = cx - baseX;
            const dy = cy - baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const inf = Math.max(0, 1 - dist / GLOW_RADIUS);
            if (inf < 0.05) continue;
            const pull = Math.max(0, 1 - dist / DISTORT_RADIUS);
            const px = baseX + dx * pull * pull * DISTORT_STRENGTH;
            const py = baseY + dy * pull * pull * DISTORT_STRENGTH;
            ctx.fillStyle = `rgba(${EM_R},${EM_G},${EM_B},${0.25 + 0.75 * inf})`;
            ctx.beginPath();
            ctx.arc(px, py, 1 + 3 * inf, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (rect) cursorRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseLeave = () => {
    cursorRef.current = { x: -9999, y: -9999 };
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated Grid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
      {/* Pulsing Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full"></div>
      <div className="relative z-20 container mx-auto px-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-surface-container-low px-4 py-1.5 rounded-sm border border-outline-variant/30 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary glow-pulse"></span>
          <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-primary">System Online: Grid Pulse Active</span>
        </div>
        <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter mb-6 text-white max-w-5xl mx-auto leading-none">
          The Grid Is Alive.<br/>Make It Clean.
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Real-time carbon intelligence for the modern home. Shift your energy use to save the planet without changing your life.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="group relative w-full md:w-auto px-12 py-5 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-sm text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-4px_rgba(78,222,163,0.7)] hover:scale-105 active:scale-100 text-center inline-flex items-center justify-center gap-3 border-2 border-primary/60"
          >
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            <span className="relative">See the Grid Live</span>
            <span className="material-symbols-outlined relative text-xl transition-transform duration-300 group-hover:translate-x-1" style={{fontVariationSettings: "'FILL' 1"}}>arrow_forward</span>
          </Link>
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
