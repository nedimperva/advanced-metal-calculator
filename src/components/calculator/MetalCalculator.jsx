import React, { useState, useEffect } from 'react';
import { materials } from '../../data/materials';
import { calculatePipeWeight, calculateProfileWeight, calculatePlateWeight, calculateAngleWeight, calculateBarWeight, calculatePressBrakeAngleWeight, calculatePressBrakeUWeight, calculateTotalPrice } from '../../utils/calculations';
import { loadSavedCalculations, saveCalculation, deleteCalculation } from '../../utils/storage';
import { generateCalculationName } from '../../utils/generateCalculationName';
import PlateCalculator from './PlateCalculator';
import ProfileCalculator from './ProfileCalculator';
import PipeCalculator from './PipeCalculator';
import AngleCalculator from './AngleCalculator';
import BarCalculator from './BarCalculator';
import PressBrakeAngleCalculator from './PressBrakeAngleCalculator';
import PressBrakeUCalculator from './PressBrakeUCalculator';
import PricingInputs from './PricingInputs';
import SavedCalculations from './SavedCalculations';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';
import LoadingSpinner from '../ui/LoadingSpinner';
import ToggleSwitch from '../ui/ToggleSwitch';
import logo from '../../assets/logo.svg';

const MetalCalculator = () => {
  // Basic settings
  const [selectedMaterial, setSelectedMaterial] = useState('steel');
  const [calculationType, setCalculationType] = useState('pipe');
  const [unit, setUnit] = useState('mm');
  const [pipeSubType, setPipeSubType] = useState('rectangular'); // 'round', 'square', 'rectangular'
  const [angleSubType, setAngleSubType] = useState('equal'); // 'equal', 'unequal', 'pressBrake'
  const [barSubType, setBarSubType] = useState('flat');
  const [profileSubType, setProfileSubType] = useState('standard'); // 'standard', 'pressBrakeU'
  
  // Loading states
  const [isCalculating, setIsCalculating] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Saved calculations
  const [savedCalculations, setSavedCalculations] = useState([]);
  
  // Get translation function
  const { t, language } = useLanguage();

  useEffect(() => {
    const saved = localStorage.getItem('savedCalculations');
    if (saved) {
      try {
        setSavedCalculations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved calculations:', error);
        localStorage.removeItem('savedCalculations');
      }
    }
  }, []);

  // Data states for different calculators
  const [plateData, setPlateData] = useState({ width: 0, length: 0, thickness: 0 });
  const [profileData, setProfileData] = useState({ type: '', size: '', length: 0 });
  const [pipeData, setPipeData] = useState({ 
    type: 'rectangular', 
    outerDiameter: 0,  // for round pipes
    size: 0,           // for square pipes
    width: 40,          // for rectangular pipes
    height: 20,         // for rectangular pipes
    thickness: 1.8, 
    length: 6000 
  });
  const [angleData, setAngleData] = useState({ type: 'equal', width: 0, height: 0, thickness: 0, length: 0 });
  const [barData, setBarData] = useState({ 
    type: 'flat', 
    diameter: 0, 
    width: 0, 
    height: 0, 
    sideLength: 0, 
    length: 0 
  });
  const [pressBrakeAngleData, setPressBrakeAngleData] = useState({ 
    width: 0, 
    height: 0, 
    thickness: 0, 
    length: 0,
    angle: 90,
    radius: 0
  });
  const [pressBrakeUData, setPressBrakeUData] = useState({ 
    width: 0, 
    height: 0, 
    thickness: 0, 
    length: 0,
    radius: 0,
    flangeWidth: 0
  });
  
  // Pricing states
  const [pricePerKg, setPricePerKg] = useState(2);
  const [quantity, setQuantity] = useState(1);

  // Results
  const [weight, setWeight] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [piecePrice, setPiecePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Get color for calculation type
  const getCalculationTypeColor = (type) => {
    switch (type) {
      case 'plate': return theme.colors.accent1;
      case 'profile': return theme.colors.accent2;
      case 'pipe': return theme.colors.primary;
      case 'angle': return theme.colors.secondary;
      case 'bar': return theme.colors.success;
      case 'pressBrakeAngle': return theme.colors.warning;
      case 'pressBrakeU': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };

  // Calculate weight when inputs change
  useEffect(() => {
    if (!selectedMaterial) return;
    
    setIsCalculating(true);
    const calculationTimeout = setTimeout(() => {
      const density = materials[selectedMaterial].density;
      let calculatedWeight = 0;

      try {
        switch (calculationType) {
          case 'plate':
            calculatedWeight = calculatePlateWeight(plateData, unit, density);
            break;
          case 'profile':
            if (profileSubType === 'pressBrakeU') {
              calculatedWeight = calculatePressBrakeUWeight(pressBrakeUData, unit, density);
            } else {
              calculatedWeight = calculateProfileWeight(profileData, unit, density);
            }
            break;
          case 'pipe':
            calculatedWeight = calculatePipeWeight(pipeData, unit, density);
            break;
          case 'angle':
            if (angleSubType === 'pressBrake') {
              calculatedWeight = calculatePressBrakeAngleWeight(pressBrakeAngleData, unit, density);
            } else {
              calculatedWeight = calculateAngleWeight(angleData, unit, density);
            }
            break;
          case 'bar':
            calculatedWeight = calculateBarWeight(barData, unit, density);
            break;
          default:
            calculatedWeight = 0;
        }
      } catch (error) {
        console.error('Error calculating weight:', error);
        calculatedWeight = 0;
      }

      setWeight(calculatedWeight);
      setIsCalculating(false);
    }, 500);

    return () => clearTimeout(calculationTimeout);
  }, [selectedMaterial, calculationType, plateData, profileData, pipeData, angleData, barData, pressBrakeAngleData, pressBrakeUData, unit, angleSubType, profileSubType]);

  // Calculate total weight and prices when weight or quantity changes
  useEffect(() => {
    setShowProgress(true);
    const priceTimeout = setTimeout(() => {
      // Handle empty or invalid values
      const qtyValue = quantity === '' ? 0 : quantity;
      const priceValue = pricePerKg === '' ? 0 : pricePerKg;
      
      setTotalWeight(weight * qtyValue);
      setPiecePrice(calculateTotalPrice(weight, priceValue, 1));
      setTotalPrice(calculateTotalPrice(weight, priceValue, qtyValue));
      setShowProgress(false);
    }, 300);

    return () => clearTimeout(priceTimeout);
  }, [weight, pricePerKg, quantity]);

  // Handle saving calculation
  const handleSaveCalculation = () => {
    setIsSaving(true);
    
    const currentCalculation = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: calculationType,
      material: selectedMaterial,
      weight: weight,
      pricePerKg: pricePerKg,
      totalPrice: totalPrice,
      quantity: quantity,
      color: theme.colors[calculationType.toLowerCase()] || theme.colors.primary
    };

    // Add specific properties and name based on calculator type
    switch (calculationType) {
      case 'plate':
        currentCalculation.dimensions = plateData;
        currentCalculation.name = generateCalculationName('plate', plateData, unit, language);
        break;
      case 'profile':
        if (profileSubType === 'pressBrakeU') {
          currentCalculation.dimensions = pressBrakeUData;
          currentCalculation.subType = 'pressBrakeU';
          currentCalculation.name = generateCalculationName('pressBrakeU', pressBrakeUData, unit, language);
        } else {
          currentCalculation.dimensions = profileData;
          currentCalculation.subType = 'standard';
          currentCalculation.name = generateCalculationName('profile', profileData, unit, language);
        }
        break;
      case 'pipe':
        currentCalculation.dimensions = pipeData;
        currentCalculation.name = generateCalculationName('pipe', pipeData, unit, language);
        break;
      case 'angle':
        if (angleSubType === 'pressBrake') {
          currentCalculation.dimensions = pressBrakeAngleData;
          currentCalculation.subType = 'pressBrake';
          currentCalculation.name = generateCalculationName('pressBrakeAngle', pressBrakeAngleData, unit, language);
        } else {
          currentCalculation.dimensions = angleData;
          currentCalculation.subType = angleSubType;
          currentCalculation.name = generateCalculationName('angle', angleData, unit, language);
        }
        break;
      case 'bar':
        currentCalculation.dimensions = barData;
        currentCalculation.name = generateCalculationName('bar', barData, unit, language);
        break;
      default:
        break;
    }

    const updatedCalculations = [...savedCalculations, currentCalculation];
    setSavedCalculations(updatedCalculations);
    localStorage.setItem('savedCalculations', JSON.stringify(updatedCalculations));
    setIsSaving(false);
  };

  // Handle deleting calculation
  const handleDeleteCalculation = (id) => {
    console.log('Deleting calculation with ID:', id);
    try {
      // Get the current calculations from localStorage
      const saved = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
      // Filter out the calculation with the specified ID
      const updated = saved.filter(calc => calc.id !== id);
      // Save the updated calculations back to localStorage
      localStorage.setItem('savedCalculations', JSON.stringify(updated));
      // Update the state
      setSavedCalculations(updated);
      console.log('Updated calculations:', updated);
    } catch (error) {
      console.error('Error deleting calculation:', error);
    }
  };

  const clearCalculations = () => {
    setSavedCalculations([]);
    localStorage.removeItem('savedCalculations');
  };

  // Handle pipe sub-type change
  const handlePipeSubTypeChange = (subType) => {
    setPipeSubType(subType);
    setPipeData({
      ...pipeData,
      type: subType
    });
  };

  // Handle angle sub-type change
  const handleAngleSubTypeChange = (subType) => {
    setAngleSubType(subType);
    setAngleData({
      ...angleData,
      type: subType
    });
  };

  // Handle bar sub-type change
  const handleBarSubTypeChange = (subType) => {
    setBarSubType(subType);
    setBarData({
      ...barData,
      type: subType,
      // Reset values that aren't used for this type
      ...(subType === 'flat' ? { diameter: 0, sideLength: 0 } : {}),
      ...(subType === 'round' ? { width: 0, height: 0, sideLength: 0 } : {}),
      ...(subType === 'square' ? { width: 0, height: 0, diameter: 0 } : {})
    });
  };

  // Handle calculation type change
  const handleCalculationTypeChange = (type) => {
    setCalculationType(type);
    
    // Reset subtypes when changing calculation type
    if (type === 'pipe') {
      setPipeSubType('rectangular');
    } else if (type === 'angle') {
      setAngleSubType('equal');
    } else if (type === 'bar') {
      setBarSubType('flat');
    } else if (type === 'profile') {
      setProfileSubType('standard');
    }
  };

  return (
    <div className="h-full overflow-auto" style={{ backgroundColor: theme.colors.background }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Left Column - Calculator */}
        <div className="lg:col-span-2 p-2 sm:p-4 flex flex-col gap-3 sm:gap-4">
          {/* Header and Controls */}
          <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              {/* Modern calculator icon instead of text title */}
              <div className="flex items-center">
                <div className="flex items-center justify-center p-2 rounded-md mr-2" 
                     style={{ backgroundColor: `${theme.colors.primary}15` }}>
                  <img src={logo} alt="Calculator" className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold" style={{ color: theme.colors.text }}>
                    {calculationType === 'pipe' && (
                      <>
                        {pipeSubType === 'round' ? t('roundPipe') : 
                         pipeSubType === 'square' ? t('squarePipe') : 
                         pipeSubType === 'rectangular' ? t('rectangularPipe') : t('pipe')}
                      </>
                    )}
                    {calculationType === 'angle' && (
                      <>
                        {angleSubType === 'equal' ? t('equalAngle') : 
                         angleSubType === 'unequal' ? t('unequalAngle') : 
                         angleSubType === 'pressBrake' ? t('pressBrakeAngle') : t('angle')}
                      </>
                    )}
                    {calculationType === 'bar' && (
                      <>
                        {barSubType === 'flat' ? t('flatBar') : 
                         barSubType === 'square' ? t('squareBar') : 
                         barSubType === 'round' ? t('roundBar') : t('bar')}
                      </>
                    )}
                    {calculationType === 'plate' && t('plate')}
                    {calculationType === 'profile' && (
                      <>
                        {profileData.size ? profileData.size : 
                         profileData.type ? profileData.type.toUpperCase() : 
                         profileSubType === 'pressBrakeU' ? t('pressBrakeU') : t('profile')}
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {/* Material Selection */}
                <div className="flex items-center gap-2 border rounded-md p-1 px-2 flex-grow sm:flex-grow-0" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                  <span className="text-sm font-medium" style={{ color: theme.colors.textLight }}>{t('materialLabel')}</span>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="bg-transparent border-0 focus:ring-0 text-sm p-1 flex-grow cursor-pointer"
                    style={{ 
                      color: theme.colors.text,
                      outlineColor: theme.colors.primary,
                      backgroundColor: `${theme.colors.primary}15`,
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>{t('selectMaterial')}</option>
                    {Object.keys(materials).map((key) => (
                      <option key={key} value={key} style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Toggle */}
                <div className="flex items-center gap-2 border rounded-md p-1 px-2" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                  <span className="text-sm font-medium" style={{ color: theme.colors.textLight }}>{t('unitLabel')}</span>
                  <span className={`text-sm px-2 py-1 rounded-md ${unit === 'mm' ? 'font-bold' : ''}`} 
                    style={{ 
                      color: unit === 'mm' ? theme.colors.primary : theme.colors.text,
                      backgroundColor: unit === 'mm' ? `${theme.colors.primary}20` : 'transparent'
                    }}>
                    mm
                  </span>
                  <ToggleSwitch
                    isChecked={unit === 'in'}
                    onChange={(checked) => setUnit(checked ? 'in' : 'mm')}
                    activeColor={theme.colors.primary}
                  />
                  <span className={`text-sm px-2 py-1 rounded-md ${unit === 'in' ? 'font-bold' : ''}`}
                    style={{ 
                      color: unit === 'in' ? theme.colors.primary : theme.colors.text,
                      backgroundColor: unit === 'in' ? `${theme.colors.primary}20` : 'transparent'
                    }}>
                    in
                  </span>
                </div>
              </div>
            </div>
            
            {/* Calculation Type Tabs */}
            <div className="flex flex-wrap border rounded-md overflow-hidden" style={{ borderColor: theme.colors.border }}>
              <button
                onClick={() => handleCalculationTypeChange('plate')}
                className={`py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base ${calculationType !== 'plate' ? 'border-r' : ''}`}
                style={{ 
                  backgroundColor: calculationType === 'plate' ? theme.colors.primary : theme.colors.background,
                  color: calculationType === 'plate' ? theme.colors.textOnPrimary : theme.colors.text,
                  borderColor: theme.colors.border
                }}
              >
                {t('plate')}
              </button>
              <button
                onClick={() => handleCalculationTypeChange('profile')}
                className={`py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base ${calculationType !== 'profile' ? 'border-r' : ''}`}
                style={{ 
                  backgroundColor: calculationType === 'profile' ? theme.colors.primary : theme.colors.background,
                  color: calculationType === 'profile' ? theme.colors.textOnPrimary : theme.colors.text,
                  borderColor: theme.colors.border
                }}
              >
                {t('profile')}
              </button>
              <button
                onClick={() => handleCalculationTypeChange('pipe')}
                className={`py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base ${calculationType !== 'pipe' ? 'border-r' : ''}`}
                style={{ 
                  backgroundColor: calculationType === 'pipe' ? theme.colors.primary : theme.colors.background,
                  color: calculationType === 'pipe' ? theme.colors.textOnPrimary : theme.colors.text,
                  borderColor: theme.colors.border
                }}
              >
                {t('pipe')}
              </button>
              <button
                onClick={() => handleCalculationTypeChange('angle')}
                className={`py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base ${calculationType !== 'angle' ? 'border-r' : ''}`}
                style={{ 
                  backgroundColor: calculationType === 'angle' ? theme.colors.primary : theme.colors.background,
                  color: calculationType === 'angle' ? theme.colors.textOnPrimary : theme.colors.text,
                  borderColor: theme.colors.border
                }}
              >
                {t('angle')}
              </button>
              <button
                onClick={() => handleCalculationTypeChange('bar')}
                className="py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base"
                style={{ 
                  backgroundColor: calculationType === 'bar' ? theme.colors.primary : theme.colors.background,
                  color: calculationType === 'bar' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('bar')}
              </button>
            </div>
          </div>

          {/* Pipe Sub-Type Tabs */}
          {calculationType === 'pipe' && (
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => handlePipeSubTypeChange('round')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: pipeSubType === 'round' ? theme.colors.primary : theme.colors.surface,
                  color: pipeSubType === 'round' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('roundPipe')}
              </button>
              <button
                onClick={() => handlePipeSubTypeChange('square')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: pipeSubType === 'square' ? theme.colors.primary : theme.colors.surface,
                  color: pipeSubType === 'square' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('squarePipe')}
              </button>
              <button
                onClick={() => handlePipeSubTypeChange('rectangular')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: pipeSubType === 'rectangular' ? theme.colors.primary : theme.colors.surface,
                  color: pipeSubType === 'rectangular' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('rectangularPipe')}
              </button>
            </div>
          )}

          {/* Angle Sub-Type Tabs */}
          {calculationType === 'angle' && (
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => handleAngleSubTypeChange('equal')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: angleSubType === 'equal' ? theme.colors.primary : theme.colors.surface,
                  color: angleSubType === 'equal' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('equalAngle')}
              </button>
              <button
                onClick={() => handleAngleSubTypeChange('unequal')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: angleSubType === 'unequal' ? theme.colors.primary : theme.colors.surface,
                  color: angleSubType === 'unequal' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('unequalAngle')}
              </button>
              <button
                onClick={() => handleAngleSubTypeChange('pressBrake')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: angleSubType === 'pressBrake' ? theme.colors.primary : theme.colors.surface,
                  color: angleSubType === 'pressBrake' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('pressBrakeAngle')}
              </button>
            </div>
          )}

          {/* Bar Sub-Type Tabs */}
          {calculationType === 'bar' && (
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => handleBarSubTypeChange('flat')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: barSubType === 'flat' ? theme.colors.primary : theme.colors.surface,
                  color: barSubType === 'flat' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('flatBar')}
              </button>
              <button
                onClick={() => handleBarSubTypeChange('square')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: barSubType === 'square' ? theme.colors.primary : theme.colors.surface,
                  color: barSubType === 'square' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('squareBar')}
              </button>
              <button
                onClick={() => handleBarSubTypeChange('round')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: barSubType === 'round' ? theme.colors.primary : theme.colors.surface,
                  color: barSubType === 'round' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('roundBar')}
              </button>
            </div>
          )}

          {/* Profile Sub-Type Tabs */}
          {calculationType === 'profile' && (
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => setProfileSubType('standard')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: profileSubType === 'standard' ? theme.colors.primary : theme.colors.surface,
                  color: profileSubType === 'standard' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('standardProfile')}
              </button>
              <button
                onClick={() => setProfileSubType('pressBrakeU')}
                className={`py-2 px-3 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base whitespace-nowrap`}
                style={{ 
                  backgroundColor: profileSubType === 'pressBrakeU' ? theme.colors.primary : theme.colors.surface,
                  color: profileSubType === 'pressBrakeU' ? theme.colors.textOnPrimary : theme.colors.text
                }}
              >
                {t('pressBrakeU')}
              </button>
            </div>
          )}

          {/* Calculator and Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Left side - Calculator */}
            <div>
              {calculationType && (
                <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                  {calculationType === 'plate' && (
                    <PlateCalculator
                      plateData={plateData}
                      onPlateDataChange={setPlateData}
                      unit={unit}
                    />
                  )}

                  {calculationType === 'profile' && profileSubType === 'standard' && (
                    <ProfileCalculator
                      profileData={profileData}
                      onProfileDataChange={setProfileData}
                      unit={unit}
                    />
                  )}

                  {calculationType === 'profile' && profileSubType === 'pressBrakeU' && (
                    <PressBrakeUCalculator
                      pressBrakeUData={pressBrakeUData}
                      onPressBrakeUDataChange={(data) => {
                        // Set radius to match thickness if not explicitly set
                        if (data.thickness && (!data.radius || data.radius === 0)) {
                          data.radius = data.thickness;
                        }
                        setPressBrakeUData(data);
                      }}
                      unit={unit}
                    />
                  )}
                  
                  {calculationType === 'pipe' && (
                    <PipeCalculator
                      pipeData={pipeData}
                      onPipeDataChange={setPipeData}
                      unit={unit}
                    />
                  )}

                  {calculationType === 'angle' && angleSubType !== 'pressBrake' && (
                    <AngleCalculator
                      angleData={angleData}
                      onAngleDataChange={setAngleData}
                      unit={unit}
                    />
                  )}

                  {calculationType === 'angle' && angleSubType === 'pressBrake' && (
                    <PressBrakeAngleCalculator
                      pressBrakeAngleData={pressBrakeAngleData}
                      onPressBrakeAngleDataChange={(data) => {
                        // Set radius to match thickness if not explicitly set
                        if (data.thickness && (!data.radius || data.radius === 0)) {
                          data.radius = data.thickness;
                        }
                        setPressBrakeAngleData(data);
                      }}
                      unit={unit}
                    />
                  )}
                  
                  {calculationType === 'bar' && (
                    <BarCalculator
                      barData={barData}
                      onBarDataChange={setBarData}
                      unit={unit}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Right side - Pricing and Results */}
            <div className="space-y-3 sm:space-y-4">
              {/* Pricing Inputs */}
              <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                <PricingInputs
                  pricePerKg={pricePerKg}
                  setPricePerKg={setPricePerKg}
                  quantity={quantity}
                  setQuantity={setQuantity}
                />
              </div>

              {/* Results */}
              <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                <h3 className="text-lg font-medium mb-3" style={{ color: theme.colors.text }}>{t('results')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm uppercase font-medium mb-1" style={{ color: theme.colors.textLight }}>{t('weight')}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm" style={{ color: theme.colors.textLight }}>{t('singlePiece')}</div>
                        <div className="text-lg font-semibold" style={{ color: theme.colors.text }}>{weight.toFixed(2)} kg</div>
                      </div>
                      <div>
                        <div className="text-sm" style={{ color: theme.colors.textLight }}>{t('total')}</div>
                        <div className="text-lg font-semibold" style={{ color: theme.colors.text }}>{totalWeight.toFixed(2)} kg</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm uppercase font-medium mb-1" style={{ color: theme.colors.textLight }}>{t('price')}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm" style={{ color: theme.colors.textLight }}>{t('singlePiece')}</div>
                        <div className="text-lg font-semibold" style={{ color: theme.colors.text }}>${piecePrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm" style={{ color: theme.colors.textLight }}>{t('total')}</div>
                        <div className="text-lg font-semibold" style={{ color: theme.colors.primary }}>${totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveCalculation}
                    disabled={!calculationType || !selectedMaterial || isCalculating || showProgress || isSaving}
                    className="w-full py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.textOnPrimary
                    }}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" color="white" />
                        {t('saving')}
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {t('saveCalculation')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Calculations - Responsive for all screen sizes */}
        <div className="h-full p-2 sm:p-4">
          <SavedCalculations
            calculations={savedCalculations}
            onDelete={handleDeleteCalculation}
            onClearAll={clearCalculations}
          />
        </div>
      </div>
    </div>
  );
};

export default MetalCalculator;
