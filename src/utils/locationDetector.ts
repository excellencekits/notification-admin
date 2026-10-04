// ==============================|| LOCATION DETECTOR UTILITY ||============================== //

export interface LocationInfo {
  countryCode: string;
  countryName: string;
  city?: string;
  timezone?: string;
}

/**
 * Detects user's location based on browser timezone and language
 * Falls back to IP-based detection if needed
 */
export const detectUserLocation = async (): Promise<LocationInfo | null> => {
  try {
    // Try to get location from browser timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || navigator.languages?.[0] || 'en-US';

    // Extract country code from locale (e.g., "en-US" -> "US")
    const localeCountryCode = locale.split('-')[1]?.toUpperCase();

    // Map timezone to country (basic mapping)
    const countryFromTimezone = getCountryFromTimezone(timezone);

    // Prefer country from locale, fallback to timezone
    const countryCode = localeCountryCode || countryFromTimezone || 'US';

    return {
      countryCode,
      countryName: getCountryName(countryCode),
      timezone
    };
  } catch (error) {
    console.error('Failed to detect location:', error);
    // Fallback to US
    return {
      countryCode: 'US',
      countryName: 'United States',
      timezone: 'America/New_York'
    };
  }
};

/**
 * Alternative method using IP geolocation API
 * Free service with no API key required
 */
export const detectLocationByIP = async (): Promise<LocationInfo | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('IP geolocation failed');
    }

    const data = await response.json();
    return {
      countryCode: data.country_code || 'US',
      countryName: data.country_name || 'United States',
      city: data.city,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Failed to detect location by IP:', error);
    return null;
  }
};

/**
 * Get country from timezone (basic mapping)
 */
function getCountryFromTimezone(timezone: string): string {
  const timezoneToCountry: Record<string, string> = {
    'America/New_York': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Los_Angeles': 'US',
    'America/Phoenix': 'US',
    'America/Anchorage': 'US',
    'America/Honolulu': 'US',
    'America/Toronto': 'CA',
    'America/Vancouver': 'CA',
    'America/Montreal': 'CA',
    'Europe/London': 'GB',
    'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Europe/Amsterdam': 'NL',
    'Europe/Brussels': 'BE',
    'Europe/Zurich': 'CH',
    'Europe/Vienna': 'AT',
    'Europe/Stockholm': 'SE',
    'Europe/Oslo': 'NO',
    'Europe/Copenhagen': 'DK',
    'Europe/Helsinki': 'FI',
    'Europe/Warsaw': 'PL',
    'Europe/Lisbon': 'PT',
    'Europe/Athens': 'GR',
    'Europe/Dublin': 'IE',
    'Asia/Tokyo': 'JP',
    'Asia/Shanghai': 'CN',
    'Asia/Hong_Kong': 'HK',
    'Asia/Singapore': 'SG',
    'Asia/Seoul': 'KR',
    'Asia/Kolkata': 'IN',
    'Asia/Dubai': 'AE',
    'Asia/Qatar': 'QA',
    'Asia/Riyadh': 'SA',
    'Asia/Kuwait': 'KW',
    'Asia/Bahrain': 'BH',
    'Asia/Muscat': 'OM',
    'Africa/Cairo': 'EG',
    'Africa/Khartoum': 'SD',
    'Australia/Sydney': 'AU',
    'Australia/Melbourne': 'AU',
    'Australia/Brisbane': 'AU',
    'Australia/Perth': 'AU',
    'Pacific/Auckland': 'NZ',
    'America/Sao_Paulo': 'BR',
    'America/Mexico_City': 'MX',
    'America/Argentina/Buenos_Aires': 'AR'
  };

  return timezoneToCountry[timezone] || 'US';
}

/**
 * Get country name from country code
 */
function getCountryName(code: string): string {
  const countryNames: Record<string, string> = {
    US: 'United States',
    CA: 'Canada',
    GB: 'United Kingdom',
    FR: 'France',
    DE: 'Germany',
    IT: 'Italy',
    ES: 'Spain',
    NL: 'Netherlands',
    BE: 'Belgium',
    CH: 'Switzerland',
    AT: 'Austria',
    SE: 'Sweden',
    NO: 'Norway',
    DK: 'Denmark',
    FI: 'Finland',
    PL: 'Poland',
    PT: 'Portugal',
    GR: 'Greece',
    IE: 'Ireland',
    JP: 'Japan',
    CN: 'China',
    IN: 'India',
    AU: 'Australia',
    NZ: 'New Zealand',
    BR: 'Brazil',
    MX: 'Mexico',
    AR: 'Argentina',
    AE: 'United Arab Emirates',
    SG: 'Singapore',
    HK: 'Hong Kong',
    KR: 'South Korea',
    QA: 'Qatar',
    SA: 'Saudi Arabia',
    EG: 'Egypt',
    SD: 'Sudan',
    KW: 'Kuwait',
    BH: 'Bahrain',
    OM: 'Oman'
  };

  return countryNames[code] || code;
}
