import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  Play,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  Filter,
  Download,
  Trash2,
  Video,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// Types
type FilterType = 'all' | 'completed' | 'processing' | 'failed';

interface Generation {
  id: string;
  avatarId: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  script: string;
  videoUrl?: string;
  createdAt: string;
  duration?: number;
}

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
  gender: 'male' | 'female';
}

export function HistoryGrid() {
  const { generations, updateGeneration, heygenAvatars } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filteredGenerations = generations.filter((gen) => {
    if (filter === 'all') return true;
    return gen.status === filter;
  });

  const getStatusIcon = (status: Generation['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
      case 'pending':
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: Generation['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
    }
  };

  const getAvatarById = (avatarId: string) => {
    const avatar = heygenAvatars.find((a: Avatar) => a.avatar_id === avatarId);
    if (!avatar) return { name: 'Unknown Avatar', role: '', image: '/avatars/sarah.jpg' };
    return {
      name: avatar.avatar_name,
      role: avatar.gender === 'male' ? 'Male Avatar' : 'Female Avatar',
      image: avatar.preview_image_url
    };
  };

  const handleDelete = (id: string) => {
    const { generations } = useAppStore.getState();
    useAppStore.setState({ generations: generations.filter((g) => g.id !== id) });
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

  const handlePlayVideo = (videoId: string) => {
    setPlayingVideo(playingVideo === videoId ? null : videoId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-24">
      <h2 className="text-4xl font-bold mb-10">
        Your <span className="gradient-text">Creations</span>
      </h2>

      {/* Filter */}
      <div className="flex gap-2 mb-8">
        {(['all', 'completed', 'processing', 'failed'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
              filter === f ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {generations.length === 0 ? (
        <div className="text-center py-20">
          <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p>No videos yet</p>
        </div>
      ) : filteredGenerations.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p>No videos match this filter</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations.map((generation) => {
            const avatar = getAvatarById(generation.avatarId);
            const isHovered = hoveredId === generation.id;
            const isPlaying = playingVideo === generation.id;

            return (
              <div
                key={generation.id}
                className="relative group rounded-2xl glass overflow-hidden transition-all duration-300"
                onMouseEnter={() => setHoveredId(generation.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  {generation.status === 'completed' && generation.videoUrl && isPlaying ? (
                    <video
                      src={generation.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                      onEnded={() => setPlayingVideo(null)}
                    />
                  ) : (
                    <>
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </>
                  )}

                  {/* Play Button Overlay */}
                  {generation.status === 'completed' && generation.videoUrl && !isPlaying && (
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                      <button
                        onClick={() => handlePlayVideo(generation.id)}
                        className="w-16 h-16 rounded-full bg-purple-600/90 backdrop-blur-md flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium">
                    {getStatusIcon(generation.status)}
                    {getStatusText(generation.status)}
                  </div>

                  {/* Duration */}
                  {generation.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
                      {formatDuration(generation.duration)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{avatar.name}</p>
                      <p className="text-xs text-gray-500">{avatar.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(generation.createdAt)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{generation.script}</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {generation.status === 'completed' && generation.videoUrl && (
                      <>
                        <button
                          onClick={() => handlePlayVideo(generation.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm"
                        >
                          {isPlaying ? 'Close' : <><Play className="w-4 h-4" /> Play</>}
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
                        <a
                          href={generation.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-200 px-3 rounded-lg flex items-center justify-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </>
                    )}
                    {generation.status === 'processing' && (
                      <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-600 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </div>
                    )}
                    {generation.status === 'failed' && (
                      <button
                        onClick={() => {
                          updateGeneration(generation.id, { status: 'processing' });
                          toast.info('Retrying generation...');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm"
                      >
                        <Sparkles className="w-4 h-4" /> Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
