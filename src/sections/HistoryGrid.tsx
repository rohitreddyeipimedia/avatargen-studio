import { useState } from 'react';
import { useAppStore, DEMO_AVATARS } from '@/store/appStore';
import { 
  Play, Clock, CheckCircle, Loader2, XCircle, Filter,
  Download, Trash2, Video, Sparkles, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import type { Generation } from '@/types';

type FilterType = 'all' | 'completed' | 'processing' | 'failed';

export function HistoryGrid() {
  const { generations, updateGeneration, heygenAvatars } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filteredGenerations = generations.filter((gen: Generation) => {
    if (filter === 'all') return true;
    return gen.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
      case 'pending': return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const getAvatarById = (avatarId: string) => {
    // Heygen avatars first
    const heygenAvatar = heygenAvatars.find(a => a.avatar_id === avatarId);
    if (heygenAvatar) return {
      name: heygenAvatar.avatar_name,
      role: heygenAvatar.gender === 'male' ? 'Male Avatar' : 'Female Avatar',
      image: heygenAvatar.preview_image_url
    };
    // Fallback to demo avatars
    const demoAvatar = DEMO_AVATARS.find(a => a.id === avatarId);
    return demoAvatar || { name: 'Unknown', role: '', image: '/avatars/sarah.jpg' };
  };

  const handleDelete = (id: string) => {
    const updatedGenerations = generations.filter(g => g.id !== id);
    useAppStore.setState({ generations: updatedGenerations });
    toast.success('Video deleted');
  };

  const handleDownload = (videoUrl?: string) => {
    if (!videoUrl) return toast.error('Video URL not available');
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

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-24 md:py-32">
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Your <span className="gradient-text">Creations</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          View and manage all your generated avatar videos.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {(['all','completed','processing','failed'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Generations Grid */}
      {generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos yet</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Start creating amazing avatar videos by selecting an avatar and writing your script.
          </p>
          <button
            onClick={() => useAppStore.getState().setView('avatars')}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Start Creating
          </button>
        </div>
      ) : filteredGenerations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Filter className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No videos match this filter</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations.map((gen: Generation, index: number) => {
            const avatar = getAvatarById(gen.avatarId);
            const isHovered = hoveredId === gen.id;
            const isPlaying = playingVideo === gen.id;

            return (
              <div key={gen.id} className="group relative"
                   onMouseEnter={() => setHoveredId(gen.id)}
                   onMouseLeave={() => setHoveredId(null)}
                   style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative rounded-2xl overflow-hidden glass transition-all duration-500 ${isHovered ? 'scale-[1.02] z-10' : ''}`}
                     style={{ boxShadow: isHovered 
                       ? '0 20px 40px rgba(0,0,0,0.1),0 0 30px rgba(139,92,246,0.1)' 
                       : '0 10px 30px rgba(0,0,0,0.05)' }}>
                  {/* Video or Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    {gen.status === 'completed' && gen.videoUrl && isPlaying ? (
                      <video
                        src={gen.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                        onEnded={() => setPlayingVideo(null)}
                      />
                    ) : (
                      <>
                        <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </>
                    )}

                    {/* Play overlay */}
                    {gen.status === 'completed' && gen.videoUrl && !isPlaying && (
                      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <button onClick={() => handlePlayVideo(gen.id)} className="w-16 h-16 rounded-full bg-purple-600/90 backdrop-blur-md flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </button>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
                      {getStatusIcon(gen.status)}
                      <span className="text-xs font-medium text-white">{getStatusText(gen.status)}</span>
                    </div>

                    {/* Duration */}
                    {gen.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-medium text-white">
                        {formatDuration(gen.duration)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{avatar.name}</p>
                        <p className="text-sm text-gray-500">{avatar.role}</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatDate(gen.createdAt)}</span>
                      </div>
                    </div>

                    {/* Script Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2">{gen.script}</p>

                    {/* Actions */}
                    <div className={`flex items-center gap-2 pt-2 border-t border-gray-100 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'}`}>
                      {gen.status === 'completed' && gen.videoUrl && (
                        <>
                          <button onClick={() => handlePlayVideo(gen.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm">
                            {isPlaying ? 'Close' : (<><Play className="w-4 h-4" /> Play</>)}
                          </button>
                          <button onClick={() => handleDownload(gen.videoUrl)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">
                            <Download className="w-4 h-4" />
                          </button>
                          <a href={gen.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button onClick={() => handleDelete(gen.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {gen.status === 'processing' && (
                        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-600 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </div>
                      )}
                      {gen.status === 'failed' && (
                        <button onClick={() => { updateGeneration(gen.id, { status: 'processing' }); toast.info('Retrying generation...'); }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm">
                          <Sparkles className="w-4 h-4" />
                          Retry
                        </button>
                      )}
                    </div>
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
