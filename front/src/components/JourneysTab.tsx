import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingUp,
} from "lucide-react";
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
import { Journey } from "../hooks/useJourneyData";
import { translateStation } from "../utils/translations";
import GlobalFilters from "./GlobalFilters";
import TrainMap from "./TrainMap";

interface JourneysTabProps {
  journeys: Journey[];
  analysisDates?: string[];
  selectedDate?: string | null;
  onDateSelect?: (date: string | null) => void;
}

const JourneysTab = ({
  journeys,
  analysisDates = [],
  selectedDate,
  onDateSelect,
}: JourneysTabProps) => {
  const [selectedRouteJourneyIds, setSelectedRouteJourneyIds] = useState<
    string[]
  >([]);

  const {
    availableOptions,
    filters,
    handleCarrierFilter,
    handleClassFilter,
    handleDiscountCardFilter,
    clearFilters,
  } = useGlobalFilters(journeys);

  const filteredJourneys = useMemo(() => {
    return journeys.filter((journey: Journey) => {
      // Filtrage par route sélectionnée
      if (selectedRouteJourneyIds.length > 0) {
        return selectedRouteJourneyIds.includes(journey.id);
      }

      // Filtrage par compagnie
      if (filters.excludedCarriers.length > 0) {
        const hasExcludedCarrier = journey.carriers.some((carrier: string) =>
          filters.excludedCarriers.includes(carrier)
        );
        if (hasExcludedCarrier) return false;
      }

      // Filtrage par classe
      if (filters.excludedClasses.length > 0) {
        const hasExcludedClass = journey.classes.some((travelClass: string) =>
          filters.excludedClasses.includes(travelClass)
        );
        if (hasExcludedClass) return false;
      }

      // Filtrage par carte de réduction
      if (filters.excludedDiscountCards.length > 0) {
        const hasExcludedDiscountCard = journey.discountCards.some(
          (discountCard: string) =>
            filters.excludedDiscountCards.includes(discountCard)
        );
        if (hasExcludedDiscountCard) return false;
      }

      return true;
    });
  }, [journeys, selectedRouteJourneyIds, filters]);

  const hasActiveFilters =
    filters.excludedCarriers.length > 0 ||
    filters.excludedClasses.length > 0 ||
    filters.excludedDiscountCards.length > 1 ||
    selectedDate;

  const displayJourneys =
    selectedRouteJourneyIds.length > 0
      ? journeys.filter((journey: Journey) =>
          selectedRouteJourneyIds.includes(journey.id)
        )
      : filteredJourneys;

  const calculateFilteredPrices = (journey: Journey) => {
    const filteredOffers = journey.offers.filter((offer) => {
      // Filtrage par compagnie
      if (filters.excludedCarriers.length > 0) {
        if (filters.excludedCarriers.includes(offer.carrier)) {
          return false;
        }
      }

      // Filtrage par classe
      if (filters.excludedClasses.length > 0) {
        if (filters.excludedClasses.includes(offer.travelClass)) {
          return false;
        }
      }

      // Filtrage par carte de réduction
      if (filters.excludedDiscountCards.length > 0) {
        if (filters.excludedDiscountCards.includes(offer.discountCard)) {
          return false;
        }
      }

      return true;
    });

    if (filteredOffers.length === 0) {
      return { minPrice: 0, avgPrice: 0, maxPrice: 0 };
    }

    const prices = filteredOffers.map((offer) => offer.minPrice);
    return {
      minPrice: Math.min(...prices),
      avgPrice: Math.round(
        prices.reduce((sum: number, price: number) => sum + price, 0) /
          prices.length
      ),
      maxPrice: Math.max(...prices),
    };
  };

  const parseJourneyName = (name: string) => {
    const parts = name.split(" → ");
    return {
      departure: parts[0] || "",
      arrival: parts[1] || "",
    };
  };

  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const sortedJourneys = [...displayJourneys].sort((a: Journey, b: Journey) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "minPrice":
        aValue = calculateFilteredPrices(a).minPrice;
        bValue = calculateFilteredPrices(b).minPrice;
        break;
      case "avgPrice":
        aValue = calculateFilteredPrices(a).avgPrice;
        bValue = calculateFilteredPrices(b).avgPrice;
        break;
      case "maxPrice":
        aValue = calculateFilteredPrices(a).maxPrice;
        bValue = calculateFilteredPrices(b).maxPrice;
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

  return (
    <div className="space-y-6">
      {/* Carte et filtres */}
      <div className="space-y-6">
        {/* Carte */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="h-96 w-full">
              <TrainMap
                journeys={filteredJourneys}
                onRouteSelect={setSelectedRouteJourneyIds}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtres */}
        <GlobalFilters
          filters={filters}
          availableOptions={availableOptions}
          onCarrierFilter={handleCarrierFilter}
          onClassFilter={handleClassFilter}
          onDiscountCardFilter={handleDiscountCardFilter}
          analysisDates={analysisDates}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
        />
      </div>

      {/* Indicateur de sélection de route et filtres actifs */}
      {(selectedRouteJourneyIds.length > 0 || hasActiveFilters) && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  {selectedRouteJourneyIds.length > 0 ? (
                    <>
                      <span className="font-semibold">
                        Route sélectionnée :
                      </span>{" "}
                      {displayJourneys.length} trajet(s) affiché(s)
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Filtres actifs :</span>{" "}
                      {displayJourneys.length} trajet(s) affiché(s)
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRouteJourneyIds([]);
                  clearFilters();
                  if (onDateSelect) {
                    onDateSelect(null);
                  }
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                Voir tous les trajets
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau des trajets */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardContent className="p-0">
          <div className="rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Départ
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Arrivée
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                    onClick={() => handleSort("minPrice")}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Prix minimum
                      {getSortIcon("minPrice")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                    onClick={() => handleSort("avgPrice")}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Prix moyen
                      {getSortIcon("avgPrice")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                    onClick={() => handleSort("maxPrice")}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Prix maximum
                      {getSortIcon("maxPrice")}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJourneys.map((journey: Journey) => {
                  const filteredPrices = calculateFilteredPrices(journey);
                  const { departure, arrival } = parseJourneyName(journey.name);

                  return (
                    <TableRow
                      key={journey.id}
                      className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                    >
                      <TableCell className="font-semibold text-gray-900">
                        {translateStation(departure)}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {translateStation(arrival)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          {filteredPrices.minPrice}€
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {filteredPrices.avgPrice}€
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          {filteredPrices.maxPrice}€
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                        >
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
