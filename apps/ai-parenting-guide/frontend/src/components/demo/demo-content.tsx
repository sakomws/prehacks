"use client"

import { BiasDetector } from '@/components/demo/bias-detector'
import { EthicsSimulator } from '@/components/demo/ethics-simulator'
import { AIChatDemo } from '@/components/demo/ai-chat-demo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Navigation } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'

export function DemoContent() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navigation />
            {/* Hero Section */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto text-center space-y-6">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-lg">
                        🏆 Hackathon Demo
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                        AI Parenting Guide
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                        Teaching AI Systems to Behave Ethically - Like Raising Children with Care and Wisdom
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Badge variant="outline" className="text-sm">🤖 Real AI Integration</Badge>
                        <Badge variant="outline" className="text-sm">🎮 Interactive Demos</Badge>
                        <Badge variant="outline" className="text-sm">🧠 Live Ethics Analysis</Badge>
                        <Badge variant="outline" className="text-sm">📚 Based on "Raising AI" Book</Badge>
                    </div>
                </div>
            </section>

            {/* Demo Navigation */}
            <section className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => document.getElementById('bias-detector')?.scrollIntoView({ behavior: 'smooth' })}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🔍 Bias Detection
                                    <Badge className="bg-red-100 text-red-800">Live AI</Badge>
                                </CardTitle>
                                <CardDescription>
                                    Real-time bias detection in text using AI analysis
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => document.getElementById('ethics-simulator')?.scrollIntoView({ behavior: 'smooth' })}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🎮 Ethics Simulator
                                    <Badge className="bg-green-100 text-green-800">Interactive</Badge>
                                </CardTitle>
                                <CardDescription>
                                    Make real AI parenting decisions and see the outcomes
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' })}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    💬 Ethical AI Chat
                                    <Badge className="bg-blue-100 text-blue-800">Real-time</Badge>
                                </CardTitle>
                                <CardDescription>
                                    Chat with AI and see ethical guidance in action
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Demo Sections */}
            <section id="bias-detector" className="py-12 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">🔍 Live Bias Detection</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Experience how AI can identify potential biases in real-time - just like teaching a child to recognize unfairness
                        </p>
                    </div>
                    <BiasDetector />
                </div>
            </section>

            <section id="ethics-simulator" className="py-12 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">🎮 Interactive Ethics Simulator</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Make real AI parenting decisions and see how your choices shape AI behavior
                        </p>
                    </div>
                    <EthicsSimulator />
                </div>
            </section>

            <section id="ai-chat" className="py-12 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">💬 AI Chat with Ethical Guidance</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            See real-time ethical coaching as AI learns to respond responsibly
                        </p>
                    </div>
                    <AIChatDemo />
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-12 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">🌟 Why This Matters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="space-y-2">
                            <div className="text-4xl">🎯</div>
                            <h3 className="font-semibold">Real Impact</h3>
                            <p className="text-blue-100">
                                Addresses actual AI bias problems affecting millions of people daily
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl">🚀</div>
                            <h3 className="font-semibold">Scalable Solution</h3>
                            <p className="text-blue-100">
                                Platform can educate thousands of AI developers and researchers
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl">💡</div>
                            <h3 className="font-semibold">Novel Approach</h3>
                            <p className="text-blue-100">
                                First platform to use "AI parenting" metaphor for ethics education
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <h3 className="text-xl font-semibold">🏆 Hackathon Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="bg-white/10 p-4 rounded-lg">
                                <h4 className="font-semibold">✨ Technical Innovation</h4>
                                <ul className="text-sm text-blue-100 mt-2 space-y-1">
                                    <li>• Real Gemini AI integration</li>
                                    <li>• Live bias detection algorithms</li>
                                    <li>• Interactive ethics simulations</li>
                                    <li>• Real-time ethical guidance</li>
                                </ul>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <h4 className="font-semibold">🎯 Market Potential</h4>
                                <ul className="text-sm text-blue-100 mt-2 space-y-1">
                                    <li>• $50B+ AI ethics market</li>
                                    <li>• 100M+ developers need training</li>
                                    <li>• Enterprise compliance demand</li>
                                    <li>• Educational institution adoption</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 px-4 bg-white">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">Ready to Start AI Parenting?</h2>
                    <p className="text-gray-600">
                        Join the movement to create more ethical, responsible AI systems
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="no-underline">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                Start Learning Now
                            </Button>
                        </Link>
                        <Link href="/about" className="no-underline">
                            <Button variant="outline" size="lg">
                                Learn More About Our Mission
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}
