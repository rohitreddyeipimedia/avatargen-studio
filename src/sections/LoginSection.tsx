import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { Sparkles, Mail, Lock, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function LoginSection() {
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    login(email, email.split('@')[0]);
    toast.success('Welcome to AvatarGen Studio!');
    setIsLoading(false);
  };

  const features = [
    { icon: Zap, text: 'AI-Powered Videos', subtext: 'Generate in minutes' },
    { icon: Shield, text: 'Studio Quality', subtext: 'Professional results' },
    { icon: Globe, text: '7 Unique Avatars', subtext: 'For any content type' }
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-20"
    >
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)`
        }}
      />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gray-700">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Powered by HeyGen API</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Bring Your{' '}
              <span className="gradient-text">Script</span>
              <br />
              to Life
            </h1>
            
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Create professional AI avatar videos with just text. 
              Studio quality, zero setup required.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 justify-center lg:justify-start">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-2xl glass glass-card-hover"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{feature.text}</p>
                    <p className="text-sm text-gray-500">{feature.subtext}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-200/50 to-cyan-200/50 rounded-3xl blur-2xl opacity-50" />
          
          <div className="relative glass rounded-3xl p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to start creating</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="form-input pl-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input pl-12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Demo: Use any email and password
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-purple-200/50 rounded-full blur-xl" />
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-cyan-200/50 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
