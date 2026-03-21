import GenerationMixChart from "./GenerationMixChart";
import DualSignalChart from "./DualSignalChart";
import MoerHistoryChart from "./MoerHistoryChart";
import { useForecast } from "../../hooks/useForecast";
import { useGenerationMix } from "../../hooks/useGenerationMix";

export default function AnalyticsView() {
  const { forecast } = useForecast();
  const { data: genMix } = useGenerationMix();

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-lg font-semibold">Grid Analytics</h2>
      <GenerationMixChart data={genMix} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DualSignalChart forecast={forecast} />
        <MoerHistoryChart />
      </div>
    </div>
  );
}
