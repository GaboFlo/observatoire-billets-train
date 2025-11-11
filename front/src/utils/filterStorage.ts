interface SavedFilters {
  carriers: string[];
  classes: string[];
  discountCards: string[];
  flexibilities?: string[];
  selectedDates: string[];
}

const STORAGE_KEY = "homepage-filters";

export const saveFilters = (filters: SavedFilters): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des filtres:", error);
  }
};

export const loadFilters = (): SavedFilters | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as SavedFilters;
  } catch (error) {
    console.error("Erreur lors du chargement des filtres:", error);
    return null;
  }
};

