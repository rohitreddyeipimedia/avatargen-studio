import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { heygenApi, type HeygenAvatar, type HeygenVoice } from '@/services/heygenApi';
import type { User, Generation, CreditPackage, ViewState } from '@/types';

// Demo avatars as fallback
export const DEMO_AVATARS = [
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Marketing Pro',
    image: '/avatars/sarah.jpg',
    description: 'Professional and engaging, perfect for marketing content'
  },
  {
    id: 'david',
    name: 'David',
    role: 'Tech Expert',
    image: '/avatars/david.jpg',
    description: 'Friendly and knowledgeable, great for tech tutorials'
  },
  {
    id: 'elena',
    name: 'Elena',
    role: 'News Anchor',
    image: '/avatars/elena.jpg',
    description: 'Authoritative and polished, ideal for news and announcements'
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Fitness Coach',
    image: '/avatars/marcus.jpg',
    description: 'Energetic and motivating, perfect for fitness content'
  },
  {
    id: 'yuki',
    name: 'Yuki',
    role: 'Anime Narrator',
    image: '/avatars/yuki.jpg',
    description: 'Vibrant and unique, great for creative storytelling'
  },
  {
    id: 'robert',
    name: 'Robert',
    role: 'Corporate Trainer',
    image: '/avatars/robert.jpg',
    description: 'Professional and experienced, ideal for training videos'
  },
  {
    id: 'zara',
    name: 'Zara',
    role: 'Lifestyle Vlogger',
    image: '/avatars/zara.jpg',
    description: 'Trendy and relatable, perfect for lifestyle content'
  }
];

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', name: 'Starter', credits: 10, price: 9.99 },
  { id: 'pro', name: 'Pro', credits: 50, price: 39.99, popular: true },
  { id: 'enterprise', name: 'Enterprise', credits: 200, price: 129.99 }
];

interface AppState {
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Navigation State
  currentView: ViewState;
  
  // Avatar Selection
  selectedAvatar: { id: string; name: string; role: string; image: string; description: string } | null;
  heygenAvatars: HeygenAvatar[];
  avatarsLoading: boolean;
  avatarsError: string | null;
  
  // Voices
  heygenVoices: HeygenVoice[];
  voicesLoading: boolean;
  voicesError: string | null;
  
  // Script Input
  scriptText: string;
  uploadedFile: File | null;
  selectedVoiceId: string;
  
  // Generations
  generations: Generation[];
  activeGenerationId: string | null;
  
  // Actions
  login: (email: string, name: string) => void;
  logout: () => void;
  setView: (view: ViewState) => void;
  selectAvatar: (avatar: { id: string; name: string; role: string; image: string; description: string }) => void;
  setScriptText: (text: string) => void;
  setUploadedFile: (file: File | null) => void;
  setSelectedVoiceId: (voiceId: string) => void;
  addGeneration: (generation: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  addCredits: (credits: number) => void;
  useCredits: (amount: number) => boolean;
  
  // Heygen API Actions
  fetchAvatars: () => Promise<void>;
  fetchVoices: () => Promise<void>;
  generateVideo: (avatarId: string, voiceId: string, script: string) => Promise<string>;
  pollVideoStatus: (videoId: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      currentView: 'login',
      selectedAvatar: null,
      heygenAvatars: [],
      avatarsLoading: false,
      avatarsError: null,
      heygenVoices: [],
      voicesLoading: false,
      voicesError: null,
      scriptText: '',
      uploadedFile: null,
      selectedVoiceId: '',
      generations: [],
      activeGenerationId: null,

      // Actions
      login: (email: string, name: string) => {
        set({
          user: {
            id: 'user-' + Date.now(),
            email,
            name,
            credits: 5 // Free credits on signup
          },
          isAuthenticated: true,
          currentView: 'avatars'
        });
        // Fetch avatars and voices after login
        get().fetchAvatars();
        get().fetchVoices();
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentView: 'login',
          selectedAvatar: null,
          scriptText: '',
          uploadedFile: null,
          heygenAvatars: [],
          heygenVoices: [],
          activeGenerationId: null
        });
      },

      setView: (view: ViewState) => {
        set({ currentView: view });
      },

      selectAvatar: (avatar) => {
        set({ selectedAvatar: avatar });
      },

      setScriptText: (text: string) => {
        set({ scriptText: text });
      },

      setUploadedFile: (file: File | null) => {
        set({ uploadedFile: file });
      },

      setSelectedVoiceId: (voiceId: string) => {
        set({ selectedVoiceId: voiceId });
      },

      addGeneration: (generation: Generation) => {
        set((state) => ({
          generations: [generation, ...state.generations]
        }));
      },

      updateGeneration: (id: string, updates: Partial<Generation>) => {
        set((state) => ({
          generations: state.generations.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          )
        }));
      },

      addCredits: (credits: number) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, credits: state.user.credits + credits }
            : null
        }));
      },

      useCredits: (amount: number) => {
        const { user } = get();
        if (!user || user.credits < amount) return false;
        
        set((state) => ({
          user: state.user
            ? { ...state.user, credits: state.user.credits - amount }
            : null
        }));
        return true;
      },

      // Heygen API Actions
      fetchAvatars: async () => {
        set({ avatarsLoading: true, avatarsError: null });
        try {
          const avatars = await heygenApi.getAvatars();
          set({ heygenAvatars: avatars, avatarsLoading: false });
        } catch (error) {
          console.error('Failed to fetch avatars:', error);
          set({ 
            avatarsError: 'Failed to load avatars from Heygen', 
            avatarsLoading: false 
          });
        }
      },

      fetchVoices: async () => {
        set({ voicesLoading: true, voicesError: null });
        try {
          const voices = await heygenApi.getVoices();
          set({ heygenVoices: voices, voicesLoading: false });
          // Set default voice if available
          if (voices.length > 0 && !get().selectedVoiceId) {
            set({ selectedVoiceId: voices[0].voice_id });
          }
        } catch (error) {
          console.error('Failed to fetch voices:', error);
          set({ 
            voicesError: 'Failed to load voices from Heygen', 
            voicesLoading: false 
          });
        }
      },

      generateVideo: async (avatarId: string, voiceId: string, script: string) => {
        const response = await heygenApi.generateVideo({
          video_inputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: avatarId,
                avatar_style: 'normal'
              },
              voice: {
                type: 'text',
                input_text: script,
                voice_id: voiceId,
                speed: 1.0
              }
            }
          ],
          dimension: {
            width: 1280,
            height: 720
          },
          caption: false
        });

        if (response.error) {
          throw new Error(response.error);
        }

        const videoId = response.data.video_id;
        set({ activeGenerationId: videoId });

        // Add to generations list
        const generation: Generation = {
          id: videoId,
          avatarId: avatarId,
          script: script,
          status: 'pending',
          createdAt: new Date()
        };
        get().addGeneration(generation);

        return videoId;
      },

      pollVideoStatus: async (videoId: string) => {
        try {
          const result = await heygenApi.pollVideoStatus(
            videoId,
            (status) => {
              console.log('Video status:', status);
              get().updateGeneration(videoId, { status: status as any });
            },
            60, // max attempts
            5000 // 5 second interval
          );

          // Update generation with final result
          get().updateGeneration(videoId, {
            status: 'completed',
            videoUrl: result.data.video_url,
            thumbnailUrl: result.data.thumbnail_url,
            duration: result.data.duration
          });

          set({ activeGenerationId: null });
        } catch (error) {
          console.error('Video generation failed:', error);
          get().updateGeneration(videoId, { status: 'failed' });
          set({ activeGenerationId: null });
          throw error;
        }
      }
    }),
    {
      name: 'avatargen-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        generations: state.generations
      })
    }
  )
);
