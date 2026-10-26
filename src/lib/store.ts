import { create } from 'zustand';
import { VehicleTier, LocationItem } from '@/types';

export type ServiceMode = 'TRANSFER' | 'HOURLY_TOUR' | 'DISTANCE';

interface BookingStoreState {
  serviceMode: ServiceMode;
  origin: LocationItem | null;
  destination: LocationItem | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  isReturn: boolean;
  returnDate: string;
  returnTime: string;
  flightOrTrainNumber: string;
  returnFlightNumber: string;
  vehicleTier: VehicleTier;
  passengers: number;
  luggageCount: number;
  handLuggageCount: number;
  babySeats: number;
  boosterSeats: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  isModalOpen: boolean;
  currentStep: 1 | 2 | 3;
  
  // Tour & Distance Mode fields
  rentalHours: number;
  estimatedKm: number;
  estimatedDurationMinutes: number;
  isCalculatingDistance: boolean;
  distanceRouteCalculated: boolean;

  // Custom price overrides per vehicle tier from active route
  sedanPriceEur: number;
  economyVanPriceEur: number;
  businessVanPriceEur: number;
  minibusPriceEur: number;

  // Actions
  setServiceMode: (mode: ServiceMode) => void;
  setOrigin: (loc: LocationItem | null) => void;
  setDestination: (loc: LocationItem | null) => void;
  swapLocations: () => void;
  setPickupAddress: (addr: string) => void;
  setDropoffAddress: (addr: string) => void;
  setPickupDate: (date: string) => void;
  setPickupTime: (time: string) => void;
  setIsReturn: (isReturn: boolean) => void;
  setReturnDate: (date: string) => void;
  setReturnTime: (time: string) => void;
  setFlightOrTrainNumber: (flight: string) => void;
  setReturnFlightNumber: (flight: string) => void;
  setVehicleTier: (tier: VehicleTier) => void;
  setPassengers: (pax: number) => void;
  setLuggageCount: (bags: number) => void;
  setHandLuggageCount: (bags: number) => void;
  setBabySeats: (seats: number) => void;
  setBoosterSeats: (seats: number) => void;
  setRentalHours: (hours: number) => void;
  setEstimatedKm: (km: number) => void;
  setEstimatedDurationMinutes: (minutes: number) => void;
  setIsCalculatingDistance: (loading: boolean) => void;
  setDistanceRouteCalculated: (calculated: boolean) => void;
  setCustomerDetails: (details: { name: string; email: string; phone: string; notes?: string }) => void;
  setRoutePricing: (prices: { sedan: number; economyVan: number; businessVan: number; minibus?: number }) => void;
  openModal: () => void;
  closeModal: () => void;
  setStep: (step: 1 | 2 | 3) => void;
  resetForm: () => void;
}

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  serviceMode: 'TRANSFER',
  origin: null,
  destination: null,
  pickupAddress: '',
  dropoffAddress: '',
  pickupDate: '',
  pickupTime: '',
  isReturn: false,
  returnDate: '',
  returnTime: '',
  flightOrTrainNumber: '',
  returnFlightNumber: '',
  vehicleTier: 'SEDAN',
  passengers: 1,
  luggageCount: 1,
  handLuggageCount: 0,
  babySeats: 0,
  boosterSeats: 0,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  notes: '',
  isModalOpen: false,
  currentStep: 1,

  rentalHours: 4,
  estimatedKm: 30,
  estimatedDurationMinutes: 40,
  isCalculatingDistance: false,
  distanceRouteCalculated: false,

  sedanPriceEur: 70,
  economyVanPriceEur: 90,
  businessVanPriceEur: 120,
  minibusPriceEur: 180,

  setServiceMode: (mode) => set({ serviceMode: mode }),
  setOrigin: (loc) => set({ origin: loc }),
  setDestination: (loc) => set({ destination: loc }),
  swapLocations: () => {
    const { origin, destination, pickupAddress, dropoffAddress } = get();
    set({
      origin: destination,
      destination: origin,
      pickupAddress: dropoffAddress,
      dropoffAddress: pickupAddress,
    });
  },
  setPickupAddress: (addr) => set({ pickupAddress: addr }),
  setDropoffAddress: (addr) => set({ dropoffAddress: addr }),
  setPickupDate: (date) => set({ pickupDate: date }),
  setPickupTime: (time) => set({ pickupTime: time }),
  setIsReturn: (isReturn) => set({ isReturn }),
  setReturnDate: (date) => set({ returnDate: date }),
  setReturnTime: (time) => set({ returnTime: time }),
  setFlightOrTrainNumber: (flight) => set({ flightOrTrainNumber: flight }),
  setReturnFlightNumber: (flight) => set({ returnFlightNumber: flight }),
  setVehicleTier: (tier) => set({ vehicleTier: tier }),
  setPassengers: (pax) => set({ passengers: pax }),
  setLuggageCount: (bags) => set({ luggageCount: bags }),
  setHandLuggageCount: (bags) => set({ handLuggageCount: bags }),
  setBabySeats: (seats) => set({ babySeats: Math.max(0, seats) }),
  setBoosterSeats: (seats) => set({ boosterSeats: Math.max(0, seats) }),
  setRentalHours: (hours) => set({ rentalHours: Math.max(1, hours) }),
  setEstimatedKm: (km) => set({ estimatedKm: Math.max(1, km) }),
  setEstimatedDurationMinutes: (minutes) => set({ estimatedDurationMinutes: Math.max(1, minutes) }),
  setIsCalculatingDistance: (loading) => set({ isCalculatingDistance: loading }),
  setDistanceRouteCalculated: (calculated) => set({ distanceRouteCalculated: calculated }),
  setCustomerDetails: (details) =>
    set({
      customerName: details.name,
      customerEmail: details.email,
      customerPhone: details.phone,
      notes: details.notes || '',
    }),
  setRoutePricing: (prices) =>
    set({
      sedanPriceEur: prices.sedan,
      economyVanPriceEur: prices.economyVan,
      businessVanPriceEur: prices.businessVan,
      minibusPriceEur: prices.minibus || 180,
    }),
  openModal: () => set({ isModalOpen: true, currentStep: 1 }),
  closeModal: () => set({ isModalOpen: false }),
  setStep: (step) => set({ currentStep: step }),
  resetForm: () =>
    set({
      serviceMode: 'TRANSFER',
      origin: null,
      destination: null,
      pickupAddress: '',
      dropoffAddress: '',
      pickupDate: '',
      pickupTime: '',
      returnDate: '',
      returnTime: '',
      flightOrTrainNumber: '',
      returnFlightNumber: '',
      isReturn: false,
      passengers: 1,
      luggageCount: 1,
      handLuggageCount: 0,
      babySeats: 0,
      boosterSeats: 0,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
      rentalHours: 4,
      estimatedKm: 30,
      estimatedDurationMinutes: 40,
      isCalculatingDistance: false,
      distanceRouteCalculated: false,
      isModalOpen: false,
      currentStep: 1,
    }),
}));
