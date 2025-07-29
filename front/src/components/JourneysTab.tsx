import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useGlobalFilters } from "../hooks/useGlobalFilters";
import { AggregatedPricingResult, GroupedJourney } from "../types/journey";
import GlobalFilters from "./GlobalFilters";
import TrainMap from "./TrainMap";

interface JourneysTabProps {
  journeys: GroupedJourney[];
}

type SortField = "name" | "minPrice" | "avgPrice" | "maxPrice";
type SortDirection = "asc" | "desc";

const JourneysTab = ({ journeys }: JourneysTabProps) => {
  const [selectedRouteJourneyIds, setSelectedRouteJourneyIds] = useState<
    string[]
  >([]);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const {
    filters,
    availableOptions,
    filteredJourneys,
    handleCarrierFilter,
    handleClassFilter,
    handleDiscountCardFilter,
    clearFilters,
  } = useGlobalFilters(journeys);

  const hasActiveFilters =
    filters.excludedCarriers.length > 0 ||
    filters.excludedClasses.length > 0 ||
    filters.excludedDiscountCards.length > 1; // Plus de 1 car MAX est toujours exclu par défaut

  const calculateFilteredPrices = (journey: GroupedJourney) => {
    if (journey.offers.length === 0) {
      return { minPrice: 0, avgPrice: 0, maxPrice: 0 };
    }

    const allPrices = [
      ...journey.offers.map((o: AggregatedPricingResult) => o.minPrice),
      ...journey.offers.map((o: AggregatedPricingResult) => o.avgPrice),
      ...journey.offers.map((o: AggregatedPricingResult) => o.maxPrice),
    ];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const avgPrice =
      allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

    return {
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice),
    };
  };

  // Filtrer les trajets selon la sélection de route et les trier
  const displayJourneys = useMemo(() => {
    let journeys = filteredJourneys;

    if (selectedRouteJourneyIds.length > 0) {
      journeys = filteredJourneys.filter((journey) =>
        selectedRouteJourneyIds.includes(journey.id)
      );
    }

    // Trier selon le champ et la direction sélectionnés
    return journeys.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === "name") {
        aValue = a.name;
        bValue = b.name;
      } else {
        const aPrices = calculateFilteredPrices(a);
        const bPrices = calculateFilteredPrices(b);
        aValue = aPrices[sortField];
        bValue = bPrices[sortField];
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredJourneys, selectedRouteJourneyIds, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    );
  };

  const parseJourneyName = (name: string) => {
    const parts = name.split(" → ");
    return {
      departure: parts[0] || "",
      arrival: parts[1] || "",
    };
  };

  return (
    <div className="space-y-2">
      {/* Carte et filtres */}
      <div className="space-y-4">
        {/* Carte */}
        <div className="h-96 w-full flex">
          <TrainMap
            journeys={filteredJourneys}
            onRouteSelect={setSelectedRouteJourneyIds}
          />
        </div>

        {/* Filtres */}
        <div className="w-full">
          <GlobalFilters
            filters={filters}
            availableOptions={availableOptions}
            onCarrierFilter={handleCarrierFilter}
            onClassFilter={handleClassFilter}
            onDiscountCardFilter={handleDiscountCardFilter}
          />
        </div>
      </div>

      {/* Indicateur de sélection de route et filtres actifs */}
      {(selectedRouteJourneyIds.length > 0 || hasActiveFilters) && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              {selectedRouteJourneyIds.length > 0 ? (
                <>
                  <span className="font-medium">Route sélectionnée :</span>{" "}
                  {displayJourneys.length} trajet(s) affiché(s)
                </>
              ) : (
                <>
                  <span className="font-medium">Filtres actifs :</span>{" "}
                  {displayJourneys.length} trajet(s) affiché(s)
                </>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedRouteJourneyIds([]);
                clearFilters();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir tous les trajets
            </button>
          </div>
        </div>
      )}

      {/* Tableau des trajets */}
      <Card className="border-0 shadow-none">
        <CardContent className="pt-0">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Départ
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Arrivée
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("minPrice")}
                  >
                    <div className="flex items-center gap-1">
                      Prix minimum
                      {getSortIcon("minPrice")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("avgPrice")}
                  >
                    <div className="flex items-center gap-1">
                      Prix moyen
                      {getSortIcon("avgPrice")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("maxPrice")}
                  >
                    <div className="flex items-center gap-1">
                      Prix maximum
                      {getSortIcon("maxPrice")}
                    </div>
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayJourneys.map((journey: GroupedJourney) => {
                  const filteredPrices = calculateFilteredPrices(journey);
                  const { departure, arrival } = parseJourneyName(journey.name);

                  return (
                    <TableRow key={journey.id}>
                      <TableCell className="font-medium">{departure}</TableCell>
                      <TableCell className="font-medium">{arrival}</TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {filteredPrices.minPrice}€
                      </TableCell>
                      <TableCell className="text-blue-600 font-semibold">
                        {filteredPrices.avgPrice}€
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {filteredPrices.maxPrice}€
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/journey/${journey.id}`}>
                            Analyse détaillée
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JourneysTab;
