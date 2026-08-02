import { SalesChart } from "../SalesChart";

export default function SalesChartExample() {
  const mockData = [
    { date: "05/10", value: 8234 },
    { date: "06/10", value: 9845 },
    { date: "07/10", value: 7621 },
    { date: "08/10", value: 11234 },
    { date: "09/10", value: 10987 },
    { date: "10/10", value: 13450 },
    { date: "11/10", value: 12450 },
  ];

  return (
    <div className="p-4">
      <SalesChart data={mockData} />
    </div>
  );
}
