import Link from 'next/link';

export default function ResourcesPage() {
  const resources = {
    tutorials: [
      {
        title: 'Cloud Architecture Patterns',
        description: 'Best practices for building scalable cloud-native applications',
        category: 'Cloud Infrastructure',
        status: 'Coming Soon',
      },
      {
        title: 'MLOps Pipeline Setup',
        description: 'Step-by-step guide to setting up production-ready MLOps workflows',
        category: 'MLOps',
        status: 'Coming Soon',
      },
      {
        title: 'AI Integration Guide',
        description: 'How to integrate AI capabilities into existing applications',
        category: 'AI/ML',
        status: 'Coming Soon',
      },
    ],
    codeSamples: [
      {
        title: 'AWS Infrastructure Templates',
        description: 'Terraform and CloudFormation templates for common AWS architectures',
        category: 'Infrastructure as Code',
        link: 'https://github.com/vurgunhajiyev',
      },
      {
        title: 'Kubernetes Deployment Examples',
        description: 'Production-ready Kubernetes manifests and configurations',
        category: 'DevOps',
        link: 'https://github.com/vurgunhajiyev',
      },
      {
        title: 'ML Pipeline Examples',
        description: 'Sample MLOps pipelines using popular frameworks',
        category: 'MLOps',
        link: 'https://github.com/vurgunhajiyev',
      },
    ],
    guides: [
      {
        title: 'Developer Onboarding Guide',
        description: 'Comprehensive guide for new developers joining cloud-native projects',
        category: 'Best Practices',
      },
      {
        title: 'API Design Principles',
        description: 'Best practices for designing RESTful and GraphQL APIs',
        category: 'Architecture',
      },
      {
        title: 'Security Best Practices',
        description: 'Security guidelines for cloud applications and infrastructure',
        category: 'Security',
      },
    ],
    openSourceProjects: [
      {
        title: 'Mentormap.ai',
        description: 'Open source platform connecting mentors and mentees. Building a community-driven ecosystem for knowledge sharing and professional growth.',
        category: 'Community',
        link: 'https://mentormap.ai',
        github: 'https://github.com/vurgunhajiyev/mentormap',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-semibold tracking-tight mb-4 text-gray-900 dark:text-white">
              Resources
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
              Tutorials, guides, code samples, and tools to help developers build better software
            </p>
          </div>

          {/* Tutorials Section */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Tutorials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.tutorials.map((tutorial, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                      {tutorial.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                      {tutorial.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                    {tutorial.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Code Samples Section */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Code Samples</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.codeSamples.map((sample, index) => (
                <a
                  key={index}
                  href={sample.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                      {sample.category}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {sample.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                    {sample.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Guides Section */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Guides</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.guides.map((guide, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6"
                >
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                      {guide.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Open Source Projects Section */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Open Source Projects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.openSourceProjects.map((project, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {project.title}
                        </h3>
                        <span className="px-2 py-1 bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 rounded-full text-xs font-medium">
                          Open Source
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed mb-4">
                    {project.description}
                  </p>
                  <div className="flex gap-3">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <span>Visit</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl border border-blue-200/50 dark:border-blue-800/50 shadow-soft-lg p-10 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Have a resource request?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-[15px] leading-relaxed max-w-2xl mx-auto">
              Looking for a specific tutorial, guide, or code sample? Let me know what would be helpful for your development journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/coffee-meets"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-soft hover:shadow-soft-lg"
              >
                Schedule a Chat
              </Link>
              <a
                href="mailto:vurgunh@gmail.com"
                className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

