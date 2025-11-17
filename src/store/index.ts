import { create } from 'zustand';
import { 
  Player, 
  PlayerRating, 
  Report, 
  Verdict, 
  DataScoutingEntry,
  VideoscoutingEntry,
  LiveScoutingEntry,
  User,
  AuthState
} from '@/types';
import { generatePlayerID } from '@/utils/helpers';
import * as supabaseService from '@/lib/supabase-service';

// Mock data for development
const MOCK_USER: User = {
  userID: 'user-1',
  email: 'scout@scoutflow.com',
  name: 'John Scout',
  role: 'datascout',
  createdAt: new Date().toISOString(),
};

// Auth Store
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Start not logged in
  isAuthenticated: false,
  
  login: async (_email: string, _password: string) => {
    // Authentication is handled in LoginPage
    // This is just for updating state
    await new Promise(resolve => setTimeout(resolve, 100));
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));

// Main App Store
interface AppState {
  // Data (cached from Supabase)
  players: Player[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  loadPlayers: () => Promise<void>;
  addPlayer: (player: Omit<Player, 'playerID' | 'createdAt' | 'updatedAt'>) => Promise<Player>;
  updatePlayer: (playerID: string, updates: Partial<Player>) => Promise<void>;
  deletePlayer: (playerID: string) => Promise<void>;
  
  addRating: (rating: Omit<PlayerRating, 'ratedAt'>) => Promise<void>;
  
  addReport: (report: Omit<Report, 'reportID' | 'uploadedAt'>) => Promise<Report>;
  deleteReport: (reportID: string) => Promise<void>;
  
  addVerdict: (verdict: Omit<Verdict, 'verdictID' | 'submittedAt'>) => Promise<void>;
  
  updateDataScouting: (entry: DataScoutingEntry) => Promise<void>;
  updateVideoscouting: (entry: VideoscoutingEntry) => Promise<void>;
  updateLiveScouting: (entry: LiveScoutingEntry) => Promise<void>;
  
  // Getters (with async data fetching)
  getPlayer: (playerID: string) => Player | undefined;
  getPlayerRatings: (playerID: string, seasonID: string) => Promise<PlayerRating | null>;
  getPlayerReports: (playerID: string, seasonID: string) => Promise<Report[]>;
  getPlayerVerdicts: (playerID: string, seasonID: string) => Promise<Verdict[]>;
  getDataScoutingEntry: (playerID: string, seasonID: string) => Promise<DataScoutingEntry | null>;
  getVideoscoutingEntry: (playerID: string, seasonID: string) => Promise<VideoscoutingEntry | null>;
  getLiveScoutingEntry: (playerID: string, seasonID: string) => Promise<LiveScoutingEntry | null>;
  
  // User (from auth)
  user: User | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  players: [],
  isLoading: false,
  user: MOCK_USER,
  
  // Load all players from Supabase
  loadPlayers: async () => {
    set({ isLoading: true })
    try {
      const players = await supabaseService.getAllPlayers()
      set({ players, isLoading: false })
    } catch (error) {
      console.error('Error loading players:', error)
      set({ isLoading: false })
    }
  },
  
  // Player Actions
  addPlayer: async (playerData) => {
    const playerID = generatePlayerID(playerData.name, playerData.dateOfBirth)
    
    try {
      console.log('Creating player with ID:', playerID)
      const newPlayer = await supabaseService.createPlayer({
        ...playerData,
        playerID,
      })
      
      // Update local cache
      set((state) => ({
        players: [newPlayer, ...state.players],
      }))
      
      return newPlayer
    } catch (error: any) {
      console.error('Error creating player:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: error,
      })
      throw error
    }
  },
  
  updatePlayer: async (playerID, updates) => {
    try {
      await supabaseService.updatePlayer(playerID, updates)
      
      // Update local cache
      set((state) => ({
        players: state.players.map((p) =>
          p.playerID === playerID
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        ),
      }))
    } catch (error) {
      console.error('Error updating player:', error)
      throw error
    }
  },
  
  deletePlayer: async (playerID) => {
    try {
      await supabaseService.deletePlayer(playerID)
      
      // Update local cache
      set((state) => ({
        players: state.players.filter((p) => p.playerID !== playerID),
      }))
    } catch (error) {
      console.error('Error deleting player:', error)
      throw error
    }
  },
  
  // Rating Actions
  addRating: async (ratingData) => {
    try {
      await supabaseService.upsertPlayerRating(ratingData)
    } catch (error) {
      console.error('Error saving rating:', error)
      throw error
    }
  },
  
  // Report Actions
  addReport: async (reportData) => {
    try {
      const newReport = await supabaseService.createReport(reportData)
      return newReport
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    }
  },
  
  deleteReport: async (reportID) => {
    try {
      await supabaseService.deleteReport(reportID)
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  },
  
  // Verdict Actions
  addVerdict: async (verdictData) => {
    try {
      await supabaseService.createVerdict(verdictData)
    } catch (error) {
      console.error('Error creating verdict:', error)
      throw error
    }
  },
  
  // Data Scouting Actions
  updateDataScouting: async (entry) => {
    try {
      await supabaseService.upsertDataScoutingEntry(entry)
    } catch (error) {
      console.error('Error updating data scouting:', error)
      throw error
    }
  },

  // Videoscouting Actions
  updateVideoscouting: async (entry) => {
    try {
      await supabaseService.upsertVideoscoutingEntry(entry)
    } catch (error) {
      console.error('Error updating videoscouting:', error)
      throw error
    }
  },

  // Live Scouting Actions
  updateLiveScouting: async (entry) => {
    try {
      await supabaseService.upsertLiveScoutingEntry(entry)
    } catch (error) {
      console.error('Error updating live scouting:', error)
      throw error
    }
  },
  
  // Getters
  getPlayer: (playerID) => {
    return get().players.find((p) => p.playerID === playerID);
  },
  
  getPlayerRatings: async (playerID, seasonID) => {
    try {
      return await supabaseService.getPlayerRating(playerID, seasonID);
    } catch (error) {
      console.error('Error getting player ratings:', error);
      return null;
    }
  },
  
  getPlayerReports: async (playerID, seasonID) => {
    try {
      return await supabaseService.getPlayerReports(playerID, seasonID);
    } catch (error) {
      console.error('Error getting player reports:', error);
      return [];
    }
  },
  
  getPlayerVerdicts: async (playerID, seasonID) => {
    try {
      return await supabaseService.getPlayerVerdicts(playerID, seasonID);
    } catch (error) {
      console.error('Error getting player verdicts:', error);
      return [];
    }
  },
  
  getDataScoutingEntry: async (playerID, seasonID) => {
    try {
      return await supabaseService.getDataScoutingEntry(playerID, seasonID);
    } catch (error) {
      console.error('Error getting data scouting entry:', error);
      return null;
    }
  },

  getVideoscoutingEntry: async (playerID, seasonID) => {
    try {
      return await supabaseService.getVideoscoutingEntry(playerID, seasonID);
    } catch (error) {
      console.error('Error getting videoscouting entry:', error);
      return null;
    }
  },

  getLiveScoutingEntry: async (playerID, seasonID) => {
    try {
      return await supabaseService.getLiveScoutingEntry(playerID, seasonID);
    } catch (error) {
      console.error('Error getting live scouting entry:', error);
      return null;
    }
  },
}));
