import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  ALL_TRAVEL_CLASSES,
  DEFAULT_FILTERS,
  useGlobalFilters,
} from "../hooks/useGlobalFilters";
import { Journey } from "../hooks/useJourneyData";
import { buildJourneyUrl } from "../lib/utils";
import { translateStation } from "../utils/translations";
import Filters from "./Filters";
import TrainMap from "./TrainMap";

interface JourneysTabProps {
  journeys: Journey[];
  allJourneys?: Journey[]; // Nouvelles données non filtrées
  analysisDates?: string[];
  selectedDates?: string[]; // Changé pour supporter multiple dates
  onDateSelect?: (dates: string[]) => void; // Changé pour supporter multiple dates
  applyFilters?: (filters: {
    carriers?: string[];
    classes?: string[];
    discountCards?: string[];
    flexibilities?: string[];
    selectedDates?: string[];
  }) => void;
  currentFilters?: {
    carriers: string[];
    classes: string[];
    discountCards: string[];
    flexibilities?: string[];
    selectedDates: string[];
  };
}

const JourneysTab = ({
  journeys,
  allJourneys,
  analysisDates = [],
  selectedDates = [],
  onDateSelect,
  applyFilters: propApplyFilters,
  currentFilters,
  filterLoading = false,
}: JourneysTabProps) => {
  const [selectedRouteJourneyIds, setSelectedRouteJourneyIds] = useState<
    string[]
  >([]);

  const applyFilters = propApplyFilters;

  // Callback pour appliquer les filtres quand ils changent
  const handleFiltersChange = useCallback(
    (filters: {
      carriers: string[];
      classes: string[];
      discountCards: string[];
    }) => {
      // Envoyer directement les filtres inclusifs à l'API
      if (applyFilters) {
        applyFilters({
          carriers: filters.carriers,
          classes: filters.classes,
          discountCards: filters.discountCards,
        });
      }
    },
    [applyFilters]
  );

  // Extraire les flexibilités disponibles depuis allJourneys
  const availableFlexibilities = useMemo(() => {
    const flexibilities = new Set<string>();
    const dataToUse = allJourneys ?? journeys;
    for (const journey of dataToUse) {
      if (journey.offers && journey.offers.length > 0) {
        for (const offer of journey.offers) {
          if (offer.flexibilities && offer.flexibilities.length > 0) {
            for (const flexibility of offer.flexibilities) {
              flexibilities.add(flexibility);
            }
          }
        }
      }
    }
    const result = Array.from(flexibilities);
    return result.length > 0 ? result : ["nonflexi", "flexi", "semiflexi"];
  }, [allJourneys, journeys]);

  // Gérer le toggle de flexibilité
  const handleFlexibilityToggle = useCallback(
    (flexibility: string) => {
      const currentFlexibilities = currentFilters?.flexibilities || [];
      const newFlexibilities = currentFlexibilities.includes(flexibility)
        ? currentFlexibilities.filter((f) => f !== flexibility)
        : [...currentFlexibilities, flexibility];

      if (applyFilters) {
        applyFilters({
          flexibilities: newFlexibilities,
        });
      }
    },
    [currentFilters?.flexibilities, applyFilters]
  );

  // Mémoriser la transformation des filtres pour éviter la boucle infinie
  const transformedCurrentFilters = useMemo(() => {
    if (!currentFilters) return undefined;
    return {
      carriers: currentFilters.carriers,
      classes: currentFilters.classes,
      discountCards: currentFilters.discountCards,
    };
  }, [currentFilters]);

  const {
    availableOptions,
    filters,
    handleCarrierFilter,
    handleClassFilter,
    handleDiscountCardFilter,
    clearFilters,
  } = useGlobalFilters(
    journeys,
    handleFiltersChange,
    transformedCurrentFilters,
    allJourneys
  ); // Passer allJourneys

  // Les journeys sont déjà filtrées par l'API, pas besoin de filtrage côté client
  const filteredJourneys = journeys;

  const displayJourneys =
    selectedRouteJourneyIds.length > 0
      ? journeys.filter((journey: Journey) =>
          selectedRouteJourneyIds.includes(journey.id)
        )
      : filteredJourneys;

  // Les prix sont déjà calculés côté serveur, utiliser directement les valeurs des journeys
  const getJourneyPrices = (journey: Journey) => {
    return {
      minPrice: journey.minPrice,
      avgPrice: journey.avgPrice,
      maxPrice: journey.maxPrice,
    };
  };

  const parseJourneyName = (name: string) => {
    const parts = name.split(" ⟷ ");
    return {
      departure: parts[0] || "",
      arrival: parts[1] || "",
    };
  };

  const [sortField, setSortField] = useState<string>("name");
  const [sortDirections, setSortDirections] = useState<
    Record<string, "asc" | "desc">
  >({
    name: "asc",
    arrival: "asc",
    minPrice: "asc",
    avgPrice: "asc",
    maxPrice: "asc",
  });

  const handleSort = (field: string) => {
    const currentDirection = sortDirections[field] || "asc";
    const newDirection =
      sortField === field
        ? currentDirection === "asc"
          ? "desc"
          : "asc"
        : "asc";

    setSortDirections({
      ...sortDirections,
      [field]: newDirection,
    });

    setSortField(field);
  };

  const getSortIcon = (field: string) => {
    const direction = sortDirections[field] || "asc";
    const isActive = sortField === field;

    if (isActive) {
      return direction === "asc" ? (
        <ChevronUp className="w-5 h-5 text-blue-600 font-bold bg-blue-100 rounded-full p-1" />
      ) : (
        <ChevronDown className="w-5 h-5 text-blue-600 font-bold bg-blue-100 rounded-full p-1" />
      );
    }

    return direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-gray-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-400" />
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
      case "departure":
        aValue = parseJourneyName(a.name).departure;
        bValue = parseJourneyName(b.name).departure;
        break;
      case "arrival":
        aValue = parseJourneyName(a.name).arrival;
        bValue = parseJourneyName(b.name).arrival;
        break;
      case "minPrice":
        aValue = getJourneyPrices(a).minPrice;
        bValue = getJourneyPrices(b).minPrice;
        break;
      case "avgPrice":
        aValue = getJourneyPrices(a).avgPrice;
        bValue = getJourneyPrices(b).avgPrice;
        break;
      case "maxPrice":
        aValue = getJourneyPrices(a).maxPrice;
        bValue = getJourneyPrices(b).maxPrice;
        break;
      default:
        return 0;
    }

    const direction = sortDirections[sortField] || "asc";
    if (direction === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Fonction pour reset les filtres
  const handleResetFilters = useCallback(() => {
    clearFilters();
    if (onDateSelect) {
      onDateSelect([]);
    }
    if (applyFilters) {
      applyFilters({
        carriers: DEFAULT_FILTERS.carriers,
        classes: DEFAULT_FILTERS.classes,
        discountCards: DEFAULT_FILTERS.discountCards,
        flexibilities: [],
        selectedDates: [],
      });
    }
  }, [clearFilters, onDateSelect, applyFilters]);

  // Vérifier si les filtres sont collapsés
  const [filtersCollapsed, setFiltersCollapsed] = useState(() => {
    const saved = localStorage.getItem("filters-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // Écouter les changements de collapse depuis localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("filters-collapsed");
      const newState = saved ? JSON.parse(saved) : false;
      if (newState !== filtersCollapsed) {
        setFiltersCollapsed(newState);
      }
    };
    globalThis.addEventListener("storage", handleStorageChange);
    // Écouter aussi les changements dans le même onglet avec un délai plus long
    const interval = setInterval(handleStorageChange, 300);
    return () => {
      globalThis.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [filtersCollapsed]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {/* Bouton pour réafficher les filtres quand ils sont collapsés */}
      {filtersCollapsed && (
        <Button
          onClick={() => {
            const newState = false;
            setFiltersCollapsed(newState);
            localStorage.setItem("filters-collapsed", JSON.stringify(newState));
          }}
          variant="outline"
          size="sm"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 rounded-r-lg rounded-l-none shadow-lg bg-white hover:bg-gray-50"
          aria-label="Afficher les filtres"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
      {/* Sidebar de filtres - max 1/3 sur desktop */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          filtersCollapsed
            ? "lg:w-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none"
            : "lg:w-1/3 lg:max-w-md lg:opacity-100 lg:pointer-events-auto"
        } lg:sticky lg:top-4 lg:self-start`}
        style={{
          willChange: "opacity, width",
        }}
      >
        <Filters
          availableDates={analysisDates}
          availableTrains={[]}
          availableCarriers={availableOptions.carriers}
          availableClasses={ALL_TRAVEL_CLASSES}
          availableDiscountCards={availableOptions.discountCards}
          availableFlexibilities={availableFlexibilities}
          selectedDates={selectedDates}
          selectedTrain={null}
          selectedCarriers={filters.carriers}
          selectedClasses={filters.classes}
          selectedDiscountCards={filters.discountCards}
          selectedFlexibilities={currentFilters?.flexibilities || []}
          onDatesSelect={onDateSelect}
          onTrainSelect={() => {}}
          onCarrierToggle={handleCarrierFilter}
          onClassToggle={handleClassFilter}
          onDiscountCardToggle={handleDiscountCardFilter}
          onFlexibilityToggle={handleFlexibilityToggle}
          onResetFilters={handleResetFilters}
          filterLoading={filterLoading}
        />
      </div>

      {/* Contenu principal - carte et tableau - prend toute la largeur si filtres collapsés */}
      <div className="flex-1 space-y-6">
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

        {/* Indicateur de sélection de route et filtres actifs */}
        {selectedRouteJourneyIds.length > 0 && (
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
                      onDateSelect([]);
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
                      onClick={() => handleSort("arrival")}
                    >
                      <div className="flex items-center gap-2">
                        Origine / Destination depuis Paris
                        {getSortIcon("arrival")}
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <TrendingUp className="w-4 h-4" />
                            Prix moyen à J-7
                            {getSortIcon("avgPrice")}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Si disponible, sinon, moyenne sur toutes les données
                            filtrées
                          </p>
                        </TooltipContent>
                      </Tooltip>
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
                    <TableHead className="font-semibold text-gray-700"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedJourneys.map((journey: Journey) => {
                    const journeyPrices = getJourneyPrices(journey);
                    const { departure, arrival } = parseJourneyName(
                      journey.name
                    );

                    // Afficher la station qui n'est pas Paris
                    const displayStation =
                      departure === "Paris" ? arrival : departure;

                    return (
                      <TableRow
                        key={journey.id}
                        className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                      >
                        <TableCell className="font-semibold text-gray-900">
                          {translateStation(displayStation)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {journeyPrices.minPrice}€
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            {journeyPrices.avgPrice}€
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                            {journeyPrices.maxPrice}€
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                          >
                            <Link
                              to={buildJourneyUrl(
                                journey.departureStation,
                                journey.arrivalStation,
                                journey.departureStationId,
                                journey.arrivalStationId
                              )}
                            >
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
    </div>
  );
};

export default JourneysTab;
