'use client';

import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';
import HeroCarousel from '../components/home/HeroCarousel';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoryGrid from '../components/home/CategoryGrid';
import PromotionalBanner from '../components/home/PromotionalBanner';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <main>
      <HeroCarousel
        title={t.home.hero.title}
        subtitle={t.home.hero.subtitle}
        cta={t.home.hero.cta}
      />
      <FeaturedProducts
        title={t.home.featuredProducts.title}
        viewAll={t.home.featuredProducts.viewAll}
      />
      <CategoryGrid
        title={t.home.categories.title}
      />
      <PromotionalBanner
        title={t.home.promotions.title}
        description={t.home.promotions.description}
        cta={t.home.promotions.cta}
      />
    </main>
  );
} 