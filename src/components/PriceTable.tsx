
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketPrice } from "@/data/mockData";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PriceTableProps {
  data: TicketPrice[];
  title: string;
  description?: string;
  className?: string;
  limit?: number;
}

const PriceTable = ({
  data,
  title,
  description,
  className,
  limit = 10,
}: PriceTableProps) => {
  // Format the data to include month names for better readability
  const formattedData = data.map((item) => {
    const date = new Date(item.date);
    const prevDay = data.find(
      (d) => d.date === new Date(new Date(item.date).setDate(date.getDate() - 1)).toISOString().split('T')[0]
    );
    const priceChange = prevDay ? item.price - prevDay.price : 0;
    const priceChangePercent = prevDay ? (priceChange / prevDay.price) * 100 : 0;
    
    return {
      ...item,
      formattedDate: date.toLocaleDateString('fr-FR', { 
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      priceChange,
      priceChangePercent
    };
  });

  // Sort by date descending (most recent first) and limit the number of rows
  const sortedData = [...formattedData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return (
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
                <TableHead>Prix Min</TableHead>
                <TableHead>Prix Moyen</TableHead>
                <TableHead>Prix Max</TableHead>
                <TableHead>Variation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.formattedDate}</TableCell>
                  <TableCell>{item.lowestPrice}€</TableCell>
                  <TableCell>{item.averagePrice}€</TableCell>
                  <TableCell>{item.highestPrice}€</TableCell>
                  <TableCell>
                    {item.priceChange !== 0 ? (
                      <div className="flex items-center">
                        {item.priceChange > 0 ? (
                          <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-4 w-4 text-emerald-500" />
                        )}
                        <span
                          className={
                            item.priceChange > 0
                              ? "text-red-500"
                              : "text-emerald-500"
                          }
                        >
                          {item.priceChange > 0 ? "+" : ""}
                          {item.priceChange.toFixed(2)}€ (
                          {item.priceChangePercent.toFixed(1)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTable;
