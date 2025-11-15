import { trackEvent } from "../hooks/useMatomo";

export const TrackingCategories = {
  NAVIGATION: "Navigation",
  FILTERS: "Filtres",
  JOURNEY: "Trajet",
  INTERACTION: "Interaction",
  ERROR: "Erreur",
  CONSENT: "Consentement",
} as const;

export const trackJourneyClick = (
  departureStation: string,
  arrivalStation: string
): void => {
  trackEvent(
    TrackingCategories.NAVIGATION,
    "Clic sur trajet",
    `${departureStation} → ${arrivalStation}`
  );
};

export const trackJourneyInversion = (
  departureStation: string,
  arrivalStation: string
): void => {
  trackEvent(
    TrackingCategories.JOURNEY,
    "Inversion trajet",
    `${departureStation} ↔ ${arrivalStation}`
  );
};

export const trackFilterChange = (
  filterType: string,
  filterValue: string,
  isSelected: boolean
): void => {
  trackEvent(
    TrackingCategories.FILTERS,
    isSelected ? "Ajout filtre" : "Retrait filtre",
    `${filterType}: ${filterValue}`
  );
};

export const trackCarrierFilter = (carrier: string, isSelected: boolean): void => {
  trackFilterChange("Transporteur", carrier, isSelected);
};

export const trackClassFilter = (travelClass: string, isSelected: boolean): void => {
  trackFilterChange("Classe", travelClass, isSelected);
};

export const trackDiscountCardFilter = (
  discountCard: string,
  isSelected: boolean
): void => {
  trackFilterChange("Carte réduction", discountCard, isSelected);
};

export const trackFlexibilityFilter = (
  flexibility: string,
  isSelected: boolean
): void => {
  trackFilterChange("Flexibilité", flexibility, isSelected);
};

export const trackDateSelection = (date: string, isMultiple: boolean): void => {
  trackEvent(
    TrackingCategories.FILTERS,
    "Sélection date",
    date,
    isMultiple ? 1 : 0
  );
};

export const trackTrainSelection = (trainNumber: string): void => {
  trackEvent(TrackingCategories.FILTERS, "Sélection train", trainNumber);
};

export const trackResetFilters = (): void => {
  trackEvent(TrackingCategories.FILTERS, "Réinitialisation filtres");
};

export const trackFiltersCollapse = (isCollapsed: boolean): void => {
  trackEvent(
    TrackingCategories.INTERACTION,
    isCollapsed ? "Masquer filtres" : "Afficher filtres"
  );
};

export const trackBackToHome = (): void => {
  trackEvent(TrackingCategories.NAVIGATION, "Retour accueil");
};

export const trackChartView = (chartType: string): void => {
  trackEvent(TrackingCategories.INTERACTION, "Affichage graphique", chartType);
};

export const trackError = (errorType: string, errorMessage: string): void => {
  trackEvent(TrackingCategories.ERROR, errorType, errorMessage);
};

export const trackConsentAction = (action: "accept" | "reject"): void => {
  trackEvent(TrackingCategories.CONSENT, action === "accept" ? "Acceptation" : "Refus");
};

