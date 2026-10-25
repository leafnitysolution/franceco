'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'es' | 'fr' | 'it' | 'de' | 'pt';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  flag: string;
  displayCode: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', displayCode: 'EN' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', displayCode: 'ES' },
  { code: 'fr', label: 'French', flag: '🇫🇷', displayCode: 'FR' },
  { code: 'it', label: 'Italian', flag: '🇮🇹', displayCode: 'IT' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', displayCode: 'DE' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹', displayCode: 'PT' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Header & Nav
    home: 'Home',
    parisTransfers: 'Paris Transfers',
    disneylandTransfers: 'Disneyland Transfers',
    tours: 'Tours',
    transferRates: 'Transfer Rates',
    more: 'More',
    hotline: '24/7 Hotline',
    topBanner: 'Paris & Disneyland Direct Private Transfers • Pay Chauffeur on Arrival • Free Child Seats',
    tagline: 'PARIS AIRPORT TRANSFERS & CURATED DAY TRIPS',
    company: 'COMPANY',
    support: 'SUPPORT',
    connect: 'CONNECT',

    // Hero Section
    heroTitle: 'Seamless Private Airport Transfers in France',
    heroDesc: 'Book direct door-to-door shuttles from Paris Airports (CDG, ORY, BVA) to Disneyland Paris, Hotels & Excursions. Guaranteed fixed rates, English speaking drivers & zero deposit.',
    flightTracking: 'Flight tracking & free waiting time',
    freeSeats: 'Complimentary baby & booster seats',
    bilingualDrivers: 'Bilingual & friendly chauffeurs',
    fixedPricing: 'Fixed pricing with no hidden extras',
    heroBadge: 'PARIS AIRPORT & DISNEYLAND PRIVATE CHAUFFEUR',

    // Route Cards & Widgets
    from: 'From',
    viewFares: 'View Route Fares & Specs',
    privateTransfer: 'Private Transfer',
    mins: 'mins',
    km: 'km',
    featuredRoutesTitle: 'Popular Transfer Routes & Fixed Fares',
    featuredRoutesSubtitle: 'Instant fixed pricing for top airport and Disneyland Paris private transfers.',

    // Booking Widget Step Wizard
    stepRoute: '1. Service & Route',
    stepFleetDate: '2. Vehicle & Date',
    stepConfirm: '3. Confirmation',
    serviceTransfer: 'Point-to-Point Transfer',
    serviceHourlyTour: 'Hourly Tour (Driver-Guide Included)',
    serviceDistance: 'Distance-Based (2€/km Car • 2.7€/km Van)',
    driverGuideIncluded: 'Driver-Guide Service Included',
    hourlyRateCar: '65€/h (Car)',
    hourlyRateVan: '80€/h (Van)',
    kmRateCar: '2.00€/km (Car)',
    kmRateVan: '2.70€/km (Van)',
    durationHours: 'Tour Duration (Hours)',
    distanceKmInput: 'Trip Distance (KM)',
    oneWay: 'One-Way',
    roundTrip: 'Round-Trip',
    whereTraveling: 'Where are you traveling?',
    whereTravelingSubtitle: 'Select your pickup airport or hub and drop-off destination.',
    pickupLocation: 'Pickup Location',
    dropoffLocation: 'Dropoff Location',
    pickupAddressLabel: 'Pickup Terminal or Hotel Address',
    dropoffAddressLabel: 'Drop-off Destination Address',
    btnChooseDateVehicle: 'Choose Date & Vehicle',

    scheduleTitle: 'Schedule & Select Vehicle Tier',
    scheduleSubtitle: 'Pick your transfer date, time, and preferred vehicle class.',
    pickupDate: 'Pickup Date',
    time: 'Time',
    passengers: 'Passengers',
    selectVehicleTier: 'Select Vehicle Tier',
    back: 'Back',
    btnPassengerDetails: 'Passenger Details',

    passengerContactTitle: 'Passenger Contact Details',
    passengerContactSubtitle: 'Enter your details to receive driver tracking info. Pay cash/card on arrival.',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    mobilePhone: 'Mobile / WhatsApp',
    babyCarSeats: 'Baby Car Seats (Free)',
    boosterSeats: 'Booster Seats (Free)',
    flightNumberLabel: 'Flight / Train Number',
    btnReserveNow: 'Reserve Transfer Now 🚀',
    bookNow: 'Reserve Transfer Now',
    payOnArrival: 'Pay Chauffeur on Arrival',
    noDepositRequired: 'No deposit required • Free cancellation',
    sedanName: 'Berline Sedan',
    economyVanName: 'Economy Van',
    businessVanName: 'VIP Business Van',
    minibusName: 'Executive Minibus',
    passengersCount: '1-3 Passengers',
    vanPassengersCount: '1-8 Passengers',
    minibusPassengersCount: '8-16 Passengers',

    // Fleet & Services
    fleetTitle: 'Our Premium Chauffeur Fleet',
    fleetSubtitle: 'Clean, modern, fully licensed luxury sedans and spacious passenger vans.',
    servicesTitle: 'Why Choose FranceGo',
    servicesSubtitle: 'Premium door-to-door transfer services tailored for families and international travelers.',

    // Reviews Section
    reviews: 'Reviews',
    reviewsTitle: 'What Our Passengers Say',
    reviewsSubtitle: 'Read genuine 5-star feedback from verified travelers around the world.',
    verifiedReview: 'Verified Review',
    customerVoices: 'CUSTOMER VOICES',
    writeReview: 'Write a review',
    openTripadvisor: 'Open Tripadvisor',
    avgRatingText: 'Average rating on Tripadvisor & Google Reviews',

    // Footer & Links
    contactUs: 'Contact Us',
    aboutUs: 'About Us',
    faqs: 'Frequently Asked Questions',
    footerDesc: 'Door-to-door private transfers, airport shuttles, and Disneyland Paris transfers with zero upfront deposit.',
    quickLinks: 'Quick Links',
    rightsReserved: 'All rights reserved. Premium Airport & Disneyland Paris Private Transfers.',

    // Additional UI & Card Translations
    popularRoutesBadge: 'POPULAR ROUTES & FARES',
    viewRoute: 'View Route',
    averageRating: 'Average Rating',
    verifiedReviewsCount: 'Verified Reviews',
    travelersChoice: "Travelers' Choice",
    fixedPricingBadge: 'Fixed Pricing',
    noHiddenFees: 'No hidden fees',
    zeroDeposit: 'Zero Deposit',
    payOnArrivalBadge: 'Pay on arrival',
    freeChildSeats: 'Free Child Seats',
    includedAlways: 'Included always',
    fleetCapacityBadge: 'FLEET CAPACITY & SPECIFICATIONS',
    familyFavorite: 'FAMILY FAVORITE',
    freeSeatsBadge: 'Free Seats',
    gotQuestions: 'GOT QUESTIONS?',
    faqsTitle: 'Frequently Asked Questions',
    faqsSubtitle: 'Everything you need to know about our airport pickup process, zero deposit policy, and child seat options.',
    bottomCtaTitle: 'Your Paris Journey Starts Here',
    bottomCtaSubtitle: 'Book your private chauffeur today with fixed pricing, zero deposit, and payment on arrival.',
    fromLabel: 'From',
    toLabel: 'To',
    selectPickupPlaceholder: 'Please select pickup location...',
    selectDropoffPlaceholder: 'Please select drop-off destination...',
    swapLocations: 'Swap Locations',
    bookNowBtn: 'BOOK NOW',
    trainStationTransfersHeading: 'Train Station Transfers',
    disneylandTransfersHeading: 'Disneyland Paris Transfers',
    excursionsHeading: 'Excursions & Day Trips',
    ourServices: 'Our Services',
    ourFleet: 'Our Fleet',
    legalPolicies: 'Legal & Policies',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    cancellationPolicy: 'Cancellation Policy',
    officialChauffeurService: 'OFFICIAL PARIS CHAUFFEUR SERVICE',
    planTransferBtn: 'Plan a Transfer',
    talkToUsBtn: 'Talk to Us',
    awardsAndTrust: 'AWARDS & TRUST',
    verifiedBadge: 'VERIFIED',
  },
  es: {
    // Header & Nav
    home: 'Inicio',
    parisTransfers: 'Traslados París',
    disneylandTransfers: 'Traslados Disneyland',
    tours: 'Tours',
    transferRates: 'Tarifas',
    more: 'Más',
    hotline: 'Línea 24/7',
    topBanner: 'Traslados Privados Directos París y Disneyland • Pago al Chófer a la Llegada • Sillas de Niño Gratis',
    tagline: 'TRASLADOS AEROPUERTO PARÍS Y EXCURSIONES',
    company: 'EMPRESA',
    support: 'SOPORTE',
    connect: 'CONECTAR',

    // Hero Section
    heroTitle: 'Traslados Privados en Aeropuertos de Francia',
    heroDesc: 'Reserve shuttles directos puerta a puerta desde los aeropuertos de París (CDG, ORY, BVA) a Disneyland París, hoteles y excursiones. Tarifas fijas garantizadas, chóferes bilingües y sin depósito.',
    flightTracking: 'Seguimiento de vuelo y tiempo de espera gratuito',
    freeSeats: 'Sillas de bebé y elevadores de cortesía',
    bilingualDrivers: 'Chóferes bilingües y amables',
    fixedPricing: 'Precios fijos sin cargos ocultos',
    heroBadge: 'CHÓFER PRIVADO AEROPORTUAL PARÍS Y DISNEYLAND',

    // Route Cards & Widgets
    from: 'Desde',
    viewFares: 'Ver Tarifas y Detalle de Ruta',
    privateTransfer: 'Traslado Privado',
    mins: 'min',
    km: 'km',
    featuredRoutesTitle: 'Rutas de Traslado Populares y Tarifas Fijas',
    featuredRoutesSubtitle: 'Precios fijos al instante para traslados en aeropuerto y Disneyland París.',

    // Booking Widget Step Wizard
    stepRoute: '1. Ruta',
    stepFleetDate: '2. Flota y Fecha',
    stepConfirm: '3. Confirmar',
    oneWay: 'Solo ida',
    roundTrip: 'Ida y vuelta',
    whereTraveling: '¿A dónde viajas?',
    whereTravelingSubtitle: 'Selecciona tu aeropuerto u origen y destino.',
    pickupLocation: 'Lugar de Recogida',
    dropoffLocation: 'Lugar de Destino',
    pickupAddressLabel: 'Dirección o Terminal de Recogida',
    dropoffAddressLabel: 'Dirección de Destino',
    btnChooseDateVehicle: 'Elegir Fecha y Vehículo',

    scheduleTitle: 'Programa y Selecciona Tipo de Vehículo',
    scheduleSubtitle: 'Elige fecha, hora y categoría de vehículo.',
    pickupDate: 'Fecha de Recogida',
    time: 'Hora',
    passengers: 'Pasajeros',
    selectVehicleTier: 'Seleccionar Tipo de Vehículo',
    back: 'Atrás',
    btnPassengerDetails: 'Datos del Pasajero',

    passengerContactTitle: 'Datos de Contacto del Pasajero',
    passengerContactSubtitle: 'Introduce tus datos para recibir el seguimiento del chófer. Pago a la llegada.',
    fullName: 'Nombre Completo',
    emailAddress: 'Correo Electrónico',
    mobilePhone: 'Móvil / WhatsApp',
    babyCarSeats: 'Sillas de Bebé (Gratis)',
    boosterSeats: 'Elevadores (Gratis)',
    flightNumberLabel: 'Número de Vuelo / Tren',
    btnReserveNow: 'Reservar Traslado Ahora 🚀',
    bookNow: 'Reservar Traslado Ahora',
    payOnArrival: 'Pago al Chófer a la Llegada',
    noDepositRequired: 'Sin depósito requerido • Cancelación gratuita',
    sedanName: 'Berline Sedán',
    economyVanName: 'Van Económica',
    businessVanName: 'Van VIP Business',
    minibusName: 'Minibús Ejecutivo',
    passengersCount: '1-3 Pasajeros',
    vanPassengersCount: '1-8 Pasajeros',
    minibusPassengersCount: '8-16 Pasajeros',

    // Fleet & Services
    fleetTitle: 'Nuestra Flota de Chóferes Premium',
    fleetSubtitle: 'Sedanes de lujo y vans espaciosas limpias, modernas y totalmente homologadas.',
    servicesTitle: 'Por Qué Elegir FastForward Shuttle',
    servicesSubtitle: 'Servicios de traslado puerta a puerta diseñados para familias y viajeros internacionales.',

    // Reviews Section
    reviews: 'Opiniones',
    reviewsTitle: 'Lo Que Dicen Nuestros Pasajeros',
    reviewsSubtitle: 'Lea opiniones reales de 5 estrellas de viajeros verificados de todo el mundo.',
    verifiedReview: 'Reseña Verificada',
    customerVoices: 'OPINIONES DE CLIENTES',
    writeReview: 'Escribir una opinión',
    openTripadvisor: 'Abrir Tripadvisor',
    avgRatingText: 'Puntuación media en Tripadvisor y Google Reviews',

    // Footer & Links
    contactUs: 'Contacto',
    aboutUs: 'Sobre Nosotros',
    faqs: 'Preguntas Frecuentes',
    footerDesc: 'Traslados privados puerta a puerta, shuttles de aeropuerto y traslados a Disneyland París sin depósito previo.',
    quickLinks: 'Enlaces Rápidos',
    rightsReserved: 'Todos los derechos reservados. Traslados Privados de Lujo en París y Disneyland.',

    // Additional UI & Card Translations
    popularRoutesBadge: 'RUTAS POPULARES Y TARIFAS',
    viewRoute: 'Ver Ruta',
    averageRating: 'Puntuación Media',
    verifiedReviewsCount: 'Reseñas Verificadas',
    travelersChoice: 'Elección de los Viajeros',
    fixedPricingBadge: 'Precios Fijos',
    noHiddenFees: 'Sin cargos ocultos',
    zeroDeposit: 'Sin Depósito',
    payOnArrivalBadge: 'Pago a la llegada',
    freeChildSeats: 'Sillas de Niño Gratis',
    includedAlways: 'Siempre incluido',
    fleetCapacityBadge: 'CAPACIDAD DE LA FLOTA Y ESPECIFICACIONES',
    familyFavorite: 'FAVORITO DE FAMILIAS',
    freeSeatsBadge: 'Sillas Gratis',
    gotQuestions: '¿TIENES PREGUNTAS?',
    faqsTitle: 'Preguntas Frecuentes',
    faqsSubtitle: 'Todo lo que necesitas saber sobre recogidas en aeropuerto, política sin depósito y sillas infantiles.',
    bottomCtaTitle: 'Tu Viaje a París Comienza Aquí',
    bottomCtaSubtitle: 'Reserve su chófer privado hoy con tarifas fijas, sin depósito y pago a la llegada.',
    fromLabel: 'Desde',
    toLabel: 'Hasta',
    selectPickupPlaceholder: 'Seleccione lugar de recogida...',
    selectDropoffPlaceholder: 'Seleccione lugar de destino...',
    swapLocations: 'Intercambiar ubicaciones',
    bookNowBtn: 'RESERVAR',
    trainStationTransfersHeading: 'Traslados Estaciones de Tren',
    disneylandTransfersHeading: 'Traslados Disneyland París',
    excursionsHeading: 'Excursiones y Visitas',
    ourServices: 'Nuestros Servicios',
    ourFleet: 'Nuestra Flota',
    legalPolicies: 'Legal y Políticas',
    termsConditions: 'Términos y Condiciones',
    privacyPolicy: 'Política de Privacidad',
    cancellationPolicy: 'Política de Cancelación',
    officialChauffeurService: 'SERVICIO OFICIAL DE CHÓFER EN PARÍS',
    planTransferBtn: 'Planificar un Traslado',
    talkToUsBtn: 'Contactar con Nosotros',
    awardsAndTrust: 'PREMIOS Y CONFIANZA',
    verifiedBadge: 'VERIFICADO',
  },
  fr: {
    // Header & Nav
    home: 'Accueil',
    parisTransfers: 'Transferts Paris',
    disneylandTransfers: 'Transferts Disneyland',
    tours: 'Excursions',
    transferRates: 'Tarifs',
    more: 'Plus',
    hotline: 'Assistance 24/7',
    topBanner: 'Transferts Privés Directs Paris & Disneyland • Paiement au Chauffeur à l’Arrivée • Sièges Enfant Gratuits',
    tagline: 'TRANSFERTS AÉROPORT PARIS & EXCURSIONS D’EXCEPTION',
    company: 'ENTREPRISE',
    support: 'SUPPORT',
    connect: 'CONNEXION',

    // Hero Section
    heroTitle: 'Transferts Privés Directs dans les Aéroports de France',
    heroDesc: 'Réservez des navettes privées porte-à-porte depuis les aéroports de Paris (CDG, ORY, BVA) vers Disneyland Paris, vos hôtels et vos excursions. Tarifs fixes garantis, chauffeurs bilingues et sans acompte.',
    flightTracking: 'Suivi de vol & temps d’attente gratuit',
    freeSeats: 'Sièges bébé & réhausseurs offerts',
    bilingualDrivers: 'Chauffeurs bilingues & courtois',
    fixedPricing: 'Tarifs fixes sans frais cachés',
    heroBadge: 'CHAUFFEUR PRIVÉ AÉROPORT PARIS & DISNEYLAND',

    // Route Cards & Widgets
    from: 'À partir de',
    viewFares: 'Voir les Tarifs & Détails du Trajet',
    privateTransfer: 'Transfert Privé',
    mins: 'min',
    km: 'km',
    featuredRoutesTitle: 'Trajets Populaires & Tarifs Fixes',
    featuredRoutesSubtitle: 'Prix fixes garantis pour vos transferts vers les aéroports et Disneyland Paris.',

    // Booking Widget Step Wizard
    stepRoute: '1. Trajet',
    stepFleetDate: '2. Flotte & Date',
    stepConfirm: '3. Confirmer',
    oneWay: 'Aller simple',
    roundTrip: 'Aller-retour',
    whereTraveling: 'Où voyagez-vous ?',
    whereTravelingSubtitle: 'Sélectionnez votre aéroport ou lieu de prise en charge et votre destination.',
    pickupLocation: 'Lieu de Prise en Charge',
    dropoffLocation: 'Lieu de Dépose',
    pickupAddressLabel: 'Adresse ou Terminal de Prise en Charge',
    dropoffAddressLabel: 'Adresse de Dépose',
    btnChooseDateVehicle: 'Choisir la Date & le Véhicule',

    scheduleTitle: 'Planifiez & Choisissez la Gamme',
    scheduleSubtitle: 'Choisissez votre date, heure et catégorie de véhicule.',
    pickupDate: 'Date de Prise en Charge',
    time: 'Heure',
    passengers: 'Passagers',
    selectVehicleTier: 'Choisir la Gamme de Véhicule',
    back: 'Retour',
    btnPassengerDetails: 'Détails du Passager',

    passengerContactTitle: 'Coordonnées du Passager',
    passengerContactSubtitle: 'Entrez vos coordonnées pour recevoir le suivi du chauffeur. Paiement à l’arrivée.',
    fullName: 'Nom Complet',
    emailAddress: 'Adresse E-mail',
    mobilePhone: 'Téléphone / WhatsApp',
    babyCarSeats: 'Sièges Bébé (Gratuits)',
    boosterSeats: 'Réhausseurs (Gratuits)',
    flightNumberLabel: 'Numéro de Vol / Train',
    btnReserveNow: 'Réserver Mon Transfert 🚀',
    bookNow: 'Réserver Votre Transfert',
    payOnArrival: 'Paiement au Chauffeur à l’Arrivée',
    noDepositRequired: 'Aucun acompte requis • Annulation gratuite',
    sedanName: 'Berline de Luxe',
    economyVanName: 'Van Économique',
    businessVanName: 'Van VIP Business',
    minibusName: 'Minibus Exécutif',
    passengersCount: '1-3 Passagers',
    vanPassengersCount: '1-8 Passagers',
    minibusPassengersCount: '8-16 Passagers',

    // Fleet & Services
    fleetTitle: 'Notre Flotte de Véhicules avec Chauffeur',
    fleetSubtitle: 'Berlines haut de gamme et vans spacieux, récents et parfaitement entretenus.',
    servicesTitle: 'Pourquoi Choisir FastForward Shuttle',
    servicesSubtitle: 'Des services de transfert sur mesure pensés pour les familles et voyageurs du monde entier.',

    // Reviews Section
    reviews: 'Avis Clients',
    reviewsTitle: 'Ce Que Disent Nos Passagers',
    reviewsSubtitle: 'Découvrez les avis 5 étoiles de nos voyageurs vérifiés du monde entier.',
    verifiedReview: 'Avis Vérifié',
    customerVoices: 'AVIS DE NOS VOYAGEURS',
    writeReview: 'Donner un avis',
    openTripadvisor: 'Ouvrir Tripadvisor',
    avgRatingText: 'Note moyenne sur Tripadvisor & Google Reviews',

    // Footer & Links
    contactUs: 'Contactez-nous',
    aboutUs: 'À Propos',
    faqs: 'Foire Aux Questions',
    footerDesc: 'Transferts privés porte-à-porte, navettes aéroports et trajets Disneyland Paris sans aucun acompte.',
    quickLinks: 'Liens Rapides',
    rightsReserved: 'Tous droits réservés. Transferts Privés de Prestige à Paris & Disneyland.',

    // Additional UI & Card Translations
    popularRoutesBadge: 'TRAJETS POPULAIRES & TARIFS',
    viewRoute: 'Voir le Trajet',
    averageRating: 'Note Moyenne',
    verifiedReviewsCount: 'Avis Vérifiés',
    travelersChoice: 'Choix des Voyageurs',
    fixedPricingBadge: 'Tarifs Fixes',
    noHiddenFees: 'Sans frais cachés',
    zeroDeposit: 'Zéro Acompte',
    payOnArrivalBadge: 'Paiement à l’arrivée',
    freeChildSeats: 'Sièges Enfant Gratuits',
    includedAlways: 'Toujours inclus',
    fleetCapacityBadge: 'CAPACITÉ DE LA FLOTTE & SPÉCIFICATIONS',
    familyFavorite: 'FAVORI DES FAMILLES',
    freeSeatsBadge: 'Sièges Gratuits',
    gotQuestions: 'DES QUESTIONS ?',
    faqsTitle: 'Foire Aux Questions',
    faqsSubtitle: 'Tout ce que vous devez savoir sur la prise en charge à l’aéroport, notre politique sans acompte et les sièges enfant.',
    bottomCtaTitle: 'Votre Séjour à Paris Commence Ici',
    bottomCtaSubtitle: 'Réservez votre chauffeur privé dès aujourd’hui avec tarifs fixes, zéro acompte et paiement à l’arrivée.',
    fromLabel: 'De',
    toLabel: 'Vers',
    selectPickupPlaceholder: 'Sélectionnez le lieu de prise en charge...',
    selectDropoffPlaceholder: 'Sélectionnez la destination...',
    swapLocations: 'Inverser les lieux',
    bookNowBtn: 'RÉSERVER',
    trainStationTransfersHeading: 'Gares Parisiennes',
    disneylandTransfersHeading: 'Transferts Disneyland Paris',
    excursionsHeading: 'Excursions & Visites',
    ourServices: 'Nos Services',
    ourFleet: 'Notre Flotte',
    legalPolicies: 'Mentions Légales & Politiques',
    termsConditions: 'Conditions Générales',
    privacyPolicy: 'Politique de Confidentialité',
    cancellationPolicy: 'Politique d’Annulation',
    officialChauffeurService: 'SERVICE DE CHAUFFEUR OFFICIEL PARIS',
    planTransferBtn: 'Planifier un Transfert',
    talkToUsBtn: 'Nous Contacter',
    awardsAndTrust: 'PRIX & CONFIANCE',
    verifiedBadge: 'VÉRIFIÉ',
  },
  it: {
    // Header & Nav
    home: 'Home',
    parisTransfers: 'Trasferimenti Parigi',
    disneylandTransfers: 'Trasferimenti Disneyland',
    tours: 'Tour',
    transferRates: 'Tariffe',
    more: 'Altro',
    hotline: 'Assistenza 24/7',
    topBanner: 'Trasferimenti Privati Diretti Parigi e Disneyland • Paga all’Autista all’Arrivo • Seggiolini Gratis',
    tagline: 'TRASFERIMENTI AEROPORTO PARIGI E TOUR PRIVATI',
    company: 'AZIENDA',
    support: 'SUPPORTO',
    connect: 'SOCIAL',

    // Hero Section
    heroTitle: 'Trasferimenti Privati dagli Aeroporti in Francia',
    heroDesc: 'Prenota navette private porta a porta dagli aeroporti di Parigi (CDG, ORY, BVA) a Disneyland Parigi, hotel ed escursioni. Prezzi fissi garantiti, autisti bilingui e zero acconto.',
    flightTracking: 'Monitoraggio volo e tempo di attesa gratuito',
    freeSeats: 'Seggiolini per bambini gratuiti',
    bilingualDrivers: 'Autisti bilingui e cortesi',
    fixedPricing: 'Prezzi fissi senza costi nascosti',
    heroBadge: 'AUTISTA PRIVATO AEROPORTO PARIGI E DISNEYLAND',

    // Route Cards & Widgets
    from: 'Da',
    viewFares: 'Vedi Tariffe e Dettagli Percorso',
    privateTransfer: 'Trasferimento Privato',
    mins: 'min',
    km: 'km',
    featuredRoutesTitle: 'Rotte Popolari e Tariffe Fisse',
    featuredRoutesSubtitle: 'Prezzi fissi immediati per i migliori trasferimenti in aeroporto e Disneyland Parigi.',

    // Booking Widget Step Wizard
    stepRoute: '1. Percorso',
    stepFleetDate: '2. Flotta e Data',
    stepConfirm: '3. Conferma',
    oneWay: 'Solo andata',
    roundTrip: 'Andata e ritorno',
    whereTraveling: 'Dove vuoi andare?',
    whereTravelingSubtitle: 'Seleziona l’aeroporto di partenza e la destinazione.',
    pickupLocation: 'Luogo di Ritiro',
    dropoffLocation: 'Destinazione',
    pickupAddressLabel: 'Indirizzo o Terminal di Ritiro',
    dropoffAddressLabel: 'Indirizzo di Destinazione',
    btnChooseDateVehicle: 'Scegli Data e Veicolo',

    scheduleTitle: 'Programma e Seleziona Veicolo',
    scheduleSubtitle: 'Scegli data, ora e categoria del veicolo.',
    pickupDate: 'Data di Ritiro',
    time: 'Ora',
    passengers: 'Passeggeri',
    selectVehicleTier: 'Seleziona Categoria Veicolo',
    back: 'Indietro',
    btnPassengerDetails: 'Dettagli Passeggero',

    passengerContactTitle: 'Dati di Contatto del Passeggero',
    passengerContactSubtitle: 'Inserisci i tuoi dati per ricevere il monitoraggio dell’autista. Paga all’arrivo.',
    fullName: 'Nome Completo',
    emailAddress: 'Indirizzo Email',
    mobilePhone: 'Cellulare / WhatsApp',
    babyCarSeats: 'Seggiolini Bebè (Gratis)',
    boosterSeats: 'Alzatine (Gratis)',
    flightNumberLabel: 'Numero Volo / Treno',
    btnReserveNow: 'Prenota Trasferimento Ora 🚀',
    bookNow: 'Prenota Trasferimento Ora',
    payOnArrival: 'Paga all’Autista all’Arrivo',
    noDepositRequired: 'Nessun acconto richiesto • Cancellazione gratuita',
    sedanName: 'Berlina Sedan',
    economyVanName: 'Van Economy',
    businessVanName: 'Van VIP Business',
    minibusName: 'Minibus Executive',
    passengersCount: '1-3 Passeggeri',
    vanPassengersCount: '1-8 Passeggeri',
    minibusPassengersCount: '8-16 Passeggeri',

    // Fleet & Services
    fleetTitle: 'La Nostra Flotta di Veicoli',
    fleetSubtitle: 'Berline di lusso e capienti van moderni, sanificati e con licenza ufficiale.',
    servicesTitle: 'Perché Scegliere FastForward Shuttle',
    servicesSubtitle: 'Servizi di trasferimento privati pensati per famiglie e viaggiatori internazionali.',

    // Reviews Section
    reviews: 'Recensioni',
    reviewsTitle: 'Cosa Dicono i Nostri Passeggeri',
    reviewsSubtitle: 'Leggi le recensioni 5 stelle dei viaggiatori di tutto il mondo.',
    verifiedReview: 'Recensione Verificata',
    customerVoices: 'RECENSIONI DEI CLIENTI',
    writeReview: 'Scrivi una recensione',
    openTripadvisor: 'Apri Tripadvisor',
    avgRatingText: 'Valutazione media su Tripadvisor e Google Reviews',

    // Footer & Links
    contactUs: 'Contattaci',
    aboutUs: 'Chi Siamo',
    faqs: 'Domande Frequenti',
    footerDesc: 'Trasferimenti privati porta a porta, navette aeroportuali e Disneyland Parigi senza anticipo.',
    quickLinks: 'Link Rapidi',
    rightsReserved: 'Tutti i diritti riservati. Trasferimenti Privati di Lusso a Parigi e Disneyland.',

    // Additional UI & Card Translations
    popularRoutesBadge: 'ROTTE POPOLARI E TARIFFE',
    viewRoute: 'Vedi Percorso',
    averageRating: 'Valutazione Media',
    verifiedReviewsCount: 'Recensioni Verificate',
    travelersChoice: 'Scelta dei Viaggiatori',
    fixedPricingBadge: 'Prezzi Fissi',
    noHiddenFees: 'Nessun costo nascosto',
    zeroDeposit: 'Zero Anticipo',
    payOnArrivalBadge: 'Paga all’arrivo',
    freeChildSeats: 'Seggiolini Gratis',
    includedAlways: 'Sempre inclusi',
    fleetCapacityBadge: 'CAPACITÀ DELLA FLOTTA E SPECIFICHE',
    familyFavorite: 'PREFERITO DALLE FAMIGLIE',
    freeSeatsBadge: 'Seggiolini Gratis',
    gotQuestions: 'HAI DOMANDE?',
    faqsTitle: 'Domande Frequenti',
    faqsSubtitle: 'Tutto quello che devi sapere su pick-up aeroporto, cancellazione e seggiolini inclusi.',
    bottomCtaTitle: 'Il Tuo Viaggio a Parigi Inizia Qui',
    bottomCtaSubtitle: 'Prenota oggi il tuo autista privato con prezzi fissi, zero anticipo e pagamento all’arrivo.',
    fromLabel: 'Da',
    toLabel: 'A',
    selectPickupPlaceholder: 'Seleziona luogo di ritiro...',
    selectDropoffPlaceholder: 'Seleziona destinazione...',
    swapLocations: 'Inverti posizioni',
    bookNowBtn: 'PRENOTA ORA',
    trainStationTransfersHeading: 'Stazioni Ferroviarie di Parigi',
    disneylandTransfersHeading: 'Trasferimenti Disneyland Parigi',
    excursionsHeading: 'Escursioni e Tour di un Giorno',
    ourServices: 'I Nostri Servizi',
    ourFleet: 'La Nostra Flotta',
    legalPolicies: 'Legale e Politiche',
    termsConditions: 'Termini e Condizioni',
    privacyPolicy: 'Informativa sulla Privacy',
    cancellationPolicy: 'Politica di Cancellazione',
    officialChauffeurService: 'SERVIZIO UFFICIALE DI AUTISTA A PARIGI',
    planTransferBtn: 'Pianifica Trasferimento',
    talkToUsBtn: 'Contattaci',
    awardsAndTrust: 'PREMI E FIDUCIA',
    verifiedBadge: 'VERIFICATO',
  },
  de: {
    // Header & Nav
    home: 'Startseite',
    parisTransfers: 'Paris Transfers',
    disneylandTransfers: 'Disneyland Transfers',
    tours: 'Touren',
    transferRates: 'Preise',
    more: 'Mehr',
    hotline: '24/7 Hotline',
    topBanner: 'Direkte Privattransfers Paris & Disneyland • Barzahlung beim Chauffeur • Kostenlose Kindersitze',
    tagline: 'PARIS FLUGHAFENTRANSFERS & TAGESAUSFLÜGE',
    company: 'UNTERNEHMEN',
    support: 'SUPPORT',
    connect: 'FOLGEN',

    // Hero Section
    heroTitle: 'Komfortable Privattransfers in Ganz Frankreich',
    heroDesc: 'Buchen Sie direkte Tür-zu-Tür-Shuttles von den Pariser Flughäfen (CDG, ORY, BVA) nach Disneyland Paris, zu Ihrem Hotel oder Ausflügen. Garantierte Festpreise, englischsprachige Fahrer & ohne Anzahlung.',
    flightTracking: 'Flugverfolgung & kostenlose Wartezeit',
    freeSeats: 'Kostenlose Baby- & Kindersitze',
    bilingualDrivers: 'Zweisprachige & freundliche Chauffeure',
    fixedPricing: 'Festpreise ohne versteckte Kosten',
    heroBadge: 'PRIVATCHAUFFEUR FLUGHAFEN PARIS & DISNEYLAND',

    // Route Cards & Widgets
    from: 'Ab',
    viewFares: 'Tarife & Details Anzeigen',
    privateTransfer: 'Privattransfer',
    mins: 'Min',
    km: 'km',
    featuredRoutesTitle: 'Beliebte Transferrouten & Festpreise',
    featuredRoutesSubtitle: 'Sofortige Festpreise für die besten Flughafentransfers und Disneyland Paris.',

    // Booking Widget Step Wizard
    stepRoute: '1. Route',
    stepFleetDate: '2. Flotte & Datum',
    stepConfirm: '3. Bestätigen',
    oneWay: 'Einfache Fahrt',
    roundTrip: 'Hin- und Rückfahrt',
    whereTraveling: 'Wohin reisen Sie?',
    whereTravelingSubtitle: 'Wählen Sie Ihren Abholflughafen und Ihr Zielort.',
    pickupLocation: 'Abholort',
    dropoffLocation: 'Zielort',
    pickupAddressLabel: 'Abhol-Terminal oder Hoteladresse',
    dropoffAddressLabel: 'Zieladresse',
    btnChooseDateVehicle: 'Datum & Fahrzeug Wählen',

    scheduleTitle: 'Zeitplan & Fahrzeugklasse Wählen',
    scheduleSubtitle: 'Wählen Sie Datum, Uhrzeit und Fahrzeugklasse.',
    pickupDate: 'Abholdatum',
    time: 'Uhrzeit',
    passengers: 'Fahrgäste',
    selectVehicleTier: 'Fahrzeugklasse Wählen',
    back: 'Zurück',
    btnPassengerDetails: 'Fahrgastdaten',

    passengerContactTitle: 'Kontaktdaten des Fahrgasts',
    passengerContactSubtitle: 'Geben Sie Ihre Daten ein, um die Chauffeur-Verfolgung zu erhalten. Bar/Karte bei Ankunft.',
    fullName: 'Vollständiger Name',
    emailAddress: 'E-Mail-Adresse',
    mobilePhone: 'Mobil / WhatsApp',
    babyCarSeats: 'Babysitze (Kostenlos)',
    boosterSeats: 'Kindersitze (Kostenlos)',
    flightNumberLabel: 'Flug-/Zugnummer',
    btnReserveNow: 'Transfer Jetzt Buchen 🚀',
    bookNow: 'Transfer Jetzt Buchen',
    payOnArrival: 'Zahlung beim Chauffeur bei Ankunft',
    noDepositRequired: 'Keine Anzahlung erforderlich • Kostenlose Stornierung',
    sedanName: 'Berline Limousine',
    economyVanName: 'Economy Van',
    businessVanName: 'VIP Business Van',
    minibusName: 'Executive Minibus',
    passengersCount: '1-3 Fahrgäste',
    vanPassengersCount: '1-8 Fahrgäste',
    minibusPassengersCount: '8-16 Fahrgäste',

    // Fleet & Services
    fleetTitle: 'Unsere Premium Chauffeur-Flotte',
    fleetSubtitle: 'Moderne, saubere und voll lizenzierte Luxuslimousinen sowie geräumige Vans.',
    servicesTitle: 'Warum FastForward Shuttle Wählen',
    servicesSubtitle: 'Erstklassige Tür-zu-Tür-Transfers speziell für Familien und internationale Reisende.',

    // Reviews Section
    reviews: 'Bewertungen',
    reviewsTitle: 'Was Unsere Fahrgäste Sagen',
    reviewsSubtitle: 'Lesen Sie echte 5-Sterne-Bewertungen von verifizierten Reisenden aus aller Welt.',
    verifiedReview: 'Verifizierte Bewertung',
    customerVoices: 'KUNDENSTIMMEN',
    writeReview: 'Bewertung schreiben',
    openTripadvisor: 'Tripadvisor öffnen',
    avgRatingText: 'Durchschnittliche Bewertung auf Tripadvisor & Google Reviews',

    // Footer & Links
    contactUs: 'Kontakt',
    aboutUs: 'Über uns',
    faqs: 'Häufig gestellte Fragen',
    footerDesc: 'Privattransfers von Tür zu Tür, Flughafen-Shuttles und Disneyland Paris ohne Anzahlung.',
    quickLinks: 'Schnelllinks',
    rightsReserved: 'Alle Rechte vorbehalten. Premium Flughafentransfers in Paris & Disneyland.',

    // Additional UI & Card Translations
    popularRoutesBadge: 'BELIEBTE ROUTEN & PREISE',
    viewRoute: 'Route ansehen',
    averageRating: 'Durchschnittliche Bewertung',
    verifiedReviewsCount: 'Verifizierte Bewertungen',
    travelersChoice: "Travelers' Choice",
    fixedPricingBadge: 'Feste Preise',
    noHiddenFees: 'Keine versteckten Gebühren',
    zeroDeposit: 'Keine Anzahlung',
    payOnArrivalBadge: 'Zahlung bei Ankunft',
    freeChildSeats: 'Kostenlose Kindersitze',
    includedAlways: 'Immer inklusive',
    fleetCapacityBadge: 'KAPAZITÄT DER FLOTTE & SPEZIFIKATIONEN',
    familyFavorite: 'FAMILIENLIEBLING',
    freeSeatsBadge: 'Kostenlose Sitze',
    gotQuestions: 'FRAGEN?',
    faqsTitle: 'Häufig gestellte Fragen',
    faqsSubtitle: 'Alles, was Sie über unsere Flughafenabholung, Null-Anzahlung und Kindersitze wissen müssen.',
    bottomCtaTitle: 'Ihre Paris-Reise beginnt hier',
    bottomCtaSubtitle: 'Buchen Sie noch heute Ihren Privat-Chauffeur mit Festpreisen, ohne Anzahlung und Zahlung bei Ankunft.',
    fromLabel: 'Von',
    toLabel: 'Nach',
    selectPickupPlaceholder: 'Bitte Abholort wählen...',
    selectDropoffPlaceholder: 'Bitte Zielort wählen...',
    swapLocations: 'Orte tauschen',
    bookNowBtn: 'JETZT BUCHEN',
    trainStationTransfersHeading: 'Bahnhofstransfers',
    disneylandTransfersHeading: 'Disneyland Paris Transfers',
    excursionsHeading: 'Ausflüge & Tagestouren',
    ourServices: 'Unsere Leistungen',
    ourFleet: 'Unsere Flotte',
    legalPolicies: 'Rechtliches & Richtlinien',
    termsConditions: 'AGB',
    privacyPolicy: 'Datenschutzerklärung',
    cancellationPolicy: 'Stornierungsbedingungen',
    officialChauffeurService: 'OFFIZIELLER PARISER CHAUFFEURSERVICE',
    planTransferBtn: 'Transfer planen',
    talkToUsBtn: 'Sprechen Sie mit uns',
    awardsAndTrust: 'AUSZEICHNUNGEN & VERTRAUEN',
    verifiedBadge: 'VERIFIZIERT',
  },
  pt: {
    // Header & Nav
    home: 'Início',
    parisTransfers: 'Transfers Paris',
    disneylandTransfers: 'Transfers Disneyland',
    tours: 'Passeios',
    transferRates: 'Tarifas',
    more: 'Mais',
    hotline: 'Linha 24/7',
    topBanner: 'Transfers Privados Diretos Paris e Disneyland • Pagamento ao Motorista na Chegada • Cadeirinhas Grátis',
    tagline: 'TRANSFERS AEROPORTO DE PARIS E PASSEIOS',
    company: 'EMPRESA',
    support: 'SUPORTE',
    connect: 'CONECTAR',

    // Hero Section
    heroTitle: 'Transfers Privados nos Aeroportos de França',
    heroDesc: 'Reserve Shuttles diretos porta a porta a partir dos aeroportos de Paris (CDG, ORY, BVA) para a Disneyland Paris, hotéis e passeios. Tarifas fixas garantidas, motoristas bilíngues e sem depósito.',
    flightTracking: 'Rastreamento de voo e tempo de espera gratuito',
    freeSeats: 'Cadeirinhas de bebê de cortesia',
    bilingualDrivers: 'Motoristas bilíngues e atenciosos',
    fixedPricing: 'Preços fixos sem taxas ocultas',
    heroBadge: 'MOTORISTA PRIVADO AEROPORTO DE PARIS E DISNEYLAND',

    // Route Cards & Widgets
    from: 'A partir de',
    viewFares: 'Ver Tarifas e Detalhes da Rota',
    privateTransfer: 'Transfer Privado',
    mins: 'min',
    km: 'km',
    featuredRoutesTitle: 'Rotas Populares e Tarifas Fixas',
    featuredRoutesSubtitle: 'Preços fixos imediatos para os melhores transfers de aeroporto e Disneyland Paris.',

    // Booking Widget Step Wizard
    stepRoute: '1. Rota',
    stepFleetDate: '2. Frota e Data',
    stepConfirm: '3. Confirmar',
    oneWay: 'Apenas ida',
    roundTrip: 'Ida e volta',
    whereTraveling: 'Para onde você vai viajar?',
    whereTravelingSubtitle: 'Selecione seu aeroporto de embarque e destino.',
    pickupLocation: 'Local de Embarque',
    dropoffLocation: 'Local de Desembarque',
    pickupAddressLabel: 'Endereço ou Terminal de Embarque',
    dropoffAddressLabel: 'Endereço de Desembarque',
    btnChooseDateVehicle: 'Escolher Data e Veículo',

    scheduleTitle: 'Agende e Selecione o Veículo',
    scheduleSubtitle: 'Escolha data, hora e categoria do veículo.',
    pickupDate: 'Data de Embarque',
    time: 'Hora',
    passengers: 'Passageiros',
    selectVehicleTier: 'Selecionar Categoria do Veículo',
    back: 'Voltar',
    btnPassengerDetails: 'Detalhes do Passageiro',

    passengerContactTitle: 'Dados de Contato do Passageiro',
    passengerContactSubtitle: 'Insira seus dados para receber o rastreamento do motorista. Pagamento na chegada.',
    fullName: 'Nome Completo',
    emailAddress: 'Endereço de E-mail',
    mobilePhone: 'Celular / WhatsApp',
    babyCarSeats: 'Cadeirinhas de Bebê (Grátis)',
    boosterSeats: 'Assentos de Elevação (Grátis)',
    flightNumberLabel: 'Número do Voo / Trem',
    btnReserveNow: 'Reservar Transfer Agora 🚀',
    bookNow: 'Reservar Transfer Agora',
    payOnArrival: 'Pagamento ao Motorista na Chegada',
    noDepositRequired: 'Sem depósito necessário • Cancelamento gratuito',
    sedanName: 'Sedan de Luxo',
    economyVanName: 'Van Econômica',
    businessVanName: 'Van VIP Business',
    minibusName: 'Minibuss Executivo',
    passengersCount: '1-3 Passageiros',
    vanPassengersCount: '1-8 Passageiros',
    minibusPassengersCount: '8-16 Passageiros',

    // Fleet & Services
    fleetTitle: 'Nossa Frota de Veículos com Motorista',
    fleetSubtitle: 'Sedans de luxo e vans espaçosas, limpas, modernas e totalmente licenciadas.',
    servicesTitle: 'Por Que Escolher a FastForward Shuttle',
    servicesSubtitle: 'Serviços de transfer porta a porta pensados para famílias e viajantes internacionais.',

    // Reviews Section
    reviews: 'Avaliações',
    reviewsTitle: 'O Que Dizem Nossos Passageiros',
    reviewsSubtitle: 'Leia depoimentos reais de 5 estrelas de viajantes verificados do mundo todo.',
    verifiedReview: 'Avaliação Verificada',
    customerVoices: 'DEPOIMENTOS DE CLIENTES',
    writeReview: 'Escrever uma avaliação',
    openTripadvisor: 'Abrir Tripadvisor',
    avgRatingText: 'Pontuação média no Tripadvisor e Google Reviews',

    // Footer & Links
    contactUs: 'Contato',
    aboutUs: 'Sobre Nós',
    faqs: 'Perguntas Frecuentes',
    footerDesc: 'Transfers privados porta a porta, shuttles de aeroporto e transfers para Disneyland Paris sem depósito prévio.',
    quickLinks: 'Links Rápidos',
    rightsReserved: 'Todos os direitos reservados. Transfers Privados de Luxo em Paris e Disneyland.',

    // Additional UI & Card Translations
    popularRoutesBadge: 'ROTAS POPULARES E TARIFAS',
    viewRoute: 'Ver Rota',
    averageRating: 'Avaliação Média',
    verifiedReviewsCount: 'Avaliações Verificadas',
    travelersChoice: 'Escolha dos Viajantes',
    fixedPricingBadge: 'Preços Fixos',
    noHiddenFees: 'Sem taxas ocultas',
    zeroDeposit: 'Sem Depósito',
    payOnArrivalBadge: 'Pagamento na chegada',
    freeChildSeats: 'Cadeirinhas Grátis',
    includedAlways: 'Sempre incluído',
    fleetCapacityBadge: 'CAPACIDADE DA FROTA E ESPECIFICAÇÕES',
    familyFavorite: 'FAVORITO DAS FAMÍLIAS',
    freeSeatsBadge: 'Assentos Grátis',
    gotQuestions: 'DÚVIDAS?',
    faqsTitle: 'Perguntas Frequentes',
    faqsSubtitle: 'Tudo o que você precisa saber sobre busca no aeroporto, política sem depósito e cadeirinhas infantis.',
    bottomCtaTitle: 'Sua Viagem a Paris Começa Aqui',
    bottomCtaSubtitle: 'Reserve hoje o seu motorista privado com preço fixo, sem depósito e pagamento na chegada.',
    fromLabel: 'De',
    toLabel: 'Para',
    selectPickupPlaceholder: 'Selecione o local de partida...',
    selectDropoffPlaceholder: 'Selecione o destino...',
    swapLocations: 'Inverter locais',
    bookNowBtn: 'RESERVAR',
    trainStationTransfersHeading: 'Estações de Trem de Paris',
    disneylandTransfersHeading: 'Transfers Disneyland Paris',
    excursionsHeading: 'Excursões e Passeios',
    ourServices: 'Nossos Serviços',
    ourFleet: 'Nossa Frota',
    legalPolicies: 'Legal e Políticas',
    termsConditions: 'Termos e Condições',
    privacyPolicy: 'Política de Privacidade',
    cancellationPolicy: 'Política de Cancelamento',
    officialChauffeurService: 'SERVIÇO OFICIAL DE MOTORISTA EM PARIS',
    planTransferBtn: 'Planejar um Transfer',
    talkToUsBtn: 'Fale Conosco',
    awardsAndTrust: 'PRÊMIOS E CONFIANÇA',
    verifiedBadge: 'VERIFICADO',
  },
};

interface LanguageContextType {
  currentLanguage: LanguageOption;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: LANGUAGES[0],
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageOption>(LANGUAGES[0]);
  const [mounted, setMounted] = useState(false);

  // Sync Google Translate cookie helper
  const syncGoogleTranslateCookie = (langCode: LanguageCode) => {
    if (typeof window === 'undefined') return;
    try {
      const hostname = window.location.hostname;
      if (langCode === 'en') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      } else {
        const val = `/en/${langCode}`;
        document.cookie = `googtrans=${val}; path=/;`;
        document.cookie = `googtrans=${val}; path=/; domain=${hostname};`;
        document.cookie = `googtrans=${val}; path=/; domain=.${hostname};`;
      }

      // If Google Translate select is rendered in DOM, trigger change
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select && select.value !== langCode) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      }
    } catch {
      // Ignore cookie errors
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('fastforward_lang') as LanguageCode;
    if (saved) {
      const found = LANGUAGES.find((l) => l.code === saved);
      if (found) {
        setCurrentLanguageState(found);
        syncGoogleTranslateCookie(saved);
      }
    }
  }, []);

  const setLanguage = (langCode: LanguageCode) => {
    const found = LANGUAGES.find((l) => l.code === langCode);
    if (found) {
      setCurrentLanguageState(found);
      localStorage.setItem('fastforward_lang', langCode);
      syncGoogleTranslateCookie(langCode);
    }
  };

  const t = (key: string): string => {
    const activeLang = mounted ? currentLanguage.code : 'en';
    return TRANSLATIONS[activeLang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage: mounted ? currentLanguage : LANGUAGES[0], setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
