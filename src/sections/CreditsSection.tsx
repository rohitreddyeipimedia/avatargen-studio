import { useState } from 'react';
import { useAppStore, CREDIT_PACKAGES } from '@/store/appStore';
import { 
  Coins, 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  Rocket,
  CreditCard,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const FEATURES = [
  'HD Video Quality',
  'All 7 Avatars',
  'Multiple Voice Styles',
  'Unlimited Downloads',
  'Priority Processing',
  'Commercial License'
];

export function CreditsSection() {
  const { user, addCredits } = useAppStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getPackageIcon = (id: string) => {
    switch (id) {
      case 'starter':
        return Zap;
      case 'pro':
        return Crown;
      case 'enterprise':
        return Rocket;
      default:
        return Sparkles;
    }
  };

  const handlePurchase = async (packageId: string) => {
    setSelectedPackage(packageId);
    setIsProcessing(true);

    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return;

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    addCredits(pkg.credits);
    toast.success(`Successfully purchased ${pkg.credits} credits!`);
    
    setIsProcessing(false);
    setSelectedPackage(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-24 md:py-32">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
          <Coins className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-700">
            Current Balance: <span className="text-gray-900 font-semibold">{user?.credits || 0}</span> credits
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Buy <span className="gradient-text">Credits</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Purchase credits to generate more avatar videos. The more you buy, the more you save.
        </p>
      </div>

      {/* Features */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass"
          >
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="w-full max-w-5xl grid md:grid-cols-3 gap-6">
        {CREDIT_PACKAGES.map((pkg) => {
          const Icon = getPackageIcon(pkg.id);
          const isSelected = selectedPackage === pkg.id;
          const isProcessingPackage = isProcessing && isSelected;

          return (
            <div
              key={pkg.id}
              className={`
                relative rounded-3xl overflow-hidden transition-all duration-500
                ${pkg.popular ? 'md:-mt-4 md:mb-4' : ''}
              `}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-bold text-center py-2">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div
                className={`
                  relative h-full p-8 pt-10
                  ${pkg.popular 
                    ? 'glass-strong border-purple-200' 
                    : 'glass border-gray-200'}
                  rounded-3xl overflow-hidden
                `}
              >
                {/* Glow Effect for Popular */}
                {pkg.popular && (
                  <div className="absolute -inset-px bg-gradient-to-b from-purple-200/30 to-transparent opacity-50" />
                )}

                <div className="relative space-y-6">
                  {/* Icon & Name */}
                  <div className="text-center">
                    <div className={`
                      w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center
                      ${pkg.popular 
                        ? 'bg-gradient-to-br from-purple-100 to-cyan-100' 
                        : 'bg-gray-100'}
                    `}>
                      <Icon className={`w-8 h-8 ${pkg.popular ? 'text-purple-600' : 'text-gray-600'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  </div>

                  {/* Credits & Price */}
                  <div className="text-center space-y-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900">{pkg.credits}</span>
                      <span className="text-lg text-gray-500">credits</span>
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold gradient-text">${pkg.price}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      ${(pkg.price / pkg.credits).toFixed(2)} per credit
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200" />

                  {/* Features List */}
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {pkg.credits} video generations
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      HD quality output
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      All avatars included
                    </li>
                    {pkg.popular && (
                      <li className="flex items-center gap-3 text-sm text-purple-700">
                        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        Priority support
                      </li>
                    )}
                    {pkg.id === 'enterprise' && (
                      <li className="flex items-center gap-3 text-sm text-purple-700">
                        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        API access
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isProcessing}
                    className={`
                      w-full py-4 rounded-xl font-semibold transition-all duration-300
                      flex items-center justify-center gap-2
                      ${pkg.popular
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isProcessingPackage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Purchase</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 text-gray-500">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span className="text-sm">Secure Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span className="text-sm">Instant Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span className="text-sm">No Expiration</span>
        </div>
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 max-w-2xl text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <p className="text-gray-600">
          Credits never expire and can be used for any avatar or voice style. 
          For bulk purchases or custom enterprise solutions, please contact our sales team.
        </p>
      </div>
    </div>
  );
}
