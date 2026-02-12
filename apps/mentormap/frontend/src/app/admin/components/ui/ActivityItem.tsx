import { ActivityItemProps } from '../../types';
import { STATUS_COLORS } from '../../constants';

export const ActivityItem = ({ title, subtitle, time, status }: ActivityItemProps) => {
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">{time}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
};