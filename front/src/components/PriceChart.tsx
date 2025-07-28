import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { TicketPrice } from "../data/mockData";
import PriceFiltersComponent, { PriceFilters } from "./PriceFilters";

interface PriceChartProps {
  data: TicketPrice[];
  title: string;
  description?: string;
  className?: string;
  showFilters?: boolean;
  onFiltersChange?: (filteredData: TicketPrice[]) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      formattedDate: string;
      price: number;
      lowestPrice: number;
      highestPrice: number;
    };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border rounded shadow-md">
        <p className="text-sm font-semibold">{data.formattedDate}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Prix:</span> {data.price}€
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Min:</span> {data.lowestPrice}€
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Max:</span> {data.highestPrice}€
        </p>
      </div>
    );
  }
  return null;
};

const PriceChart = ({
  data,
  title,
  description,
  className,
  showFilters = false,
  onFiltersChange,
}: PriceChartProps) => {
  const [filteredData, setFilteredData] = useState(data);

  const handleFiltersChange = (
    newFilteredData: TicketPrice[],
    filters: PriceFilters
  ) => {
    setFilteredData(newFilteredData);
    onFiltersChange?.(newFilteredData);
  };

  // Format data for chart display
  const formattedData = filteredData.map((item: TicketPrice) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  return (
    <div>
      {showFilters && (
        <PriceFiltersComponent
          data={data}
          onFiltersChange={handleFiltersChange}
        />
      )}
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={10}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="lowestPrice"
                  stroke="#10b981"
                  fillOpacity={0.2}
                  fill="url(#colorLow)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceChart;
