const BASE_URL = "https://backend-gen.vercel.app";
// 👆 replace with your actual backend URL if different

export const heygenApi = {
  getAvatars: async () => {
    const res = await fetch(`${BASE_URL}/api/avatars`);
    return res.json();
  },

  getVoices: async () => {
    const res = await fetch(`${BASE_URL}/api/voices`);
    return res.json();
  },

  generateVideo: async (data: any) => {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getStatus: async (videoId: string) => {
    const res = await fetch(
      `${BASE_URL}/api/status?video_id=${videoId}`
    );
    return res.json();
  },
};
