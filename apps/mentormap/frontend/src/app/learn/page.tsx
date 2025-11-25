import Link from "next/link";
import Logo from "@/components/Logo";

export default function LearnPage() {
  const paths = [
    {
      title: "System Design",
      icon: "🏗️",
      description: "Master system design concepts for senior engineer interviews",
      topics: ["Scalability", "Load Balancing", "Caching", "Database Design", "Microservices"],
      duration: "8-12 weeks",
      level: "Intermediate to Advanced",
    },
    {
      title: "Data Structures & Algorithms",
      icon: "📊",
      description: "Build a strong foundation in DSA for coding interviews",
      topics: ["Arrays", "Trees", "Graphs", "Dynamic Programming", "Sorting"],
      duration: "12-16 weeks",
      level: "Beginner to Advanced",
    },
    {
      title: "Behavioral Interviews",
      icon: "💬",
      description: "Prepare for behavioral questions and leadership scenarios",
      topics: ["STAR Method", "Leadership", "Conflict Resolution", "Team Collaboration"],
      duration: "4-6 weeks",
      level: "All Levels",
    },
    {
      title: "Machine Learning",
      icon: "🤖",
      description: "Learn ML concepts and prepare for ML engineer roles",
      topics: ["Supervised Learning", "Neural Networks", "NLP", "Computer Vision"],
      duration: "16-20 weeks",
      level: "Intermediate to Advanced",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size="lg" className="transition-transform group-hover:scale-110" />
              <h1 className="text-2xl font-bold">MentorMap</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/mentors" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Find Mentors
              </Link>
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Learning Paths</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Structured roadmaps to help you achieve your career goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {paths.map((path) => (
            <div
              key={path.title}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl mb-4">{path.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{path.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{path.description}</p>

              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Key Topics:</div>
                <div className="flex flex-wrap gap-2">
                  {path.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div>⏱️ {path.duration}</div>
                  <div>📈 {path.level}</div>
                </div>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Learning
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Need Personalized Guidance?</h3>
          <p className="text-xl mb-8 opacity-90">
            Work with a mentor to create a custom learning path tailored to your goals
          </p>
          <Link
            href="/mentors"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            Find a Mentor
          </Link>
        </div>
      </div>
    </div>
  );
}
