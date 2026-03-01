import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { 
  Sparkles, 
  Upload, 
  Type, 
  Mic, 
  Play, 
  Loader2,
  ArrowLeft,
  Wand2,
  FileText,
  X,
  Volume2
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
      // Try to find an English voice
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

  const handleGenerate = async () => {
    const content = activeTab === 'write' ? scriptText : '';
    
    if (!content && !scriptText) {
      toast.error('Please enter a script or upload a file');
      return;
    }

    if (!selectedVoiceId) {
      toast.error('Please select a voice');
      return;
    }

    if (!useCredits(1)) {
      toast.error('Insufficient credits. Please purchase more.');
      setView('credits');
      return;
    }

    setIsGenerating(true);

    try {
      // Get the Heygen avatar ID from the selected avatar
      // For demo, we'll map our avatar IDs to Heygen avatar IDs
      const heygenAvatarId = getHeygenAvatarId(selectedAvatar.id);
      
      // Start video generation
      const videoId = await generateVideo(heygenAvatarId, selectedVoiceId, scriptText);
      
      toast.success('Video generation started!');
      
      // Poll for status in background
      pollVideoStatus(videoId)
        .then(() => {
          toast.success('Video generated successfully!');
        })
        .catch((error) => {
          toast.error('Video generation failed: ' + error.message);
        });

      // Navigate to history
      setScriptText('');
      setUploadedFile(null);
      setView('history');
    } catch (error: any) {
      toast.error('Failed to start generation: ' + error.message);
      setIsGenerating(false);
    }
  };

  // Map our avatar IDs to Heygen avatar IDs
  const getHeygenAvatarId = (avatarId: string): string => {
    // For demo, we'll use a default Heygen avatar
    // In production, you'd map these to actual Heygen avatar IDs
    const avatarMap: Record<string, string> = {
      'sarah': 'Daisy-inskirt-20220818',
      'david': 'Joon-insuit-20220818',
      'elena': 'Bella-casual-20220727',
      'marcus': 'Tyler-incasual-20220727',
      'yuki': 'Mia-casual-20220727',
      'robert': 'Archie-sport-20220727',
      'zara': 'Anna-casual-20220727'
    };
    return avatarMap[avatarId] || 'Daisy-inskirt-20220818';
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

  // Group voices by language
  const groupedVoices = heygenVoices.reduce((acc, voice) => {
    const lang = voice.language || 'Other';
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, typeof heygenVoices>);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 md:py-32">
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-600">Step 2 of 2</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Craft Your <span className="gradient-text">Message</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Write or upload your script, and watch your avatar bring it to life.
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-8">
        {/* Left - Avatar Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('avatars')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <p className="text-sm text-gray-500">Selected Avatar</p>
                <p className="font-semibold text-gray-900">{selectedAvatar.name}</p>
              </div>
            </div>

            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <img
                src={selectedAvatar.image}
                alt={selectedAvatar.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all group">
                  <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white/80 text-sm">{selectedAvatar.role}</p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-600" />
              Quick Tips
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Keep scripts under 1500 characters for best results</li>
              <li>• Use natural pauses with commas and periods</li>
              <li>• Preview voices before generating</li>
              <li>• Videos are generated in HD (1280x720)</li>
            </ul>
          </div>
        </div>

        {/* Right - Input Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-full glass w-fit">
            <button
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'write'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Type className="w-4 h-4" />
              Write Script
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          </div>

          {/* Input Content */}
          <div className="glass rounded-3xl p-6 space-y-6">
            {activeTab === 'write' ? (
              <>
                <textarea
                  ref={textareaRef}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Type your script here... Your avatar will bring these words to life."
                  className="w-full h-64 bg-white border border-gray-200 rounded-2xl p-5 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                  maxLength={1500}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{scriptText.length} / 1500 characters</span>
                </div>
                
                {/* Sample Scripts */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Or try a sample script:</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleScripts.map((script, index) => (
                      <button
                        key={index}
                        onClick={() => applySampleScript(script)}
                        className="px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-all"
                      >
                        Sample {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative h-64 rounded-2xl border-2 border-dashed transition-all cursor-pointer
                  flex flex-col items-center justify-center gap-4
                  ${isDragging 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setScriptText('');
                      }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-medium">Drop your file here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                      <p className="text-xs text-gray-400 mt-2">Supports .txt files</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Voice Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Select Voice 
                  {voicesLoading && <span className="text-gray-400 ml-2">(Loading...)</span>}
                </span>
              </div>
              
              {voicesError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {voicesError}
                </div>
              )}
              
              {heygenVoices.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                  {Object.entries(groupedVoices).map(([language, voices]) => (
                    <div key={language}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {language}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {voices.map((voice) => (
                          <button
                            key={voice.voice_id}
                            onClick={() => setSelectedVoiceId(voice.voice_id)}
                            className={`
                              flex items-center justify-between p-3 rounded-xl border transition-all text-left
                              ${selectedVoiceId === voice.voice_id
                                ? 'bg-purple-50 border-purple-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'}
                            `}
                          >
                            <div>
                              <p className={`font-medium ${selectedVoiceId === voice.voice_id ? 'text-purple-700' : 'text-gray-900'}`}>
                                {voice.name}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {voice.gender} • {voice.language}
                              </p>
                            </div>
                            {voice.preview_audio && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playVoicePreview(voice);
                                }}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <Volume2 className={`w-4 h-4 ${playingVoice === voice.voice_id ? 'text-purple-600 animate-pulse' : 'text-gray-500'}`} />
                              </button>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-100 text-gray-500 text-center text-sm">
                  {voicesLoading ? 'Loading voices...' : 'No voices available'}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!scriptText && activeTab === 'write') || !selectedVoiceId}
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
        </div>
      </div>
    </div>
  );
}
