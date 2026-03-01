import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { heygenApi } from '@/services/heygenApi';

interface Avatar {
  id: string;
  name: string;
  role: string;
  image: string;
  avatar_id: string;
}

export function AvatarGallery() {
  const { selectAvatar, setView } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await heygenApi.getAvatars();
      setAvatars(data.map(a => ({
        id: a.avatar_id,
        name: a.avatar_name,
        role: a.gender,
        image: a.preview_image_url,
        avatar_id: a.avatar_id
      })));
    } catch (err) {
      setError('Failed to load avatars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAvatars(); }, []);

  const handleSelect = (avatar: Avatar) => {
    selectAvatar(avatar as any);
    toast.success(`${avatar.name} selected!`);
    setTimeout(() => setView('script'), 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your <span className="gradient-text">Host</span>
        </h2>
        <p className="text-gray-600 mb-4">Select from your Heygen avatars</p>
        <button onClick={fetchAvatars} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && avatars.length === 0 && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">No avatars found</p>
          <a href="https://app.heygen.com/avatars" target="_blank" className="btn-primary">Create on Heygen</a>
        </div>
      )}

      {!loading && !error && avatars.length > 0 && (
        <div className="relative w-full max-w-6xl">
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-8">
            {avatars.map((avatar) => (
              <div key={avatar.id} onClick={() => handleSelect(avatar)} className="flex-shrink-0 cursor-pointer">
                <div className="relative w-[280px] h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white">{avatar.name}</h3>
                    <p className="text-purple-300 capitalize">{avatar.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
