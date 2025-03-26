import { profileWeights } from '../data/profileWeights';

/**
 * Calculate the weight of a plate based on dimensions and density
 * @param {Object} plateData - The plate dimensions
 * @param {string} unit - The unit of measurement ('mm' or 'in')
 * @param {number} density - The density of the material in g/cm³
 * @returns {number} - The weight in kg
 */
export const calculatePlateWeight = (plateData, unit, density) => {
  if (!plateData.width || !plateData.length || !plateData.thickness) return 0;

  let { width, length, thickness } = plateData;
  
  // Convert to mm if using inches
  if (unit === 'in') {
    width = width * 25.4;
    length = length * 25.4;
    thickness = thickness * 25.4;
  }
  
  // Calculate volume in cm³ (convert mm to cm by dividing by 10)
  const volume = (width / 10) * (length / 10) * (thickness / 10);
  
  // Calculate weight (volume in cm³ * density in g/cm³ / 1000 to get kg)
  return volume * density / 1000;
};

/**
 * Calculate the weight of a profile based on type, size, length and density
 * @param {Object} profileData - The profile data
 * @param {string} unit - The unit of measurement ('mm' or 'in')
 * @param {number} density - The density of the material in g/cm³
 * @returns {number} - The weight in kg
 */
export const calculateProfileWeight = (profileData, unit, density) => {
  if (!profileData.type || !profileData.size || !profileData.length) return 0;
  
  try {
    // Get the weight per meter from the profileWeights data
    const weightPerMeter = profileWeights[profileData.size];
    if (!weightPerMeter) {
      console.error(`Invalid profile size: ${profileData.size}`);
      return 0;
    }
    
    let length = profileData.length;
    
    // Convert to mm if using inches
    if (unit === 'in') {
      length = length * 25.4;
    }
    
    // Convert mm to m
    length = length / 1000;
    
    // Calculate weight (weightPerMeter * length)
    // Adjust for density if not steel (steel density is 7.85 g/cm³)
    const densityFactor = density / 7.85;
    return weightPerMeter * length * densityFactor;
  } catch (error) {
    console.error('Error calculating profile weight:', error);
    return 0;
  }
};

/**
 * Calculate the weight of a pipe based on dimensions and density
 * @param {Object} pipeData - The pipe dimensions
 * @param {string} unit - The unit of measurement ('mm' or 'in')
 * @param {number} density - The density of the material in g/cm³
 * @returns {number} - The weight in kg
 */
export const calculatePipeWeight = (pipeData, unit, density) => {
  if (!pipeData.type || !pipeData.thickness || !pipeData.length) return 0;

  // Convert all dimensions to meters
  const length = unit === 'mm' ? pipeData.length / 1000 : pipeData.length * 0.0254;
  const thickness = unit === 'mm' ? pipeData.thickness / 1000 : pipeData.thickness * 0.0254;

  let crossSectionalArea = 0;

  if (pipeData.type === 'round') {
    const outerDiameter = unit === 'mm' ? pipeData.outerDiameter / 1000 : pipeData.outerDiameter * 0.0254;
    const innerDiameter = outerDiameter - (2 * thickness);
    // Ensure inner diameter is not negative
    if (innerDiameter <= 0) return 0;
    crossSectionalArea = Math.PI * ((Math.pow(outerDiameter, 2) - Math.pow(innerDiameter, 2)) / 4);
  } else if (pipeData.type === 'square') {
    const side = unit === 'mm' ? pipeData.size / 1000 : pipeData.size * 0.0254;
    const innerSide = side - (2 * thickness);
    // Ensure inner dimensions are not negative
    if (innerSide <= 0) return 0;
    crossSectionalArea = Math.pow(side, 2) - Math.pow(innerSide, 2);
  } else if (pipeData.type === 'rectangular') {
    const width = unit === 'mm' ? pipeData.width / 1000 : pipeData.width * 0.0254;
    const height = unit === 'mm' ? pipeData.height / 1000 : pipeData.height * 0.0254;
    const innerWidth = width - (2 * thickness);
    const innerHeight = height - (2 * thickness);
    // Ensure inner dimensions are not negative
    if (innerWidth <= 0 || innerHeight <= 0) return 0;
    crossSectionalArea = (width * height) - (innerWidth * innerHeight);
  }

  // Convert to kg (density is in g/cm³, so multiply by 1000 to get kg/m³)
  return crossSectionalArea * length * density * 1000;
};

/**
 * Calculate the weight of an angle based on dimensions and density
 * @param {Object} angleData - The angle dimensions
 * @param {string} unit - The unit of measurement ('mm' or 'in')
 * @param {number} density - The density of the material in g/cm³
 * @returns {number} - The weight in kg
 */
export const calculateAngleWeight = (angleData, unit, density) => {
  if (!angleData.type || !angleData.thickness || !angleData.length) return 0;
  
  let { thickness, length } = angleData;
  
  // Convert to mm if using inches
  if (unit === 'in') {
    thickness = thickness * 25.4;
    length = length * 25.4;
  }
  
  let volume = 0;
  
  if (angleData.type === 'equal' && angleData.width) {
    let { width } = angleData;
    
    if (unit === 'in') {
      width = width * 25.4;
    }
    
    // Calculate cross-sectional area in cm²
    // For equal angle: 2 * width * thickness - thickness²
    const area = (2 * width * thickness - thickness * thickness) / 100;
    
    // Calculate volume in cm³
    volume = area * (length / 10);
  } 
  else if (angleData.type === 'unequal' && angleData.width && angleData.height) {
    let { width, height } = angleData;
    
    if (unit === 'in') {
      width = width * 25.4;
      height = height * 25.4;
    }
    
    // Calculate cross-sectional area in cm²
    // For unequal angle: (width + height) * thickness - thickness²
    const area = ((width + height) * thickness - thickness * thickness) / 100;
    
    // Calculate volume in cm³
    volume = area * (length / 10);
  }
  
  // Calculate weight (volume in cm³ * density in g/cm³ / 1000 to get kg)
  return volume * density / 1000;
};

/**
 * Calculate the weight of a bar based on dimensions and density
 * @param {Object} barData - The bar dimensions
 * @param {string} unit - The unit of measurement ('mm' or 'in')
 * @param {number} density - The density of the material in g/cm³
 * @returns {number} - The weight in kg
 */
export const calculateBarWeight = (barData, unit, density) => {
  if (!barData.length) return 0;
  
  let { length } = barData;
  
  // Convert to mm if using inches
  if (unit === 'in') {
    length = length * 25.4;
  }
  
  let volume = 0;
  
  if (barData.type === 'flat' && barData.width && barData.height) {
    let { width, height } = barData;
    
    if (unit === 'in') {
      width = width * 25.4;
      height = height * 25.4;
    }
    
    // Calculate cross-sectional area in cm²
    const area = (width / 10) * (height / 10);
    
    // Calculate volume in cm³
    volume = area * (length / 10);
  }
  else if (barData.type === 'round' && barData.diameter) {
    let { diameter } = barData;
    
    if (unit === 'in') {
      diameter = diameter * 25.4;
    }
    
    // Calculate cross-sectional area in cm²
    const area = Math.PI * Math.pow(diameter / 20, 2);
    
    // Calculate volume in cm³
    volume = area * (length / 10);
  }
  else if (barData.type === 'square' && barData.sideLength) {
    let { sideLength } = barData;
    
    if (unit === 'in') {
      sideLength = sideLength * 25.4;
    }
    
    // Calculate cross-sectional area in cm²
    const area = Math.pow(sideLength / 10, 2);
    
    // Calculate volume in cm³
    volume = area * (length / 10);
  }
  
  // Calculate weight (volume in cm³ * density in g/cm³ / 1000 to get kg)
  return volume * density / 1000;
};

/**
 * Calculate total price based on weight, price per kg, and quantity
 * @param {number} weight - Weight in kg
 * @param {number} pricePerKg - Price per kg
 * @param {number} quantity - Quantity
 * @returns {number} - Total price
 */
export const calculateTotalPrice = (weight, pricePerKg, quantity) => {
  // Handle empty string or undefined values
  const weightValue = weight || 0;
  const priceValue = pricePerKg || 0;
  const quantityValue = quantity || 0;
  
  if (weightValue <= 0 || priceValue <= 0 || quantityValue <= 0) return 0;
  
  // Calculate total price (weight * pricePerKg * quantity)
  return Math.round(weightValue * priceValue * quantityValue * 100) / 100;
};
