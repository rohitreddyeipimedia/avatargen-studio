     1	import { useRef, useState, useEffect } from 'react';
     2	import { useAppStore } from '@/store/appStore';
     3	import { Check, ChevronLeft, ChevronRight, Sparkles, Loader2, RefreshCw } from 'lucide-react';
     4	import { toast } from 'sonner';
     5	import { heygenApi } from '@/services/heygenApi';
     6	
     7	interface Avatar {
     8	  id: string;
     9	  name: string;
    10	  role: string;
    11	  image: string;
    12	  description: string;
    13	  avatar_id: string;
    14	}
    15	
    16	export function AvatarGallery() {
    17	  const { selectedAvatar, selectAvatar, setView } = useAppStore();
    18	  const scrollContainerRef = useRef<HTMLDivElement>(null);
    19	  const [canScrollLeft, setCanScrollLeft] = useState(false);
    20	  const [canScrollRight, setCanScrollRight] = useState(true);
    21	  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
    22	  
    23	  // Real Heygen avatars state
    24	  const [avatars, setAvatars] = useState<Avatar[]>([]);
    25	  const [loading, setLoading] = useState(true);
    26	  const [error, setError] = useState<string | null>(null);
    27	
    28	  // Fetch real Heygen avatars
    29	  const fetchAvatars = async () => {
    30	    setLoading(true);
    31	    setError(null);
    32	    try {
    33	      const heygenAvatars = await heygenApi.getAvatars();
    34	      
    35	      // Map Heygen avatars to our format
    36	      const mappedAvatars: Avatar[] = heygenAvatars.map((avatar) => ({
    37	        id: avatar.avatar_id,
    38	        name: avatar.avatar_name,
    39	        role: avatar.gender === 'male' ? 'Male Avatar' : 'Female Avatar',
    40	        image: avatar.preview_image_url,
    41	        description: `Professional ${avatar.gender} avatar for video content`,
    42	        avatar_id: avatar.avatar_id
    43	      }));
    44	
    45	      setAvatars(mappedAvatars);
    46	    } catch (err: any) {
    47	      console.error('Failed to fetch avatars:', err);
    48	      setError('Failed to load avatars from Heygen. Please check your API key.');
    49	      toast.error('Could not load avatars from Heygen');
    50	    } finally {
    51	      setLoading(false);
    52	    }
    53	  };
    54	
    55	  useEffect(() => {
    56	    fetchAvatars();
    57	  }, []);
    58	
    59	  const checkScrollability = () => {
    60	    const container = scrollContainerRef.current;
    61	    if (container) {
    62	      setCanScrollLeft(container.scrollLeft > 0);
    63	      setCanScrollRight(
    64	        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    65	      );
    66	    }
    67	  };
    68	
    69	  useEffect(() => {
    70	    const container = scrollContainerRef.current;
    71	    if (container) {
    72	      container.addEventListener('scroll', checkScrollability);
    73	      checkScrollability();
    74	      return () => container.removeEventListener('scroll', checkScrollability);
    75	    }
    76	  }, [avatars]);
    77	
    78	  const scroll = (direction: 'left' | 'right') => {
    79	    const container = scrollContainerRef.current;
    80	    if (container) {
    81	      const scrollAmount = 340;
    82	      container.scrollBy({
    83	        left: direction === 'left' ? -scrollAmount : scrollAmount,
    84	        behavior: 'smooth'
    85	      });
    86	    }
    87	  };
    88	
    89	  const handleAvatarSelect = (avatar: Avatar) => {
    90	    selectAvatar(avatar);
    91	    toast.success(`${avatar.name} selected!`);
    92	    setTimeout(() => setView('script'), 500);
    93	  };
    94	
    95	  return (
    96	    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 md:py-32">
    97	      {/* Header */}
    98	      <div className="text-center mb-12 space-y-4">
    99	        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
   100	          <Sparkles className="w-4 h-4 text-purple-600" />
   101	          <span className="text-sm text-gray-600">Step 1 of 2</span>
   102	        </div>
   103	        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
   104	          Choose Your <span className="gradient-text">Host</span>
   105	        </h2>
   106	        <p className="text-lg text-gray-600 max-w-xl mx-auto">
   107	          Select from your Heygen avatars. These are the avatars from your Heygen account.
   108	        </p>
   109	        
   110	        {/* Refresh Button */}
   111	        <button
   112	          onClick={fetchAvatars}
   113	          disabled={loading}
   114	          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-all disabled:opacity-50"
   115	        >
   116	          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
   117	          Refresh Avatars
   118	        </button>
   119	      </div>
   120	
   121	      {/* Loading State */}
   122	      {loading && (
   123	        <div className="flex flex-col items-center justify-center py-20">
   124	          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
   125	          <p className="text-gray-600">Loading your Heygen avatars...</p>
   126	        </div>
   127	      )}
   128	
   129	      {/* Error State */}
   130	      {error && !loading && (
   131	        <div className="flex flex-col items-center justify-center py-20 max-w-md text-center">
   132	          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
   133	            <Sparkles className="w-8 h-8 text-red-500" />
   134	          </div>
   135	          <h3 className="text-xl font-semibold text-gray-900 mb-2">Could not load avatars</h3>
   136	          <p className="text-gray-600 mb-4">{error}</p>
   137	          <button
   138	            onClick={fetchAvatars}
   139	            className="btn-primary flex items-center gap-2"
   140	          >
   141	            <RefreshCw className="w-4 h-4" />
   142	            Try Again
   143	          </button>
   144	        </div>
   145	      )}
   146	
   147	      {/* Avatar Gallery */}
   148	      {!loading && !error && avatars.length > 0 && (
   149	        <div className="relative w-full max-w-6xl">
   150	          {/* Scroll Buttons */}
   151	          <button
   152	            onClick={() => scroll('left')}
   153	            disabled={!canScrollLeft}
   154	            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full glass flex items-center justify-center transition-all duration-300 ${
   155	              canScrollLeft
   156	                ? 'opacity-100 hover:bg-gray-100 cursor-pointer'
   157	                : 'opacity-0 pointer-events-none'
   158	            }`}
   159	          >
   160	            <ChevronLeft className="w-6 h-6 text-gray-700" />
   161	          </button>
   162	
   163	          <button
   164	            onClick={() => scroll('right')}
   165	            disabled={!canScrollRight}
   166	            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full glass flex items-center justify-center transition-all duration-300 ${
   167	              canScrollRight
   168	                ? 'opacity-100 hover:bg-gray-100 cursor-pointer'
   169	                : 'opacity-0 pointer-events-none'
   170	            }`}
   171	          >
   172	            <ChevronRight className="w-6 h-6 text-gray-700" />
   173	          </button>
   174	
   175	          {/* Cards Container */}
   176	          <div
   177	            ref={scrollContainerRef}
   178	            className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-8 snap-x snap-mandatory"
   179	            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
   180	          >
   181	            {avatars.map((avatar, index) => {
   182	              const isSelected = selectedAvatar?.id === avatar.id;
   183	              const isHovered = hoveredAvatar === avatar.id;
   184	
   185	              return (
   186	                <div
   187	                  key={avatar.id}
   188	                  className="flex-shrink-0 snap-center"
   189	                  onMouseEnter={() => setHoveredAvatar(avatar.id)}
   190	                  onMouseLeave={() => setHoveredAvatar(null)}
   191	                >
   192	                  <div
   193	                    onClick={() => handleAvatarSelect(avatar)}
   194	                    className={`
   195	                      relative w-[280px] h-[400px] rounded-3xl overflow-hidden cursor-pointer
   196	                      transition-all duration-500 ease-out
   197	                      ${isSelected ? 'selected scale-105' : ''}
   198	                      ${isHovered && !isSelected ? 'scale-[1.02]' : ''}
   199	                    `}
   200	                    style={{
   201	                      transformStyle: 'preserve-3d',
   202	                      perspective: '1000px',
   203	                      transform: isHovered
   204	                        ? `rotateY(${(index - Math.floor(avatars.length/2)) * -2}deg) translateZ(20px)`
   205	                        : `rotateY(${(index - Math.floor(avatars.length/2)) * 5}deg)`,
   206	                      boxShadow: isSelected
   207	                        ? '0 0 40px rgba(139, 92, 246, 0.25), inset 0 0 20px rgba(139, 92, 246, 0.1)'
   208	                        : isHovered
   209	                        ? '0 20px 40px rgba(0, 0, 0, 0.12), 0 0 30px rgba(6, 182, 212, 0.15)'
   210	                        : '0 10px 30px rgba(0, 0, 0, 0.08)'
   211	                    }}
   212	                  >
   213	                    {/* Image */}
   214	                    <img
   215	                      src={avatar.image}
   216	                      alt={avatar.name}
   217	                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
   218	                      style={{
   219	                        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
   220	                      }}
   221	                      onError={(e) => {
   222	                        // Fallback if image fails to load
   223	                        (e.target as HTMLImageElement).src = '/avatars/sarah.jpg';
   224	                      }}
   225	                    />
   226	
   227	                    {/* Gradient Overlay */}
   228	                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
   229	
   230	                    {/* Glass Border */}
   231	                    <div 
   232	                      className={`
   233	                        absolute inset-0 rounded-3xl border-2 transition-all duration-300
   234	                        ${isSelected 
   235	                          ? 'border-purple-500 shadow-[inset_0_0_30px_rgba(139,92,246,0.15)]' 
   236	                          : 'border-white/20'}
   237	                      `}
   238	                    />
   239	
   240	                    {/* Content */}
   241	                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
   242	                      <div className="flex items-center justify-between">
   243	                        <h3 className="text-2xl font-bold text-white">{avatar.name}</h3>
   244	                        {isSelected && (
   245	                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
   246	                            <Check className="w-5 h-5 text-white" />
   247	                          </div>
   248	                        )}
   249	                      </div>
   250	                      <p className="text-purple-300 font-medium">{avatar.role}</p>
   251	                      <p className="text-sm text-white/70 line-clamp-2">{avatar.description}</p>
   252	                    </div>
   253	
   254	                    {/* Hover Glow */}
   255	                    {isHovered && !isSelected && (
   256	                      <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]" />
   257	                    )}
   258	                  </div>
   259	                </div>
   260	              );
   261	            })}
   262	          </div>
   263	        </div>
   264	      )}
   265	
   266	      {/* No Avatars State */}
   267	      {!loading && !error && avatars.length === 0 && (
   268	        <div className="flex flex-col items-center justify-center py-20 max-w-md text-center">
   269	          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
   270	            <Sparkles className="w-8 h-8 text-amber-600" />
   271	          </div>
   272	          <h3 className="text-xl font-semibold text-gray-900 mb-2">No avatars found</h3>
   273	          <p className="text-gray-600 mb-4">
   274	            You don't have any avatars in your Heygen account yet. Create avatars at Heygen first.
   275	          </p>
   276	          <a
   277	            href="https://app.heygen.com/avatars"
   278	            target="_blank"
   279	            rel="noopener noreferrer"
   280	            className="btn-primary flex items-center gap-2"
   281	          >
   282	            <Sparkles className="w-4 h-4" />
   283	            Create Avatars on Heygen
   284	          </a>
   285	        </div>
   286	      )}
   287	
   288	      {/* Selected Indicator */}
   289	      {selectedAvatar && (
   290	        <div className="mt-8 flex items-center gap-4 px-6 py-3 rounded-full glass">
   291	          <img
   292	            src={selectedAvatar.image}
   293	            alt={selectedAvatar.name}
   294	            className="w-10 h-10 rounded-full object-cover"
   295	          />
   296	          <div>
   297	            <p className="text-sm text-gray-500">Selected</p>
   298	            <p className="font-semibold text-gray-900">{selectedAvatar.name}</p>
   299	          </div>
   300	          <button
   301	            onClick={() => setView('script')}
   302	            className="ml-4 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
   303	          >
   304	            Continue
   305	          </button>
   306	        </div>
   307	      )}
   308	    </div>
   309	  );
   310	}
   311	
