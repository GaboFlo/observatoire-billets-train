import { CalendarDays, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import {
  DEFAULT_FILTERS,
  GlobalFilters as GlobalFiltersType,
} from "../hooks/useGlobalFilters";
import {
  translateCarrier,
  translateDiscountCard,
  translateTravelClass,
} from "../utils/translations";

interface GlobalFiltersProps {
  filters: GlobalFiltersType;
  availableOptions: {
    carriers: string[];
    classes: string[];
    discountCards: string[];
  };
  onCarrierFilter: (carrier: string) => void;
  onClassFilter: (travelClass: string) => void;
  onDiscountCardFilter: (discountCard: string) => void;
  // Nouvelles props pour les dates
  analysisDates?: string[];
  selectedDates?: string[]; // Changé pour supporter multiple dates
  onDateSelect?: (dates: string[]) => void; // Changé pour supporter multiple dates
  onReload?: () => void; // Nouveau prop pour le rechargement
}

const GlobalFilters = ({
  filters,
  availableOptions,
  onCarrierFilter,
  onClassFilter,
  onDiscountCardFilter,
  analysisDates = [],
  selectedDates = [],
  onDateSelect,
  onReload,
}: GlobalFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false); // Plié par défaut

  // Vérifier si les filtres actuels sont différents des filtres par défaut
  const hasActiveFilters = () => {
    if (!filters) return false;

    // Comparer les carriers
    const carriersDifferent =
      JSON.stringify(filters.carriers?.toSorted()) !==
      JSON.stringify(DEFAULT_FILTERS.carriers.toSorted());

    // Comparer les classes
    const classesDifferent =
      JSON.stringify(filters.classes?.toSorted()) !==
      JSON.stringify(DEFAULT_FILTERS.classes.toSorted());

    // Comparer les discountCards
    const discountCardsDifferent =
      JSON.stringify(filters.discountCards?.toSorted()) !==
      JSON.stringify(DEFAULT_FILTERS.discountCards.toSorted());

    // Vérifier les dates sélectionnées
    const hasSelectedDates = selectedDates.length > 0;

    return (
      carriersDifferent ||
      classesDifferent ||
      discountCardsDifferent ||
      hasSelectedDates
    );
  };

  const getActiveFiltersCount = () => {
    if (!filters) return 0;

    let count = 0;

    // Compter les carriers différents des filtres par défaut
    const carriersDifferent =
      JSON.stringify(filters.carriers?.toSorted()) !==
      JSON.stringify(DEFAULT_FILTERS.carriers.toSorted());
    if (carriersDifferent) count += 1;

    // Compter les classes différentes des filtres par défaut
    const classesDifferent =
      JSON.stringify(filters.classes?.toSorted()) !==
      JSON.stringify(DEFAULT_FILTERS.classes.toSorted());
    if (classesDifferent) count += 1;

    // Compter les discountCards différentes des filtres par défaut
    const discountCardsDifferent =
      JSON.stringify(filters.discountCards?.toSorted()) !==
      JSON.stringify(DEFAULT_FILTERS.discountCards.toSorted());
    if (discountCardsDifferent) count += 1;

    // Compter les dates sélectionnées
    count += selectedDates.length;

    return count;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("fr-FR", {
      weekday: "short",
    });
    const dateOnly = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    return `${dayOfWeek} ${dateOnly}`;
  };

  const getDateStatus = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "today";
    } else if (date > today) {
      return "future";
    } else {
      return "past";
    }
  };

  const handleDateClick = (date: string) => {
    if (onDateSelect) {
      const isSelected = selectedDates.includes(date);
      if (isSelected) {
        // Retirer la date de la sélection
        onDateSelect(selectedDates.filter((d) => d !== date));
      } else {
        // Ajouter la date à la sélection
        onDateSelect([...selectedDates, date]);
      }
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
              {hasActiveFilters() && (
                <p className="text-sm text-gray-500">
                  {getActiveFiltersCount()} filtre(s) actif(s)
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Réduire
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Déplier
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isExpanded && (
          <div className="space-y-6">
            {/* Calendrier des dates */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <CalendarDays className="w-4 h-4" />
                Dates d'analyse
              </h4>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {analysisDates.map((date, index) => {
                  const status = getDateStatus(date);
                  const isSelected = selectedDates.includes(date);

                  const statusColors = {
                    past: "bg-gray-100 text-gray-600 border-gray-200",
                    today: "bg-green-100 text-green-700 border-green-300",
                    future: "bg-blue-100 text-blue-700 border-blue-300",
                  };

                  const selectedColors = isSelected
                    ? "bg-blue-500 text-white border-blue-600"
                    : statusColors[status];

                  return (
                    <button
                      key={`date-${date}-${index}`}
                      onClick={() => handleDateClick(date)}
                      className={`p-2 rounded-lg border text-xs font-medium transition-all hover:shadow-md ${selectedColors} ${
                        isSelected ? "ring-2 ring-blue-300" : ""
                      }`}
                      title={formatDate(date)}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{formatDate(date)}</div>
                        {status === "today" && (
                          <div className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded mt-1">
                            Aujourd'hui
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compagnies */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Compagnies ferroviaires
              </h4>
              <div className="flex flex-wrap gap-3">
                {availableOptions.carriers.map(
                  (carrier: string, index: number) => {
                    const isSelected =
                      filters?.carriers?.includes(carrier) || false;

                    return (
                      <Badge
                        key={`carrier-${carrier}-${index}`}
                        variant="secondary"
                        className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 border border-blue-200 hover:border-blue-300 hover:shadow-md"
                            : "bg-gray-100 text-gray-400 line-through opacity-50"
                        }`}
                        onClick={() => onCarrierFilter(carrier)}
                      >
                        {translateCarrier(carrier)}
                      </Badge>
                    );
                  }
                )}
              </div>
            </div>

            {/* Classes de voyage */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Classes de voyage
              </h4>
              <div className="flex flex-wrap gap-3">
                {availableOptions.classes.map(
                  (travelClass: string, index: number) => {
                    const isSelected =
                      filters?.classes?.includes(travelClass) || false;

                    return (
                      <Badge
                        key={`class-${travelClass}-${index}`}
                        variant="secondary"
                        className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-700 border border-green-200 hover:border-green-300 hover:shadow-md"
                            : "bg-gray-100 text-gray-400 line-through opacity-50"
                        }`}
                        onClick={() => onClassFilter(travelClass)}
                      >
                        {translateTravelClass(travelClass)}
                      </Badge>
                    );
                  }
                )}
              </div>
            </div>

            {/* Cartes de réduction */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Cartes de réduction
              </h4>
              <div className="flex flex-wrap gap-3">
                {availableOptions.discountCards.map(
                  (discountCard: string, index: number) => {
                    return (
                      <Badge
                        key={`discount-${discountCard}-${index}`}
                        variant="secondary"
                        className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          filters?.discountCards?.includes(discountCard)
                            ? "bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-gray-700 border border-purple-200 hover:border-purple-300 hover:shadow-md"
                            : "bg-gray-100 text-gray-400 line-through opacity-50"
                        }`}
                        onClick={() => onDiscountCardFilter(discountCard)}
                      >
                        {translateDiscountCard(discountCard)}
                      </Badge>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalFilters;
