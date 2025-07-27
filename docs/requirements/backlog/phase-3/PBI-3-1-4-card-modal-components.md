# PBI-3-1-4: Card and Modal UI Components

## Description

Implement Card layout and Modal dialog components using shadcn/ui patterns with flexible content layouts, responsive
design, and accessibility features.

## Implementation Details

### Files to Create/Modify

1. `src/components/ui/card.tsx` - Card layout component
2. `src/components/ui/dialog.tsx` - Modal dialog component
3. `src/components/ui/sheet.tsx` - Side panel component
4. `src/components/ui/alert.tsx` - Alert/notification component
5. `src/components/ui/popover.tsx` - Popover component
6. `src/hooks/useModal.ts` - Modal state management hook
7. `src/lib/modal-stack.ts` - Modal stack management utility

### Technical Requirements

- shadcn/ui v0.8+ with Radix UI primitives
- Card sections: header, content, footer with flexible layouts
- Modal variants: dialog, sheet, popover, alert
- Focus trap and escape key handling
- Portal rendering for modals
- Animation support with framer-motion
- Responsive design for mobile and desktop
- Accessibility compliance (WCAG 2.1 AA)

### Code Patterns to Follow

- Use Radix UI primitives for accessibility
- Implement compound component patterns
- Use React.createContext for modal state
- Follow animation best practices with reduced motion support
- Use CSS custom properties for theming

### Interface Specifications

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface AlertProps {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}
```

### Security Considerations

- XSS prevention in dynamic content
- Click-jacking protection for modals
- Focus management for security-sensitive dialogs
- Proper escape key handling

### Performance Optimizations

- Lazy loading of modal content
- Portal optimization for DOM performance
- Animation performance with GPU acceleration
- Memory cleanup for unmounted modals

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant
- **Reviewer**: Human Developer

## Acceptance Criteria

- [ ] Card component supports flexible content layouts
- [ ] Modal component handles focus management correctly
- [ ] Sheet component slides in from specified directions
- [ ] Alert component displays notifications appropriately
- [ ] All components are accessible with proper ARIA attributes
- [ ] Components work consistently across different screen sizes

### Verification Commands

```bash
npm run build
npm run test:components
npm run test:a11y
```

## Dependencies

- **Required**: PBI-3-1-3 - Button and form components (for modal actions)

## Testing Requirements

- Unit Tests (Vitest): Component rendering, props handling, state management
- Integration Tests (Testing Library): Modal interactions, focus management
- Accessibility Tests: Focus trap, keyboard navigation, screen reader support
- Visual Regression Tests: Layout variations and responsive behavior

### Test Coverage Requirements

- Component rendering: 100%
- Focus management: 100%
- User interactions: 90%
- Accessibility: 100%

## Estimate

1 story point

## Priority

High - Essential for layout structure and user interactions

## Implementation Notes

- Use Radix UI Dialog primitive for modal accessibility
- Implement proper focus restoration when modals close
- Add animation support with respect for reduced motion preferences
- Ensure proper z-index management for nested modals
