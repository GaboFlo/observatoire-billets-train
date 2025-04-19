
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
import { TrendingDown, TrendingUp, Train, Clock, Ticket, Badge } from "lucide-react";

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
                <TableHead>Prix</TableHead>
                <TableHead>Variation</TableHead>
                <TableHead className="hidden md:table-cell">Délai</TableHead>
                <TableHead className="hidden md:table-cell">Classe</TableHead>
                <TableHead className="hidden lg:table-cell">Réduction</TableHead>
                <TableHead className="hidden lg:table-cell">Horaire</TableHead>
                <TableHead className="hidden xl:table-cell">Transporteur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.formattedDate}</TableCell>
                  <TableCell>{item.price}€</TableCell>
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
                          {item.priceChange.toFixed(2)}€
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>J-{item.daysBeforeDeparture}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Ticket className="h-4 w-4 text-gray-500" />
                      <span>{item.class}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Badge className="h-4 w-4 text-gray-500" />
                      <span>{item.discount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{item.departureTime}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex items-center gap-1">
                      <Train className="h-4 w-4 text-gray-500" />
                      <span>{item.carrier}</span>
                    </div>
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
