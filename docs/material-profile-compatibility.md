# Material-Profile Compatibility System

## Overview

This system ensures that only realistic material-profile combinations are available in the metal calculator, based on industry standards and manufacturing practices.

## Implementation

### Configuration File
- `lib/material-profile-compatibility.ts` - Contains the mapping configuration
- Based on industry standards (AISC, ASTM, Aluminum Association)
- Easily extensible for new materials and profiles

### Components Updated
- `components/profile-selector.tsx` - Filters profiles based on material
- `components/material-selector.tsx` - Shows compatibility information
- `app/page.tsx` - Auto-corrects incompatible combinations

### Key Features
- **Automatic Filtering**: Only compatible profiles shown
- **Auto-Correction**: Invalid combinations automatically corrected
- **User Feedback**: Toast notifications for changes
- **Industry Accuracy**: Based on real manufacturing availability

## Material-Profile Compatibility Matrix

### Steel (Structural & Hot-Rolled)
**Available Profiles**: All structural profiles
- ✅ Beams: I-beams, H-beams, Wide Flange
- ✅ Channels: C-channels, MC channels
- ✅ Angles: Equal & Unequal angles
- ✅ Tubes: Square, rectangular, round
- ✅ Sheets: Flat, checkered plate
- ✅ Bars: Round, square, flat, hexagonal

**Rationale**: Steel is the most versatile structural material with excellent fabrication properties.

### Aluminum (6000 & 7000 series)
**Available Profiles**: Extrusion-friendly shapes
- ✅ Extrusions: T-slot, structural framing
- ✅ Angles: Equal & Unequal (lightweight applications)
- ✅ Tubes: Square, rectangular, round (thin walls)
- ✅ Channels: Standard structural channels
- ✅ Sheets: Flat sheets (marine, aerospace)
- ❌ Heavy I-beams: Not economical due to extrusion limits
- ❌ Wide Flange: Rarely available in aluminum

**Rationale**: Aluminum excels in extrusion but has limitations for large structural shapes.

### Copper (C110, C101)
**Available Profiles**: Simple shapes for electrical/plumbing
- ✅ Tubes: Round, square (plumbing, HVAC)
- ✅ Sheets: Flat sheets (roofing, electrical)
- ✅ Bars: Round, square, rectangular
- ❌ Structural Shapes: Too expensive and unnecessary
- ❌ Complex Profiles: Not cost-effective

**Rationale**: Copper is primarily used for electrical and plumbing applications.

### Brass (C360, C260)
**Available Profiles**: Decorative and precision applications
- ✅ Bars: Round, square, hexagonal (machining)
- ✅ Tubes: Round, square (decorative, precision)
- ✅ Sheets: Flat sheets (decorative applications)
- ❌ Structural Profiles: Too expensive for structural use

**Rationale**: Brass is used for decorative, marine, and precision machining applications.

## Adding New Materials

To add a new material:

1. **Research availability** from major suppliers (McMaster-Carr, Online Metals, etc.)
2. **Add to configuration** in `lib/material-profile-compatibility.ts`
3. **Follow the pattern**:
   ```typescript
   {
     materialKey: "new_material",
     compatibleProfiles: {
       "category_name": ["profile1", "profile2"],
       // ... other categories
     },
     notes: "Brief explanation of availability"
   }
   ```
4. **Update this documentation**

## Adding New Profiles

To add a new profile type:

1. **Add to PROFILES data** in `lib/metal-data.ts`
2. **Update compatibility mappings** for relevant materials
3. **Consider manufacturing constraints**:
   - Extrusion limits for aluminum
   - Rolling mill capabilities for steel
   - Cost-effectiveness for premium materials

## Maintenance Notes

### Regular Updates Needed
- **Supplier catalogs**: Check annual updates from major suppliers
- **Standards changes**: Monitor AISC, ASTM, and international standards
- **Market availability**: Some profiles may become more/less available

### Data Sources
- **AISC Steel Construction Manual**: Structural steel shapes
- **Aluminum Association Standards**: Aluminum extrusion capabilities
- **Supplier catalogs**: McMaster-Carr, Online Metals, Metal Supermarkets
- **Industry publications**: Modern Metals, The Fabricator

### Testing Compatibility
Run the calculator with various material-profile combinations to ensure:
- ✅ Compatible combinations work smoothly
- ✅ Incompatible combinations are auto-corrected
- ✅ User feedback is helpful and accurate
- ✅ No material has zero compatible profiles

## Performance Considerations

The compatibility system is designed for efficiency:
- **Compile-time configuration**: No runtime API calls
- **Minimal overhead**: Simple array lookups
- **Caching ready**: Easy to add caching if needed
- **Scalable**: Linear complexity for new materials/profiles 