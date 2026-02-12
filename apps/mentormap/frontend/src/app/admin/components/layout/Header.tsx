import Link from "next/link";
import { User } from '../../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              MentorMap Admin
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-purple-500">
            Back to Site
          </Link>
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};