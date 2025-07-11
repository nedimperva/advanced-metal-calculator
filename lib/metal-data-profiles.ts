// Profile types with their specific dimension requirements
export const PROFILES = {
  basic: {
    name: "Basic Shapes",
    types: {
      rectangular: { name: "Rectangular Bar", dimensions: ["width", "height"] },
      round: { name: "Round Bar", dimensions: ["diameter"] },
      square: { name: "Square Bar", dimensions: ["side"] },
      flat: { name: "Flat Bar", dimensions: ["width", "thickness"] },
      hexagonal: { name: "Hexagonal Bar", dimensions: ["distance"] },
    },
  },
  beams: {
    name: "I-Beams & H-Beams",
    types: {
      ipn: { name: "IPN - I-Beam Narrow (European)", dimensions: ["h", "b", "tw", "tf", "r"] },
      ipe: { name: "IPE - I-Beam European Standard", dimensions: ["h", "b", "tw", "tf", "r"] },
      hea: { name: "HEA - H-Beam Series A (European)", dimensions: ["h", "b", "tw", "tf", "r"] },
      heb: { name: "HEB - H-Beam Series B (European)", dimensions: ["h", "b", "tw", "tf", "r"] },
      hec: { name: "HEC - H-Beam Series C (European)", dimensions: ["h", "b", "tw", "tf", "r"] },
      wBeam: { name: "W-Beam (AISC/American)", dimensions: ["h", "b", "tw", "tf"] },
    },
  },
  channels: {
    name: "Channels & Angles",
    types: {
      upn: { name: "UPN - U-Channel Normal (European)", dimensions: ["h", "b", "tw", "tf", "r"] },
      uChannel: { name: "C-Channel (American)", dimensions: ["h", "b", "tw", "tf"] },
      equalAngle: { name: "Equal Angle (L)", dimensions: ["a", "t", "r"] },
      unequalAngle: { name: "Unequal Angle (L)", dimensions: ["a", "b", "t", "r"] },
    },
  },
  hollow: {
    name: "Hollow Sections",
    types: {
      rhs: { name: "RHS - Rectangular Hollow Section", dimensions: ["h", "b", "t"] },
      shs: { name: "SHS - Square Hollow Section", dimensions: ["a", "t"] },
      chs: { name: "CHS - Circular Hollow Section", dimensions: ["od", "t"] },
      pipe: { name: "Pipe (Schedule)", dimensions: ["od", "wt"] },
    },
  },
  special: {
    name: "Special Sections",
    types: {
      tBeam: { name: "T-Beam", dimensions: ["h", "b", "tw", "tf"] },
      bulbFlat: { name: "Bulb Flat", dimensions: ["h", "b", "t"] },
      halfRound: { name: "Half Round", dimensions: ["d", "t"] },
    },
  },
  plates: {
    name: "Steel Plates",
    types: {
      plate: { name: "Steel Plate", dimensions: ["length", "width", "thickness"] },
      sheetMetal: { name: "Sheet Metal", dimensions: ["length", "width", "thickness"] },
      checkeredPlate: { name: "Checkered Plate", dimensions: ["length", "width", "thickness"] },
      perforatedPlate: { name: "Perforated Plate", dimensions: ["length", "width", "thickness"] },
    },
  },
}

// Standard sizes for common profiles
export const STANDARD_SIZES = {
  // European I-Beams Narrow Profile  
  ipn: [
    { designation: "IPN 80", dimensions: { h: "80", b: "42", tw: "3.9", tf: "5.9", r: "3.9" } },
    { designation: "IPN 100", dimensions: { h: "100", b: "50", tw: "4.5", tf: "6.8", r: "4.5" } },
    { designation: "IPN 120", dimensions: { h: "120", b: "58", tw: "5.1", tf: "7.7", r: "5.1" } },
    { designation: "IPN 140", dimensions: { h: "140", b: "66", tw: "5.7", tf: "8.6", r: "5.7" } },
    { designation: "IPN 160", dimensions: { h: "160", b: "74", tw: "6.3", tf: "9.5", r: "6.3" } },
    { designation: "IPN 180", dimensions: { h: "180", b: "82", tw: "6.9", tf: "10.4", r: "6.9" } },
    { designation: "IPN 200", dimensions: { h: "200", b: "90", tw: "7.5", tf: "11.3", r: "7.5" } },
    { designation: "IPN 220", dimensions: { h: "220", b: "98", tw: "8.1", tf: "12.2", r: "8.1" } },
    { designation: "IPN 240", dimensions: { h: "240", b: "106", tw: "8.7", tf: "13.1", r: "8.7" } },
    { designation: "IPN 260", dimensions: { h: "260", b: "113", tw: "9.4", tf: "14.1", r: "9.4" } },
    { designation: "IPN 280", dimensions: { h: "280", b: "119", tw: "10.1", tf: "15.2", r: "10.1" } },
    { designation: "IPN 300", dimensions: { h: "300", b: "125", tw: "10.8", tf: "16.2", r: "10.8" } },
    { designation: "IPN 320", dimensions: { h: "320", b: "131", tw: "11.5", tf: "17.3", r: "11.5" } },
    { designation: "IPN 340", dimensions: { h: "340", b: "137", tw: "12.2", tf: "18.3", r: "12.2" } },
    { designation: "IPN 360", dimensions: { h: "360", b: "143", tw: "13.0", tf: "19.5", r: "13.0" } },
    { designation: "IPN 380", dimensions: { h: "380", b: "149", tw: "13.7", tf: "20.5", r: "13.7" } },
    { designation: "IPN 400", dimensions: { h: "400", b: "155", tw: "14.4", tf: "21.6", r: "14.4" } },
    { designation: "IPN 450", dimensions: { h: "450", b: "170", tw: "16.2", tf: "24.3", r: "16.2" } },
    { designation: "IPN 500", dimensions: { h: "500", b: "185", tw: "18.0", tf: "27.0", r: "18.0" } },
    { designation: "IPN 550", dimensions: { h: "550", b: "200", tw: "19.0", tf: "30.0", r: "19.0" } },
    { designation: "IPN 600", dimensions: { h: "600", b: "215", tw: "21.6", tf: "32.4", r: "21.6" } },
  ],
  // European I-Beams IPE Series
  ipe: [
    { designation: "IPE 80", dimensions: { h: "80", b: "46", tw: "3.8", tf: "5.2", r: "5" } },
    { designation: "IPE 100", dimensions: { h: "100", b: "55", tw: "4.1", tf: "5.7", r: "7" } },
    { designation: "IPE 120", dimensions: { h: "120", b: "64", tw: "4.4", tf: "6.3", r: "7" } },
    { designation: "IPE 140", dimensions: { h: "140", b: "73", tw: "4.7", tf: "6.9", r: "7" } },
    { designation: "IPE 160", dimensions: { h: "160", b: "82", tw: "5.0", tf: "7.4", r: "9" } },
    { designation: "IPE 180", dimensions: { h: "180", b: "91", tw: "5.3", tf: "8.0", r: "9" } },
    { designation: "IPE 200", dimensions: { h: "200", b: "100", tw: "5.6", tf: "8.5", r: "12" } },
    { designation: "IPE 220", dimensions: { h: "220", b: "110", tw: "5.9", tf: "9.2", r: "12" } },
    { designation: "IPE 240", dimensions: { h: "240", b: "120", tw: "6.2", tf: "9.8", r: "15" } },
    { designation: "IPE 270", dimensions: { h: "270", b: "135", tw: "6.6", tf: "10.2", r: "15" } },
    { designation: "IPE 300", dimensions: { h: "300", b: "150", tw: "7.1", tf: "10.7", r: "15" } },
    { designation: "IPE 330", dimensions: { h: "330", b: "160", tw: "7.5", tf: "11.5", r: "18" } },
    { designation: "IPE 360", dimensions: { h: "360", b: "170", tw: "8.0", tf: "12.7", r: "18" } },
    { designation: "IPE 400", dimensions: { h: "400", b: "180", tw: "8.6", tf: "13.5", r: "21" } },
    { designation: "IPE 450", dimensions: { h: "450", b: "190", tw: "9.4", tf: "14.6", r: "21" } },
    { designation: "IPE 500", dimensions: { h: "500", b: "200", tw: "10.2", tf: "16.0", r: "21" } },
    { designation: "IPE 550", dimensions: { h: "550", b: "210", tw: "11.1", tf: "17.2", r: "24" } },
    { designation: "IPE 600", dimensions: { h: "600", b: "220", tw: "12.0", tf: "19.0", r: "24" } },
  ],
  // Additional standard sizes would continue here...
  // For brevity, I'll include just the key ones
  
  // European H-Beams Series A (Lighter)
  hea: [
    { designation: "HEA 100", dimensions: { h: "96", b: "100", tw: "5", tf: "8", r: "12" } },
    { designation: "HEA 120", dimensions: { h: "114", b: "120", tw: "5", tf: "8", r: "12" } },
    { designation: "HEA 140", dimensions: { h: "133", b: "140", tw: "5.5", tf: "8.5", r: "12" } },
    { designation: "HEA 160", dimensions: { h: "152", b: "160", tw: "6", tf: "9", r: "15" } },
    { designation: "HEA 180", dimensions: { h: "171", b: "180", tw: "6", tf: "9.5", r: "15" } },
    { designation: "HEA 200", dimensions: { h: "190", b: "200", tw: "6.5", tf: "10", r: "18" } },
    { designation: "HEA 220", dimensions: { h: "210", b: "220", tw: "7", tf: "11", r: "18" } },
    { designation: "HEA 240", dimensions: { h: "230", b: "240", tw: "7.5", tf: "12", r: "21" } },
    { designation: "HEA 260", dimensions: { h: "250", b: "260", tw: "7.5", tf: "12.5", r: "24" } },
    { designation: "HEA 280", dimensions: { h: "270", b: "280", tw: "8", tf: "13", r: "24" } },
    { designation: "HEA 300", dimensions: { h: "290", b: "300", tw: "8.5", tf: "14", r: "27" } },
    // Additional sizes...
  ],
  
  // European H-Beams Series B (Heavier)
  heb: [
    { designation: "HEB 100", dimensions: { h: "100", b: "100", tw: "6", tf: "10", r: "12" } },
    { designation: "HEB 120", dimensions: { h: "120", b: "120", tw: "6.5", tf: "11", r: "12" } },
    { designation: "HEB 140", dimensions: { h: "140", b: "140", tw: "7", tf: "12", r: "12" } },
    { designation: "HEB 160", dimensions: { h: "160", b: "160", tw: "8", tf: "13", r: "15" } },
    { designation: "HEB 180", dimensions: { h: "180", b: "180", tw: "8.5", tf: "14", r: "15" } },
    { designation: "HEB 200", dimensions: { h: "200", b: "200", tw: "9", tf: "15", r: "18" } },
    { designation: "HEB 220", dimensions: { h: "220", b: "220", tw: "9.5", tf: "16", r: "18" } },
    { designation: "HEB 240", dimensions: { h: "240", b: "240", tw: "10", tf: "17", r: "21" } },
    { designation: "HEB 260", dimensions: { h: "260", b: "260", tw: "10", tf: "17.5", r: "24" } },
    { designation: "HEB 280", dimensions: { h: "280", b: "280", tw: "10.5", tf: "18", r: "24" } },
    { designation: "HEB 300", dimensions: { h: "300", b: "300", tw: "11", tf: "19", r: "27" } },
    // Additional sizes...
  ],
  
  // Equal Angles
  equalAngle: [
    { designation: "L20×20×3", dimensions: { a: "20", t: "3", r: "3.5" } },
    { designation: "L25×25×3", dimensions: { a: "25", t: "3", r: "3.5" } },
    { designation: "L30×30×3", dimensions: { a: "30", t: "3", r: "5" } },
    { designation: "L35×35×4", dimensions: { a: "35", t: "4", r: "5" } },
    { designation: "L40×40×4", dimensions: { a: "40", t: "4", r: "6" } },
    { designation: "L45×45×4.5", dimensions: { a: "45", t: "4.5", r: "7" } },
    { designation: "L50×50×5", dimensions: { a: "50", t: "5", r: "7" } },
    { designation: "L60×60×6", dimensions: { a: "60", t: "6", r: "8" } },
    { designation: "L70×70×7", dimensions: { a: "70", t: "7", r: "9" } },
    { designation: "L80×80×8", dimensions: { a: "80", t: "8", r: "10" } },
    { designation: "L90×90×9", dimensions: { a: "90", t: "9", r: "11" } },
    { designation: "L100×100×10", dimensions: { a: "100", t: "10", r: "12" } },
    { designation: "L120×120×12", dimensions: { a: "120", t: "12", r: "13" } },
    { designation: "L150×150×15", dimensions: { a: "150", t: "15", r: "16" } },
  ]
}