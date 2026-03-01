import { useRef, useState, useEffect } from 'react';
import { useAppStore, DEMO_AVATARS } from '@/store/appStore';
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function AvatarGallery() {
  const { selectedAvatar, selectAvatar, setView } = useAppStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      checkScrollability();
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 340;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAvatarSelect = (avatar: typeof DEMO_AVATARS[0]) => {
    selectAvatar(avatar);
    toast.success(`${avatar.name} selected!`);
    setTimeout(() => setView('script'), 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 md:py-32">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-600">Step 1 of 2</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Choose Your <span className="gradient-text">Host</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Select from our diverse cast of AI presenters. Each avatar brings a unique personality to your content.
        </p>
      </div>

      {/* Gallery Container */}
      <div className="relative w-full max-w-6xl">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full glass flex items-center justify-center transition-all duration-300 ${
            canScrollLeft
              ? 'opacity-100 hover:bg-gray-100 cursor-pointer'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full glass flex items-center justify-center transition-all duration-300 ${
            canScrollRight
              ? 'opacity-100 hover:bg-gray-100 cursor-pointer'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {DEMO_AVATARS.map((avatar: typeof DEMO_AVATARS[0], index: number) => {
            const isSelected = selectedAvatar?.id === avatar.id;
            const isHovered = hoveredAvatar === avatar.id;

            return (
              <div
                key={avatar.id}
                className="flex-shrink-0 snap-center"
                onMouseEnter={() => setHoveredAvatar(avatar.id)}
                onMouseLeave={() => setHoveredAvatar(null)}
              >
                <div
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`
                    relative w-[280px] h-[400px] rounded-3xl overflow-hidden cursor-pointer
                    transition-all duration-500 ease-out
                    ${isSelected ? 'selected scale-105' : ''}
                    ${isHovered && !isSelected ? 'scale-[1.02]' : ''}
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                    transform: isHovered
                      ? `rotateY(${(index - 3) * -2}deg) translateZ(20px)`
                      : `rotateY(${(index - 3) * 5}deg)`,
                    boxShadow: isSelected
                      ? '0 0 40px rgba(139, 92, 246, 0.25), inset 0 0 20px rgba(139, 92, 246, 0.1)'
                      : isHovered
                      ? '0 20px 40px rgba(0, 0, 0, 0.12), 0 0 30px rgba(6, 182, 212, 0.15)'
                      : '0 10px 30px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  {/* Image */}
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                    style={{
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Glass Border */}
                  <div 
                    className={`
                      absolute inset-0 rounded-3xl border-2 transition-all duration-300
                      ${isSelected 
                        ? 'border-purple-500 shadow-[inset_0_0_30px_rgba(139,92,246,0.15)]' 
                        : 'border-white/20'}
                    `}
                  />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">{avatar.name}</h3>
                      {isSelected && (
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-purple-300 font-medium">{avatar.role}</p>
                    <p className="text-sm text-white/70 line-clamp-2">{avatar.description}</p>
                  </div>

                  {/* Hover Glow */}
                  {isHovered && !isSelected && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Indicator */}
      {selectedAvatar && (
        <div className="mt-8 flex items-center gap-4 px-6 py-3 rounded-full glass">
          <img
            src={selectedAvatar.image}
            alt={selectedAvatar.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm text-gray-500">Selected</p>
            <p className="font-semibold text-gray-900">{selectedAvatar.name}</p>
          </div>
          <button
            onClick={() => setView('script')}
            className="ml-4 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
