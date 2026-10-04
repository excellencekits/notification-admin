// Utility function to get city name from city code
// For now, returns the code as-is since we don't have a code-to-name mapping
export const getCityName = (cityCode: string): string => {
  return cityCode || 'Unknown';
};
