import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { TicketPrice } from "../data/mockData";
import PriceFiltersComponent, { PriceFilters } from "./PriceFilters";

interface FormattedTicketPrice extends TicketPrice {
  formattedDate: string;
  priceChange: number;
}

interface PriceTableProps {
  data: TicketPrice[];
  title?: string;
  description?: string;
  showFilters?: boolean;
  onFiltersChange?: (filteredData: TicketPrice[]) => void;
}

const PriceTable = ({
  data,
  title = "Évolution des Prix",
  description = "Tableau détaillé des prix des billets de train",
  showFilters = false,
  onFiltersChange,
}: PriceTableProps) => {
  const [filteredData, setFilteredData] = useState(data);

  const handleFiltersChange = (
    newFilteredData: TicketPrice[],
    newFilters: PriceFilters
  ) => {
    setFilteredData(newFilteredData);
    if (onFiltersChange) {
      onFiltersChange(newFilteredData);
    }
  };

  // Process and format the data
  const formattedData = filteredData.map((item: TicketPrice, index: number) => {
    const previousPrice =
      index > 0 ? filteredData[index - 1]?.price : item.price;
    const priceChange = item.price - previousPrice;

    return {
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString("fr-FR"),
      priceChange,
    };
  });

  // Sort data by date (newest first)
  const sortedData = [...formattedData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      {showFilters && (
        <PriceFiltersComponent
          data={data}
          onFiltersChange={handleFiltersChange}
        />
      )}
      <Card>
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
                  <TableHead>Classe</TableHead>
                  <TableHead>Carte de réduction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item: FormattedTicketPrice, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.formattedDate}
                    </TableCell>
                    <TableCell>{item.price}€</TableCell>
                    <TableCell className="flex items-center gap-1">
                      {item.priceChange !== 0 && (
                        <>
                          {item.priceChange > 0 ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                          <span
                            className={
                              item.priceChange > 0
                                ? "text-red-500"
                                : "text-green-500"
                            }
                          >
                            {item.priceChange > 0 ? "+" : ""}
                            {item.priceChange}€
                          </span>
                        </>
                      )}
                    </TableCell>
                    <TableCell>{item.class}</TableCell>
                    <TableCell>{item.discount}</TableCell>
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
