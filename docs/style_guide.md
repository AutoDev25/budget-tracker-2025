# budget-2025 - Style Guide

## Brand Colors
- **Primary**: #667eea (Modern blue-purple)
- **Secondary**: #764ba2 (Deep purple)
- **Accent**: #f093fb (Light pink accent)
- **Success**: #28a745 (Green for positive amounts/savings)
- **Warning**: #ffc107 (Yellow for budget warnings)
- **Error**: #dc3545 (Red for overspending/errors)
- **Gray Dark**: #2d3748 (Primary text)
- **Gray Medium**: #718096 (Secondary text)
- **Gray Light**: #f7fafc (Background)
- **White**: #ffffff (Card backgrounds)

## Typography
- **Primary Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Headings**: 
  - H1: 32px, bold, primary color
  - H2: 24px, semibold, gray dark
  - H3: 20px, medium, gray dark
- **Body Text**: 16px base size, line-height 1.6
- **Small Text**: 14px for labels, secondary info
- **Numbers**: Tabular figures for expense amounts

## Components Style

### Buttons
- **Primary**: Gradient from primary to secondary, white text, 8px radius
- **Secondary**: White background, primary border, primary text
- **Danger**: Error color background, white text
- **Sizes**: Small (32px), Medium (40px), Large (48px)
- **States**: Hover with subtle scale (1.02x), active with slight press effect

### Cards & Containers
- **Background**: White with subtle shadow (0 2px 4px rgba(0,0,0,0.1))
- **Border Radius**: 12px for cards, 8px for smaller elements
- **Padding**: 16px standard, 24px for main content areas
- **Borders**: 1px solid #e2e8f0 for subtle separation

### Form Elements
- **Inputs**: 
  - Border: 1px solid #e2e8f0
  - Focus: Primary color border with shadow
  - Padding: 12px horizontal, 8px vertical
  - Border radius: 6px
- **Labels**: Medium weight, gray medium color, 14px
- **Validation**: Error state with red border and helper text

### Data Display
- **Tables**: 
  - Zebra striping with gray light background
  - Hover rows with subtle background change
  - Right-aligned numbers
- **Expense Items**:
  - Card-based layout for mobile
  - Category color-coding with small indicator dot
  - Amount prominence with larger, bold text

## Layout Principles
- **Spacing**: 8px base grid system (8, 16, 24, 32, 40px)
- **Mobile First**: Responsive breakpoints at 640px, 768px, 1024px
- **Content Width**: Max 1200px with centered layout
- **Sidebar**: 280px on desktop, collapsible on mobile

## Navigation & UI Patterns
- **Tab Navigation**: Clean tabs with active state indicators
- **Modals**: Overlay with backdrop blur, slide-in animation
- **Loading States**: Skeleton screens matching content layout
- **Empty States**: Helpful illustrations with clear call-to-action
- **Success Feedback**: Green toast notifications with check icons

## Expense-Specific Styling
- **Amount Display**: 
  - Large, bold font for primary amounts
  - Color coding: Green for income, red for high expenses
  - Currency symbol styling
- **Categories**: 
  - Color-coded badges/dots
  - Consistent iconography per category
- **User Assignment**: 
  - User avatars with initials
  - Color-coded by user preference
- **Date Formatting**: Clear, scannable date formats (MMM DD, YYYY)

## Responsive Behavior
- **Desktop**: Multi-column layout, sidebar navigation
- **Tablet**: Adapted grid layout, collapsible sidebar
- **Mobile**: Single column, bottom tab navigation, touch-friendly buttons

## Accessibility
- **Colors**: WCAG AA contrast ratios (4.5:1 minimum)
- **Focus States**: Clear keyboard navigation indicators
- **Screen Readers**: Proper ARIA labels and semantic markup
- **Touch Targets**: Minimum 44px for interactive elements

## Animation & Transitions
- **Duration**: 200ms for micro-interactions, 300ms for page transitions
- **Easing**: ease-in-out for smooth, natural movement
- **Loading**: Subtle pulse animations for loading states
- **Hover Effects**: Scale (1.02x) and shadow enhancement