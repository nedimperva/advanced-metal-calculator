const FORMULAS_KEY = 'metalCalculator.formulas';

const builtInFormulas = [
  {
    id: 'sheet-metal-cost',
    name: 'Sheet-metal cost',
    expression: 'thickness * width * length * density * price',
    parameters: [
      { key: 'thickness', label: 'Thickness (mm)', default: 1 },
      { key: 'width', label: 'Width (mm)', default: 100 },
      { key: 'length', label: 'Length (mm)', default: 100 },
      { key: 'density', label: 'Density (kg/mm3)', default: 0.00000785 },
      { key: 'price', label: 'Price per kg', default: 2 }
    ]
  }
];

export const loadFormulas = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FORMULAS_KEY) || '[]');
    const merged = [...builtInFormulas];
    saved.forEach(f => {
      if (!merged.find(m => m.id === f.id)) merged.push(f);
    });
    return merged;
  } catch (error) {
    console.error('Error loading formulas:', error);
    return builtInFormulas;
  }
};

export const saveFormula = (formula) => {
  try {
    // only persist custom formulas (exclude built-ins)
    const custom = loadFormulas().filter(f => !builtInFormulas.find(b => b.id === f.id));
    const updated = [...custom.filter(f => f.id !== formula.id), formula];
    localStorage.setItem(FORMULAS_KEY, JSON.stringify(updated));
    return loadFormulas();
  } catch (error) {
    console.error('Error saving formula:', error);
    return null;
  }
};

export const deleteFormula = (id) => {
  try {
    const remaining = loadFormulas().filter(f => f.id !== id && !builtInFormulas.find(b => b.id === f.id));
    localStorage.setItem(FORMULAS_KEY, JSON.stringify(remaining));
    return loadFormulas();
  } catch (error) {
    console.error('Error deleting formula:', error);
    return null;
  }
};
