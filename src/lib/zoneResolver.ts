/**
 * Zone Resolution Engine for FranceGo Transfers
 * 
 * Maps arbitrary addresses (Google Place Autocomplete predictions, hotel names, 
 * street addresses, postal codes, and landmarks) to predefined transport zones 
 * and matches them to configured database fixed routes.
 */

export interface ZoneDefinition {
  shortCode: string;
  name: string;
  postalCodes?: string[];
  keywords: string[];
  regex?: RegExp;
}

export const KNOWN_ZONES: Record<string, ZoneDefinition> = {
  // 1. Paris City Center (All 20 Arrondissements Intra-Muros)
  PAR: {
    shortCode: 'PAR',
    name: 'Paris City Center',
    keywords: [
      'paris',
      'eiffel tower',
      'tour eiffel',
      'champ de mars',
      'trocadero',
      'louvre',
      'pyramide du louvre',
      'notre dame',
      'notre-dame',
      'arc de triomphe',
      'champs elysees',
      'champs-elysees',
      'montmartre',
      'sacre coeur',
      'sacre-coeur',
      'opera garnier',
      'place vendome',
      'madeleine',
      'pantheon',
      'jardin du luxembourg',
      'saint germain',
      'saint-germain',
      'bastille',
      'republique',
      'chatelet',
      'le marais',
      'marais',
      'bercy',
      'nation',
      'porte maillot',
      'montparnasse',
      'gare du nord',
      'gare de lyon',
      'gare de lest',
      'gare saint-lazare',
      'gare montparnasse',
      'gare dausterlitz',
      'arrondissement',
    ],
    // Matches 75001 through 75020, and 75116 (Paris 16th)
    regex: /\b(7500[1-9]|7501[0-9]|75020|75116)\b/i,
  },

  // 2. Paris Charles de Gaulle Airport (CDG)
  CDG: {
    shortCode: 'CDG',
    name: 'Paris Charles de Gaulle Airport (CDG)',
    keywords: [
      'cdg',
      'charles de gaulle',
      'roissy',
      'roissypole',
      'terminal 1',
      'terminal 2',
      'terminal 3',
      'terminal 2e',
      'terminal 2f',
      'terminal 2a',
      'terminal 2b',
      'terminal 2c',
      'terminal 2d',
      'terminal 2g',
    ],
    regex: /\b(95700|93290|cdg|charles\s+de\s+gaulle|roissy)\b/i,
  },

  // 3. Paris Orly Airport (ORY)
  ORY: {
    shortCode: 'ORY',
    name: 'Paris Orly Airport (ORY)',
    keywords: ['orly', 'ory', 'orly 1', 'orly 2', 'orly 3', 'orly 4', 'orly sud', 'orly ouest'],
    regex: /\b(94390|91550|orly)\b/i,
  },

  // 4. Paris Beauvais Tillé Airport (BVA)
  BVA: {
    shortCode: 'BVA',
    name: 'Paris Beauvais Tillé Airport (BVA)',
    keywords: ['beauvais', 'bva', 'tille', 'tillé', 'aeroport beauvais'],
    regex: /\b(60000|beauvais|bva)\b/i,
  },

  // 5. Disneyland Paris Hotels & Parks (DLP)
  DLP: {
    shortCode: 'DLP',
    name: 'Disneyland Paris & Val d\'Europe',
    keywords: [
      'disneyland',
      'disney',
      'marne la vallee',
      'marne-la-vallee',
      'marne-la-vallée',
      'chessy',
      'coupvray',
      'serris',
      'magny le hongre',
      'magny-le-hongre',
      'bailly romainvilliers',
      'bailly-romainvilliers',
      'val deurope',
      "val d'europe",
      'hotel cheyenne',
      'hotel santa fe',
      'newport bay',
      'sequoia lodge',
      'hotel new york',
      'disneyland hotel',
      'davy crockett',
      'villages nature',
    ],
    regex: /\b(77700|77777|chessy|coupvray|serris|magny-le-hongre|disneyland)\b/i,
  },

  // 6. Château de Versailles (VERS)
  VERS: {
    shortCode: 'VERS',
    name: 'Château de Versailles & Hotels',
    keywords: ['versailles', 'chateau de versailles', 'château de versailles', 'trianon palace'],
    regex: /\b(78000|versailles)\b/i,
  },

  // 7. Parc Astérix (ASTX)
  ASTX: {
    shortCode: 'ASTX',
    name: 'Parc Astérix & Hotels',
    keywords: ['asterix', 'astérix', 'plailly', 'trois hiboux'],
    regex: /\b(60128|asterix|astérix)\b/i,
  },

  // 8. Fondation Claude Monet Giverny (GIV)
  GIV: {
    shortCode: 'GIV',
    name: 'Fondation Claude Monet Giverny',
    keywords: ['giverny', 'monet', 'claude monet'],
    regex: /\b(27620|giverny)\b/i,
  },

  // 9. Château de Fontainebleau (FTB)
  FTB: {
    shortCode: 'FTB',
    name: 'Château de Fontainebleau & Barbizon',
    keywords: ['fontainebleau', 'barbizon'],
    regex: /\b(77300|fontainebleau)\b/i,
  },
};

/**
 * Normalizes an address string for resilient substring matching.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents (é -> e, etc.)
    .replace(/[,\.\-\/\\#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detects whether an address or location object belongs to a known Zone (PAR, CDG, ORY, DLP, etc.).
 */
export function detectZone(
  addressOrText?: string | null,
  locationObj?: { id?: string; shortCode?: string; name?: string; category?: string } | null
): string | null {
  // 1. Direct shortCode match if already known from predefined DB locations
  if (locationObj?.shortCode && KNOWN_ZONES[locationObj.shortCode.toUpperCase()]) {
    return locationObj.shortCode.toUpperCase();
  }

  // 2. Direct name/id match from known locations
  if (locationObj?.id) {
    const rawId = locationObj.id.toLowerCase();
    if (rawId.includes('cdg')) return 'CDG';
    if (rawId.includes('ory')) return 'ORY';
    if (rawId.includes('bva')) return 'BVA';
    if (rawId.includes('dlp')) return 'DLP';
    if (rawId.includes('par')) return 'PAR';
    if (rawId.includes('vers')) return 'VERS';
    if (rawId.includes('astx')) return 'ASTX';
  }

  const textToScan = [addressOrText, locationObj?.name].filter(Boolean).join(' ');
  if (!textToScan || textToScan.trim().length === 0) {
    return null;
  }

  const normalized = normalizeText(textToScan);

  // 3. Priority check: Specific Airports and Theme Parks before general Paris
  // (e.g. "Paris Charles de Gaulle" has the word "Paris", but must be classified as CDG!)
  const specificZones = ['CDG', 'ORY', 'BVA', 'DLP', 'VERS', 'ASTX', 'GIV', 'FTB'];

  for (const zoneCode of specificZones) {
    const zone = KNOWN_ZONES[zoneCode];
    if (zone.regex && zone.regex.test(textToScan)) {
      return zoneCode;
    }
    for (const kw of zone.keywords) {
      if (normalized.includes(kw)) {
        return zoneCode;
      }
    }
  }

  // 4. Paris City Center check (All 20 Arrondissements Intra-Muros)
  const parZone = KNOWN_ZONES.PAR;
  // Check Paris postal code 75001-75020
  if (parZone.regex && parZone.regex.test(textToScan)) {
    return 'PAR';
  }

  // Check landmark keywords
  for (const kw of parZone.keywords) {
    if (normalized.includes(kw)) {
      return 'PAR';
    }
  }

  // Check general word "paris" with France
  if (/\bparis\b/i.test(normalized)) {
    return 'PAR';
  }

  return null;
}

export interface MatchedZoneRoute {
  isFixedZoneRate: true;
  route: any;
  originZone: string;
  destZone: string;
  zoneLabel: string;
  pricing: {
    sedan: number;
    economyVan: number;
    businessVan: number;
    minibus: number;
  };
  distanceKm: number;
  estDurationMinutes: number;
}

/**
 * Resolves an origin and destination against the active routes catalog.
 * Returns the matched fixed route if both sides resolve to a configured DB route pair.
 */
export function findZoneRoute(
  origin: any,
  destination: any,
  routes: any[]
): MatchedZoneRoute | null {
  if (!origin || !destination || !routes || routes.length === 0) {
    return null;
  }

  const originText = typeof origin === 'string' ? origin : origin?.name || origin?.pickupAddress || '';
  const destText = typeof destination === 'string' ? destination : destination?.name || destination?.dropoffAddress || '';

  const originObj = typeof origin === 'object' ? origin : null;
  const destObj = typeof destination === 'object' ? destination : null;

  // 1. Direct ID match first (if both are already predefined DB locations)
  if (originObj?.id && destObj?.id && originObj.id !== destObj.id) {
    const directMatch = routes.find(
      (r) =>
        (r.originId === originObj.id && r.destinationId === destObj.id) ||
        (r.originId === destObj.id && r.destinationId === originObj.id)
    );
    if (directMatch) {
      return {
        isFixedZoneRate: true,
        route: directMatch,
        originZone: directMatch.origin?.shortCode || originObj.shortCode || 'ORIGIN',
        destZone: directMatch.destination?.shortCode || destObj.shortCode || 'DEST',
        zoneLabel: `${directMatch.origin?.name || 'Pickup'} ↔ ${directMatch.destination?.name || 'Drop-off'}`,
        pricing: {
          sedan: directMatch.sedanPriceEur,
          economyVan: directMatch.economyVanPriceEur,
          businessVan: directMatch.businessVanPriceEur,
          minibus: directMatch.minibusPriceEur,
        },
        distanceKm: directMatch.distanceKm || 35,
        estDurationMinutes: directMatch.estDurationMinutes || 40,
      };
    }
  }

  // 2. Detect Zones for both endpoints
  const originZone = detectZone(originText, originObj);
  const destZone = detectZone(destText, destObj);

  if (!originZone || !destZone || originZone === destZone) {
    return null;
  }

  // 3. Search routes by matching shortCodes (Bidirectional)
  const matchedRoute = routes.find((r) => {
    const rOrigCode = r.origin?.shortCode || (r.originId ? String(r.originId).replace('loc-', '').toUpperCase() : '');
    const rDestCode = r.destination?.shortCode || (r.destinationId ? String(r.destinationId).replace('loc-', '').toUpperCase() : '');

    return (
      (rOrigCode === originZone && rDestCode === destZone) ||
      (rOrigCode === destZone && rDestCode === originZone)
    );
  });

  if (matchedRoute) {
    return {
      isFixedZoneRate: true,
      route: matchedRoute,
      originZone,
      destZone,
      zoneLabel: `${matchedRoute.origin?.name || originZone} ↔ ${matchedRoute.destination?.name || destZone}`,
      pricing: {
        sedan: matchedRoute.sedanPriceEur,
        economyVan: matchedRoute.economyVanPriceEur,
        businessVan: matchedRoute.businessVanPriceEur,
        minibus: matchedRoute.minibusPriceEur,
      },
      distanceKm: matchedRoute.distanceKm || 35,
      estDurationMinutes: matchedRoute.estDurationMinutes || 40,
    };
  }

  return null;
}
