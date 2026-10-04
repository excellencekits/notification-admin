// ==============================|| CITIES LOOKUP DATA ||============================== //

export interface City {
  code: string;
  name: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export const cities: City[] = [
  // United States
  { code: 'US-NYC', name: 'New York', countryCode: 'US', lat: 40.7128, lng: -74.006 },
  { code: 'US-LA', name: 'Los Angeles', countryCode: 'US', lat: 34.0522, lng: -118.2437 },
  { code: 'US-CHI', name: 'Chicago', countryCode: 'US', lat: 41.8781, lng: -87.6298 },
  { code: 'US-HOU', name: 'Houston', countryCode: 'US', lat: 29.7604, lng: -95.3698 },
  { code: 'US-PHX', name: 'Phoenix', countryCode: 'US', lat: 33.4484, lng: -112.074 },
  { code: 'US-PHI', name: 'Philadelphia', countryCode: 'US', lat: 39.9526, lng: -75.1652 },
  { code: 'US-SA', name: 'San Antonio', countryCode: 'US', lat: 29.4241, lng: -98.4936 },
  { code: 'US-SD', name: 'San Diego', countryCode: 'US', lat: 32.7157, lng: -117.1611 },
  { code: 'US-DAL', name: 'Dallas', countryCode: 'US', lat: 32.7767, lng: -96.797 },
  { code: 'US-SF', name: 'San Francisco', countryCode: 'US', lat: 37.7749, lng: -122.4194 },

  // United Kingdom
  { code: 'GB-LON', name: 'London', countryCode: 'GB', lat: 51.5074, lng: -0.1278 },
  { code: 'GB-BIR', name: 'Birmingham', countryCode: 'GB', lat: 52.4862, lng: -1.8904 },
  { code: 'GB-MAN', name: 'Manchester', countryCode: 'GB', lat: 53.4808, lng: -2.2426 },
  { code: 'GB-GLA', name: 'Glasgow', countryCode: 'GB', lat: 55.8642, lng: -4.2518 },
  { code: 'GB-LIV', name: 'Liverpool', countryCode: 'GB', lat: 53.4084, lng: -2.9916 },

  // Canada
  { code: 'CA-TOR', name: 'Toronto', countryCode: 'CA', lat: 43.6532, lng: -79.3832 },
  { code: 'CA-MON', name: 'Montreal', countryCode: 'CA', lat: 45.5017, lng: -73.5673 },
  { code: 'CA-VAN', name: 'Vancouver', countryCode: 'CA', lat: 49.2827, lng: -123.1207 },
  { code: 'CA-CAL', name: 'Calgary', countryCode: 'CA', lat: 51.0447, lng: -114.0719 },

  // Germany
  { code: 'DE-BER', name: 'Berlin', countryCode: 'DE', lat: 52.52, lng: 13.405 },
  { code: 'DE-HAM', name: 'Hamburg', countryCode: 'DE', lat: 53.5511, lng: 9.9937 },
  { code: 'DE-MUN', name: 'Munich', countryCode: 'DE', lat: 48.1351, lng: 11.582 },
  { code: 'DE-COL', name: 'Cologne', countryCode: 'DE', lat: 50.9375, lng: 6.9603 },

  // France
  { code: 'FR-PAR', name: 'Paris', countryCode: 'FR', lat: 48.8566, lng: 2.3522 },
  { code: 'FR-MAR', name: 'Marseille', countryCode: 'FR', lat: 43.2965, lng: 5.3698 },
  { code: 'FR-LYO', name: 'Lyon', countryCode: 'FR', lat: 45.764, lng: 4.8357 },
  { code: 'FR-TOU', name: 'Toulouse', countryCode: 'FR', lat: 43.6047, lng: 1.4442 },

  // United Arab Emirates
  { code: 'AE-DXB', name: 'Dubai', countryCode: 'AE', lat: 25.2048, lng: 55.2708 },
  { code: 'AE-AUH', name: 'Abu Dhabi', countryCode: 'AE', lat: 24.4539, lng: 54.3773 },
  { code: 'AE-SHJ', name: 'Sharjah', countryCode: 'AE', lat: 25.3463, lng: 55.4209 },
  { code: 'AE-AJM', name: 'Ajman', countryCode: 'AE', lat: 25.4052, lng: 55.5136 },
  { code: 'AE-RAK', name: 'Ras Al Khaimah', countryCode: 'AE', lat: 25.7954, lng: 55.9432 },
  { code: 'AE-FUJ', name: 'Fujairah', countryCode: 'AE', lat: 25.1288, lng: 56.3265 },
  { code: 'AE-UAQ', name: 'Umm Al Quwain', countryCode: 'AE', lat: 25.5647, lng: 55.5552 },

  // Egypt
  { code: 'EG-CAI', name: 'Cairo', countryCode: 'EG', lat: 30.0444, lng: 31.2357 },
  { code: 'EG-ALX', name: 'Alexandria', countryCode: 'EG', lat: 31.2001, lng: 29.9187 },
  { code: 'EG-GIZ', name: 'Giza', countryCode: 'EG', lat: 30.0131, lng: 31.2089 },
  { code: 'EG-SHG', name: 'Sharm El Sheikh', countryCode: 'EG', lat: 27.9158, lng: 34.33 },
  { code: 'EG-HRG', name: 'Hurghada', countryCode: 'EG', lat: 27.2579, lng: 33.8116 },
  { code: 'EG-LXR', name: 'Luxor', countryCode: 'EG', lat: 25.6872, lng: 32.6396 },
  { code: 'EG-ASW', name: 'Aswan', countryCode: 'EG', lat: 24.0889, lng: 32.8998 },
  { code: 'EG-PTS', name: 'Port Said', countryCode: 'EG', lat: 31.2653, lng: 32.3019 },
  { code: 'EG-SUZ', name: 'Suez', countryCode: 'EG', lat: 29.9668, lng: 32.5498 },
  { code: 'EG-ISM', name: 'Ismailia', countryCode: 'EG', lat: 30.5833, lng: 32.2667 },

  // Saudi Arabia
  { code: 'SA-RUH', name: 'Riyadh', countryCode: 'SA', lat: 24.7136, lng: 46.6753 },
  { code: 'SA-JED', name: 'Jeddah', countryCode: 'SA', lat: 21.5433, lng: 39.1728 },
  { code: 'SA-MEC', name: 'Mecca', countryCode: 'SA', lat: 21.3891, lng: 39.8579 },
  { code: 'SA-MED', name: 'Medina', countryCode: 'SA', lat: 24.5247, lng: 39.5692 },
  { code: 'SA-DAM', name: 'Dammam', countryCode: 'SA', lat: 26.4207, lng: 50.0888 },
  { code: 'SA-TAF', name: 'Taif', countryCode: 'SA', lat: 21.2703, lng: 40.4158 },
  { code: 'SA-TUU', name: 'Tabuk', countryCode: 'SA', lat: 28.3838, lng: 36.5663 },
  { code: 'SA-BUR', name: 'Buraidah', countryCode: 'SA', lat: 26.326, lng: 43.975 },
  { code: 'SA-KHO', name: 'Khobar', countryCode: 'SA', lat: 26.2172, lng: 50.1971 },
  { code: 'SA-ABH', name: 'Abha', countryCode: 'SA', lat: 18.2164, lng: 42.5053 },

  // Qatar
  { code: 'QA-DOH', name: 'Doha', countryCode: 'QA', lat: 25.2854, lng: 51.531 },
  { code: 'QA-RAY', name: 'Al Rayyan', countryCode: 'QA', lat: 25.2522, lng: 51.4392 },
  { code: 'QA-WKR', name: 'Al Wakrah', countryCode: 'QA', lat: 25.1716, lng: 51.6021 },
  { code: 'QA-KHO', name: 'Al Khor', countryCode: 'QA', lat: 25.6805, lng: 51.4969 },
  { code: 'QA-DSL', name: 'Dukhan', countryCode: 'QA', lat: 25.4233, lng: 50.7822 },

  // Sudan
  { code: 'SD-KRT', name: 'Khartoum', countryCode: 'SD', lat: 15.5007, lng: 32.5599 },
  { code: 'SD-OMD', name: 'Omdurman', countryCode: 'SD', lat: 15.6445, lng: 32.4777 },
  { code: 'SD-PZU', name: 'Port Sudan', countryCode: 'SD', lat: 19.6158, lng: 37.2164 },
  { code: 'SD-KAS', name: 'Kassala', countryCode: 'SD', lat: 15.45, lng: 36.4 },
  { code: 'SD-OBE', name: 'El Obeid', countryCode: 'SD', lat: 13.1833, lng: 30.2167 },
  { code: 'SD-NYA', name: 'Nyala', countryCode: 'SD', lat: 12.0488, lng: 24.8809 },
  { code: 'SD-WAD', name: 'Wad Madani', countryCode: 'SD', lat: 14.401, lng: 33.5197 }
];

export const getCitiesByCountry = (countryCode: string): City[] => {
  return cities.filter((city) => city.countryCode === countryCode);
};

export const getCityByCode = (code: string): City | undefined => {
  return cities.find((city) => city.code === code);
};
