import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ScriptInput() {
  const {
    selectedAvatar,
    scriptText,
    setScriptText,
    selectedVoiceId,
    setSelectedVoiceId,
    heygenVoices,
    generateVideo,
    getStatus,
    useCredits,
    setView,
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (heygenVoices.length > 0 && !selectedVoiceId) {
      setSelectedVoiceId(heygenVoices[0].voice_id);
    }
  }, [heygenVoices]);

  if (!selectedAvatar) {
    setView("avatars");
    return null;
  }

  const handleGenerate = async () => {
    if (!scriptText) {
      toast.error("Enter script");
      return;
    }

    if (!selectedVoiceId) {
      toast.error("Select voice");
      return;
    }

    if (!selectedAvatar.avatar_id) {
      toast.error("Invalid avatar");
      return;
    }

    if (!useCredits(1)) {
      toast.error("Insufficient credits");
      setView("credits");
      return;
    }

    setIsGenerating(true);

    try {
      const videoId = await generateVideo(
        selectedAvatar.avatar_id,
        selectedVoiceId,
        scriptText
      );

      toast.success("Video started");

      let attempts = 0;
      let status = "pending";

      while (status === "pending" && attempts < 60) {
        attempts++;
        const res = await getStatus(videoId);
        status = res.status;
        if (status === "pending") {
          await new Promise((r) => setTimeout(r, 5000));
        }
      }

      if (status === "completed") {
        toast.success("Video ready");
        setView("history");
        setScriptText("");
      } else {
        toast.error("Video failed");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">Generate Video</h2>

      <textarea
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
        className="w-full border p-4 rounded-lg"
        placeholder="Write your script..."
      />

      <select
        value={selectedVoiceId || ""}
        onChange={(e) => setSelectedVoiceId(e.target.value)}
        className="w-full border p-3 rounded-lg"
      >
        {heygenVoices.map((voice) => (
          <option key={voice.voice_id} value={voice.voice_id}>
            {voice.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-purple-600 text-white p-4 rounded-lg flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate
          </>
        )}
      </button>
    </div>
  );
}
