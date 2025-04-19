
// Mock data for train tickets price statistics

// Types definitions
export interface TicketPrice {
  date: string; // ISO date string
  price: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

export interface JourneyData {
  id: string;
  name: string;
  origin: string;
  destination: string;
  prices: TicketPrice[];
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceChangePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Mock data for journeys
export const journeys: JourneyData[] = [
  {
    id: 'paris-lyon',
    name: 'Paris - Lyon',
    origin: 'Paris',
    destination: 'Lyon',
    averagePrice: 49.5,
    lowestPrice: 29,
    highestPrice: 89,
    priceChangePercentage: 5.2,
    trend: 'up',
    prices: generatePriceData(45, 90, 30)
  },
  {
    id: 'paris-marseille',
    name: 'Paris - Marseille',
    origin: 'Paris',
    destination: 'Marseille',
    averagePrice: 68.25,
    lowestPrice: 39,
    highestPrice: 110,
    priceChangePercentage: -3.8,
    trend: 'down',
    prices: generatePriceData(60, 120, 35)
  },
  {
    id: 'lyon-nice',
    name: 'Lyon - Nice',
    origin: 'Lyon',
    destination: 'Nice',
    averagePrice: 54.75,
    lowestPrice: 32,
    highestPrice: 92,
    priceChangePercentage: 0.5,
    trend: 'stable',
    prices: generatePriceData(50, 100, 28)
  },
  {
    id: 'paris-nantes',
    name: 'Paris - Nantes',
    origin: 'Paris',
    destination: 'Nantes',
    averagePrice: 42.3,
    lowestPrice: 25,
    highestPrice: 75,
    priceChangePercentage: 8.1,
    trend: 'up',
    prices: generatePriceData(40, 80, 22)
  },
  {
    id: 'bordeaux-lille',
    name: 'Bordeaux - Lille',
    origin: 'Bordeaux',
    destination: 'Lille',
    averagePrice: 72.8,
    lowestPrice: 45,
    highestPrice: 120,
    priceChangePercentage: -2.3,
    trend: 'down',
    prices: generatePriceData(70, 130, 40)
  },
  {
    id: 'strasbourg-toulouse',
    name: 'Strasbourg - Toulouse',
    origin: 'Strasbourg',
    destination: 'Toulouse',
    averagePrice: 82.6,
    lowestPrice: 55,
    highestPrice: 145,
    priceChangePercentage: 1.2,
    trend: 'stable',
    prices: generatePriceData(80, 150, 50)
  }
];

// Helper function to generate semi-realistic price data
function generatePriceData(basePrice: number, maxPrice: number, minPrice: number, days = 90): TicketPrice[] {
  const data: TicketPrice[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - days + i);
    
    // Generate some fluctuation
    const fluctuation = Math.sin(i / 10) * 15 + Math.random() * 10;
    const price = Math.round(basePrice + fluctuation);
    const lowestDayPrice = Math.max(minPrice, Math.round(price * 0.8));
    const highestDayPrice = Math.min(maxPrice, Math.round(price * 1.2));
    const averageDayPrice = Math.round((lowestDayPrice + highestDayPrice) / 2);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price,
      lowestPrice: lowestDayPrice,
      highestPrice: highestDayPrice,
      averagePrice: averageDayPrice
    });
  }
  
  return data;
}

// Global statistics
export const globalStats = {
  averagePriceChange: 1.5,
  busiesRoute: 'Paris - Marseille',
  mostExpensiveRoute: 'Strasbourg - Toulouse',
  cheapestRoute: 'Paris - Nantes',
  dataUpdatedAt: new Date().toISOString()
};

// Key price factors
export const priceFactors = [
  { name: 'Advance Purchase', impact: 'High', description: 'Booking 2-3 months in advance can save up to 50%' },
  { name: 'Day of Week', impact: 'Medium', description: 'Tuesdays and Wednesdays tend to be cheaper' },
  { name: 'Time of Day', impact: 'Medium', description: 'Early morning and late evening trains cost less' },
  { name: 'Seasonal', impact: 'High', description: 'Prices rise during holidays and summer months' },
  { name: 'Route Popularity', impact: 'High', description: 'Major routes between large cities command premium prices' }
];
