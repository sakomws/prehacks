export interface Module {
    id: string
    slug: string
    title: string
    description: string
    category: 'Ethics' | 'Technical' | 'Parenting' | 'Philosophy'
    duration: string // e.g. "15 min"
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    image: string
    progress?: number
    isNew?: boolean
    content?: string
}

export function getModuleBySlug(slug: string): Module | undefined {
    return modules.find((m) => m.slug === slug)
}

export const modules: Module[] = [
    {
        id: '1',
        slug: 'intro-to-ai-parenting',
        title: 'Introduction to AI Parenting',
        description: 'Understand the core metaphor of "Raising AI" and why treating AI systems as growing entities matters for our future.',
        category: 'Parenting',
        duration: '10 min',
        difficulty: 'Beginner',
        image: '/images/modules/intro.jpg',
        progress: 0,
        isNew: true,
    },
    {
        id: '2',
        slug: 'bias-and-fairness',
        title: 'Bias in the Nursery',
        description: 'Explore how AI systems "inherit" biases from their training data, just as children pick up behaviors from their environment.',
        category: 'Ethics',
        duration: '20 min',
        difficulty: 'Intermediate',
        image: '/images/modules/bias.jpg',
        progress: 0,
    },
    {
        id: '3',
        slug: 'responsibility-framework',
        title: 'The Responsibility Framework',
        description: 'Practical steps for developers and users to take ownership of AI outcomes.',
        category: 'Technical',
        duration: '25 min',
        difficulty: 'Advanced',
        image: '/images/modules/responsibility.jpg',
        progress: 0,
    },
    {
        id: '4',
        slug: 'human-ai-alignment',
        title: 'Aligning Values',
        description: 'How to ensure AI systems grow up to share human modifications and ethical principles.',
        category: 'Philosophy',
        duration: '15 min',
        difficulty: 'Intermediate',
        image: '/images/modules/alignment.jpg',
        progress: 0,
    },
]
