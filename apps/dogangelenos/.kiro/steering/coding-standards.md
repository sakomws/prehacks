# Coding Standards for Dog Angelenos

## Frontend Standards

### Component Structure
- Use functional components with hooks
- Implement proper TypeScript types
- Add loading and error states
- Include dark mode support
- Make components responsive

### State Management
- Use Context API for global state (Auth, Theme, Content)
- Local state with useState for component-specific data
- useEffect for side effects and data fetching

### Styling
- Tailwind CSS utility classes
- Dark mode: `dark:` prefix for all color classes
- Responsive: `md:`, `lg:` breakpoints
- Animations: Framer Motion for complex animations
- Gradients: `from-pink-500 via-purple-500 to-orange-500`

### API Integration
- Use fetch API with proper error handling
- Show loading states during requests
- Display user-friendly error messages
- Implement optimistic updates where appropriate

## Backend Standards

### API Design
- RESTful endpoints with proper HTTP methods
- Pydantic models for request/response validation
- Proper error handling with HTTPException
- CORS configuration for frontend access

### Database
- SQLAlchemy ORM models
- Proper relationships and foreign keys
- Timestamps (created_at, updated_at)
- JSON fields for arrays (specialties, certifications, etc.)

### Code Organization
- Separate routers for different features
- Database models in database.py
- Utility functions in separate modules
- Environment variables for configuration

## Best Practices

### Security
- Input validation on all endpoints
- SQL injection prevention via ORM
- CORS restrictions
- Role-based access control

### Performance
- Lazy loading for images
- Efficient database queries
- Proper indexing
- Caching where appropriate

### Accessibility
- Semantic HTML
- Proper ARIA labels
- Keyboard navigation support
- Color contrast compliance

### SEO
- Meta tags for all pages
- Structured data
- Los Angeles-specific keywords
- Proper heading hierarchy
