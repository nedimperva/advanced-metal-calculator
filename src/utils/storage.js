const STORAGE_KEY = 'savedCalculations';

export const loadSavedCalculations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved calculations:', error);
    return [];
  }
};

export const saveCalculation = (calculation) => {
  try {
    const saved = loadSavedCalculations();
    const newCalc = {
      ...calculation,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    const updated = [newCalc, ...saved];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving calculation:', error);
    return null;
  }
};

export const deleteCalculation = (id) => {
  try {
    const saved = loadSavedCalculations();
    const updated = saved.filter(calc => calc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error deleting calculation:', error);
    return null;
  }
};
