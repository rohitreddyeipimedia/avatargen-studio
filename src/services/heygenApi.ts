const BASE_URL = "https://backend-gen.vercel.app"; 
// change if your backend URL is different

export const heygenApi = {
  async generateVideo(
    avatarId: string,
    voiceId: string,
    script: string
  ) {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        voice_id: voiceId,
        script: script
      })
    });

    if (!res.ok) {
      throw new Error("Failed to generate video");
    }

    return res.json();
  },

  async getStatus(videoId: string) {
    const res = await fetch(
      `${BASE_URL}/api/status?video_id=${videoId}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch status");
    }

    return res.json();
  },

  async getAvatars() {
    const res = await fetch(`${BASE_URL}/api/avatars`);
    if (!res.ok) throw new Error("Failed to fetch avatars");
    return res.json();
  },

  async getVoices() {
    const res = await fetch(`${BASE_URL}/api/voices`);
    if (!res.ok) throw new Error("Failed to fetch voices");
    return res.json();
  }
};
