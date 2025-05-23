import React, { useState, useEffect } from 'react';
import { materials } from '../../data/materials';
import { calculatePipeWeight, calculateProfileWeight, calculatePlateWeight, calculateAngleWeight, calculateBarWeight, calculatePressBrakeAngleWeight, calculatePressBrakeUWeight, calculatePressBrakeLWeight, calculateTotalPrice } from '../../utils/calculations';
import { loadSavedCalculations, saveCalculation, deleteCalculation } from '../../utils/storage';
import { loadProducts } from '../../utils/products.jsx';
import { generateCalculationName } from '../../utils/generateCalculationName';
import PlateCalculator from './PlateCalculator';
import ProfileCalculator from './ProfileCalculator';
import PipeCalculator from './PipeCalculator';
import AngleCalculator from './AngleCalculator';
import BarCalculator from './BarCalculator';
import PressBrakeAngleCalculator from './PressBrakeAngleCalculator';
import PressBrakeUCalculator from './PressBrakeUCalculator';
import PressBrakeLCalculator from './PressBrakeLCalculator';
import PricingInputs from './PricingInputs';
import SavedCalculations from './SavedCalculations';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';
import LoadingSpinner from '../ui/LoadingSpinner';
import ToggleSwitch from '../ui/ToggleSwitch';
import logo from '../../assets/logo.svg';
import EqualAngle from '../../assets/profiles/EqualAngle.svg';
import UnequalAngle from '../../assets/profiles/UnequalAngle.svg';
import SquarePipe from '../../assets/profiles/SquarePipe.svg';
import RoundPipe from '../../assets/profiles/RoundPipe.svg';
import RectangularPipe from '../../assets/profiles/RectangularPipe.svg';
import HEA from '../../assets/profiles/HEA.svg';
import HEB from '../../assets/profiles/HEB.svg';
import UProfile from '../../assets/profiles/UProfile.svg';
import IPN from '../../assets/profiles/IPN.svg';
import IPE from '../../assets/profiles/IPE.svg';
import SteelPlate from '../../assets/profiles/SteelPlate.svg';
import FlatBar from '../../assets/profiles/FlatBar.svg';
import SquareBar from '../../assets/profiles/SquareBar.svg';
import RoundBar from '../../assets/profiles/RoundBar.svg';
import UPressBrake from '../../assets/profiles/UPressBrake.svg';
import LPressBrake from '../../assets/profiles/LPressBrake.svg';

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
    const loadCalcs = () => {
      const saved = localStorage.getItem('savedCalculations');
      if (saved) {
        try {
          setSavedCalculations(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading saved calculations:', error);
          localStorage.removeItem('savedCalculations');
        }
      }
    };
    loadCalcs();
    window.addEventListener('calculation-added', loadCalcs);
    return () => window.removeEventListener('calculation-added', loadCalcs);
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
  const [pressBrakeLData, setPressBrakeLData] = useState({
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
            } else if (profileSubType === 'pressBrakeL') {
              calculatedWeight = calculatePressBrakeLWeight(pressBrakeLData, unit, density);
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
  }, [selectedMaterial, calculationType, plateData, profileData, pipeData, angleData, barData, pressBrakeAngleData, pressBrakeUData, pressBrakeLData, unit, angleSubType, profileSubType]);

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
        } else if (profileSubType === 'pressBrakeL') {
          currentCalculation.dimensions = pressBrakeLData;
          currentCalculation.subType = 'pressBrakeL';
          currentCalculation.name = generateCalculationName('pressBrakeL', pressBrakeLData, unit, language);
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
      setProfileData({ type: '', size: '', length: 0 });
      setPressBrakeUData({ width: 0, height: 0, thickness: 0, length: 0, radius: 0, flangeWidth: 0 });
      setPressBrakeLData({ width: 0, height: 0, thickness: 0, length: 0, radius: 0, flangeWidth: 0 });
    }
  };



  const profileIcons = {
    'hea': HEA,
    'heb': HEB,
    'ipn': IPN,
    'ipe': IPE,
    'upn': UProfile,
    'pressBrakeU': UPressBrake
  };

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex flex-1 flex-col lg:flex-row gap-0.5 h-full w-full min-h-0">
        {/* Main Column: Calculator UI ONLY */}
        <div className="flex flex-col flex-1 min-w-[360px] p-0.5 md:p-1 gap-1">
          {/* Header and Controls */}
          <div className="rounded-lg p-1 sm:p-0.5 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1">
              {/* Modern calculator icon instead of text title */}
              <div className="flex items-center">
                <div className="flex items-center justify-center p-4 rounded-md mr-2"
                     style={{ backgroundColor: `${theme.colors.primary}15` }}>
                  {calculationType === 'profile' ? (
                    profileData.type ? (
                      <img
                        src={profileIcons[profileData.type]}
                        alt={profileData.type}
                        className="h-6 w-6"
                      />
                    ) : profileSubType === 'pressBrakeU' ? (
                      <img
                        src={UPressBrake}
                        alt="U Press Brake"
                        className="h-6 w-6"
                      />
                    ) : (
                      <img
                        src={logo}
                        alt="Calculator"
                        className="h-6 w-6"
                      />
                    )
                  ) : calculationType === 'pipe' ? (
                    <img
                      src={pipeSubType === 'round' ? RoundPipe :
                           pipeSubType === 'square' ? SquarePipe :
                           RectangularPipe}
                      alt={pipeSubType === 'round' ? t('roundPipe') :
                           pipeSubType === 'square' ? t('squarePipe') :
                           t('rectangularPipe')}
                      className="h-6 w-6"
                    />
                  ) : calculationType === 'angle' ? (
                    <img
                      src={angleSubType === 'equal' ? EqualAngle :
                           angleSubType === 'unequal' ? UnequalAngle :
                           LPressBrake}
                      alt={angleSubType === 'equal' ? t('equalAngle') :
                           angleSubType === 'unequal' ? t('unequalAngle') :
                           t('pressBrakeAngle')}
                      className="h-6 w-6"
                    />
                  ) : calculationType === 'bar' ? (
                    <img
                      src={barSubType === 'flat' ? FlatBar :
                           barSubType === 'square' ? SquareBar :
                           RoundBar}
                      alt={barSubType === 'flat' ? t('flatBar') :
                           barSubType === 'square' ? t('squareBar') :
                           t('roundBar')}
                      className="h-6 w-6"
                    />
                  ) : calculationType === 'plate' ? (
                    <img
                      src={SteelPlate}
                      alt={t('plate')}
                      className="h-6 w-6"
                    />
                  ) : (
                    <img
                      src={logo}
                      alt="Calculator"
                      className="h-6 w-6"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold" style={{ color: theme.colors.text }}>
                    {calculationType === 'pipe' && (
                      pipeSubType === 'round' ? t('roundPipe') :
                      pipeSubType === 'square' ? t('squarePipe') :
                      pipeSubType === 'rectangular' ? t('rectangularPipe') : t('pipe')
                    )}
                    {calculationType === 'angle' && (
                      angleSubType === 'equal' ? t('equalAngle') :
                      angleSubType === 'unequal' ? t('unequalAngle') :
                      angleSubType === 'pressBrake' ? t('pressBrakeAngle') : t('angle')
                    )}
                    {calculationType === 'bar' && (
                      barSubType === 'flat' ? t('flatBar') :
                      barSubType === 'square' ? t('squareBar') :
                      barSubType === 'round' ? t('roundBar') : t('bar')
                    )}
                    {calculationType === 'plate' && t('plate')}
                    {calculationType === 'profile' && (
                      profileData.size ? profileData.size :
                      profileData.type ? profileData.type.toUpperCase() :
                      profileSubType === 'pressBrakeU' ? t('pressBrakeU') : t('profile')
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-4">
                {/* Material Selection */}
                <div className="flex items-center gap-4 border rounded-md p-1 px-2 flex-grow sm:flex-grow-0" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                  <span className="text-base font-medium" style={{ color: theme.colors.textLight }}>{t('materialLabel')}</span>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="bg-transparent border-0 focus:ring-0 text-base p-1 flex-grow cursor-pointer"
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
                <div className="flex items-center gap-4 border rounded-md p-1 px-2" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                  <span className="text-base font-medium" style={{ color: theme.colors.textLight }}>{t('unitLabel')}</span>
                  <span className={`text-base px-2 py-2 rounded-md ${unit === 'mm' ? 'font-bold' : ''}`}
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
                  <span className={`text-base px-2 py-2 rounded-md ${unit === 'in' ? 'font-bold' : ''}`}
                    style={{
                      color: unit === 'in' ? theme.colors.primary : theme.colors.text,
                      backgroundColor: unit === 'in' ? `${theme.colors.primary}20` : 'transparent'
                    }}>
                    in
                  </span>
                </div>
              </div>
            </div>
          </div> {/* End Header and Controls */}

          {/* Calculation Type Tabs */}
          {/* Main Tab Navigation */}
          <div className="flex flex-wrap gap-x-2 mb-2 px-0">
            {['plate', 'profile', 'pipe', 'angle', 'bar'].map((type, idx, arr) => (
              <button
                key={type}
                onClick={() => handleCalculationTypeChange(type)}
                className={
                  `py-3 px-6 text-center flex-1 rounded-t-lg transition-all text-base font-semibold shadow-sm
                  ${calculationType === type ? 'bg-orange-400 text-white shadow-md underline underline-offset-4' : 'bg-gray-700 text-white hover:bg-orange-200 hover:text-gray-900'}
                  ${idx !== arr.length - 1 ? 'mr-2' : ''}`
                }
                style={{
                  border: calculationType === type ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
                  zIndex: calculationType === type ? 2 : 1
                }}
              >
                {t(type)}
              </button>
            ))}
          </div>

          {/* Sub-tabs for Profile, Pipe, Angle, Bar */}
          {(calculationType === 'profile' || calculationType === 'pipe' || calculationType === 'angle' || calculationType === 'bar') && (
            <div className="flex flex-col mb-6">
              {/* Pipe Sub-Type Tabs */}
              {calculationType === 'pipe' && (
                <div className="flex space-x-1 overflow-x-auto">
                  <button
                    onClick={() => handlePipeSubTypeChange('round')}
                    className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
                    style={{
                      backgroundColor: pipeSubType === 'round' ? theme.colors.primary : theme.colors.surface,
                      color: pipeSubType === 'round' ? theme.colors.textOnPrimary : theme.colors.text
                    }}
                  >
                    {t('roundPipe')}
                  </button>
                  <button
                    onClick={() => handlePipeSubTypeChange('square')}
                    className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
                    style={{
                       backgroundColor: pipeSubType === 'square' ? theme.colors.primary : theme.colors.surface,
                      color: pipeSubType === 'square' ? theme.colors.textOnPrimary : theme.colors.text
                    }}
                  >
                    {t('squarePipe')}
                  </button>
                  <button
                     onClick={() => handlePipeSubTypeChange('rectangular')}
                    className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
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
                     className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
                    style={{
                      backgroundColor: angleSubType === 'equal' ? theme.colors.primary : theme.colors.surface,
                      color: angleSubType === 'equal' ? theme.colors.textOnPrimary : theme.colors.text
                     }}
                  >
                    {t('equalAngle')}
                  </button>
                  <button
                     onClick={() => handleAngleSubTypeChange('unequal')}
                    className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
                    style={{
                      backgroundColor: angleSubType === 'unequal' ? theme.colors.primary : theme.colors.surface,
                      color: angleSubType === 'unequal' ? theme.colors.textOnPrimary : theme.colors.text
                    }}
                  >
                    {t('unequalAngle')}
                  </button>
                  <button
                     onClick={() => handleAngleSubTypeChange('pressBrake')}
                    className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
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
                     className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
                    style={{
                      backgroundColor: barSubType === 'flat' ? theme.colors.primary : theme.colors.surface,
                      color: barSubType === 'flat' ? theme.colors.textOnPrimary : theme.colors.text
                     }}
                  >
                    {t('flatBar')}
                  </button>
                  <button
                     onClick={() => handleBarSubTypeChange('square')}
                    className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
                    style={{
                      backgroundColor: barSubType === 'square' ? theme.colors.primary : theme.colors.surface,
                      color: barSubType === 'square' ? theme.colors.textOnPrimary : theme.colors.text
                    }}
                  >
                    {t('squareBar')}
                  </button>
                  <button
                     onClick={() => handleBarSubTypeChange('round')}
                    className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
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
                     className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
                    style={{
                      backgroundColor: profileSubType === 'standard' ? theme.colors.primary : theme.colors.surface,
                      color: profileSubType === 'standard' ? theme.colors.textOnPrimary : theme.colors.text
                     }}
                  >
                    {t('standardProfile')}
                  </button>
                  <button
                     onClick={() => setProfileSubType('pressBrakeU')}
                    className={`py-2 px-3 sm:px-2 text-center flex-1 rounded-t-md transition-colors text-base sm:text-base whitespace-nowrap`}
                    style={{
                      backgroundColor: profileSubType === 'pressBrakeU' ? theme.colors.primary : theme.colors.surface,
                      color: profileSubType === 'pressBrakeU' ? theme.colors.textOnPrimary : theme.colors.text
                    }}
                  >
                    {t('pressBrakeU')}
                  </button>
                </div>
               )}
            </div>
          )}
         {/* END Corrected Sub-tabs Block */}

          {/* Calculator and Results */}
          <div className="flex flex-col md:flex-row gap-4 min-h-0 flex-1">
            {/* Left side - Calculator */}
            <div className="flex-1 min-w-0 flex flex-col">
               {/* Only render calculator UIs for supported types */}
               {calculationType && (
                 <div className="rounded-lg p-2 sm:p-3 border flex-1 min-h-0" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
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
                       onPressBrakeAngleDataChange={setPressBrakeAngleData}
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
            <div className="flex flex-col justify-between w-full max-w-full md:max-w-[320px] lg:max-w-[420px] md:flex-[0_1_320px] lg:flex-[0_1_420px] flex-shrink-0 min-w-0 space-y-1">
              {/* Pricing Inputs */}
              <div className="rounded-lg p-2 sm:p-2 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                 <PricingInputs
                  pricePerKg={pricePerKg}
                  setPricePerKg={setPricePerKg}
                  quantity={quantity}
                  setQuantity={setQuantity}
                />
               </div>

              {/* Results */}
              <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                <h3 className="text-base font-medium mb-3" style={{ color: theme.colors.text }}>{t('results')}</h3>
                <div className="space-y-4">
                   <div>
                    <h4 className="text-base uppercase font-medium mb-1" style={{ color: theme.colors.textLight }}>{t('weight')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <div className="text-base" style={{ color: theme.colors.textLight }}>{t('singlePiece')}</div>
                        <div className="text-base font-semibold" style={{ color: theme.colors.text }}>{weight.toFixed(2)} kg</div>
                      </div>
                      <div>
                         <div className="text-base" style={{ color: theme.colors.textLight }}>{t('total')}</div>
                        <div className="text-base font-semibold" style={{ color: theme.colors.text }}>{totalWeight.toFixed(2)} kg</div>
                      </div>
                    </div>
                   </div>

                  <div>
                    <h4 className="text-base uppercase font-medium mb-1" style={{ color: theme.colors.textLight }}>{t('price')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <div className="text-base" style={{ color: theme.colors.textLight }}>{t('singlePiece')}</div>
                        <div className="text-base font-semibold" style={{ color: theme.colors.text }}>${piecePrice.toFixed(2)}</div>
                      </div>
                      <div>
                         <div className="text-base" style={{ color: theme.colors.textLight }}>{t('total')}</div>
                        <div className="text-base font-semibold" style={{ color: theme.colors.primary }}>${totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                   </div>

                  <button
                    onClick={handleSaveCalculation}
                    disabled={!calculationType || !selectedMaterial || isCalculating || showProgress || isSaving}
                    className="w-full py-2 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.textOnPrimary
                    }}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-4">
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

         {/* Saved Calculations - Sidebar only */}
        <div className="flex flex-col w-full max-w-full md:max-w-[320px] lg:max-w-[420px] md:flex-[0_1_320px] lg:flex-[0_1_420px] flex-shrink-0 min-w-[220px] p-0.5 md:p-1 h-full">
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