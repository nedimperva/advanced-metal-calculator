import React from 'react';
import { theme } from '../../theme';

const ResultsPanel = ({ weight, totalWeight, unitPrice, totalPrice, quantity }) => {
  return (
    <div className="rounded-xl p-6 border" style={{ 
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    }}>
      <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.textOnPrimary }}>Results</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm" style={{ color: theme.colors.textOnPrimary, opacity: 0.8 }}>Unit Weight</p>
          <p className="text-2xl font-bold" style={{ color: theme.colors.textOnPrimary }}>{weight.toFixed(2)} kg</p>
          <p className="text-sm" style={{ color: theme.colors.textOnPrimary, opacity: 0.8 }}>({(weight * 2.20462).toFixed(2)} lb)</p>
        </div>
        <div>
          <p className="text-sm" style={{ color: theme.colors.textOnPrimary, opacity: 0.8 }}>Total Weight ({quantity} pcs)</p>
          <p className="text-2xl font-bold" style={{ color: theme.colors.textOnPrimary }}>{totalWeight.toFixed(2)} kg</p>
          <p className="text-sm" style={{ color: theme.colors.textOnPrimary, opacity: 0.8 }}>({(totalWeight * 2.20462).toFixed(2)} lb)</p>
        </div>
        <div>
          <p className="text-sm" style={{ color: theme.colors.textOnPrimary, opacity: 0.8 }}>Unit Price</p>
          <p className="text-2xl font-bold" style={{ color: theme.colors.textOnPrimary }}>${unitPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm" style={{ color: theme.colors.textOnPrimary, opacity: 0.8 }}>Total Price</p>
          <p className="text-2xl font-bold" style={{ color: theme.colors.textOnPrimary }}>${totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
