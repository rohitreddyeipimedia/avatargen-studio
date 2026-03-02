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
  user: User | null;
  isAuthenticated: boolean;
  currentView: ViewState;

  selectedAvatar: HeygenAvatar | null;
  heygenAvatars: HeygenAvatar[];
  avatarsLoading: boolean;
  avatarsError: string | null;

  heygenVoices: HeygenVoice[];
  voicesLoading: boolean;
  voicesError: string | null;

  scriptText: string;
  selectedVoiceId: string;

  generations: Generation[];
  activeGenerationId: string | null;

  login: (email: string, name: string) => void;
  logout: () => void;
  setView: (view: ViewState) => void;
  selectAvatar: (avatar: HeygenAvatar) => void;
  setScriptText: (text: string) => void;
  setSelectedVoiceId: (voiceId: string) => void;
  addGeneration: (generation: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  addCredits: (credits: number) => void;
  useCredits: (amount: number) => boolean;

  fetchAvatars: () => Promise<void>;
  fetchVoices: () => Promise<void>;
  generateVideo: (avatarId: string, voiceId: string, script: string) => Promise<string>;
  getStatus: (videoId: string) => Promise<{ status: string; video_url?: string; thumbnail_url?: string; duration?: number }>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      selectedVoiceId: '',

      generations: [],
      activeGenerationId: null,

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
          heygenAvatars: [],
          heygenVoices: [],
          activeGenerationId: null
        });
      },

      setView: (view) => set({ currentView: view }),
      selectAvatar: (avatar) => set({ selectedAvatar: avatar }),
      setScriptText: (text) => set({ scriptText: text }),
      setSelectedVoiceId: (voiceId) => set({ selectedVoiceId: voiceId }),

      addGeneration: (generation) => set(state => ({ generations: [generation, ...state.generations] })),
      updateGeneration: (id, updates) => set(state => ({
        generations: state.generations.map(g => g.id === id ? { ...g, ...updates } : g)
      })),

      addCredits: (credits) => set(state => ({
        user: state.user ? { ...state.user, credits: state.user.credits + credits } : null
      })),

      useCredits: (amount) => {
        const { user } = get();
        if (!user || user.credits < amount) return false;
        set(state => ({
          user: state.user ? { ...state.user, credits: state.user.credits - amount } : null
        }));
        return true;
      },

      fetchAvatars: async () => {
        set({ avatarsLoading: true, avatarsError: null });
        try {
          const avatars = await heygenApi.getAvatars();
          set({ heygenAvatars: avatars, avatarsLoading: false });
        } catch (error) {
          console.error(error);
          set({ avatarsError: 'Failed to load avatars', avatarsLoading: false });
        }
      },

      fetchVoices: async () => {
        set({ voicesLoading: true, voicesError: null });
        try {
          const voices = await heygenApi.getVoices();
          set({ heygenVoices: voices, voicesLoading: false });
          if (voices.length > 0 && !get().selectedVoiceId) set({ selectedVoiceId: voices[0].voice_id });
        } catch (error) {
          console.error(error);
          set({ voicesError: 'Failed to load voices', voicesLoading: false });
        }
      },

      generateVideo: async (avatarId, voiceId, script) => {
        const response = await heygenApi.generateVideo({
          video_inputs: [
            {
              character: { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
              voice: { type: 'text', input_text: script, voice_id: voiceId, speed: 1.0 }
            }
          ],
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
        return heygenApi.getStatus(videoId);
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
