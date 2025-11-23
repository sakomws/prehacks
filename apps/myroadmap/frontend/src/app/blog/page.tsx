import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      title: "How to Ace Your System Design Interview",
      excerpt: "Learn the key principles and strategies for succeeding in system design interviews at top tech companies.",
      date: "Nov 20, 2025",
      author: "Sarah Johnson",
      category: "Interview Tips",
    },
    {
      title: "Top 10 Data Structures Every Developer Should Know",
      excerpt: "Master these fundamental data structures to solve coding problems efficiently and ace technical interviews.",
      date: "Nov 18, 2025",
      author: "Mike Chen",
      category: "Technical",
    },
    {
      title: "Behavioral Interview Questions: The STAR Method",
      excerpt: "Use the STAR method to structure your answers and make a lasting impression in behavioral interviews.",
      date: "Nov 15, 2025",
      author: "Sarah Johnson",
      category: "Career",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl">🗺️</div>
              <h1 className="text-2xl font-bold">MyRoadmap</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold mb-8">Blog</h2>
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.title} className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-300">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.author}</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                  {post.category}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
              <Link href="#" className="text-blue-600 hover:underline">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
