# Implementation Plan

- [x] 1. Prepare assets and project structure
  - Export and place background image (dogangelenos-bg.jpg) in /public folder
  - Export and place three dog images (dog-left.png, dog-center.png, dog-right.png) as transparent PNGs in /public folder
  - Verify Framer Motion is installed in package.json
  - Verify Tailwind CSS is configured
  - _Requirements: 1.4, 2.6_

- [x] 2. Create dog data configuration
  - Define TypeScript interfaces for DogData with id, name, imagePath, position, and animationDelay properties
  - Create dogsConfig array with three dog objects (Sunny at 20%, Max at 50%, Luna at 80%)
  - Set unique animation delays for each dog (0s, 0.3s, 0.6s)
  - _Requirements: 2.2, 2.3, 2.4, 3.4, 6.5_

- [x] 3. Implement hero section layout
  - Create full viewport height container with relative positioning
  - Add background image with cover sizing and center positioning
  - Implement dark gradient overlay for contrast
  - Ensure proper z-index layering (background → overlay → dogs)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3.1 Write unit tests for hero layout
  - Test hero section has 100vh height
  - Test background image path is correct
  - Test overlay gradient is present
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Implement dog components with positioning
  - Map over dogsConfig to render three dog elements
  - Apply absolute positioning with percentage-based left values
  - Position dogs near bottom of viewport using bottom property
  - Use Next.js Image component or img tags for dog images
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4.1 Write property test for dog positioning
  - **Property 1: All dogs have bottom positioning**
  - **Validates: Requirements 2.5**

- [x] 4.2 Write unit tests for dog rendering
  - Test exactly three dogs render
  - Test correct image paths for each dog
  - Test specific positioning values (20%, 50%, 80%)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

- [x] 5. Implement floating animations
  - Wrap each dog in Framer Motion's motion.div
  - Configure animate prop with y: [0, -12, 0] for vertical float
  - Set transition with infinite repeat and easeInOut easing
  - Apply unique animationDelay from dogsConfig to each dog
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5.1 Write property test for floating animation
  - **Property 3: All dogs have floating animation**
  - **Validates: Requirements 3.1**

- [x] 5.2 Write property test for animation timing
  - **Property 4: Animation timing varies between dogs**
  - **Validates: Requirements 3.4**

- [x] 5.3 Write unit tests for animation configuration
  - Test animation uses y: [0, -12, 0]
  - Test infinite repeat is set
  - Test easeInOut easing is applied
  - Test Framer Motion components are used
  - _Requirements: 3.2, 3.3, 3.5_

- [x] 6. Implement hover interactions
  - Add whileHover prop to each dog's motion.div
  - Configure scale increase (e.g., scale: 1.15)
  - Configure rotation wiggle (e.g., rotate: [-2, 2, -2])
  - Set transition duration to less than 0.5 seconds
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.1 Write property test for hover effects
  - **Property 5: Hover triggers visual changes**
  - **Validates: Requirements 4.1, 4.2**

- [x] 6.2 Write property test for hover reversibility
  - **Property 6: Hover effects are reversible**
  - **Validates: Requirements 4.4**

- [x] 6.3 Write unit test for hover transition timing
  - Test transition duration is less than 0.5 seconds
  - _Requirements: 4.3_

- [x] 7. Implement click interactions
  - Create handleDogClick function that accepts dog name parameter
  - Add onClick handler to each dog that calls handleDogClick with dog.name
  - Implement click action (show alert, modal, or display name)
  - Add visual feedback on click using whileTap prop
  - Ensure clicks don't cause navigation
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 7.1 Write property test for click handler
  - **Property 7: Click triggers handler**
  - **Validates: Requirements 5.1**

- [x] 7.2 Write property test for click identification
  - **Property 8: Click identifies correct dog**
  - **Validates: Requirements 5.2**

- [x] 7.3 Write property test for click outcome
  - **Property 9: Click produces visible outcome**
  - **Validates: Requirements 5.3**

- [x] 7.4 Write property test for no navigation
  - **Property 10: Click doesn't navigate**
  - **Validates: Requirements 5.5**

- [x] 8. Implement responsive design
  - Add Tailwind responsive classes for mobile viewports (< 768px)
  - Adjust dog sizes for mobile using responsive width/height
  - Test positioning maintains relative layout on mobile
  - Ensure touch events work on mobile devices
  - Add CSS to maintain image aspect ratios
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 8.1 Write property test for responsive positioning
  - **Property 2: Responsive positioning is maintained**
  - **Validates: Requirements 2.7**

- [x] 8.2 Write property test for aspect ratio preservation
  - **Property 11: Image aspect ratios preserved**
  - **Validates: Requirements 7.2**

- [x] 8.3 Write unit tests for responsive behavior
  - Test mobile styles applied at < 768px
  - Test touch event handlers present
  - _Requirements: 7.1, 7.3_

- [x] 9. Add error handling and accessibility
  - Implement fallback background color if image fails to load
  - Add alt text to all dog images
  - Implement prefers-reduced-motion media query to disable animations
  - Add try-catch to click handlers
  - Add keyboard accessibility (tab navigation, enter to click)

- [x] 9.1 Write unit tests for error handling
  - Test fallback behavior for failed image loads
  - Test click handler error handling
  - Test reduced motion preference

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
