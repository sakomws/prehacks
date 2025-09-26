import { Hero } from '@/components/hero'
import { FeaturedProjects } from '@/components/featured-projects'
import { Stats } from '@/components/stats'
import { TechStack } from '@/components/tech-stack'
import { CTA } from '@/components/cta'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Stats />
        <FeaturedProjects />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
