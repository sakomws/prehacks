import { StatCardProps } from '../../types';

export const StatCard = ({ icon, title, value, change, changeType }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className={`text-sm font-semibold ${
          changeType === "positive" ? "text-green-600" : "text-red-600"
        }`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
};