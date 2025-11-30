# Dog Angelenos Logo Guide

## Logo Files

### Primary Logo
- **File:** `/public/logo.svg`
- **Format:** SVG (Scalable Vector Graphics)
- **Dimensions:** 120x120px (scalable)
- **Usage:** Main logo for website header, admin portal, trainer portal

### Design Elements

The Dog Angelenos logo features:

1. **Sunset Circle Background**
   - Gradient stripes representing LA sunset
   - Colors: Yellow → Orange → Red → Pink → Purple
   - Symbolizes the vibrant LA lifestyle

2. **Palm Trees**
   - Silhouettes on left and right
   - Represents Los Angeles iconic scenery

3. **Dog Character**
   - Friendly, smiling dog face
   - Brown and white coloring
   - Wearing a yellow/gold jersey
   - Represents the friendly, professional training approach

4. **Color Palette**
   - Primary: Pink (#e91e63), Purple (#9c27b0)
   - Accent: Orange (#f39c12), Yellow (#f4e04d)
   - Neutral: Dark Navy (#1a1a2e)

## Usage Guidelines

### Header Navigation
```tsx
<img
  src="/logo.svg"
  alt="Dog Angelenos Logo"
  className="w-12 h-12"
/>
```

### Login Page
```tsx
<img
  src="/logo.svg"
  alt="Dog Angelenos Logo"
  className="w-24 h-24 mx-auto"
/>
```

### Admin/Trainer Portal
```tsx
<img
  src="/logo.svg"
  alt="Dog Angelenos Logo"
  className="w-10 h-10"
/>
```

## Size Variations

- **Header:** 48x48px (w-12 h-12)
- **Login/Hero:** 96x96px (w-24 h-24)
- **Portal Headers:** 40x40px (w-10 h-10)
- **Favicon:** 32x32px or 16x16px

## Brand Colors

### Primary Gradient
```css
background: linear-gradient(to right, #e91e63, #9c27b0);
```

### Sunset Gradient
```css
background: linear-gradient(to bottom, 
  #f4e04d,  /* Yellow */
  #f39c12,  /* Orange */
  #e74c3c,  /* Red */
  #e91e63,  /* Pink */
  #9c27b0,  /* Purple */
  #673ab7   /* Deep Purple */
);
```

## File Locations

- Main Logo: `apps/dogangelenos/frontend/public/logo.svg`
- Favicon: `apps/dogangelenos/frontend/public/favicon.ico`
- Header Component: `apps/dogangelenos/frontend/app/components/Header.tsx`

## Future Enhancements

1. Create PNG versions for email and social media
2. Create favicon.ico from SVG
3. Add logo variations (white version for dark backgrounds)
4. Create app icons for mobile (if needed)
5. Add logo animation for loading states

## Notes

- The logo is optimized for web use
- SVG format ensures crisp display on all screen sizes
- Maintains brand consistency across all pages
- Represents LA culture with sunset and palm trees
- Friendly dog character appeals to target audience
