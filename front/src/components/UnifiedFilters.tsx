import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  translateCarrier,
  translateDiscountCard,
  translateTravelClass,
} from "@/utils/translations";
import {
  ArrowRightLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Train,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface UnifiedFiltersProps {
  // Données disponibles
  availableDates: string[];
  availableTrains: TrainInfo[];
  availableCarriers: string[];
  availableClasses: string[];
  availableDiscountCards: string[];

  // États sélectionnés
  selectedDate: string | null;
  selectedTrain: string | null;
  selectedCarriers: string[];
  selectedClasses: string[];
  selectedDiscountCards: string[];

  // Callbacks
  onDateSelect: (date: string | null) => void;
  onTrainSelect: (train: string | null) => void;
  onCarrierToggle: (carrier: string) => void;
  onClassToggle: (travelClass: string) => void;
  onDiscountCardToggle: (discountCard: string) => void;
  onInvertJourney: () => void;

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
    <div
      className="flex items-center justify-between cursor-pointer"
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      role="button"
      tabIndex={0}
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
    </div>
    {isExpanded && children}
  </div>
);

const UnifiedFilters = ({
  availableDates,
  availableTrains,
  availableCarriers,
  availableClasses,
  availableDiscountCards,
  selectedDate,
  selectedTrain,
  selectedCarriers,
  selectedClasses,
  selectedDiscountCards,
  onDateSelect,
  onTrainSelect,
  onCarrierToggle,
  onClassToggle,
  onDiscountCardToggle,
  onInvertJourney,
  loading = false,
  filterLoading = false,
}: UnifiedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDateSectionExpanded, setIsDateSectionExpanded] = useState(true);
  const [isCarrierSectionExpanded, setIsCarrierSectionExpanded] =
    useState(true);
  const [isClassSectionExpanded, setIsClassSectionExpanded] = useState(true);
  const [isDiscountCardSectionExpanded, setIsDiscountCardSectionExpanded] =
    useState(true);
  const [isTrainSectionExpanded, setIsTrainSectionExpanded] = useState(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("fr-FR", {
      weekday: "long",
    });
    const dateOnly = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${dayOfWeek} ${dateOnly}`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  // Fonction pour déclencher l'analyse avec debounce
  const triggerAnalysis = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      // Ici on pourrait appeler une fonction de callback pour déclencher l'analyse
    }, 400);
  }, [
    selectedDate,
    selectedTrain,
    selectedCarriers,
    selectedClasses,
    selectedDiscountCards,
  ]);

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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? "Réduire" : "Développer"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Inverser le sens */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onInvertJourney}
              className="w-full flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Inverser le sens du trajet
            </Button>
          </div>
          {/* Sélection de date */}
          <CollapsibleSection
            title="Date de voyage"
            icon={Calendar}
            isExpanded={isDateSectionExpanded}
            onToggle={() => setIsDateSectionExpanded(!isDateSectionExpanded)}
          >
            {availableDates.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune date disponible</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={selectedDate === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDateSelect(null)}
                  className="justify-start"
                >
                  Toutes les dates
                </Button>
                {availableDates.map((date) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDateSelect(date)}
                    className="justify-start"
                  >
                    {formatDate(date)}
                  </Button>
                ))}
              </div>
            )}
          </CollapsibleSection>
          {/* Compagnies ferroviaires */}
          {availableCarriers.length > 0 && (
            <CollapsibleSection
              title="Compagnies ferroviaires"
              icon={Train}
              isExpanded={isCarrierSectionExpanded}
              onToggle={() =>
                setIsCarrierSectionExpanded(!isCarrierSectionExpanded)
              }
            >
              <div className="space-y-2">
                {availableCarriers.map((carrier) => (
                  <div key={carrier} className="flex items-center space-x-2">
                    <Checkbox
                      id={`carrier-${carrier}`}
                      checked={selectedCarriers.includes(carrier)}
                      onCheckedChange={() => onCarrierToggle(carrier)}
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
              onToggle={() =>
                setIsClassSectionExpanded(!isClassSectionExpanded)
              }
            >
              <div className="space-y-2">
                {availableClasses.map((travelClass) => (
                  <div
                    key={travelClass}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`class-${travelClass}`}
                      checked={selectedClasses.includes(travelClass)}
                      onCheckedChange={() => onClassToggle(travelClass)}
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
              onToggle={() =>
                setIsDiscountCardSectionExpanded(!isDiscountCardSectionExpanded)
              }
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
          {/* Sélection de train */}
          {selectedDate && availableTrains.length > 0 && (
            <CollapsibleSection
              title="Train spécifique"
              icon={Train}
              isExpanded={isTrainSectionExpanded}
              onToggle={() =>
                setIsTrainSectionExpanded(!isTrainSectionExpanded)
              }
            >
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={selectedTrain === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTrainSelect(null)}
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
                    className="justify-start"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span>Train {train.trainNumber}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {translateCarrier(train.carrier)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
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
      )}
    </Card>
  );
};

export default UnifiedFilters;
