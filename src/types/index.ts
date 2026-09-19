export type LocationCategory = 'AIRPORT' | 'AMUSEMENT_PARK' | 'CITY_CENTER' | 'TRAIN_STATION' | 'PALACE' | string;

export interface CategoryItem {
  id: string;
  key: string;
  name: string;
  sortOrder?: number;
}

export interface LocationItem {
  id: string;
  name: string;
  shortCode: string;
  category: LocationCategory;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type VehicleTier = 'SEDAN' | 'ECONOMY_VAN' | 'BUSINESS_VAN' | 'MINIBUS';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface RouteWithLocations {
  id: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  originId: string;
  destinationId: string;
  origin: LocationItem;
  destination: LocationItem;
  distanceKm: number;
  estDurationMinutes: number;
  sedanPriceEur: number;
  economyVanPriceEur: number;
  businessVanPriceEur: number;
  minibusPriceEur: number;
  h1Heading: string;
  metaTitle: string;
  metaDescription: string;
  overviewText: string;
  faqs: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithDetails {
  id: string;
  bookingRef: string;
  status: BookingStatus;
  originId?: string | null;
  destinationId?: string | null;
  origin?: LocationItem | null;
  destination?: LocationItem | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: Date;
  flightOrTrainNumber?: string | null;
  returnDateTime?: Date | null;
  returnFlightNumber?: string | null;
  vehicleTier: VehicleTier;
  passengers: number;
  luggageCount: number;
  babySeats: number;
  boosterSeats: number;
  totalFareEur: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
