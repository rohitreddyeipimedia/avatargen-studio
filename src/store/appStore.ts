import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { heygenApi, type HeygenAvatar, type HeygenVoice } from '@/services/heygenApi';
import type { User, Generation, CreditPackage, ViewState } from '@/types';

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', name: 'Starter', credits: 10, price: 9.99 },
  { id: 'pro', name: 'Pro', credits: 50, price: 39.99, popular: true },
  { id: 'enterprise', name: 'Enterprise', credits: 200, price: 129.99 }
];

interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;

  // Navigation
  currentView: ViewState;

  // Avatar & Voices
  selectedAvatar: HeygenAvatar | null;
  heygenAvatars: HeygenAvatar[];
  avatarsLoading: boolean;
  avatarsError: string | null;

  heygenVoices: HeygenVoice[];
  voicesLoading: boolean;
  voicesError: string | null;
  selectedVoiceId: string;

  // Script
  scriptText: string;
  uploadedFile: File | null;

  // Generations
  generations: Generation[];
  activeGenerationId: string | null;

  // Actions
  login: (email: string, name: string) => void;
  logout: () => void;
  setView: (view: ViewState) => void;
  selectAvatar: (avatar: HeygenAvatar) => void;
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
  getStatus: (videoId: string) => Promise<{ status: 'pending' | 'completed' | 'failed'; videoUrl?: string; thumbnailUrl?: string; duration?: number }>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
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
      selectedVoiceId: '',

      scriptText: '',
      uploadedFile: null,

      generations: [],
      activeGenerationId: null,

      // User actions
      login: (email, name) => {
        set({
          user: { id: 'user-' + Date.now(), email, name, credits: 5 },
          isAuthenticated: true,
          currentView: 'avatars'
        });
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

      setView: (view) => set({ currentView: view }),
      selectAvatar: (avatar) => set({ selectedAvatar: avatar }),
      setScriptText: (text) => set({ scriptText: text }),
      setUploadedFile: (file) => set({ uploadedFile: file }),
      setSelectedVoiceId: (voiceId) => set({ selectedVoiceId: voiceId }),

      addGeneration: (generation) => set((state) => ({ generations: [generation, ...state.generations] })),
      updateGeneration: (id, updates) => set((state) => ({
        generations: state.generations.map((g) => g.id === id ? { ...g, ...updates } : g)
      })),

      addCredits: (credits) => set((state) => ({
        user: state.user ? { ...state.user, credits: state.user.credits + credits } : null
      })),
      useCredits: (amount) => {
        const { user } = get();
        if (!user || user.credits < amount) return false;
        set({ user: { ...user, credits: user.credits - amount } });
        return true;
      },

      // Heygen API
      fetchAvatars: async () => {
        set({ avatarsLoading: true, avatarsError: null });
        try {
          const avatars = await heygenApi.getAvatars();
          set({ heygenAvatars: avatars, avatarsLoading: false });
        } catch (err) {
          console.error(err);
          set({ avatarsError: 'Failed to load avatars', avatarsLoading: false });
        }
      },

      fetchVoices: async () => {
        set({ voicesLoading: true, voicesError: null });
        try {
          const voices = await heygenApi.getVoices();
          set({ heygenVoices: voices, voicesLoading: false });
          if (voices.length > 0 && !get().selectedVoiceId) {
            set({ selectedVoiceId: voices[0].voice_id });
          }
        } catch (err) {
          console.error(err);
          set({ voicesError: 'Failed to load voices', voicesLoading: false });
        }
      },

      generateVideo: async (avatarId, voiceId, script) => {
        const response = await heygenApi.generateVideo({
          character: { avatar_id: avatarId, type: 'avatar', avatar_style: 'normal' },
          voice: { input_text: script, voice_id: voiceId, type: 'text', speed: 1.0 },
          dimension: { width: 1280, height: 720 },
          caption: false
        });

        if (response.error) throw new Error(response.error);

        const videoId = response.data.video_id;
        set({ activeGenerationId: videoId });

        get().addGeneration({
          id: videoId,
          avatarId,
          script,
          status: 'pending',
          createdAt: new Date()
        });

        return videoId;
      },

      getStatus: async (videoId) => {
        const result = await heygenApi.getStatus(videoId);
        // map status
        const statusMap = ['pending', 'completed', 'failed'] as const;
        return {
          status: statusMap.includes(result.status as any) ? result.status as any : 'failed',
          videoUrl: result.video_url,
          thumbnailUrl: result.thumbnail_url,
          duration: result.duration
        };
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
