import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  Play,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  Download,
  Trash2,
  Video,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

type FilterType = 'all' | 'completed' | 'processing' | 'failed';

export function HistoryGrid() {
  const { generations, updateGeneration, heygenAvatars } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filteredGenerations = generations.filter(gen =>
    filter === 'all' ? true : gen.status === filter
  );

  const getAvatarById = (avatarId: string) => {
    const avatar = heygenAvatars.find(a => a.avatar_id === avatarId);

    return {
      name: avatar?.avatar_name || 'Unknown Avatar',
      role: avatar?.gender === 'male' ? 'Male Avatar' : avatar?.gender === 'female' ? 'Female Avatar' : '',
      image: avatar?.preview_image_url || '/avatars/sarah.jpg'
    };
  };

  const handleDelete = (id: string) => {
    const { generations } = useAppStore.getState();
    useAppStore.setState({ generations: generations.filter(g => g.id !== id) });
    toast.success('Video deleted');
  };

  const handleDownload = (videoUrl: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `avatar-video-${Date.now()}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-24">
      <h2 className="text-4xl font-bold mb-10">
        Your <span className="gradient-text">Creations</span>
      </h2>

      {generations.length === 0 ? (
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p>No videos yet</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations.map(generation => {
            const avatar = getAvatarById(generation.avatarId);
            const isPlaying = playingVideo === generation.id;

            return (
              <div key={generation.id} className="rounded-xl glass p-4">
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-full aspect-video object-cover rounded-lg mb-4"
                />

                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold">{avatar.name}</p>
                    <p className="text-xs text-gray-500">{avatar.role}</p>
                  </div>
                  {generation.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {generation.status === 'processing' && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                  {generation.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{generation.script}</p>

                {generation.status === 'completed' && generation.videoUrl && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(generation.videoUrl, '_blank')}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      {isPlaying ? 'Close' : 'Play'}
                    </button>
                    <button
                      onClick={() => handleDownload(generation.videoUrl!)}
                      className="bg-gray-200 px-3 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(generation.id)}
                      className="bg-red-100 px-3 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
