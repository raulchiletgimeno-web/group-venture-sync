// Emergency phone numbers by country code (ISO 3166-1 alpha-2)
// Each country includes the international dialing prefix

export interface PhoneEntry {
  labelKey: string; // translation key
  number: string;
  icon: string; // emoji
}

export interface CountryPhones {
  name: string;
  prefix: string;
  phones: PhoneEntry[];
}

// Map of country codes to emergency numbers
const emergencyPhonesByCountry: Record<string, CountryPhones> = {
  ES: {
    name: "España",
    prefix: "+34",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "091", icon: "🚔" },
      { labelKey: "phoneLocalPolice", number: "092", icon: "👮" },
      { labelKey: "phoneAmbulance", number: "061", icon: "🚑" },
      { labelKey: "phoneFire", number: "080", icon: "🚒" },
      { labelKey: "phoneTaxi", number: "902101564", icon: "🚕" },
      { labelKey: "phoneTourism", number: "901300600", icon: "ℹ️" },
    ],
  },
  FR: {
    name: "France",
    prefix: "+33",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "17", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "15", icon: "🚑" },
      { labelKey: "phoneFire", number: "18", icon: "🚒" },
      { labelKey: "phoneTourism", number: "0892681000", icon: "ℹ️" },
    ],
  },
  GB: {
    name: "United Kingdom",
    prefix: "+44",
    phones: [
      { labelKey: "phoneEmergencies", number: "999", icon: "🚨" },
      { labelKey: "phonePolice", number: "101", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "999", icon: "🚑" },
      { labelKey: "phoneFire", number: "999", icon: "🚒" },
      { labelKey: "phoneNonEmergency", number: "111", icon: "🏥" },
    ],
  },
  IT: {
    name: "Italia",
    prefix: "+39",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "113", icon: "🚔" },
      { labelKey: "phoneCarabinieri", number: "112", icon: "👮" },
      { labelKey: "phoneAmbulance", number: "118", icon: "🚑" },
      { labelKey: "phoneFire", number: "115", icon: "🚒" },
      { labelKey: "phoneTourism", number: "800990000", icon: "ℹ️" },
    ],
  },
  PT: {
    name: "Portugal",
    prefix: "+351",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "112", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "112", icon: "🚑" },
      { labelKey: "phoneFire", number: "112", icon: "🚒" },
      { labelKey: "phoneTourism", number: "808781212", icon: "ℹ️" },
    ],
  },
  DE: {
    name: "Deutschland",
    prefix: "+49",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "110", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "112", icon: "🚑" },
      { labelKey: "phoneFire", number: "112", icon: "🚒" },
    ],
  },
  US: {
    name: "United States",
    prefix: "+1",
    phones: [
      { labelKey: "phoneEmergencies", number: "911", icon: "🚨" },
      { labelKey: "phonePolice", number: "911", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "911", icon: "🚑" },
      { labelKey: "phoneFire", number: "911", icon: "🚒" },
      { labelKey: "phonePoison", number: "18002221222", icon: "☠️" },
    ],
  },
  MX: {
    name: "México",
    prefix: "+52",
    phones: [
      { labelKey: "phoneEmergencies", number: "911", icon: "🚨" },
      { labelKey: "phonePolice", number: "911", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "065", icon: "🚑" },
      { labelKey: "phoneFire", number: "068", icon: "🚒" },
      { labelKey: "phoneTourism", number: "078", icon: "ℹ️" },
    ],
  },
  AR: {
    name: "Argentina",
    prefix: "+54",
    phones: [
      { labelKey: "phoneEmergencies", number: "911", icon: "🚨" },
      { labelKey: "phonePolice", number: "101", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "107", icon: "🚑" },
      { labelKey: "phoneFire", number: "100", icon: "🚒" },
    ],
  },
  CO: {
    name: "Colombia",
    prefix: "+57",
    phones: [
      { labelKey: "phoneEmergencies", number: "123", icon: "🚨" },
      { labelKey: "phonePolice", number: "112", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "125", icon: "🚑" },
      { labelKey: "phoneFire", number: "119", icon: "🚒" },
    ],
  },
  CL: {
    name: "Chile",
    prefix: "+56",
    phones: [
      { labelKey: "phoneEmergencies", number: "131", icon: "🚨" },
      { labelKey: "phonePolice", number: "133", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "131", icon: "🚑" },
      { labelKey: "phoneFire", number: "132", icon: "🚒" },
    ],
  },
  BR: {
    name: "Brasil",
    prefix: "+55",
    phones: [
      { labelKey: "phoneEmergencies", number: "190", icon: "🚨" },
      { labelKey: "phonePolice", number: "190", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "192", icon: "🚑" },
      { labelKey: "phoneFire", number: "193", icon: "🚒" },
    ],
  },
  NL: {
    name: "Nederland",
    prefix: "+31",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "0900-8844", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "112", icon: "🚑" },
      { labelKey: "phoneFire", number: "112", icon: "🚒" },
    ],
  },
  GR: {
    name: "Ελλάδα",
    prefix: "+30",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "100", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "166", icon: "🚑" },
      { labelKey: "phoneFire", number: "199", icon: "🚒" },
      { labelKey: "phoneTourism", number: "171", icon: "ℹ️" },
    ],
  },
  AT: {
    name: "Österreich",
    prefix: "+43",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "133", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "144", icon: "🚑" },
      { labelKey: "phoneFire", number: "122", icon: "🚒" },
    ],
  },
  CH: {
    name: "Schweiz",
    prefix: "+41",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "117", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "144", icon: "🚑" },
      { labelKey: "phoneFire", number: "118", icon: "🚒" },
    ],
  },
  JP: {
    name: "日本",
    prefix: "+81",
    phones: [
      { labelKey: "phonePolice", number: "110", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "119", icon: "🚑" },
      { labelKey: "phoneFire", number: "119", icon: "🚒" },
    ],
  },
  TH: {
    name: "ประเทศไทย",
    prefix: "+66",
    phones: [
      { labelKey: "phoneEmergencies", number: "191", icon: "🚨" },
      { labelKey: "phonePolice", number: "191", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "1554", icon: "🚑" },
      { labelKey: "phoneFire", number: "199", icon: "🚒" },
      { labelKey: "phoneTourism", number: "1155", icon: "ℹ️" },
    ],
  },
  MA: {
    name: "المغرب",
    prefix: "+212",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "19", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "15", icon: "🚑" },
      { labelKey: "phoneFire", number: "15", icon: "🚒" },
    ],
  },
  TR: {
    name: "Türkiye",
    prefix: "+90",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "155", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "112", icon: "🚑" },
      { labelKey: "phoneFire", number: "110", icon: "🚒" },
    ],
  },
  HR: {
    name: "Hrvatska",
    prefix: "+385",
    phones: [
      { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
      { labelKey: "phonePolice", number: "192", icon: "🚔" },
      { labelKey: "phoneAmbulance", number: "194", icon: "🚑" },
      { labelKey: "phoneFire", number: "193", icon: "🚒" },
    ],
  },
};

// Default fallback for unknown countries (EU standard)
const defaultPhones: CountryPhones = {
  name: "",
  prefix: "",
  phones: [
    { labelKey: "phoneEmergencies", number: "112", icon: "🚨" },
    { labelKey: "phonePolice", number: "112", icon: "🚔" },
    { labelKey: "phoneAmbulance", number: "112", icon: "🚑" },
    { labelKey: "phoneFire", number: "112", icon: "🚒" },
  ],
};

// Known destination-to-country mappings for common cities
const cityToCountry: Record<string, string> = {
  // Spain
  madrid: "ES", barcelona: "ES", sevilla: "ES", valencia: "ES", málaga: "ES", malaga: "ES",
  bilbao: "ES", granada: "ES", ibiza: "ES", mallorca: "ES", tenerife: "ES", "san sebastián": "ES",
  // France
  paris: "FR", lyon: "FR", marsella: "FR", marseille: "FR", niza: "FR", nice: "FR", burdeos: "FR", bordeaux: "FR",
  // UK
  londres: "GB", london: "GB", edimburgo: "GB", edinburgh: "GB", manchester: "GB", liverpool: "GB",
  // Italy
  roma: "IT", rome: "IT", milán: "IT", milan: "IT", florencia: "IT", florence: "IT",
  venecia: "IT", venice: "IT", nápoles: "IT", naples: "IT", turín: "IT", turin: "IT", amalfi: "IT",
  // Portugal
  lisboa: "PT", lisbon: "PT", oporto: "PT", porto: "PT", faro: "PT", algarve: "PT",
  // Germany
  berlín: "DE", berlin: "DE", múnich: "DE", munich: "DE", münchen: "DE", hamburgo: "DE", hamburg: "DE",
  frankfurt: "DE", colonia: "DE", köln: "DE",
  // USA
  "nueva york": "US", "new york": "US", miami: "US", "los angeles": "US", "los ángeles": "US",
  "san francisco": "US", chicago: "US", washington: "US", "las vegas": "US", boston: "US", orlando: "US",
  // Mexico
  cancún: "MX", cancun: "MX", "ciudad de méxico": "MX", "mexico city": "MX", playa: "MX", tulum: "MX",
  // Argentina
  "buenos aires": "AR", mendoza: "AR", bariloche: "AR",
  // Colombia
  bogotá: "CO", medellín: "CO", cartagena: "CO",
  // Chile
  santiago: "CL", "viña del mar": "CL", valparaíso: "CL",
  // Brazil
  "río de janeiro": "BR", "rio de janeiro": "BR", "são paulo": "BR", "sao paulo": "BR", salvador: "BR",
  // Netherlands
  ámsterdam: "NL", amsterdam: "NL", rotterdam: "NL",
  // Greece
  atenas: "GR", athens: "GR", santorini: "GR", mykonos: "GR", creta: "GR", crete: "GR",
  // Austria
  viena: "AT", vienna: "AT", wien: "AT", salzburgo: "AT", salzburg: "AT",
  // Switzerland
  zúrich: "CH", zurich: "CH", ginebra: "CH", geneva: "CH", berna: "CH", bern: "CH",
  // Japan
  tokio: "JP", tokyo: "JP", kioto: "JP", kyoto: "JP", osaka: "JP",
  // Thailand
  bangkok: "TH", phuket: "TH",
  // Morocco
  marrakech: "MA", casablanca: "MA", fez: "MA",
  // Turkey
  estambul: "TR", istanbul: "TR", antalya: "TR", capadocia: "TR", cappadocia: "TR",
  // Croatia
  dubrovnik: "HR", split: "HR", zagreb: "HR",
};

// Also map by country name keywords
const countryKeywords: Record<string, string> = {
  españa: "ES", spain: "ES", espagne: "ES", spagna: "ES", espanha: "ES",
  francia: "FR", france: "FR",
  "reino unido": "GB", "united kingdom": "GB", england: "GB", inglaterra: "GB", "grande-bretagne": "GB",
  italia: "IT", italy: "IT", italie: "IT", itália: "IT",
  portugal: "PT",
  alemania: "DE", germany: "DE", allemagne: "DE", germania: "DE", alemanha: "DE",
  "estados unidos": "US", "united states": "US", usa: "US", "états-unis": "US",
  méxico: "MX", mexico: "MX", mexique: "MX", messico: "MX",
  argentina: "AR", argentine: "AR",
  colombia: "CO", colombie: "CO",
  chile: "CL", chili: "CL", cile: "CL",
  brasil: "BR", brazil: "BR", brésil: "BR", brasile: "BR",
  "países bajos": "NL", holanda: "NL", netherlands: "NL", "pays-bas": "NL", "paesi bassi": "NL",
  grecia: "GR", greece: "GR", grèce: "GR",
  austria: "AT", autriche: "AT",
  suiza: "CH", switzerland: "CH", suisse: "CH", svizzera: "CH", suíça: "CH",
  japón: "JP", japan: "JP", japon: "JP", giappone: "JP", japão: "JP",
  tailandia: "TH", thailand: "TH", thaïlande: "TH", thailandia: "TH", tailândia: "TH",
  marruecos: "MA", morocco: "MA", maroc: "MA", marocco: "MA", marrocos: "MA",
  turquía: "TR", turkey: "TR", turquie: "TR", turchia: "TR",
  croacia: "HR", croatia: "HR", croatie: "HR", croazia: "HR", croácia: "HR",
};

export function getCountryFromDestination(destination: string): string | null {
  const lower = destination.toLowerCase().trim();

  // Check city names first
  for (const [city, code] of Object.entries(cityToCountry)) {
    if (lower.includes(city)) return code;
  }

  // Check country names
  for (const [keyword, code] of Object.entries(countryKeywords)) {
    if (lower.includes(keyword)) return code;
  }

  return null;
}

export function getEmergencyPhones(destination: string): CountryPhones {
  const countryCode = getCountryFromDestination(destination);
  if (countryCode && emergencyPhonesByCountry[countryCode]) {
    return emergencyPhonesByCountry[countryCode];
  }
  return { ...defaultPhones, name: destination };
}

export function buildTelLink(prefix: string, number: string): string {
  // For short emergency numbers (3 digits or less), just use the number directly
  if (number.length <= 3) return `tel:${number}`;
  // For longer numbers, prepend the country prefix
  return `tel:${prefix}${number}`;
}
