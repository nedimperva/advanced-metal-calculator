import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';
import { JSDOM } from 'jsdom';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const iconsDir = path.join(publicDir, 'icons');

// Ensure the icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Define icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons using canvas fallback method...');

// Read the SVG file
const svgContent = fs.readFileSync(path.join(publicDir, 'logo.svg'), 'utf8');

// Function to convert SVG to PNG using canvas
async function convertSvgToPng(svgContent, size) {
  const dom = new JSDOM();
  const window = dom.window;
  
  // Create a canvas with the desired size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create an image element to load the SVG
  const img = new window.Image();
  
  // Convert SVG to data URL
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0, size, size);
      
      // Convert canvas to PNG buffer
      const pngBuffer = canvas.toBuffer('image/png');
      
      // Revoke the object URL to free memory
      URL.revokeObjectURL(url);
      
      resolve(pngBuffer);
    };
    
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    
    img.src = url;
  });
}

// Generate icons for each size
async function generateIcons() {
  for (const size of iconSizes) {
    try {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      const pngBuffer = await convertSvgToPng(svgContent, size);
      fs.writeFileSync(outputPath, pngBuffer);
      console.log(`Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`Failed to generate ${size}x${size} icon: ${error.message}`);
    }
  }
  console.log('Icon generation complete!');
}

generateIcons().catch(error => {
  console.error('Error generating icons:', error);
});
