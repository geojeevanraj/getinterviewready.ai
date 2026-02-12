# GetInterviewReady.AI - Design System

**Version:** 1.0  
**Last Updated:** February 2026

A comprehensive, production-ready design system for consistent UI/UX across the entire application.

---

## 📐 Design Principles

Our design system follows **Modern SaaS** principles inspired by:
- **Stripe** - Clean, professional, trustworthy
- **Linear** - Minimal, fast, focused
- **Notion** - Organized, readable, accessible
- **Vercel** - Modern, technical, elegant

### Core Principles
1. **Consistency** - Same patterns everywhere
2. **Clarity** - Clear hierarchy and purpose
3. **Simplicity** - Minimal, uncluttered UI
4. **Accessibility** - WCAG 2.1 AA compliant
5. **Performance** - Fast, smooth interactions

---

## 🎨 Design Tokens

Centralized in `src/config/designTokens.js`

### Spacing Scale
```js
xs:  8px   (0.5rem)
sm:  12px  (0.75rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
```

### Color Palette

#### Primary (Indigo)
- `indigo-50` - Lightest background
- `indigo-500` - Primary actions
- `indigo-600` - Primary hover
- `indigo-700` - Active states

#### Semantic Colors
- **Success:** Emerald shades
- **Error:** Rose shades
- **Warning:** Amber shades
- **Info:** Blue shades

#### Neutrals
- Gray scale from 50 (lightest) to 950 (darkest)
- Used for text, borders, backgrounds

### Typography

#### Font Sizes
```
xs:   12px  (labels, captions)
sm:   14px  (body text, buttons)
base: 16px  (default)
lg:   18px  (emphasized text)
xl:   20px  (section headers)
2xl:  24px  (page titles)
3xl:  30px  (hero text)
```

#### Font Weights
- `normal: 400` - Body text
- `medium: 500` - Emphasized text
- `semibold: 600` - Buttons, labels
- `bold: 700` - Headings

### Shadows
```
sm:      Subtle card elevation
DEFAULT: Standard cards
md:      Hover states
lg:      Modals, dropdowns
xl:      Floating panels
```

### Border Radius
```
sm:  6px   - Small elements
md:  8px   - Inputs, badges
lg:  12px  - Cards
xl:  16px  - Large containers
2xl: 24px  - Feature sections
```

---

## 🧩 Component Library

All components in `src/components/ui/`

### Card
Flexible container component.

```jsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card hoverable>
  <CardHeader 
    title="Card Title"
    subtitle="Description"
    action={<Button size="sm">Action</Button>}
  />
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Props:**
- `hoverable` - Add hover shadow effect
- `noPadding` - Remove default padding
- `onClick` - Make card interactive
- `className` - Additional Tailwind classes

---

### Button
Standardized buttons with variants.

```jsx
import Button from '@/components/Button';

<Button variant="primary" size="md" fullWidth>
  Click Me
</Button>

<Button 
  variant="secondary" 
  leftIcon={<Icon />}
  loading
>
  Loading...
</Button>
```

**Variants:**
- `primary` - Main actions (indigo)
- `secondary` - Secondary actions (gray)
- `danger` - Destructive actions (rose)
- `success` - Positive actions (emerald)
- `ghost` - Minimal style
- `outline` - Bordered style

**Sizes:**
- `sm` - Compact buttons
- `md` - Default size
- `lg` - Prominent actions

---

### Input
Form input with validation states.

```jsx
import Input from '@/components/Input';

<Input 
  label="Email Address"
  type="email"
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<EmailIcon />}
  required
/>
```

**Props:**
- `label` - Input label
- `error` - Error message
- `helperText` - Helper text
- `leftIcon` / `rightIcon` - Icon elements
- `required` - Show asterisk

---

### Badge
Visual indicators for status/categories.

```jsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="md" dot>
  Active
</Badge>

<Badge 
  variant="primary"
  onRemove={() => {}}
>
  Removable
</Badge>
```

**Variants:**
- `default`, `primary`, `success`, `warning`, `error`, `info`, `purple`

**Sizes:**
- `sm`, `md`, `lg`

**Features:**
- `dot` - Show colored dot
- `icon` - Custom icon
- `onRemove` - Removable badge

---

### PageHeader
Consistent page headers.

```jsx
import { PageHeader } from '@/components/ui';

<PageHeader 
  title="Dashboard"
  subtitle="Welcome back!"
  actions={<Button>Add New</Button>}
  sticky
/>
```

**Props:**
- `title` - Page title
- `subtitle` - Description
- `actions` - Action buttons
- `breadcrumb` - Navigation breadcrumb
- `sticky` - Sticky on scroll

---

### PageContainer & PageContent
Layout wrappers for consistent spacing.

```jsx
import { PageContainer, PageContent } from '@/components/ui';

<PageContainer>
  <PageHeader title="Page Title" />
  <PageContent maxWidth="7xl">
    {/* Page content */}
  </PageContent>
</PageContainer>
```

**maxWidth options:**
- `5xl`, `6xl`, `7xl`, `full`

---

### EmptyState
Display when no data exists.

```jsx
import { EmptyState } from '@/components/ui';

<EmptyState 
  icon={<Icon />}
  title="No interviews yet"
  description="Start your first interview to see results here"
  action={<Button>Start Interview</Button>}
/>
```

---

### LoadingSkeleton
Skeleton loaders for better perceived performance.

```jsx
import { LoadingSkeleton, PageLoadingSkeleton } from '@/components/ui';

<LoadingSkeleton variant="card" />
<LoadingSkeleton variant="text" lines={3} />
<LoadingSkeleton variant="avatar" />

// Full page skeleton
<PageLoadingSkeleton />
```

---

### Modal
Accessible modal dialogs.

```jsx
import { Modal, ModalFooter } from '@/components/ui';

<Modal 
  isOpen={showModal}
  onClose={closeModal}
  title="Confirm Action"
  size="md"
  footer={
    <ModalFooter 
      onCancel={closeModal}
      onConfirm={handleConfirm}
      confirmText="Delete"
    />
  }
>
  Modal content here
</Modal>
```

**Sizes:**
- `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `full`

---

## 🎯 Usage Patterns

### Common Layouts

#### Page Structure
```jsx
<PageContainer>
  <PageHeader 
    title="Page Title"
    subtitle="Description"
    actions={<Button>Action</Button>}
  />
  
  <PageContent>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>...</Card>
      <Card>...</Card>
      <Card>...</Card>
    </div>
  </PageContent>
</PageContainer>
```

#### Form Layout
```jsx
<Card>
  <CardHeader title="Form Title" />
  <CardContent>
    <Input label="Name" required />
    <Input label="Email" type="email" />
    <Input label="Password" type="password" />
  </CardContent>
  <CardFooter>
    <div className="flex gap-3">
      <Button variant="secondary" fullWidth>
        Cancel
      </Button>
      <Button variant="primary" fullWidth>
        Submit
      </Button>
    </div>
  </CardFooter>
</Card>
```

#### Empty State
```jsx
<Card>
  <EmptyState 
    icon={<NoDataIcon />}
    title="No data yet"
    description="Get started by creating your first item"
    action={<Button>Create Now</Button>}
  />
</Card>
```

#### Loading State
```jsx
{loading ? (
  <PageLoadingSkeleton />
) : (
  <PageContent>
    {/* Actual content */}
  </PageContent>
)}
```

---

## 📱 Responsive Design

### Breakpoints
```
sm:  640px   - Phablets
md:  768px   - Tablets
lg:  1024px  - Laptops
xl:  1280px  - Desktops
2xl: 1536px  - Large screens
```

### Mobile-First Approach
Always style for mobile first, then add breakpoints:

```jsx
<div className="
  grid 
  grid-cols-1       /* Mobile: 1 column */
  md:grid-cols-2    /* Tablet: 2 columns */
  lg:grid-cols-3    /* Desktop: 3 columns */
  gap-4             /* Consistent spacing */
">
```

---

## ♿ Accessibility

### Focus Management
- All interactive elements have visible focus rings
- Focus rings use `focus:ring-2` with appropriate color
- Modals trap focus and support ESC key

### Color Contrast
- Text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements have sufficient contrast
- Error states use both color AND icons

### Keyboard Navigation
- All components support keyboard navigation
- Tab order follows visual order
- Enter/Space activate buttons
- ESC closes modals and dropdowns

### Screen Readers
- Semantic HTML (`<button>`, `<label>`, etc.)
- ARIA labels where needed
- Descriptive alt text for images
- Hidden text for icon-only buttons

---

## 🌙 Dark Mode Support

All components support dark mode via Tailwind's `dark:` variant.

```jsx
// Light mode: bg-white
// Dark mode: dark:bg-gray-900
<Card className="bg-white dark:bg-gray-900">
```

**Dark Mode Classes:**
- Background: `dark:bg-gray-900`, `dark:bg-gray-950`
- Text: `dark:text-white`, `dark:text-gray-300`
- Borders: `dark:border-gray-800`
- Hover: `dark:hover:bg-gray-800`

---

## 🎭 Animation & Transitions

### Standard Transitions
```
transition-all     - All properties
transition-colors  - Color changes only
transition-shadow  - Shadow changes
```

### Duration
```
fast: 150ms   - Micro-interactions
base: 200ms   - Default
slow: 300ms   - Larger movements
```

### Hover States
All interactive elements should have hover states:
- Buttons: Darker background + shadow
- Cards: Elevated shadow
- Links: Underline or color change

---

## ✅ Component Checklist

When creating NEW components:
- [ ] Use design tokens from `designTokens.js`
- [ ] Support dark mode
- [ ] Add hover/focus states
- [ ] Include loading/disabled states
- [ ] Keyboard accessible
- [ ] Responsive at all breakpoints
- [ ] PropTypes or TypeScript
- [ ] JSDoc comments

---

## 📦 Import Patterns

```jsx
// UI Components
import { Card, Badge, EmptyState } from '@/components/ui';

// Core Components
import Button from '@/components/Button';
import Input from '@/components/Input';

// Design Tokens
import { colors, spacing, componentTokens } from '@/config/designTokens';
```

---

## 🚀 Best Practices

### DO ✅
- Use component library for all UI
- Follow spacing scale consistently
- Reuse existing components
- Keep components focused and simple
- Add hover/focus states to interactive elements
- Support keyboard navigation
- Test on mobile devices

### DON'T ❌
- Create one-off custom styled elements
- Use arbitrary spacing values
- Mix different button styles on same page
- Forget loading/empty states
- Skip error handling in forms
- Ignore accessibility
- Hardcode colors or sizes

---

## 🔧 Customization

To customize the design system:

1. **Update Tokens:** Modify `src/config/designTokens.js`
2. **Extend Components:** Create variants in component files
3. **Add New Components:** Follow existing patterns
4. **Update Tailwind:** Adjust `tailwind.config.js` if needed

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

---

**Questions?** Review existing components or check the design tokens file.

**Contributing?** Follow the component checklist and maintain consistency.
