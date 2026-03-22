import { motion } from "framer-motion";
import GenerationMixChart from "./GenerationMixChart";
import DualSignalChart from "./DualSignalChart";
import MoerHistoryChart from "./MoerHistoryChart";
import { useForecast } from "../../hooks/useForecast";
import { useGenerationMix } from "../../hooks/useGenerationMix";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AnalyticsView() {
  const { forecast } = useForecast();
  const { data: genMix } = useGenerationMix();

  return (
    <motion.div 
      className="space-y-4 mt-6 mx-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.h2 variants={itemVariants} className="text-lg font-semibold">Grid Analytics</motion.h2>
      <motion.div variants={itemVariants}>
        <GenerationMixChart data={genMix} />
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <DualSignalChart forecast={forecast} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MoerHistoryChart />
        </motion.div>
      </div>
    </motion.div>
  );
}
