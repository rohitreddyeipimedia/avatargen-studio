import { create } from "zustand";
import { persist } from "zustand/middleware";
import { heygenApi } from "@/services/heygenApi";
import type { User, Generation, CreditPackage, ViewState } from "@/types";

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "starter", name: "Starter", credits: 10, price: 9.99 },
  { id: "pro", name: "Pro", credits: 50, price: 39.99, popular: true },
  { id: "enterprise", name: "Enterprise", credits: 200, price: 129.99 }
];

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentView: ViewState;

  selectedAvatar: any | null;
  heygenAvatars: any[];
  heygenVoices: any[];
  selectedVoiceId: string;

  scriptText: string;
  generations: Generation[];

  login: (email: string, name: string) => void;
  logout: () => void;
  setView: (view: ViewState) => void;
  selectAvatar: (avatar: any) => void;
  setScriptText: (text: string) => void;
  setSelectedVoiceId: (voiceId: string) => void;

  fetchAvatars: () => Promise<void>;
  fetchVoices: () => Promise<void>;
  generateVideo: (
    avatarId: string,
    voiceId: string,
    script: string
  ) => Promise<string>;
  getStatus: (videoId: string) => Promise<any>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      currentView: "login",

      selectedAvatar: null,
      heygenAvatars: [],
      heygenVoices: [],
      selectedVoiceId: "",

      scriptText: "",
      generations: [],

      login: (email, name) => {
        set({
          user: { id: "user-" + Date.now(), email, name, credits: 5 },
          isAuthenticated: true,
          currentView: "avatars"
        });

        get().fetchAvatars();
        get().fetchVoices();
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentView: "login",
          selectedAvatar: null,
          scriptText: "",
          generations: []
        });
      },

      setView: (view) => set({ currentView: view }),
      selectAvatar: (avatar) => set({ selectedAvatar: avatar }),
      setScriptText: (text) => set({ scriptText: text }),
      setSelectedVoiceId: (voiceId) => set({ selectedVoiceId: voiceId }),

      fetchAvatars: async () => {
        const avatars = await heygenApi.getAvatars();
        set({ heygenAvatars: avatars });
      },

      fetchVoices: async () => {
        const voices = await heygenApi.getVoices();
        set({ heygenVoices: voices });

        if (voices.length > 0 && !get().selectedVoiceId) {
          set({ selectedVoiceId: voices[0].voice_id });
        }
      },

      generateVideo: async (avatarId, voiceId, script) => {
        const response = await heygenApi.generateVideo(
          avatarId,
          voiceId,
          script
        );

        const videoId = response.video_id;

        if (!videoId) throw new Error("No video ID returned");

        set((state) => ({
          generations: [
            {
              id: videoId,
              avatarId,
              script,
              status: "pending",
              createdAt: new Date()
            },
            ...state.generations
          ]
        }));

        return videoId;
      },

      getStatus: async (videoId) => {
        return heygenApi.getStatus(videoId);
      }
    }),
    {
      name: "avatargen-storage"
    }
  )
);
