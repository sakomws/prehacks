export default function Footer() {
  return (
    <footer className="border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Vurik Blog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

