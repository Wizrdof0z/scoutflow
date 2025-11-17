// Core Types

export type PlayerID = string; // Generated from Name + DOB

export type PositionProfile = 
  | 'Goalkeeper'
  | 'Centre Back'
  | 'Left Fullback'
  | 'Right Fullback'
  | 'Defensive Midfielder'
  | 'Central Midfielder'
  | 'Attacking Midfielder'
  | 'Left Winger'
  | 'Right Winger'
  | 'Centre Forward';

// Subprofiles for each position
export type SubProfile = 
  | 'Technical Centre Back'
  | 'Physical Centre Back'
  | 'Technical Fullback'
  | 'Intense Fullback'
  | 'Pivot'
  | 'Box-to-Box'
  | 'Inverted Winger'
  | 'Traditional Winger'
  | 'Second Striker'
  | 'Direct Striker';

export type Foot = 'Left' | 'Right' | 'Both';

export type VerdictType = 'Follow-up' | 'Continue Monitoring' | 'Not Good Enough';

export type DataVerdict = 'Good' | 'Average' | 'Bad';

export type VideoscoutingVerdict = 'Follow-up' | 'Continue Monitoring' | 'Not Good Enough';

// Live Scouting uses percentage grades (0-100)
export type LiveScoutingCategory = 
  | 'Top (80%+)'
  | 'Subtop (75-79%)'
  | 'Heracles (70-74%)'
  | 'Bottom Eredivisie (65-69%)'
  | 'KKD Subtop (60-64%)'
  | 'KKD Mid-Table (55-59%)'
  | 'KKD Bottom (50-54%)';

export type ListCategory = 
  | 'Prospects'
  | 'Datascouting list'
  | 'Videoscouting list'
  | 'Live scouting list'
  | 'Potential list'
  | 'Not interesting list';

// Player Model

export interface Player {
  playerID: PlayerID;
  
  // Mandatory fields
  name: string;
  dateOfBirth: string; // ISO date string
  currentTeam: string;
  currentLeague: string;
  matchesPlayed: number;
  nationality: string;
  foot: Foot;
  
  // Optional fields
  marketValue?: number;
  contractEndDate?: string; // ISO date string
  positionProfile?: PositionProfile;
  dataAvailable: boolean;
  currentList: ListCategory; // Which list the player is currently in
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Season Model (July-June range)

export interface Season {
  seasonID: string; // e.g., "2023-2024"
  startYear: number;
  endYear: number;
  startDate: string; // July 1st
  endDate: string;   // June 30th
}

// Rating Model (per season)

export interface PlayerRating {
  playerID: PlayerID;
  seasonID: string;
  
  overall: number;      // 1-10 scale
  physical: number;     // 1-10 scale
  movement: number;     // 1-10 scale
  passing: number;      // 1-10 scale
  pressure: number;     // 1-10 scale
  defensive: number;    // 1-10 scale
  
  ratedBy: string;      // userID
  ratedAt: string;      // ISO timestamp
}

// Report Model (per season)

export interface Report {
  reportID: string;
  playerID: PlayerID;
  seasonID: string;
  
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  
  uploadedBy: string;   // userID
  uploadedAt: string;   // ISO timestamp
}

// Verdict Model

export interface Verdict {
  verdictID: string;
  playerID: PlayerID;
  seasonID: string;
  
  scoutID: string;      // userID of the videoscout
  scoutName: string;
  verdictType: VerdictType;
  notes?: string;
  
  submittedAt: string;  // ISO timestamp
}

// Data Scouting Model

export interface DataScoutingEntry {
  playerID: PlayerID;
  seasonID: string;
  
  dataVerdict?: DataVerdict;
  subProfile?: SubProfile; // Subprofile for position
  datascoutID?: string; // userID
  datascoutedAt?: string;
  
  notes?: string;
}

// Videoscouting Model

export interface VideoscoutingEntry {
  playerID: PlayerID;
  seasonID: string;
  
  // Kyle's verdict
  kyleVerdict?: VideoscoutingVerdict;
  kyleVideoscoutedAt?: string;
  kyleNotes?: string;
  
  // Toer's verdict
  toerVerdict?: VideoscoutingVerdict;
  toerVideoscoutedAt?: string;
  toerNotes?: string;
}

// Live Scouting Model

export interface LiveScoutingEntry {
  playerID: PlayerID;
  seasonID: string;
  
  liveScoutingPercentage?: number; // 0-100 percentage
  livescoutID?: string; // userID
  livescoutedAt?: string;
  
  notes?: string;
}

// Helper function to get category from percentage
export function getLiveScoutingCategory(percentage: number): LiveScoutingCategory | null {
  if (percentage >= 80) return 'Top (80%+)';
  if (percentage >= 75) return 'Subtop (75-79%)';
  if (percentage >= 70) return 'Heracles (70-74%)';
  if (percentage >= 65) return 'Bottom Eredivisie (65-69%)';
  if (percentage >= 60) return 'KKD Subtop (60-64%)';
  if (percentage >= 55) return 'KKD Mid-Table (55-59%)';
  if (percentage >= 50) return 'KKD Bottom (50-54%)';
  return null;
}

// Player Classification (computed)

export interface PlayerClassification {
  playerID: PlayerID;
  seasonID: string;
  category: ListCategory;
  
  verdicts: Verdict[];
  dataScoutingEntry?: DataScoutingEntry;
  
  lastUpdated: string;
}

// User Model

export type UserRole = 'admin' | 'datascout' | 'videoscout' | 'livescout' | 'viewer';

export interface User {
  userID: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// Permission helpers
export const UserPermissions = {
  canAddPlayers: (role: UserRole) => role !== 'viewer',
  canDeletePlayers: (role: UserRole) => role === 'admin',
  canEditPlayerInfo: (role: UserRole) => role !== 'viewer',
  canChangePlayerList: (role: UserRole) => role !== 'viewer',
  
  canViewDataSummary: (role: UserRole) => true, // All can view
  canEditDataSummary: (role: UserRole) => role === 'admin' || role === 'datascout',
  
  canViewVideoscouting: (role: UserRole) => true, // All can view
  canEditVideoscouting: (role: UserRole) => role === 'admin' || role === 'videoscout',
  
  canViewLiveScouting: (role: UserRole) => true, // All can view
  canEditLiveScouting: (role: UserRole) => role === 'admin' || role === 'livescout',
  
  canUploadReports: (role: UserRole) => role === 'admin' || role === 'datascout',
  canDownloadReports: (role: UserRole) => role !== 'viewer',
  canDeleteReports: (role: UserRole) => role === 'admin' || role === 'datascout',
  
  canEditRatings: (role: UserRole) => role === 'admin' || role === 'datascout',
};

// Auth State

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
