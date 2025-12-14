import { Metadata } from 'next'
import { DemoContent } from '@/components/demo/demo-content'

export const metadata: Metadata = {
  title: 'Live Demo - AI Parenting Guide Platform',
  description: 'Experience interactive AI ethics tools and see how we teach AI systems to behave ethically',
}

export default function DemoPage() {
  return <DemoContent />
}