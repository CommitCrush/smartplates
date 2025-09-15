# SmartPlates Responsive Design Guide

## Overview

This guide documents the comprehensive responsive design system implemented across SmartPlates, following Mobile-First principles and ensuring optimal user experience across all device sizes.

## Breakpoint System

### Mobile-First Breakpoints

```css
/* Breakpoint Definitions (from responsive.ts) */
mobile: '0px',        // 0-639px    - Primary mobile devices
sm: '640px',          // 640-767px  - Large mobile/small tablet
md: '768px',          // 768-1023px - Tablet landscape
lg: '1024px',         // 1024-1279px - Small desktop
xl: '1280px',         // 1280-1535px - Large desktop  
'2xl': '1536px'       // 1536px+    - Extra large screens
```

### Device Targeting

- **Mobile (320-639px)**: Single column layouts, large touch targets, simplified navigation
- **Small Tablet (640-767px)**: 2-column grids, enhanced typography, improved spacing
- **Tablet (768-1023px)**: 3-column layouts, sidebar content, desktop-like interactions
- **Desktop (1024px+)**: Multi-column layouts, hover states, complex interactions

## Responsive Typography Scale

### Heading Hierarchy

```css
/* Mobile-First Typography Scaling */
H1 (Hero): text-3xl sm:text-4xl md:text-5xl lg:text-6xl
H2 (Section): text-2xl sm:text-3xl md:text-4xl lg:text-5xl
H3 (Component): text-lg sm:text-xl md:text-2xl
Body Large: text-base sm:text-lg md:text-xl
Body Regular: text-sm sm:text-base
Small Text: text-xs sm:text-sm
```

### Line Height Optimization

- **Mobile**: `leading-tight` for headlines, `leading-relaxed` for body text
- **Desktop**: `leading-normal` for most content with improved readability

## Spacing & Layout Patterns

### Container Responsive Padding

```css
/* Progressive Padding Enhancement */
px-4 sm:px-6 lg:px-8           # Horizontal padding
py-12 sm:py-16 md:py-20 lg:py-24  # Vertical padding
```

### Grid Responsive Patterns

```css
/* Common Grid Patterns */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3     # Content cards
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4     # Feature cards
grid-cols-1 md:grid-cols-2 xl:grid-cols-3     # Article layout
```

### Gap Scaling

```css
gap-4 sm:gap-6 md:gap-8 lg:gap-10    # Progressive gap increase
gap-6 sm:gap-8                       # Simple two-step scaling
```

## Touch Target Optimization

### Minimum Touch Target Sizes

```css
/* WCAG AA Compliant Touch Targets */
min-h-[44px]          # Minimum mobile touch target
min-h-[48px]          # Recommended mobile target
min-h-[48px] sm:min-h-[56px]  # Progressive enhancement
```

### Button Responsive Sizing

```css
/* Touch-Friendly Button Pattern */
inline-flex items-center gap-2 
px-6 py-3 sm:px-8 sm:py-4
min-h-[48px] sm:min-h-[56px]
text-base sm:text-lg
touch-manipulation
```

## Component Responsive Patterns

### Navigation

- **Mobile**: Hamburger menu, vertical stack, simplified options
- **Desktop**: Horizontal navigation, full menu visibility, hover states

### Cards & Content

```css
/* Card Responsive Enhancement */
p-4 sm:p-6                    # Progressive padding
text-sm sm:text-base          # Typography scaling
mb-3 sm:mb-4                  # Margin scaling
```

### Images & Media

```css
/* Responsive Image Patterns */
aspect-video                  # Consistent aspect ratios
h-12 w-12 sm:h-16 sm:w-16    # Icon scaling
object-cover                  # Image fitting
```

## Accessibility Considerations

### Focus Management

- Visible focus rings on all interactive elements
- Logical tab order maintained across breakpoints
- Skip links provided for keyboard navigation

### Screen Reader Support

- Semantic HTML structure preserved at all sizes
- ARIA labels and descriptions maintained
- Role attributes for complex layouts

### Color Contrast

- WCAG AA compliance maintained across all breakpoints
- High contrast mode support via CSS custom properties
- Color alone never used to convey information

## Performance Optimization

### Mobile-First Loading

- Critical CSS for mobile viewport loaded first
- Progressive enhancement for larger screens
- Reduced layout shift through consistent sizing

### Image Optimization

- Responsive images with appropriate sizing
- Lazy loading for non-critical content
- WebP format with fallbacks

## Testing Strategy

### Device Testing

- **Physical Devices**: iPhone SE, iPhone 14, iPad, MacBook
- **Browser DevTools**: Chrome, Firefox, Safari responsive modes
- **Screen Readers**: VoiceOver (iOS), TalkBack (Android)

### Breakpoint Validation

- Test all major breakpoint transitions
- Verify touch target accessibility
- Confirm readable text at all sizes
- Validate interactive element functionality

## Implementation Examples

### Homepage Hero Section

```tsx
<div className="text-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 md:pt-40 lg:pt-52">
  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
    Smart Cooking Made Simple
  </h1>
  <p className="text-base sm:text-lg md:text-xl mt-4 sm:mt-6 max-w-full sm:max-w-2xl mx-auto">
    Plan meals, discover recipes, and cook with confidence using AI-powered suggestions.
  </p>
  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 justify-center">
    <button className="px-6 py-3 sm:px-8 sm:py-4 min-h-[48px] sm:min-h-[56px]">
      Get Started Free
    </button>
  </div>
</div>
```

### Features Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
  <div className="text-center p-4 sm:p-0">
    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
      <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
    </div>
    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
      Feature Title
    </h3>
    <p className="text-sm sm:text-base leading-relaxed">
      Feature description text
    </p>
  </div>
</div>
```

## Common Patterns Documentation

### Responsive Container

```css
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Responsive Section Spacing

```css
py-12 sm:py-16 md:py-20 lg:py-24
```

### Responsive Text Margins

```css
mb-3 sm:mb-4 md:mb-6    # Progressive margin increase
mb-6 sm:mb-8 md:mb-12   # Larger margin scaling
```

### Responsive Grid Gaps

```css
gap-4 sm:gap-6 lg:gap-8       # Standard progression
gap-6 sm:gap-8 md:gap-10      # Enhanced progression
```

## Best Practices

### Mobile-First Approach

1. **Start with mobile design**: Design and implement for smallest screen first
2. **Progressive enhancement**: Add complexity for larger screens
3. **Touch-first interactions**: Design for finger navigation primarily

### Performance Considerations

1. **Minimize layout shifts**: Use consistent sizing across breakpoints
2. **Optimize critical path**: Load mobile styles first
3. **Progressive loading**: Enhance functionality for larger screens

### Accessibility Priority

1. **Maintain focus order**: Ensure logical navigation at all sizes
2. **Preserve semantics**: Keep HTML structure meaningful across breakpoints
3. **Test with assistive technology**: Verify functionality with screen readers

## Maintenance Guidelines

### Adding New Responsive Components

1. Follow established breakpoint patterns
2. Use documented spacing scales
3. Implement mobile-first approach
4. Test across all breakpoint transitions
5. Validate accessibility compliance

### Updating Existing Components

1. Maintain backward compatibility
2. Test impact on related components
3. Update documentation as needed
4. Verify performance implications

---

This responsive design guide ensures consistent, accessible, and performant user experiences across all devices while maintaining the SmartPlates design system integrity.
