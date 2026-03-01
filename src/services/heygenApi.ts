// Heygen API Service
// Documentation: https://docs.heygen.com/reference/create-an-avatar-video-v2

const HEYGEN_API_BASE = 'https://api.heygen.com';
const API_KEY = import.meta.env.VITE_HEYGEN_API_KEY || '';

// Types
export interface HeygenAvatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
  preview_image_url: string;
  preview_video_url?: string;
}

export interface HeygenVoice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio?: string;
}

export interface VideoGenerationRequest {
  video_inputs: Array<{
    character: {
      type: 'avatar';
      avatar_id: string;
      avatar_style?: 'normal' | 'square' | 'circle';
    };
    voice: {
      type: 'text';
      input_text: string;
      voice_id: string;
      speed?: number;
    };
  }>;
  dimension?: {
    width: number;
    height: number;
  };
  caption?: boolean;
  title?: string;
}

export interface VideoGenerationResponse {
  error: string | null;
  data: {
    video_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    video_url?: string;
    thumbnail_url?: string;
    duration?: number;
  };
}

// API Client
class HeygenAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = HEYGEN_API_BASE;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Heygen API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Get all available avatars
  async getAvatars(): Promise<HeygenAvatar[]> {
    try {
      const response = await this.fetch('/v2/avatars');
      // Filter for photo avatars (not studio)
      const avatars = response.data?.avatars || [];
      return avatars.filter((avatar: any) => avatar.avatar_type === 'photo');
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
      throw error;
    }
  }

  // Get all available voices
  async getVoices(): Promise<HeygenVoice[]> {
    try {
      const response = await this.fetch('/v2/voices');
      return response.data?.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      throw error;
    }
  }

  // Generate a video
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await this.fetch('/v2/video/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response;
    } catch (error) {
      console.error('Failed to generate video:', error);
      throw error;
    }
  }

  // Get video status
  async getVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await this.fetch(`/v1/video_status.get?video_id=${videoId}`);
      return response;
    } catch (error) {
      console.error('Failed to get video status:', error);
      throw error;
    }
  }

  // Poll video status until complete
  async pollVideoStatus(
    videoId: string,
    onProgress?: (status: string) => void,
    maxAttempts: number = 60,
    interval: number = 5000
  ): Promise<VideoGenerationResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getVideoStatus(videoId);
      
      onProgress?.(status.data.status);
      
      if (status.data.status === 'completed') {
        return status;
      }
      
      if (status.data.status === 'failed') {
        throw new Error('Video generation failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Video generation timed out');
  }
}

// Export singleton instance
export const heygenApi = new HeygenAPI(API_KEY);

// Export for testing with different keys
export const createHeygenAPI = (apiKey: string) => new HeygenAPI(apiKey);
