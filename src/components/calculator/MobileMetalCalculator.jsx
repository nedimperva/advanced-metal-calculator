import React, { useState, useEffect } from 'react';
import { materials } from '../../data/materials';
import { calculatePipeWeight, calculateProfileWeight, calculatePlateWeight, calculateAngleWeight, calculateBarWeight, calculateTotalPrice } from '../../utils/calculations';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

// Mobile-optimized components
import MobileCalculatorLayout from './MobileCalculatorLayout';
import MobileCalculationTypeSelector from './MobileCalculationTypeSelector';
import MobileInputField from './MobileInputField';
import MobileResultsDisplay from './MobileResultsDisplay';
import MobileSavedCalculationsModal from './MobileSavedCalculationsModal';
import MobileSettingsModal from './MobileSettingsModal';

// Existing calculator components (will be used as fallback)
import PlateCalculator from './PlateCalculator';
import ProfileCalculator from './ProfileCalculator';
import PipeCalculator from './PipeCalculator';
import AngleCalculator from './AngleCalculator';
import BarCalculator from './BarCalculator';

const MobileMetalCalculator = () => {
  const { t, language, setLanguage } = useLanguage();
  
  // Main states
  const [selectedMaterial, setSelectedMaterial] = useState('steel');
  const [calculationType, setCalculationType] = useState('pipe');
  const [subType, setSubType] = useState('rectangular');
  const [unit, setUnit] = useState('mm');
  
  // Modal states
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Calculation states
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Input data states (simplified for mobile)
  const [dimensions, setDimensions] = useState({
    // Common dimensions that apply to all calculation types
    length: 6000,
    width: 40,
    height: 20,
    thickness: 1.8,
    diameter: 50,
    // Pricing
    pricePerKg: 2,
    quantity: 1
  });
  
  // Results
  const [weight, setWeight] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [piecePrice, setPiecePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Saved calculations
  const [savedCalculations, setSavedCalculations] = useState([]);

  // Load saved calculations on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedCalculations');
    if (saved) {
      try {
        setSavedCalculations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved calculations:', error);
      }
    }
  }, []);

  // Calculate weight when inputs change
  useEffect(() => {
    if (!selectedMaterial || !calculationType) return;

    setIsCalculating(true);
    const calculationTimeout = setTimeout(() => {
      const density = materials[selectedMaterial]?.density || 7850;
      let calculatedWeight = 0;

      try {
        switch (calculationType) {
          case 'plate':
            calculatedWeight = calculatePlateWeight(
              {
                width: dimensions.width,
                length: dimensions.length,
                thickness: dimensions.thickness
              },
              unit,
              density
            );
            break;
          case 'pipe':
            const pipeData = {
              type: subType,
              width: dimensions.width,
              height: dimensions.height,
              thickness: dimensions.thickness,
              length: dimensions.length,
              outerDiameter: dimensions.diameter,
              size: dimensions.width // for square pipes
            };
            calculatedWeight = calculatePipeWeight(pipeData, unit, density);
            break;
          case 'angle':
            calculatedWeight = calculateAngleWeight(
              {
                type: subType,
                width: dimensions.width,
                height: dimensions.height,
                thickness: dimensions.thickness,
                length: dimensions.length
              },
              unit,
              density
            );
            break;
          case 'bar':
            calculatedWeight = calculateBarWeight(
              {
                type: subType,
                width: dimensions.width,
                height: dimensions.height,
                diameter: dimensions.diameter,
                length: dimensions.length
              },
              unit,
              density
            );
            break;
          case 'profile':
            // For profile, we'll use a simplified calculation
            calculatedWeight = calculateProfileWeight(
              {
                type: subType,
                size: `${dimensions.width}x${dimensions.height}`,
                length: dimensions.length
              },
              unit,
              density
            );
            break;
          default:
            calculatedWeight = 0;
        }
      } catch (error) {
        console.error('Calculation error:', error);
        calculatedWeight = 0;
      }

      setWeight(calculatedWeight);
      setIsCalculating(false);
    }, 300);

    return () => clearTimeout(calculationTimeout);
  }, [selectedMaterial, calculationType, subType, dimensions, unit]);

  // Calculate totals when weight or pricing changes
  useEffect(() => {
    const quantity = dimensions.quantity || 1;
    const pricePerKg = dimensions.pricePerKg || 0;
    
    setTotalWeight(weight * quantity);
    setPiecePrice(calculateTotalPrice(weight, pricePerKg, 1));
    setTotalPrice(calculateTotalPrice(weight, pricePerKg, quantity));
  }, [weight, dimensions.quantity, dimensions.pricePerKg]);

  // Handle input changes
  const handleDimensionChange = (field, value) => {
    setDimensions(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  // Handle calculation type change
  const handleCalculationTypeChange = (type) => {
    setCalculationType(type);
    // Set default subtype based on calculation type
    switch (type) {
      case 'pipe':
        setSubType('rectangular');
        break;
      case 'angle':
        setSubType('equal');
        break;
      case 'bar':
        setSubType('flat');
        break;
      case 'profile':
        setSubType('hea');
        break;
      default:
        setSubType('');
    }
  };

  // Save calculation
  const handleSaveCalculation = () => {
    setIsSaving(true);
    try {
      const calculation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: calculationType,
        subType: subType,
        material: selectedMaterial,
        dimensions: dimensions,
        weight: weight,
        totalWeight: totalWeight,
        pricePerKg: dimensions.pricePerKg,
        totalPrice: totalPrice,
        quantity: dimensions.quantity,
        unit: unit,
        name: `${t(calculationType)} - ${dimensions.width}x${dimensions.height}x${dimensions.thickness} ${unit}`
      };

      const updated = [...savedCalculations, calculation];
      setSavedCalculations(updated);
      localStorage.setItem('savedCalculations', JSON.stringify(updated));
      
      // Show success feedback (you can implement toast notifications here)
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error('Error saving calculation:', error);
      setIsSaving(false);
    }
  };

  // Load calculation from saved
  const handleLoadCalculation = (calculation) => {
    try {
      setCalculationType(calculation.type);
      setSubType(calculation.subType || 'rectangular');
      setSelectedMaterial(calculation.material);
      setDimensions(calculation.dimensions);
      setUnit(calculation.unit || 'mm');
    } catch (error) {
      console.error('Error loading calculation:', error);
    }
  };

  // Delete calculation
  const handleDeleteCalculation = (id) => {
    try {
      const updated = savedCalculations.filter(calc => calc.id !== id);
      setSavedCalculations(updated);
      localStorage.setItem('savedCalculations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting calculation:', error);
    }
  };

  // Clear all calculations
  const handleClearAllCalculations = () => {
    setSavedCalculations([]);
    localStorage.removeItem('savedCalculations');
  };

  // Share calculation
  const handleShareCalculation = () => {
    if (navigator.share) {
      navigator.share({
        title: t('metalCalculator'),
        text: `${t(calculationType)} ${t('calculation')}: ${totalWeight.toFixed(2)}kg, $${totalPrice.toFixed(2)}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const shareText = `${t(calculationType)} ${t('calculation')}: ${totalWeight.toFixed(2)}kg, $${totalPrice.toFixed(2)}`;
      navigator.clipboard.writeText(shareText);
    }
  };

  // Get the appropriate input fields based on calculation type
  const renderInputFields = () => {
    const commonProps = {
      unit: unit,
      onChange: handleDimensionChange
    };

    switch (calculationType) {
      case 'plate':
        return (
          <>
            <MobileInputField
              label={t('width')}
              value={dimensions.width}
              onChange={(value) => handleDimensionChange('width', value)}
              {...commonProps}
            />
            <MobileInputField
              label={t('length')}
              value={dimensions.length}
              onChange={(value) => handleDimensionChange('length', value)}
              {...commonProps}
            />
            <MobileInputField
              label={t('thickness')}
              value={dimensions.thickness}
              onChange={(value) => handleDimensionChange('thickness', value)}
              {...commonProps}
            />
          </>
        );
      
      case 'pipe':
        if (subType === 'round') {
          return (
            <>
              <MobileInputField
                label={t('diameter')}
                value={dimensions.diameter}
                onChange={(value) => handleDimensionChange('diameter', value)}
                {...commonProps}
              />
              <MobileInputField
                label={t('thickness')}
                value={dimensions.thickness}
                onChange={(value) => handleDimensionChange('thickness', value)}
                {...commonProps}
              />
              <MobileInputField
                label={t('length')}
                value={dimensions.length}
                onChange={(value) => handleDimensionChange('length', value)}
                {...commonProps}
              />
            </>
          );
        } else if (subType === 'square') {
          return (
            <>
              <MobileInputField
                label={t('size')}
                value={dimensions.width}
                onChange={(value) => handleDimensionChange('width', value)}
                {...commonProps}
              />
              <MobileInputField
                label={t('thickness')}
                value={dimensions.thickness}
                onChange={(value) => handleDimensionChange('thickness', value)}
                {...commonProps}
              />
              <MobileInputField
                label={t('length')}
                value={dimensions.length}
                onChange={(value) => handleDimensionChange('length', value)}
                {...commonProps}
              />
            </>
          );
        } else {
          return (
            <>
              <MobileInputField
                label={t('width')}
                value={dimensions.width}
                onChange={(value) => handleDimensionChange('width', value)}
                {...commonProps}
              />
              <MobileInputField
                label={t('height')}
                value={dimensions.height}
                onChange={(value) => handleDimensionChange('height', value)}
                {...commonProps}
              />
              <MobileInputField
                label={t('thickness')}
                value={dimensions.thickness}
                onChange={(value) => handleDimensionChange('thickness', value)}
                {...commonProps}
              />
              <MobileInputField
                label={t('length')}
                value={dimensions.length}
                onChange={(value) => handleDimensionChange('length', value)}
                {...commonProps}
              />
            </>
          );
        }
      
      case 'angle':
      case 'bar':
      case 'profile':
        return (
          <>
            <MobileInputField
              label={t('width')}
              value={dimensions.width}
              onChange={(value) => handleDimensionChange('width', value)}
              {...commonProps}
            />
            <MobileInputField
              label={t('height')}
              value={dimensions.height}
              onChange={(value) => handleDimensionChange('height', value)}
              {...commonProps}
            />
            <MobileInputField
              label={t('thickness')}
              value={dimensions.thickness}
              onChange={(value) => handleDimensionChange('thickness', value)}
              {...commonProps}
            />
            <MobileInputField
              label={t('length')}
              value={dimensions.length}
              onChange={(value) => handleDimensionChange('length', value)}
              {...commonProps}
            />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <MobileCalculatorLayout
        onOpenSaved={() => setShowSavedModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        activeTab="calculate"
      >
        <div className="flex flex-col min-h-full">
          {/* Type Selector */}
          <div className="flex-shrink-0">
            <MobileCalculationTypeSelector
              selectedType={calculationType}
              onTypeChange={handleCalculationTypeChange}
              selectedSubType={subType}
              onSubTypeChange={setSubType}
            />
          </div>

          {/* Material and Unit Selection */}
          <div className="flex-shrink-0 px-4 py-4 space-y-4">
            {/* Material Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                {t('materialLabel')}
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full p-4 rounded-lg border text-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }}
              >
                {Object.keys(materials).map((key) => (
                  <option key={key} value={key} style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>
                    {t(key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Toggle */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                {t('unitLabel')}
              </label>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: theme.colors.border }}>
                <button
                  onClick={() => setUnit('mm')}
                  className={`flex-1 py-3 px-4 text-lg font-medium transition-colors ${
                    unit === 'mm' ? 'font-bold' : ''
                  }`}
                  style={{
                    backgroundColor: unit === 'mm' ? theme.colors.primary : theme.colors.surface,
                    color: unit === 'mm' ? theme.colors.textOnPrimary : theme.colors.text
                  }}
                >
                  mm
                </button>
                <button
                  onClick={() => setUnit('in')}
                  className={`flex-1 py-3 px-4 text-lg font-medium transition-colors ${
                    unit === 'in' ? 'font-bold' : ''
                  }`}
                  style={{
                    backgroundColor: unit === 'in' ? theme.colors.primary : theme.colors.surface,
                    color: unit === 'in' ? theme.colors.textOnPrimary : theme.colors.text
                  }}
                >
                  in
                </button>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="flex-shrink-0 px-4 space-y-4">
            {renderInputFields()}
            
            {/* Pricing Inputs */}
            <div className="pt-4 border-t" style={{ borderColor: theme.colors.border }}>
              <h4 className="text-lg font-medium mb-4" style={{ color: theme.colors.text }}>
                {t('pricing')}
              </h4>
              <MobileInputField
                label={t('pricePerKg')}
                value={dimensions.pricePerKg}
                onChange={(value) => handleDimensionChange('pricePerKg', value)}
                unit="$/kg"
              />
              <MobileInputField
                label={t('quantity')}
                value={dimensions.quantity}
                onChange={(value) => handleDimensionChange('quantity', value)}
                unit="pcs"
                min={1}
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="flex-1 mt-6">
            <MobileResultsDisplay
              weight={weight}
              totalWeight={totalWeight}
              piecePrice={piecePrice}
              totalPrice={totalPrice}
              quantity={dimensions.quantity}
              pricePerKg={dimensions.pricePerKg}
              material={selectedMaterial}
              calculationType={calculationType}
              onSave={handleSaveCalculation}
              onShare={handleShareCalculation}
              isSaving={isSaving}
              isCalculating={isCalculating}
            />
          </div>
        </div>
      </MobileCalculatorLayout>

      {/* Modals */}
      <MobileSavedCalculationsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        calculations={savedCalculations}
        onDelete={handleDeleteCalculation}
        onClearAll={handleClearAllCalculations}
        onLoadCalculation={handleLoadCalculation}
      />

      <MobileSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        currentTheme="dark"
        onThemeChange={() => {}} // Placeholder for theme switching
      />
    </>
  );
};

export default MobileMetalCalculator; 