import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

console.log('Generating PWA icons from SVG...');

// Check if Inkscape is installed
try {
  // Try to use Inkscape for better SVG to PNG conversion if available
  let inkscapeError = false;
  for (const size of iconSizes) {
    if (inkscapeError) break;
    
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    try {
      execSync(`inkscape --export-filename="${outputPath}" --export-width=${size} --export-height=${size} "${path.join(publicDir, 'logo.svg')}"`);
      console.log(`Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`Failed to generate ${size}x${size} icon with Inkscape: ${error.message}`);
      console.log('Please install Inkscape or manually convert the SVG to PNG icons.');
      console.log(`Required sizes: ${iconSizes.join(', ')}`);
      inkscapeError = true;
    }
  }
} catch (error) {
  console.error('Inkscape not found. Please install Inkscape or manually convert the SVG to PNG icons.');
  console.log(`Required sizes: ${iconSizes.join(', ')}`);
}

console.log('Icon generation complete!');
