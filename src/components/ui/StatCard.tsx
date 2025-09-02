import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color, 
  description 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-100',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50 border-green-100',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 border-purple-100',
    orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50 border-orange-100',
    red: 'from-red-500 to-red-600 text-red-600 bg-red-50 border-red-100'
  };

  const [gradientClass, textClass, bgClass, borderClass] = colorClasses[color].split(' ');

  return (
    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradientClass} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <span className="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      {description && (
        <div className="text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
};