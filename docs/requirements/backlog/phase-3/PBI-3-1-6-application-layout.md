# PBI-3-1-6: Application Layout and Navigation

## Description

Create the main application layout with sidebar navigation, header, and responsive design
for the authenticated dashboard area of the management interface.

## Implementation Details

### Files to Create/Modify

1. `src/app/(dashboard)/layout.tsx` - Dashboard layout wrapper
2. `src/components/layout/AppSidebar.tsx` - Collapsible sidebar navigation
3. `src/components/layout/AppHeader.tsx` - Header with user menu
4. `src/components/layout/NavigationItem.tsx` - Individual nav items
5. `src/components/layout/UserMenu.tsx` - User profile dropdown
6. `src/components/layout/BreadcrumbNav.tsx` - Breadcrumb navigation
7. `src/components/ErrorBoundary.tsx` - Global error boundary
8. `src/lib/navigation.ts` - Navigation configuration

### Technical Requirements

- Responsive layout that works on mobile, tablet, desktop
- Collapsible sidebar with smooth animations
- Active page highlighting in navigation
- User profile menu with logout functionality
- Breadcrumb navigation for deep pages
- Keyboard navigation support

### エラーバウンダリー実装

- Global error boundary for unexpected errors
- Graceful error handling with user-friendly messages
- Detailed error display in development environment
- Production-safe error messages for end users
- Error reporting and logging integration
- Automatic error recovery where possible

### Navigation Structure

```typescript
interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType;
  children?: NavigationItem[];
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const navigationConfig = {
  main: [
    { id: "dashboard", label: "Dashboard", href: "/", icon: HomeIcon },
    { id: "receipts", label: "Receipts", href: "/receipts", icon: ReceiptIcon },
    {
      id: "transactions",
      label: "Transactions",
      href: "/transactions",
      icon: CreditCardIcon,
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: SettingsIcon,
    },
  ],
};
```

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant
- **Reviewer**: Human Developer

## Acceptance Criteria

- [ ] Sidebar navigation displays all menu items correctly
- [ ] Active page is highlighted in navigation
- [ ] Sidebar collapses/expands smoothly on desktop
- [ ] Mobile navigation works with drawer/overlay pattern
- [ ] User menu shows profile information and logout option
- [ ] Breadcrumb navigation shows current page hierarchy
- [ ] Layout is responsive across all screen sizes
- [ ] Error boundary catches and displays errors gracefully
- [ ] Error boundary shows different messages for dev/prod environments
- [ ] Error boundary provides error recovery mechanisms

### Verification Commands

```bash
npm run test:layout
npm run test:navigation
npm run test:responsive
npm run test:error-boundary
```

## Dependencies

- **Required**: PBI-3-1-3 - Button and form components
- **Required**: PBI-3-1-4 - Card and modal components
- **Required**: PBI-3-1-5 - Authentication (for user menu)

## Testing Requirements

- Navigation: Test menu item navigation and active states
- Responsive: Verify layout behavior on different screen sizes
- Accessibility: Test keyboard navigation and screen reader support

## Estimate

2 story points (includes +0.5 SP for error boundary implementation)

## Priority

High - Foundation for all authenticated pages

## Implementation Notes

- Use CSS Grid and Flexbox for responsive layout structure
- Implement proper focus management for accessibility
- Add smooth transitions for sidebar collapse/expand

### Error Boundary Implementation

- Wrap entire application with ErrorBoundary component
- Use React.ErrorBoundary with componentDidCatch lifecycle
- Implement environment-specific error display logic
- Add error recovery button with page/component reset
- Integrate with logging service for error tracking
- Ensure proper handling of long navigation labels
- Consider implementing route-based breadcrumb generation
