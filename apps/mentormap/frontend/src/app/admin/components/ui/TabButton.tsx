import { TabButtonProps } from '../../types';

export const TabButton = ({ icon, label, active, onClick }: TabButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
        active
          ? "bg-purple-500 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};