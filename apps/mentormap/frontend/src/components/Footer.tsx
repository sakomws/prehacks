import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {[
            { title: "Platform", links: [["Find Mentors", "/mentors"], ["Pricing", "/pricing"], ["Referrals", "/referral"], ["Become a Mentor", "/become-mentor"]] },
            { title: "Resources", links: [["Learning Paths", "/learn"], ["Blog", "/blog"], ["FAQ", "/faq"]] },
            { title: "Company", links: [["About Us", "/about"], ["Contact", "/contact"], ["Careers", "/careers"]] },
            { title: "Legal", links: [["Terms", "/terms"], ["Privacy", "/privacy"]] },
          ].map((col, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 MentorMap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
