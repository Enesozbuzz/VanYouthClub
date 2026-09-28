import {
  getActiveCategories,
  getActiveGallery,
  getFeaturedEvents,
} from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import {
  AboutTeaser,
  CategoryStrip,
  ContactCta,
  GalleryTeaser,
  Hero,
  UpcomingEvents,
} from "@/components/home-sections";

export const revalidate = 60;

export default async function HomePage() {
  const [events, categories, gallery, settings] = await Promise.all([
    getFeaturedEvents(6),
    getActiveCategories(),
    getActiveGallery(),
    getSettings(),
  ]);

  return (
    <>
      <Hero />
      <UpcomingEvents events={events} />
      <CategoryStrip categories={categories} />
      <AboutTeaser />
      <GalleryTeaser items={gallery} />
      <ContactCta settings={settings} />
    </>
  );
}
