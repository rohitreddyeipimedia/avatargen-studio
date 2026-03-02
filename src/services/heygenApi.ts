const BASE_URL = "https://backend-gen.vercel.app";

/* =========================
   TYPES
========================= */

export interface HeygenAvatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
  gender?: string;
}

export interface HeygenVoice {
  voice_id: string;
  name: string;
  language?: string;
}

export interface GenerateVideoPayload {
  avatar_id: string;
  voice_id: string;
  script: string;
}

/* =========================
   API SERVICE
========================= */

export const heygenApi = {
  getAvatars: async (): Promise<HeygenAvatar[]> => {
    const response = await fetch(`${BASE_URL}/api/avatars`);
    if (!response.ok) {
      throw new Error("Failed to fetch avatars");
    }
    return response.json();
  },

  getVoices: async (): Promise<HeygenVoice[]> => {
    const response = await fetch(`${BASE_URL}/api/voices`);
    if (!response.ok) {
      throw new Error("Failed to fetch voices");
    }
    return response.json();
  },

  generateVideo: async (
    payload: GenerateVideoPayload
  ): Promise<any> => {
    const response = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to generate video");
    }

    return response.json();
  },

  getStatus: async (videoId: string): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/api/status?video_id=${videoId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video status");
    }

    return response.json();
  },
};
