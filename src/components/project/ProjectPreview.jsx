import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';

const ProjectPreview = ({ project, isExpanded = false, currency: currencyProp }) => {
  const currency = currencyProp || '€';

  // Calculate project statistics
  const totalItems = project.calculations.length;
  const totalWeight = project.calculations.reduce((sum, calc) => sum + (calc.weight * calc.quantity), 0);
  const totalPrice = project.calculations.reduce((sum, calc) => sum + calc.totalPrice, 0);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group calculations by date (if expanded view)
  const groupCalculationsByDate = () => {
    const groups = {};
    
    project.calculations.forEach(calc => {
      const date = new Date(calc.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(calc);
    });
    
    // Sort dates in descending order (newest first)
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([date, calcs]) => ({
        date,
        calculations: calcs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      }));
  };

  return (
    <div className="rounded-lg overflow-hidden border" style={{ 
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border
    }}>
      {/* Project Header with Summary */}
      <div className="p-4" style={{ backgroundColor: theme.colors.primary }}>
        <h2 className="text-lg font-bold mb-1" style={{ color: theme.colors.textOnPrimary }}>{project.name}</h2>
        <div className="text-sm mb-3" style={{ color: theme.colors.textOnPrimary, opacity: 0.9 }}>{formatDate(project.createdAt)}</div>
        
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.background }}>
            <div className="text-xs uppercase font-medium" style={{ color: theme.colors.textLight }}>Items</div>
            <div className="text-xl font-bold" style={{ color: theme.colors.text }}>{totalItems}</div>
          </div>
          
          <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.background }}>
            <div className="text-xs uppercase font-medium" style={{ color: theme.colors.textLight }}>Price</div>
            <div className="text-xl font-bold" style={{ color: theme.colors.text }}>{currency}{totalPrice.toFixed(2)}</div>
          </div>
          
          <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.background }}>
            <div className="text-xs uppercase font-medium" style={{ color: theme.colors.textLight }}>Total Value</div>
            <div className="text-xl font-bold" style={{ color: theme.colors.primary }}>{currency}{totalPrice.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Expanded View with Calculations Grouped by Date */}
      {isExpanded && project.calculations.length > 0 && (
        <div className="divide-y" style={{ borderColor: theme.colors.border }}>
          {groupCalculationsByDate().map(group => (
            <div key={group.date} className="p-4">
              <div className="text-sm font-medium mb-3" style={{ color: theme.colors.textLight }}>
                {new Date(group.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              
              <div className="space-y-3">
                {group.calculations.map(calc => (
                  <div 
                    key={calc.id} 
                    className="rounded-lg p-3 border"
                    style={{ 
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      borderLeftWidth: '4px', 
                      borderLeftColor: calc.color || theme.colors.primary 
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium" style={{ color: theme.colors.text }}>{calc.name}</h3>
                        <div className="text-sm mt-1" style={{ color: theme.colors.textLight }}>
                          {calc.weight.toFixed(2)} kg × {calc.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: theme.colors.primary }}>${calc.totalPrice.toFixed(2)}</div>
                        <div className="text-xs mt-1" style={{ color: theme.colors.textLight }}>
                          ${(calc.pricePerKg || calc.totalPrice / (calc.weight * calc.quantity)).toFixed(2)}/kg
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isExpanded && project.calculations.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <p>No calculations added yet</p>
        </div>
      )}
    </div>
  );
};

ProjectPreview.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    calculations: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string,
        weight: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired,
        totalPrice: PropTypes.number.isRequired,
        timestamp: PropTypes.string.isRequired,
        color: PropTypes.string,
        pricePerKg: PropTypes.number
      })
    ).isRequired
  }).isRequired,
  isExpanded: PropTypes.bool
};

export default ProjectPreview;
