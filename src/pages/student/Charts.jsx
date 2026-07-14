import LiveChartWidget from '../../components/charts/LiveChartWidget';

export default function StudentCharts() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink">Advanced Charts</h1>
        <p className="text-sm text-dark-500">Interactive TradingView chart with persistent drawings</p>
      </div>
      <LiveChartWidget showTitle={false} />
    </div>
  );
}
