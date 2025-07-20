import { TicketPrice } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import PriceFiltersComponent, { PriceFilters } from "./PriceFilters";
import { useState } from "react";

interface PriceTableProps {
  data: TicketPrice[];
  title: string;
  description?: string;
  className?: string;
  limit?: number;
  showFilters?: boolean;
  onFiltersChange?: (filteredData: TicketPrice[]) => void;
}

const PriceTable = ({ data, title, description, className, limit, showFilters = false, onFiltersChange }: PriceTableProps) => {
  const [filteredData, setFilteredData] = useState(data);

  const handleFiltersChange = (newFilteredData: TicketPrice[], filters: PriceFilters) => {
    setFilteredData(newFilteredData);
    onFiltersChange?.(newFilteredData);
  };

  // Process and format the data
  const formattedData = filteredData.map((item, index) => {
    const previousPrice = index > 0 ? filteredData[index - 1]?.price : item.price;
    const priceChange = item.price - previousPrice;
    const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
    
    return {
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      priceChange,
      priceChangePercent,
    };
  });

  // Sort by date (most recent first) and apply limit
  const sortedData = [...formattedData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Variation</TableHead>
                  <TableHead>J-X</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Réduction</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Transporteur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.formattedDate}</TableCell>
                    <TableCell>{item.price}€</TableCell>
                    <TableCell>
                      {Math.abs(item.priceChange) > 0.1 ? (
                        <div className="flex items-center">
                          {item.priceChange > 0 ? (
                            <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="mr-1 h-4 w-4 text-emerald-500" />
                          )}
                          <span
                            className={
                              item.priceChange > 0 ? "text-red-500" : "text-emerald-500"
                            }
                          >
                            {item.priceChange > 0 ? "+" : ""}
                            {item.priceChange.toFixed(2)}€
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>J-{item.daysBeforeDeparture}</TableCell>
                    <TableCell className="capitalize">{item.class}</TableCell>
                    <TableCell className="capitalize">
                      {item.discount === "aucune" ? "Aucune" : item.discount}
                    </TableCell>
                    <TableCell>{item.departureTime}</TableCell>
                    <TableCell>{item.carrier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceTable;