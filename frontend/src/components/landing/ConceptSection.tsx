import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const barVariants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.5 } },
};

const textVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 1, duration: 0.5 } }
};

const ConceptSection: React.FC = () => {
  return (
    <section className="py-32 bg-surface-container-low relative">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-primary font-headline text-sm uppercase tracking-widest mb-4 block">The Methodology</span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 tracking-tight">Shift vs. Reduce</h2>
            <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
              Traditional conservation asks you to use less. GridGhost asks you to use <span className="text-on-surface font-semibold italic">better</span>. We identify the specific moments when the grid is powered by fossils and move your heavy loads to when the wind blows and the sun shines.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-sm mt-1">
                  <span className="material-symbols-outlined text-primary text-xl">update</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Zero Sacrifice</h4>
                  <p className="text-sm text-on-surface-variant">Your laundry still gets done. Your car still charges. It just happens when the earth prefers it.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-12">
            {/* Dirty Timeline */}
            <div className="glass-card p-6 border-l-4 border-l-error">
              <div className="flex justify-between items-center mb-6">
                <span className="font-headline font-bold text-error uppercase tracking-tighter">Legacy Behavior (Dirty)</span>
                <span className="text-[10px] text-slate-500">18:00–22:00</span>
              </div>
              <motion.div 
                className="h-28 w-full bg-surface-container-lowest rounded-sm flex items-end px-4 gap-1 pt-6 pb-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <motion.div variants={barVariants} className="w-full h-1/4 bg-error/20 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-1/3 bg-error/20 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-2/3 bg-error/40 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-5/6 bg-error/80 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-full bg-error rounded-t-sm relative origin-bottom">
                  <motion.div variants={textVariants} className="absolute bottom-full mb-0.5 leading-none left-1/2 -translate-x-1/2 text-[10px] font-bold text-error">PEAK</motion.div>
                </motion.div>
                <motion.div variants={barVariants} className="w-full h-3/4 bg-error/60 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-1/2 bg-error/30 rounded-t-sm origin-bottom"></motion.div>
              </motion.div>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-surface-container-highest text-[10px] rounded-sm text-on-surface-variant">EV Charging</span>
                <span className="px-2 py-1 bg-surface-container-highest text-[10px] rounded-sm text-on-surface-variant">Dishwasher</span>
              </div>
            </div>
            {/* Clean Timeline */}
            <div className="glass-card p-6 border-l-4 border-l-primary">
              <div className="flex justify-between items-center mb-6">
                <span className="font-headline font-bold text-primary uppercase tracking-tighter">GridGhost Mode (Clean)</span>
                <span className="text-[10px] text-slate-500">09:00–13:00</span>
              </div>
              <motion.div 
                className="h-28 w-full bg-surface-container-lowest rounded-sm flex items-end px-4 gap-1 pt-6 pb-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <motion.div variants={barVariants} className="w-full h-full bg-primary rounded-t-sm relative origin-bottom">
                  <motion.div variants={textVariants} className="absolute bottom-full mb-0.5 leading-none left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">OPTIMAL</motion.div>
                </motion.div>
                <motion.div variants={barVariants} className="w-full h-5/6 bg-primary/80 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-2/3 bg-primary/40 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-1/3 bg-primary/20 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-1/6 bg-primary/10 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-1/6 bg-primary/10 rounded-t-sm origin-bottom"></motion.div>
                <motion.div variants={barVariants} className="w-full h-1/6 bg-primary/10 rounded-t-sm origin-bottom"></motion.div>
              </motion.div>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-primary/20 text-[10px] rounded-sm text-primary">EV Charging (Shifted)</span>
                <span className="px-2 py-1 bg-primary/20 text-[10px] rounded-sm text-primary">Dishwasher (Shifted)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConceptSection;