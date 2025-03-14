'use client';

interface PromotionalBannerProps {
  title: string;
  description: string;
  cta: string;
}

export default function PromotionalBanner({ title, description, cta }: PromotionalBannerProps) {
  return (
    <section className="bg-blue-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-blue-100 mb-8">{description}</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors">
            {cta}
          </button>
        </div>
      </div>
    </section>
  );
} 