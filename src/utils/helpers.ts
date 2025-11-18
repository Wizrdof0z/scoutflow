import { Season } from '@/types';

// Generate PlayerID from name and date of birth
export function generatePlayerID(name: string, dateOfBirth: string): string {
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');
  const dob = dateOfBirth.replace(/-/g, '');
  return `${cleanName}-${dob}`;
}

// Get current season based on July-June cycle
export function getCurrentSeason(): Season {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  
  // If before July (month 6), we're in the season that started last year
  const startYear = currentMonth < 6 ? currentYear - 1 : currentYear;
  const endYear = startYear + 1;
  
  return {
    seasonID: `${startYear}-${endYear}`,
    startYear,
    endYear,
    startDate: `${startYear}-07-01`,
    endDate: `${endYear}-06-30`,
  };
}

// Generate all seasons for a player (from when they started playing)
export function generateSeasons(startYear: number, endYear: number): Season[] {
  const seasons: Season[] = [];
  
  for (let year = startYear; year < endYear; year++) {
    seasons.push({
      seasonID: `${year}-${year + 1}`,
      startYear: year,
      endYear: year + 1,
      startDate: `${year}-07-01`,
      endDate: `${year + 1}-06-30`,
    });
  }
  
  return seasons;
}

// Format season for display
export function formatSeason(season: Season): string {
  return `${season.startYear}/${String(season.endYear).slice(-2)}`;
}

// Parse season ID to get years
export function parseSeasonID(seasonID: string): { startYear: number; endYear: number } {
  const [startYear, endYear] = seasonID.split('-').map(Number);
  return { startYear, endYear };
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
