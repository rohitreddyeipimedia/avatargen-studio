import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { 
  Sparkles, Upload, Type, Mic, Play, Loader2,
  ArrowLeft, Wand2, FileText, X, Volume2
} from 'lucide-react';
import { toast } from 'sonner';

export function ScriptInput() {
  const { 
    selectedAvatar, 
    scriptText, 
    setScriptText, 
    useCredits, 
    setView,
    heygenVoices,
    voicesLoading,
    voicesError,
    selectedVoiceId,
    setSelectedVoiceId,
    generateVideo,
    pollVideoStatus
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'write' | 'upload'>('write');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Redirect if no avatar selected
  if (!selectedAvatar) {
    setView('avatars');
    return null;
  }

  // Set default voice when voices load
  useEffect(() => {
    if (heygenVoices.length > 0 && !selectedVoiceId) {
      const englishVoice = heygenVoices.find(v => v.language?.toLowerCase().includes('en'));
      setSelectedVoiceId(englishVoice?.voice_id || heygenVoices[0]?.voice_id);
    }
  }, [heygenVoices, selectedVoiceId, setSelectedVoiceId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setScriptText(text);
          setUploadedFile(file);
          toast.success(`File "${file.name}" loaded`);
        };
        reader.readAsText(file);
      } else {
        toast.error('Please upload a .txt file');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setScriptText(text);
        setUploadedFile(file);
        toast.success(`File "${file.name}" loaded`);
      };
      reader.readAsText(file);
    } else {
      toast.error('Please upload a .txt file');
    }
  };

  const handleGenerate = async () => {
    if (!scriptText) {
      toast.error('Please enter a script');
      return;
    }

    if (!selectedVoiceId) {
      toast.error('Please select a voice');
      return;
    }

    if (!selectedAvatar?.avatar_id) {
      toast.error('Invalid avatar selected');
      return;
    }

    if (!useCredits(1)) {
      toast.error('Insufficient credits');
      setView('credits');
      return;
    }

    setIsGenerating(true);

    try {
      // Use the real HeyGen avatar ID
      const videoId = await generateVideo(
        selectedAvatar.avatar_id,
        selectedVoiceId,
        scriptText
      );

      toast.success('Video generation started!');

      pollVideoStatus(videoId)
        .then(() => {
          toast.success('Video generated successfully!');
        })
        .catch((error) => {
          toast.error('Video generation failed: ' + error.message);
        });

      setScriptText('');
      setUploadedFile(null);
      setView('history');

    } catch (error: any) {
      toast.error('Failed to start generation: ' + error.message);
      setIsGenerating(false);
    }
  };

  const playVoicePreview = (voice: typeof heygenVoices[0]) => {
    if (voice.preview_audio) {
      if (playingVoice === voice.voice_id) {
        audioRef.current?.pause();
        setPlayingVoice(null);
      } else {
        audioRef.current = new Audio(voice.preview_audio);
        audioRef.current.play();
        setPlayingVoice(voice.voice_id);
        audioRef.current.onended = () => setPlayingVoice(null);
      }
    } else {
      toast.info('No preview available for this voice');
    }
  };

  const sampleScripts = [
    "Welcome to our channel! Today we're exploring the fascinating world of AI technology and how it's transforming the way we create content.",
    "Hello everyone! In this video, I'll show you how to boost your productivity with these simple tips that have helped thousands of professionals.",
    "Hey there! Are you ready to transform your fitness journey? Let's dive into these proven strategies that will help you achieve your goals."
  ];

  const applySampleScript = (script: string) => {
    setScriptText(script);
    toast.info('Sample script applied');
  };

  const groupedVoices = heygenVoices.reduce((acc, voice) => {
    const lang = voice.language || 'Other';
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, typeof heygenVoices>);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 md:py-32">
      {/* UI for script input, tabs, avatar preview, voice selection, generate button */}
      {/* ...You can reuse the UI code from your previous component, unchanged... */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !scriptText || !selectedVoiceId}
        className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Starting Generation...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate Video (1 Credit)</span>
          </>
        )}
      </button>
    </div>
  );
}
