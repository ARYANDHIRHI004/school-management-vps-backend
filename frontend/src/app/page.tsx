import AcademicWings from "@/components/landing/AcademicWings";
import Achievements from "@/components/landing/Achievements";
import CampusGallery from "@/components/landing/CampusGallery";
import Footer from "@/components/landing/Footer";
import HeroCarousel from "@/components/landing/HeroCarousel";
import MissionVision from "@/components/landing/MissionVision";
import Navbar from "@/components/landing/Navbar";
import NewsAndNotices from "@/components/landing/NewsAndNotices";
import WelcomeModal from "@/components/landing/WelcomeModal";

export default function Home() {
  return (
    <>
      <WelcomeModal />
      <Navbar />
      <main className="flex-1">
        <HeroCarousel />
        <NewsAndNotices />
        <MissionVision />
        <CampusGallery />
        <Achievements />
        <AcademicWings />
      </main>
      <Footer />
    </>
  );
}