import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { TicketPrice } from "@/data/mockData";

export interface PriceFilters {
  class?: "première" | "seconde";
  discount?: "aucune" | "avantage jeune" | "avantage senior" | "carte liberté";
  departureDate?: string;
  daysBeforeDeparture?: number;
}

interface PriceFiltersProps {
  data: TicketPrice[];
  onFiltersChange: (filteredData: TicketPrice[], filters: PriceFilters) => void;
}

const PriceFiltersComponent = ({ data, onFiltersChange }: PriceFiltersProps) => {
  const [filters, setFilters] = useState<PriceFilters>({});

  // Get unique departure dates from data
  const uniqueDepartureDates = [...new Set(data.map(item => item.date))].sort().reverse();

  const applyFilters = (newFilters: PriceFilters) => {
    let filteredData = [...data];

    if (newFilters.class) {
      filteredData = filteredData.filter(item => item.class === newFilters.class);
    }

    if (newFilters.discount) {
      filteredData = filteredData.filter(item => item.discount === newFilters.discount);
    }

    if (newFilters.departureDate) {
      filteredData = filteredData.filter(item => item.date === newFilters.departureDate);
    }

    if (newFilters.daysBeforeDeparture !== undefined) {
      filteredData = filteredData.filter(item => item.daysBeforeDeparture === newFilters.daysBeforeDeparture);
    }

    setFilters(newFilters);
    onFiltersChange(filteredData, newFilters);
  };

  const updateFilter = (key: keyof PriceFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    applyFilters(newFilters);
  };

  const clearFilter = (key: keyof PriceFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    applyFilters(newFilters);
  };

  const clearAllFilters = () => {
    applyFilters({});
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Filtres
          {Object.keys(filters).length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Effacer tout
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Classe</Label>
            <div className="flex items-center space-x-2">
              <Select
                value={filters.class || ""}
                onValueChange={(value) => updateFilter("class", value as "première" | "seconde")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="première">Première</SelectItem>
                  <SelectItem value="seconde">Seconde</SelectItem>
                </SelectContent>
              </Select>
              {filters.class && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("class")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Carte de réduction</Label>
            <div className="flex items-center space-x-2">
              <Select
                value={filters.discount || ""}
                onValueChange={(value) => updateFilter("discount", value as typeof filters.discount)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les cartes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucune">Aucune</SelectItem>
                  <SelectItem value="avantage jeune">Avantage Jeune</SelectItem>
                  <SelectItem value="avantage senior">Avantage Senior</SelectItem>
                  <SelectItem value="carte liberté">Carte Liberté</SelectItem>
                </SelectContent>
              </Select>
              {filters.discount && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("discount")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date de départ</Label>
            <div className="flex items-center space-x-2">
              <Select
                value={filters.departureDate || ""}
                onValueChange={(value) => updateFilter("departureDate", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les dates" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueDepartureDates.slice(0, 20).map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString("fr-FR")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.departureDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("departureDate")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Jours avant départ</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="ex: 15"
                value={filters.daysBeforeDeparture || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilter("daysBeforeDeparture", value ? parseInt(value) : undefined);
                }}
                min="0"
                max="90"
              />
              {filters.daysBeforeDeparture !== undefined && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("daysBeforeDeparture")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceFiltersComponent;