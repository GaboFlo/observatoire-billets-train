interface FilterParams {
  carriers?: string[];
  classes?: string[];
  discountCards?: string[];
  flexibilities?: string[];
  selectedDates?: string[];
  trainNumber?: number;
  departureStationId?: number;
  arrivalStationId?: number;
}

export const buildBaseMatch = (filters: FilterParams): Record<string, unknown> => {
  const baseMatch: Record<string, unknown> = { is_error: { $ne: true } };

  if (filters.carriers && filters.carriers.length > 0) {
    baseMatch.carrier = { $in: filters.carriers };
  }

  if (filters.classes && filters.classes.length > 0) {
    baseMatch["pricing.travel_class"] = { $in: filters.classes };
  }

  if (filters.discountCards && filters.discountCards.length > 0) {
    baseMatch["pricing.discount_card"] = { $in: filters.discountCards };
  }

  if (filters.flexibilities && filters.flexibilities.length > 0) {
    baseMatch["pricing.flexibility"] = { $in: filters.flexibilities };
  }

  if (filters.trainNumber) {
    baseMatch.train_number = Number.parseInt(String(filters.trainNumber));
  }

  if (filters.departureStationId) {
    baseMatch["departure_station.id"] = filters.departureStationId;
  }

  if (filters.arrivalStationId) {
    baseMatch["arrival_station.id"] = filters.arrivalStationId;
  }

  if (filters.selectedDates && filters.selectedDates.length > 0) {
    addDateFilters(baseMatch, filters.selectedDates);
  }

  return baseMatch;
};

const addDateFilters = (
  baseMatch: Record<string, unknown>,
  selectedDates: string[]
): void => {
  if (selectedDates.length === 1) {
    const date = selectedDates[0];
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    baseMatch.departure_date = {
      $gte: startDate,
      $lte: endDate,
    };
  } else {
    const orConditions = selectedDates.map((date: string) => {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      return {
        departure_date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    });
    baseMatch.$or = orConditions;
  }
};

