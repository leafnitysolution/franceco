import { z } from 'zod';

export const faqSchema = z.object({
  question: z.string().trim().min(3, 'Question must be at least 3 characters').max(250),
  answer: z.string().trim().min(5, 'Answer must be at least 5 characters').max(1000),
});

export const routeSchema = z
  .object({
    originId: z.string().min(1, 'Please select an origin hub'),
    destinationId: z.string().min(1, 'Please select a destination hub'),
    slug: z
      .string()
      .trim()
      .min(3, 'Slug must be valid (e.g. cdg-to-disneyland-paris)')
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    distanceKm: z.coerce.number().positive('Distance must be positive').max(2000),
    estDurationMinutes: z.coerce.number().int().positive('Duration must be positive').max(1440),
    sedanPriceEur: z.coerce.number().positive('Sedan fare required').max(5000),
    economyVanPriceEur: z.coerce.number().positive('Economy Van fare required').max(5000),
    businessVanPriceEur: z.coerce.number().positive('Business Van fare required').max(5000),
    minibusPriceEur: z.coerce.number().positive('Minibus fare required').max(10000).default(180),
    h1Heading: z.string().trim().min(5, 'H1 Heading required').max(200),
    metaTitle: z.string().trim().min(5, 'SEO Meta Title required').max(150),
    metaDescription: z.string().trim().min(10, 'SEO Meta Description required').max(350),
    overviewText: z.string().trim().min(10, 'Route overview text required').max(5000),
    faqs: z.array(faqSchema).max(50),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
  })
  .refine((data) => data.originId !== data.destinationId, {
    message: 'Origin and Destination hubs must be different',
    path: ['destinationId'],
  });

export type RouteFormValues = z.infer<typeof routeSchema>;

export const bookingFormSchema = z
  .object({
    originId: z.string().optional(),
    destinationId: z.string().optional(),
    pickupAddress: z.string().trim().min(3, 'Pickup location/terminal required').max(300),
    dropoffAddress: z.string().trim().min(3, 'Dropoff address/hotel required').max(300),
    pickupDate: z.string().min(1, 'Pickup date required'),
    pickupTime: z.string().min(1, 'Pickup time required'),
    isReturn: z.boolean().default(false),
    returnDate: z.string().optional(),
    returnTime: z.string().optional(),
    returnFlightNumber: z.string().trim().max(100).optional(),
    flightOrTrainNumber: z.string().trim().max(100).optional(),
    vehicleTier: z.enum(['SEDAN', 'ECONOMY_VAN', 'BUSINESS_VAN', 'MINIBUS']),
    passengers: z.number().int().min(1, 'At least 1 passenger required').max(16, 'Maximum 16 passengers'),
    luggageCount: z.number().int().min(0).max(20, 'Maximum 20 luggage items'),
    babySeats: z.number().int().min(0).max(6, 'Maximum 6 baby seats'),
    boosterSeats: z.number().int().min(0).max(6, 'Maximum 6 booster seats'),
    customerName: z.string().trim().min(2, 'Full name required').max(100),
    customerEmail: z.string().trim().email('Valid email address required').max(150),
    customerPhone: z
      .string()
      .trim()
      .min(6, 'Phone number with country code required')
      .max(30)
      .regex(/^[\d\s+\-()]+$/, 'Invalid phone number format'),
    notes: z.string().trim().max(1000).optional(),
    totalFareEur: z.number().optional(), // We ignore this and recalculate on the server!
    website_url: z.string().optional(), // Honeypot field for bot protection!
  })
  .refine(
    (data) => {
      if (data.originId && data.destinationId) {
        return data.originId !== data.destinationId;
      }
      return true;
    },
    {
      message: 'Pickup and Dropoff locations cannot be identical',
      path: ['destinationId'],
    }
  );

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
