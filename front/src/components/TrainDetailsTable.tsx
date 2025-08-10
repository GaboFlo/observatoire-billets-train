import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DetailedPricingResult } from "@/types/journey";
import { Calendar, Clock, Train, TrendingUp } from "lucide-react";
import { useState } from "react";

interface TrainDetailsTableProps {
  offers: DetailedPricingResult[];
  onTrainSelect: (trainName: string, departureDate: string) => void;
}

const TrainDetailsTable = ({
  offers,
  onTrainSelect,
}: TrainDetailsTableProps) => {
  const [sortField, setSortField] = useState<string>("departureDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedOffers = [...offers].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortField) {
      case "departureDate":
        aValue = a.departureDate ? new Date(a.departureDate) : new Date(0);
        bValue = b.departureDate ? new Date(b.departureDate) : new Date(0);
        break;
      case "departureTime":
        aValue = a.departureTime || "";
        bValue = b.departureTime || "";
        break;
      case "trainName":
        aValue = a.trainName;
        bValue = b.trainName;
        break;
      case "minPrice":
        aValue = a.minPrice;
        bValue = b.minPrice;
        break;
      case "avgPrice":
        aValue = a.avgPrice;
        bValue = b.avgPrice;
        break;
      case "maxPrice":
        aValue = a.maxPrice;
        bValue = b.maxPrice;
        break;
      default:
        return 0;
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getStatusBadge = (offer: DetailedPricingResult) => {
    if (!offer.is_sellable) {
      return (
        <Badge variant="destructive" className="text-xs">
          {offer.unsellable_reason || "Indisponible"}
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="text-xs">
        Disponible
      </Badge>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="h-5 w-5" />
          Détail des trains
        </CardTitle>
        <CardDescription>
          Liste complète des trains avec horaires, prix et disponibilité
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                  onClick={() => handleSort("departureDate")}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                  onClick={() => handleSort("departureTime")}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Départ
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Arrivée
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                  onClick={() => handleSort("trainName")}
                >
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4" />
                    Train
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Compagnie
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Classe
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                  onClick={() => handleSort("minPrice")}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Prix min
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                  onClick={() => handleSort("avgPrice")}
                >
                  Prix moyen
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                  onClick={() => handleSort("maxPrice")}
                >
                  Prix max
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Statut
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOffers.map((offer, index) => (
                <TableRow
                  key={`${offer.trainName}-${offer.departureDate}-${index}`}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 cursor-pointer"
                  onClick={() =>
                    onTrainSelect(offer.trainName, offer.departureDate || "")
                  }
                >
                  <TableCell className="font-medium text-gray-900">
                    {formatDate(offer.departureDate)}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {formatTime(offer.departureTime)}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {formatTime(offer.arrivalTime)}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {offer.trainName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {offer.carrier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {offer.travelClass}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      {offer.minPrice}€
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {offer.avgPrice}€
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                      {offer.maxPrice}€
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(offer)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainDetailsTable;
