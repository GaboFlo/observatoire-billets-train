import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  translateCarrier,
  translateDiscountCard,
  translateFlexibility,
  translateTravelClass,
} from "@/utils/translations";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Filter,
  RotateCcw,
  Train,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface FiltersProps {
  // Données disponibles
  availableDates: string[];
  availableTrains: TrainInfo[];
  availableCarriers: string[];
  availableClasses: string[];
  availableDiscountCards: string[];
  availableFlexibilities: string[];

  // États sélectionnés - support pour page de détails (une date) et page d'accueil (plusieurs dates)
  selectedDate?: string | null;
  selectedDates?: string[];
  selectedTrain: string | null;
  selectedCarriers: string[];
  selectedClasses: string[];
  selectedDiscountCards: string[];
  selectedFlexibilities: string[];

  // Callbacks - support pour les deux modes
  onDateSelect?: (date: string | null) => void;
  onDatesSelect?: (dates: string[]) => void;
  onTrainSelect: (train: string | null) => void;
  onCarrierToggle: (carrier: string) => void;
  onClassToggle: (travelClass: string) => void;
  onDiscountCardToggle: (discountCard: string) => void;
  onFlexibilityToggle: (flexibility: string) => void;
  onInvertJourney?: () => void;
  onResetFilters?: () => void;

  // États de chargement
  loading?: boolean;
  filterLoading?: boolean;
}

interface TrainInfo {
  trainNumber: string;
  departureTime: string;
  arrivalTime: string;
  carrier: string;
  minPrice: number;
}

// Composant pour les sections collapsibles
const CollapsibleSection = ({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <button
      type="button"
      className="flex items-center justify-between cursor-pointer w-full"
      onClick={onToggle}
    >
      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>
    </button>
    {isExpanded && children}
  </div>
);

const Filters = ({
  availableDates,
  availableTrains,
  availableCarriers,
  availableClasses,
  availableDiscountCards,
  availableFlexibilities,
  selectedDate,
  selectedDates,
  selectedTrain,
  selectedCarriers,
  selectedClasses,
  selectedDiscountCards,
  selectedFlexibilities,
  onDateSelect,
  onDatesSelect,
  onTrainSelect,
  onCarrierToggle,
  onClassToggle,
  onDiscountCardToggle,
  onFlexibilityToggle,
  onInvertJourney,
  onResetFilters,
  loading = false,
  filterLoading = false,
}: FiltersProps) => {
  const isMultipleDatesMode =
    selectedDates !== undefined && onDatesSelect !== undefined;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // État de collapse latéral avec persistance
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("filters-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // États pour les sections collapsibles avec persistance
  const [isDateSectionExpanded, setIsDateSectionExpanded] = useState(() => {
    const saved = localStorage.getItem("filter-section-date");
    return saved ? JSON.parse(saved) : true;
  });

  const [isCarrierSectionExpanded, setIsCarrierSectionExpanded] = useState(
    () => {
      const saved = localStorage.getItem("filter-section-carrier");
      return saved ? JSON.parse(saved) : true;
    }
  );

  const [isClassSectionExpanded, setIsClassSectionExpanded] = useState(() => {
    const saved = localStorage.getItem("filter-section-class");
    return saved ? JSON.parse(saved) : true;
  });

  const [isDiscountCardSectionExpanded, setIsDiscountCardSectionExpanded] =
    useState(() => {
      const saved = localStorage.getItem("filter-section-discount");
      return saved ? JSON.parse(saved) : true;
    });

  const [isFlexibilitySectionExpanded, setIsFlexibilitySectionExpanded] =
    useState(() => {
      const saved = localStorage.getItem("filter-section-flexibility");
      return saved ? JSON.parse(saved) : true;
    });

  const [isTrainSectionExpanded, setIsTrainSectionExpanded] = useState(() => {
    const saved = localStorage.getItem("filter-section-train");
    return saved ? JSON.parse(saved) : true;
  });

  const formatDate = (dateString: string, includeDayOfWeek: boolean = true) => {
    const date = new Date(dateString);
    const dateOnly = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    if (includeDayOfWeek) {
      const dayOfWeek = date.toLocaleDateString("fr-FR", {
        weekday: "short",
      });
      return `${dayOfWeek} ${dateOnly}`;
    }
    return dateOnly;
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
    if (isMultipleDatesMode && onDatesSelect) {
      const currentDates = selectedDates || [];
      const isSelected = currentDates.includes(date);
      if (isSelected) {
        onDatesSelect(currentDates.filter((d) => d !== date));
      } else {
        onDatesSelect([...currentDates, date]);
      }
    } else if (onDateSelect) {
      onDateSelect(selectedDate === date ? null : date);
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  // Fonction pour toggle le collapse latéral
  const toggleCollapse = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Utiliser requestAnimationFrame pour éviter le clignotement
    requestAnimationFrame(() => {
      localStorage.setItem("filters-collapsed", JSON.stringify(newState));
    });
  }, [isCollapsed]);

  // Fonctions pour gérer le toggle avec persistance
  const toggleDateSection = useCallback(() => {
    const newState = !isDateSectionExpanded;
    setIsDateSectionExpanded(newState);
    localStorage.setItem("filter-section-date", JSON.stringify(newState));
  }, [isDateSectionExpanded]);

  const toggleCarrierSection = useCallback(() => {
    const newState = !isCarrierSectionExpanded;
    setIsCarrierSectionExpanded(newState);
    localStorage.setItem("filter-section-carrier", JSON.stringify(newState));
  }, [isCarrierSectionExpanded]);

  const toggleClassSection = useCallback(() => {
    const newState = !isClassSectionExpanded;
    setIsClassSectionExpanded(newState);
    localStorage.setItem("filter-section-class", JSON.stringify(newState));
  }, [isClassSectionExpanded]);

  const toggleDiscountCardSection = useCallback(() => {
    const newState = !isDiscountCardSectionExpanded;
    setIsDiscountCardSectionExpanded(newState);
    localStorage.setItem("filter-section-discount", JSON.stringify(newState));
  }, [isDiscountCardSectionExpanded]);

  const toggleFlexibilitySection = useCallback(() => {
    const newState = !isFlexibilitySectionExpanded;
    setIsFlexibilitySectionExpanded(newState);
    localStorage.setItem(
      "filter-section-flexibility",
      JSON.stringify(newState)
    );
  }, [isFlexibilitySectionExpanded]);

  const toggleTrainSection = useCallback(() => {
    const newState = !isTrainSectionExpanded;
    setIsTrainSectionExpanded(newState);
    localStorage.setItem("filter-section-train", JSON.stringify(newState));
  }, [isTrainSectionExpanded]);

  // Fonction pour déclencher l'analyse avec debounce
  const triggerAnalysis = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      // Ici on pourrait appeler une fonction de callback pour déclencher l'analyse
    }, 400);
  }, []);

  // Écouter les changements de collapse depuis localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("filters-collapsed");
      const newState = saved ? JSON.parse(saved) : false;
      if (newState !== isCollapsed) {
        setIsCollapsed(newState);
      }
    };
    globalThis.addEventListener("storage", handleStorageChange);
    // Écouter aussi les changements dans le même onglet avec un délai
    const interval = setInterval(handleStorageChange, 300);
    return () => {
      globalThis.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [isCollapsed]);

  // Déclencher l'analyse quand les filtres changent
  useEffect(() => {
    triggerAnalysis();
  }, [triggerAnalysis]);

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isCollapsed
          ? "opacity-0 max-h-0 overflow-hidden pointer-events-none transform scale-x-0 origin-left"
          : "opacity-100 max-h-[2000px] overflow-visible pointer-events-auto transform scale-x-100 origin-left"
      }`}
      style={{
        transition:
          "opacity 300ms ease-in-out, max-height 300ms ease-in-out, transform 300ms ease-in-out origin-left",
      }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Filtres
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onResetFilters && (
                <Button
                  onClick={onResetFilters}
                  variant="outline"
                  size="sm"
                  disabled={filterLoading}
                  className="text-xs"
                  title="Réinitialiser les filtres"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Réinitialiser
                </Button>
              )}
              <Button
                onClick={toggleCollapse}
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8"
                aria-label="Masquer les filtres"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection de date */}
          <CollapsibleSection
            title={"Date de voyage"}
            icon={CalendarDays}
            isExpanded={isDateSectionExpanded}
            onToggle={toggleDateSection}
          >
            {availableDates.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune date disponible</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    if (isMultipleDatesMode && onDatesSelect) {
                      onDatesSelect([]);
                    } else if (onDateSelect) {
                      onDateSelect(null);
                    }
                  }}
                  disabled={filterLoading}
                  className={`p-3 rounded-lg border text-xs font-medium transition-all hover:shadow-md ${
                    isMultipleDatesMode
                      ? (selectedDates || []).length === 0
                        ? "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                      : selectedDate === null
                      ? "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="text-center font-semibold whitespace-nowrap truncate">
                    Toutes dates
                  </div>
                </button>
                {availableDates.map((date, index) => {
                  const status = getDateStatus(date);
                  const isSelected = isMultipleDatesMode
                    ? (selectedDates || []).includes(date)
                    : selectedDate === date;

                  const statusColors = {
                    past: "bg-gray-100 text-gray-600 border-gray-200",
                    today: "bg-green-100 text-green-700 border-green-300",
                    future: "bg-blue-100 text-blue-700 border-blue-300",
                  };

                  const selectedColors = isSelected
                    ? "bg-blue-500 text-white border-blue-600"
                    : statusColors[status];

                  // Format complet avec jour de la semaine pour le title
                  const fullDate = formatDate(date, true);
                  // Format court sans jour de la semaine pour l'affichage
                  const shortDate = formatDate(date, false);

                  return (
                    <button
                      key={`date-${date}-${index}`}
                      onClick={() => handleDateClick(date)}
                      disabled={filterLoading}
                      className={`p-3 rounded-lg border text-xs font-medium transition-all hover:shadow-md ${selectedColors} ${
                        isSelected ? "ring-2 ring-blue-300" : ""
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={fullDate}
                    >
                      <div className="text-center">
                        <div className="font-semibold whitespace-nowrap truncate">
                          {shortDate}
                        </div>
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
            )}
          </CollapsibleSection>
          {/* Compagnies ferroviaires */}
          {availableCarriers.length > 0 && (
            <CollapsibleSection
              title="Compagnies ferroviaires"
              icon={Train}
              isExpanded={isCarrierSectionExpanded}
              onToggle={toggleCarrierSection}
            >
              <div className="space-y-2">
                {availableCarriers.map((carrier) => (
                  <div key={carrier} className="flex items-center space-x-2">
                    <Checkbox
                      id={`carrier-${carrier}`}
                      checked={selectedCarriers.includes(carrier)}
                      onCheckedChange={() => onCarrierToggle(carrier)}
                      disabled={filterLoading}
                    />
                    <label
                      htmlFor={`carrier-${carrier}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {translateCarrier(carrier)}
                    </label>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
          {/* Classes de voyage */}
          {availableClasses.length > 0 && (
            <CollapsibleSection
              title="Classes de voyage"
              icon={Filter}
              isExpanded={isClassSectionExpanded}
              onToggle={toggleClassSection}
            >
              <div className="space-y-2">
                {availableClasses
                  .filter((travelClass) => travelClass !== null)
                  .map((travelClass) => (
                    <div
                      key={travelClass}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`class-${travelClass}`}
                        checked={selectedClasses.includes(travelClass)}
                        onCheckedChange={() => onClassToggle(travelClass)}
                        disabled={filterLoading}
                      />
                      <label
                        htmlFor={`class-${travelClass}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {translateTravelClass(travelClass)}
                      </label>
                    </div>
                  ))}
              </div>
            </CollapsibleSection>
          )}
          {/* Cartes de réduction */}
          {availableDiscountCards.length > 0 && (
            <CollapsibleSection
              title="Cartes de réduction"
              icon={Filter}
              isExpanded={isDiscountCardSectionExpanded}
              onToggle={toggleDiscountCardSection}
            >
              <div className="space-y-2">
                {availableDiscountCards.map((discountCard) => (
                  <div
                    key={discountCard}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`discount-${discountCard}`}
                      checked={selectedDiscountCards.includes(discountCard)}
                      onCheckedChange={() => onDiscountCardToggle(discountCard)}
                      disabled={filterLoading}
                    />
                    <label
                      htmlFor={`discount-${discountCard}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {translateDiscountCard(discountCard)}
                    </label>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
          {/* Flexibilité */}
          <CollapsibleSection
            title="Flexibilité"
            icon={Filter}
            isExpanded={isFlexibilitySectionExpanded}
            onToggle={toggleFlexibilitySection}
          >
            <div className="space-y-2">
              {(availableFlexibilities.length > 0
                ? availableFlexibilities
                : ["nonflexi", "flexi", "semiflexi"]
              ).map((flexibility) => (
                <div key={flexibility} className="flex items-center space-x-2">
                  <Checkbox
                    id={`flexibility-${flexibility}`}
                    checked={selectedFlexibilities.includes(flexibility)}
                    onCheckedChange={() => onFlexibilityToggle(flexibility)}
                    disabled={filterLoading}
                  />
                  <label
                    htmlFor={`flexibility-${flexibility}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {translateFlexibility(flexibility)}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleSection>
          {/* Sélection de train */}
          {availableTrains.length > 0 && (
            <CollapsibleSection
              title="Train spécifique"
              icon={Train}
              isExpanded={isTrainSectionExpanded}
              onToggle={toggleTrainSection}
            >
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={selectedTrain === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTrainSelect(null)}
                  disabled={filterLoading}
                  className="justify-start"
                >
                  Tous les trains
                </Button>
                {availableTrains.map((train) => (
                  <Button
                    key={train.trainNumber}
                    variant={
                      selectedTrain === train.trainNumber
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => onTrainSelect(train.trainNumber)}
                    disabled={filterLoading}
                    className="justify-start"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            selectedTrain === train.trainNumber
                              ? "text-white"
                              : ""
                          }
                        >
                          Train {train.trainNumber}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            selectedTrain === train.trainNumber
                              ? "text-gray-800 bg-white/90"
                              : "text-gray-500 bg-gray-100"
                          }`}
                        >
                          {translateCarrier(train.carrier)}
                        </span>
                      </div>
                      <div
                        className={`text-xs ${
                          selectedTrain === train.trainNumber
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(train.departureTime)} -{" "}
                        {formatTime(train.arrivalTime)}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CollapsibleSection>
          )}
          {/* Indicateur de chargement */}
          {filterLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">
                Analyse en cours...
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Filters;
