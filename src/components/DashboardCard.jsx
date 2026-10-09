import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = '#4F46E5',
  bgLight = '#EEF2FF'
}) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <div 
          className="metric-icon-box"
          style={{ background: bgLight, color: color }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>

      <div className="metric-value">{value}</div>

      <div className="metric-footer">
        {trend && (
          <span className={`trend-badge ${trendDirection === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trendDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
        <span>{subtitle}</span>
      </div>
    </div>
  );
};

export default DashboardCard;
