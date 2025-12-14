import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'AI Ethics Tools - AI Parenting Guide',
  description: 'Explore our collection of interactive tools for ethical AI development and assessment.',
}

const tools = [
  {
    title: "Bias Assessment",
    description: "Detect and analyze potential biases in AI systems and content using real-time AI analysis.",
    href: "/demo#bias-detector",
    icon: "🔍",
    status: "Live Demo",
    gradient: "from-ai-blue-500 to-ai-blue-600"
  },
  {
    title: "Ethics Checker",
    description: "Comprehensive ethical evaluation tool to assess AI systems across key ethical dimensions.",
    href: "/tools/ethics-checker",
    icon: "⚖️",
    status: "Available",
    gradient: "from-ai-purple-500 to-ai-purple-600"
  },
  {
    title: "Ethics Simulator",
    description: "Interactive scenarios to practice ethical AI decision-making and learn from outcomes.",
    href: "/demo#ethics-simulator",
    icon: "🎮",
    status: "Live Demo",
    gradient: "from-ai-green-500 to-ai-green-600"
  },
  {
    title: "AI Chat Demo",
    description: "Experience real-time ethical guidance as AI learns to respond responsibly.",
    href: "/demo#ai-chat",
    icon: "💬",
    status: "Live Demo",
    gradient: "from-ai-blue-500 to-ai-purple-500"
  },
  {
    title: "Case Studies",
    description: "Learn from real-world examples of ethical AI challenges and solutions.",
    href: "/tools/case-studies",
    icon: "📚",
    status: "Coming Soon",
    gradient: "from-ai-purple-500 to-ai-green-500"
  },
  {
    title: "Resources Library",
    description: "Access curated resources, frameworks, and best practices for ethical AI development.",
    href: "/tools/resources",
    icon: "🛠️",
    status: "Coming Soon",
    gradient: "from-ai-green-500 to-ai-blue-500"
  }
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-ai-blue-600 via-ai-purple-600 to-ai-green-600 bg-clip-text text-transparent">
                AI Ethics Tools
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-light leading-relaxed max-w-4xl mx-auto">
              Interactive tools and resources to help you develop, assess, and improve ethical AI systems
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tools.map((tool, index) => (
              <Card 
                key={index} 
                className="group relative apple-card hover:scale-[1.02] transition-all duration-500"
              >
                <CardHeader className="relative p-8">
                  <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {tool.icon}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-2xl font-bold group-hover:text-ai-blue-600 transition-colors duration-300">
                      {tool.title}
                    </CardTitle>
                    <Badge 
                      variant={tool.status === 'Available' || tool.status === 'Live Demo' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {tool.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="relative px-8 pb-8">
                  <CardDescription className="text-muted-foreground leading-relaxed text-lg mb-6">
                    {tool.description}
                  </CardDescription>
                  
                  {tool.status === 'Coming Soon' ? (
                    <Button 
                      disabled 
                      className="w-full"
                    >
                      Coming Soon
                    </Button>
                  ) : (
                    <Link href={tool.href} className="no-underline">
                      <Button 
                        className="w-full ai-button-primary"
                      >
                        {tool.status === 'Live Demo' ? 'Try Demo' : 'Open Tool'}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-20 text-center">
            <div className="bg-muted/50 backdrop-blur-xl border border-border/50 rounded-3xl p-12 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                🧠 Need Help Choosing?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Not sure which tool to start with? Our interactive demo showcases all the key features 
                in one comprehensive experience.
              </p>
              <Link href="/demo" className="no-underline">
                <Button size="lg" className="ai-button-primary text-xl px-12 py-4">
                  <span className="mr-3">🎮</span>
                  Try the Full Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}