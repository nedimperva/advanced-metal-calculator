import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { materials } from '../../data/materials';
import { calculatePipeWeight, calculateProfileWeight, calculatePlateWeight, calculateAngleWeight, calculateBarWeight, calculatePressBrakeAngleWeight, calculatePressBrakeUWeight } from '../../utils/calculations';
import { generateCalculationName } from '../../utils/generateCalculationName';

// Import calculator components
import PlateCalculator from '../calculator/PlateCalculator';
import ProfileCalculator from '../calculator/ProfileCalculator';
import PipeCalculator from '../calculator/PipeCalculator';
import AngleCalculator from '../calculator/AngleCalculator';
import BarCalculator from '../calculator/BarCalculator';
import PressBrakeAngleCalculator from '../calculator/PressBrakeAngleCalculator';
import PressBrakeUCalculator from '../calculator/PressBrakeUCalculator';

const SETTINGS_KEY = 'amc_settings';

const ComponentSelector = ({ onAdd, onCancel }) => {
  const { t, language } = useLanguage();
  const [componentType, setComponentType] = useState('pipe');
  const [material, setMaterial] = useState('steel');
  const [quantity, setQuantity] = useState(1);
  const [pricePerKg, setPricePerKg] = useState(0);
  const [weight, setWeight] = useState(0);
  const [unit, setUnit] = useState('mm');
  
  // Load default price per kg from settings/localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.defaultPrice !== undefined) setPricePerKg(settings.defaultPrice);
      }
    } catch {}
  }, []);

  // Subtypes for various component categories
  const [pipeSubType, setPipeSubType] = useState('rectangular');
  const [angleSubType, setAngleSubType] = useState('equal');
  const [barSubType, setBarSubType] = useState('flat');
  const [profileSubType, setProfileSubType] = useState('standard');

  // Data states for different calculators
  const [plateData, setPlateData] = useState({ width: 1000, length: 2000, thickness: 3 });
  const [profileData, setProfileData] = useState({ type: 'hea', size: '100', length: 6000 });
  const [pipeData, setPipeData] = useState({ 
    type: 'rectangular', 
    outerDiameter: 33.7,
    size: 40,
    width: 40,
    height: 20,
    thickness: 1.8, 
    length: 6000 
  });
  const [angleData, setAngleData] = useState({ 
    type: 'equal', 
    width: 30, 
    height: 30, 
    thickness: 3, 
    length: 6000 
  });
  const [barData, setBarData] = useState({ 
    type: 'flat', 
    diameter: 12, 
    width: 30, 
    height: 5, 
    sideLength: 12, 
    length: 6000 
  });
  const [pressBrakeAngleData, setPressBrakeAngleData] = useState({ 
    width: 100, 
    height: 50, 
    thickness: 2, 
    length: 2000,
    angle: 90,
    radius: 2
  });
  const [pressBrakeUData, setPressBrakeUData] = useState({ 
    width: 100, 
    height: 50, 
    thickness: 2, 
    length: 2000,
    radius: 2,
    flangeWidth: 20
  });

  // Calculate weight when inputs change
  useEffect(() => {
    if (!material) return;
    
    const density = materials[material].density;
    let calculatedWeight = 0;

    try {
      switch (componentType) {
        case 'plate':
          calculatedWeight = calculatePlateWeight(plateData, unit, density);
          break;
        case 'profile':
          if (profileSubType === 'pressBrakeU') {
            // Use specific calculation for pressBrakeU
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
            // Use specific calculation for pressBrakeAngle
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
  }, [
    material, componentType, plateData, profileData, pipeData, 
    angleData, barData, pressBrakeAngleData, pressBrakeUData, 
    unit, angleSubType, profileSubType, language
  ]);

  // Update pipe data when subtype changes
  useEffect(() => {
    if (componentType === 'pipe') {
      setPipeData(prevData => ({
        ...prevData,
        type: pipeSubType
      }));
    }
  }, [pipeSubType, componentType]);

  // Update angle data when subtype changes
  useEffect(() => {
    if (componentType === 'angle') {
      setAngleData(prevData => ({
        ...prevData,
        type: angleSubType
      }));
    }
  }, [angleSubType, componentType]);

  // Update bar data when subtype changes
  useEffect(() => {
    if (componentType === 'bar') {
      setBarData(prevData => ({
        ...prevData,
        type: barSubType
      }));
    }
  }, [barSubType, componentType]);
  
  // Handle adding component with calculated data
  const handleAddComponent = (e) => {
    e.preventDefault();
    
    if (!weight || !quantity) return;
    
    // Build component object with appropriate data based on type
    let dimensions;
    let componentName = '';
    
    // Calculate total price for this component
    const totalPrice = parseFloat(pricePerKg) * parseFloat(weight) * parseInt(quantity);
    
    switch (componentType) {
      case 'plate':
        dimensions = { ...plateData };
        componentName = generateCalculationName('plate', plateData, unit, language);
        break;
      case 'profile':
        if (profileSubType === 'pressBrakeU') {
          dimensions = { ...pressBrakeUData };
          componentName = generateCalculationName('pressBrakeU', pressBrakeUData, unit, language);
        } else {
          dimensions = { ...profileData };
          componentName = generateCalculationName('profile', profileData, unit, language);
        }
        break;
      case 'pipe':
        dimensions = { ...pipeData };
        componentName = generateCalculationName('pipe', pipeData, unit, language);
        break;
      case 'angle':
        if (angleSubType === 'pressBrake') {
          dimensions = { ...pressBrakeAngleData };
          componentName = generateCalculationName('pressBrakeAngle', pressBrakeAngleData, unit, language);
        } else {
          dimensions = { ...angleData };
          componentName = generateCalculationName('angle', angleData, unit, language);
        }
        break;
      case 'bar':
        dimensions = { ...barData };
        componentName = generateCalculationName('bar', barData, unit, language);
        break;
      default:
        dimensions = {};
    }
    
    const newComponent = {
      id: Date.now().toString(),
      name: componentName,
      material,
      type: componentType,
      subType: componentType === 'profile' ? profileSubType :
               componentType === 'angle' ? angleSubType :
               componentType === 'pipe' ? pipeSubType :
               componentType === 'bar' ? barSubType : null,
      dimensions,
      weight: parseFloat(weight),
      quantity: parseInt(quantity),
      pricePerKg: parseFloat(pricePerKg),
      totalPrice: totalPrice
    };
    
    onAdd(newComponent);
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setWeight(0);
    setQuantity(1);
    // Reset price to default from settings
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.defaultPrice !== undefined) setPricePerKg(settings.defaultPrice);
      } else {
        setPricePerKg(0);
      }
    } catch { setPricePerKg(0); }
    
    // Reset to default values for each component type
    if (componentType === 'plate') {
      setPlateData({ width: 1000, length: 2000, thickness: 3 });
    } else if (componentType === 'profile') {
      if (profileSubType === 'pressBrakeU') {
        setPressBrakeUData({ 
          width: 100, 
          height: 50, 
          thickness: 2, 
          length: 2000,
          radius: 2,
          flangeWidth: 20
        });
      } else {
        setProfileData({ type: 'hea', size: '100', length: 6000 });
      }
    } else if (componentType === 'pipe') {
      setPipeData({ 
        type: pipeSubType, 
        outerDiameter: 33.7,
        size: 40,
        width: 40,
        height: 20,
        thickness: 1.8, 
        length: 6000 
      });
    } else if (componentType === 'angle') {
      if (angleSubType === 'pressBrake') {
        setPressBrakeAngleData({ 
          width: 100, 
          height: 50, 
          thickness: 2, 
          length: 2000,
          angle: 90,
          radius: 2
        });
      } else {
        setAngleData({ 
          type: angleSubType, 
          width: 30, 
          height: angleSubType === 'equal' ? 30 : 50, 
          thickness: 3, 
          length: 6000 
        });
      }
    } else if (componentType === 'bar') {
      setBarData({ 
        type: barSubType, 
        diameter: 12, 
        width: 30, 
        height: 5, 
        sideLength: 12, 
        length: 6000 
      });
    }
  };

  // Handle pipe sub-type change
  const handlePipeSubTypeChange = (subType) => {
    setPipeSubType(subType);
    
    // Update pipe data based on the selected subtype
    let updatedPipeData = { ...pipeData, type: subType };
    
    if (subType === 'round') {
      updatedPipeData = {
        ...updatedPipeData,
        outerDiameter: 33.7,
        thickness: 2.6
      };
    } else if (subType === 'square') {
      updatedPipeData = {
        ...updatedPipeData,
        size: 40,
        thickness: 2.0
      };
    } else { // rectangular
      updatedPipeData = {
        ...updatedPipeData,
        width: 40,
        height: 20,
        thickness: 1.8
      };
    }
    
    setPipeData(updatedPipeData);
  };

  // Handle angle sub-type change
  const handleAngleSubTypeChange = (subType) => {
    setAngleSubType(subType);
    
    if (subType === 'equal') {
      setAngleData({
        ...angleData,
        type: subType,
        width: 30,
        height: 30
      });
    } else if (subType === 'unequal') {
      setAngleData({
        ...angleData,
        type: subType,
        width: 50,
        height: 30
      });
    } else {
      // For pressBrake, we'll use the separate pressBrakeAngleData state
      // so no need to update angleData here
    }
  };

  // Handle bar sub-type change
  const handleBarSubTypeChange = (subType) => {
    setBarSubType(subType);
    
    if (subType === 'flat') {
      setBarData({
        ...barData,
        type: subType,
        width: 30,
        height: 5
      });
    } else if (subType === 'square') {
      setBarData({
        ...barData,
        type: subType,
        sideLength: 12
      });
    } else { // round
      setBarData({
        ...barData,
        type: subType,
        diameter: 12
      });
    }
  };

  // Handle component type change
  const handleComponentTypeChange = (type) => {
    setComponentType(type);
  };
  
  return (
    <div className="space-y-4">
      <div className="border-b pb-4" style={{ borderColor: theme.colors.border }}>
        <h3 className="text-lg font-medium mb-3" style={{ color: theme.colors.text }}>
          {t('addComponent')}
        </h3>
        
        {/* Material Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('materialLabel')}
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                outlineColor: theme.colors.primary
              }}
              required
            >
              {Object.keys(materials).map((key) => (
                <option key={key} value={key}>{t(key)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('quantity')}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full p-2 border rounded-md focus:ring-2"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                outlineColor: theme.colors.primary
              }}
              min="1"
              step="1"
              required
            />
          </div>
        </div>
        
        {/* Component Type Selection Tabs */}
        <div className="flex flex-wrap border rounded-md overflow-hidden" style={{ borderColor: theme.colors.border }}>
          <button
            type="button"
            onClick={() => handleComponentTypeChange('plate')}
            className={`py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base ${componentType !== 'plate' ? 'border-r' : ''}`}
            style={{ 
              backgroundColor: componentType === 'plate' ? theme.colors.primary : theme.colors.background,
              color: componentType === 'plate' ? theme.colors.textOnPrimary : theme.colors.text,
              borderColor: theme.colors.border
            }}
          >
            {t('plate')}
          </button>
          <button
            type="button"
            onClick={() => handleComponentTypeChange('profile')}
            className={`py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base ${componentType !== 'profile' ? 'border-r' : ''}`}
            style={{ 
              backgroundColor: componentType === 'profile' ? theme.colors.primary : theme.colors.background,
              color: componentType === 'profile' ? theme.colors.textOnPrimary : theme.colors.text,
              borderColor: theme.colors.border
            }}
          >
            {t('profile')}
          </button>
          <button
            type="button"
            onClick={() => handleComponentTypeChange('pipe')}
            className={`py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base ${componentType !== 'pipe' ? 'border-r' : ''}`}
            style={{ 
              backgroundColor: componentType === 'pipe' ? theme.colors.primary : theme.colors.background,
              color: componentType === 'pipe' ? theme.colors.textOnPrimary : theme.colors.text,
              borderColor: theme.colors.border
            }}
          >
            {t('pipe')}
          </button>
          <button
            type="button"
            onClick={() => handleComponentTypeChange('angle')}
            className={`py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base ${componentType !== 'angle' ? 'border-r' : ''}`}
            style={{ 
              backgroundColor: componentType === 'angle' ? theme.colors.primary : theme.colors.background,
              color: componentType === 'angle' ? theme.colors.textOnPrimary : theme.colors.text,
              borderColor: theme.colors.border
            }}
          >
            {t('angle')}
          </button>
          <button
            type="button"
            onClick={() => handleComponentTypeChange('bar')}
            className="py-2 px-2 sm:px-4 text-center flex-1 rounded-t-md transition-colors text-sm sm:text-base"
            style={{ 
              backgroundColor: componentType === 'bar' ? theme.colors.primary : theme.colors.background,
              color: componentType === 'bar' ? theme.colors.textOnPrimary : theme.colors.text
            }}
          >
            {t('bar')}
          </button>
        </div>
      </div>

      {/* Pipe Sub-Type Tabs */}
      {componentType === 'pipe' && (
        <div className="flex space-x-1 overflow-x-auto mb-4">
          <button
            type="button"
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
            type="button"
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
            type="button"
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
      {componentType === 'angle' && (
        <div className="flex space-x-1 overflow-x-auto mb-4">
          <button
            type="button"
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
            type="button"
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
            type="button"
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
      {componentType === 'bar' && (
        <div className="flex space-x-1 overflow-x-auto mb-4">
          <button
            type="button"
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
            type="button"
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
            type="button"
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
      {componentType === 'profile' && (
        <div className="flex space-x-1 overflow-x-auto mb-4">
          <button
            type="button"
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
            type="button"
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

      {/* Price per kg input */}
      <div className="rounded-lg p-3 sm:p-4 border mb-4" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="pricePerKg" className="text-sm font-medium" style={{ color: theme.colors.textLight }}>{t('pricePerKg')}:</label>
          <input
            id="pricePerKg"
            type="number"
            min="0"
            step="0.01"
            value={pricePerKg}
            onChange={e => setPricePerKg(e.target.value)}
            className="w-24 px-2 py-1 rounded border"
            style={{ borderColor: theme.colors.border }}
            placeholder={t('pricePerKg')}
          />
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: theme.colors.textLight }}>
            {t('calculatedWeight')}:
          </span>
          <span className="text-lg font-semibold" style={{ color: theme.colors.primary }}>
            {weight.toFixed(2)} kg
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: theme.colors.textLight }}>
            {t('totalComponentWeight')}:
          </span>
          <span className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            {(weight * quantity).toFixed(2)} kg
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: theme.colors.textLight }}>
            {t('totalPrice')}:
          </span>
          <span className="text-lg font-semibold" style={{ color: theme.colors.secondary }}>
            {(pricePerKg * weight * quantity).toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Calculator Components */}
      <div className="rounded-lg p-3 sm:p-4 border mb-4" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
        {componentType === 'plate' && (
          <PlateCalculator
            plateData={plateData}
            onPlateDataChange={setPlateData}
            unit={unit}
          />
        )}

        {componentType === 'profile' && profileSubType === 'standard' && (
          <ProfileCalculator
            profileData={profileData}
            onProfileDataChange={setProfileData}
            unit={unit}
          />
        )}

        {componentType === 'profile' && profileSubType === 'pressBrakeU' && (
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
        
        {componentType === 'pipe' && (
          <PipeCalculator
            pipeData={pipeData}
            onPipeDataChange={setPipeData}
            unit={unit}
          />
        )}

        {componentType === 'angle' && angleSubType !== 'pressBrake' && (
          <AngleCalculator
            angleData={angleData}
            onAngleDataChange={setAngleData}
            unit={unit}
          />
        )}

        {componentType === 'angle' && angleSubType === 'pressBrake' && (
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
        
        {componentType === 'bar' && (
          <BarCalculator
            barData={barData}
            onBarDataChange={setBarData}
            unit={unit}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 rounded-md text-sm"
          style={{ 
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`
          }}
        >
          {t('cancel')}
        </button>
        
        <button
          type="button"
          onClick={handleAddComponent}
          disabled={!weight || !quantity}
          className="py-2 px-4 rounded-md text-sm disabled:opacity-50"
          style={{ 
            backgroundColor: theme.colors.primary,
            color: theme.colors.textOnPrimary
          }}
        >
          {t('add')}
        </button>
      </div>
    </div>
  );
};

ComponentSelector.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

import styles from './productScrollbar.module.css';

export default ComponentSelector;