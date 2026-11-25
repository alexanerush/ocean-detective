# Ocean Detective — UI Design System

## 1. Design Principles

Ocean Detective uses a consistent, research-oriented visual
language for satellite imagery analysis and marine debris detection.

- Responsive and accessible interfaces
- Consistent visual hierarchy
- Reusable React components
- Semantic color tokens
- Clear data visualization
- Predictable interaction patterns

## 2. Color Tokens

| CSS token | Light | Dark |
|---|---|---|
| --od-bg | #EEF5F5 | #071417 |
| --od-surface | #FFFFFF | #10272C |
| --od-text | #122F35 | #E8F1F2 |
| --od-muted | #405B61 | #A9C1C4 |
| --od-accent | #006663 | #75D8D3 |
| --od-border | #A0B8BC | #38585D |
| --od-control-border | #52777A | #739B9D |
| --od-success | #12663C | #75E0AD |
| --od-error | #A11D2B | #FFB4B4 |

The application supports Light, Dark and System color schemes.
Theme preferences are persisted in localStorage.

Scientific segmentation colors are separate from interface tokens
and represent the 15 MARIDA object classes.

## 3. Typography

Font family: Inter, Arial, sans-serif.

| Element | Size |
|---|---|
| Brand heading | clamp(2rem, 6vw, 5.5rem) |
| Dashboard heading | clamp(1.5rem, 3vw, 2.625rem) |
| Page H1 | clamp(1.625rem, 3vw, 2.625rem) |
| Dashboard card heading | 1.25rem |
| Upload heading | 1.375rem |
| Body text | 1rem |
| Card description | 0.875rem |
| Navigation | 0.875rem |
| Mobile navigation | 0.75rem |
| Eyebrow | 0.75rem, weight 700 |

Text scaling options: 100%, 112.5% and 125%.
The 112.5% option is displayed as 112% in the interface.

Relative units support browser zoom and user text preferences.

## 4. Spacing and Geometry

| Property | Value |
|---|---|
| Standard spacing | 1rem |
| Desktop layout gap | 1.5rem |
| Tablet layout gap | 1rem |
| Panel radius | 1rem |
| Dashboard card radius | 18px |
| Control radius | 0.6rem |
| Minimum touch target | 44px |
| Checkbox visual dimensions | 1.25rem x 1.25rem |
| Checkbox label minimum height | 44px |
| Desktop sidebar width | 14.375rem |
| Application maximum width | 100rem |
| Account form maximum width | 32rem |

Checkboxes use compact visual dimensions and a larger
associated clickable label.

## 5. Responsive Layout

### Desktop — 1440 x 900

- Two-column application shell
- Sidebar navigation
- Flexible main content area
- Multi-column dashboard cards
- Side-by-side analysis visualizations

### Tablet — 768 x 1024

- Single-column application shell
- Navigation above the main content
- Responsive dashboard grid
- Flexible forms and data panels

### Mobile — 390 x 844

- Single-column content
- Compact navigation grid above content
- Stacked dashboard cards
- Full-width analysis action button
- Single-column ML image grid
- Horizontally scrollable data tables where necessary

### Breakpoints

| Breakpoint | Behavior |
|---|---|
| 64rem | Single-column shell and navigation grid |
| 48rem | Compact navigation and stacked content |
| 22rem | Two-column navigation |
| 20rem | Stacked authentication options |
| 16rem | Additional narrow-screen adjustments |
| 600px | Compact upload area and ML image grid |
| Landscape, max-height 30rem | Static navigation |

Layouts use CSS Grid, Flexbox, minmax(), auto-fit(),
clamp(), relative units and flexible image dimensions.

## 6. Reusable Component Library

| Component | Implementation |
|---|---|
| Button | shared/ui/controls.tsx |
| Panel | shared/ui/controls.tsx |
| Field | shared/ui/controls.tsx |
| Skeleton | shared/ui/controls.tsx |
| Icon | shared/ui/Icon.tsx |
| Toast | shared/ui/Toast.tsx |
| BarChart | shared/ui/BarChart.tsx |
| ImageComparison | shared/ui/ImageComparison.tsx |
| ResultImage | shared/ui/ResultImage.tsx |
| ErrorBoundary | shared/ui/ErrorBoundary.tsx |
| Sidebar | widgets/sidebar/Sidebar.tsx |
| Header | widgets/header/Header.tsx |
| DisplaySettings | features/display-settings/DisplaySettings.tsx |
| ImageUpload | features/image-upload/ImageUpload.tsx |
| AuthForm | features/auth/AuthForm.tsx |
| UserUpload | features/user-upload/UserUpload.tsx |
| RunAnalysis | features/ml-results/RunAnalysis.tsx |
| Results | features/ml-results/Results.tsx |

Paths are relative to frontend/src.

## 7. Interaction States

### Button

- Default: surface background and accent text
- Keyboard focus: 2px accent outline, 3px offset
- Disabled: opacity 0.55 and not-allowed cursor
- Loading: descriptive text and disabled interaction

### Form Field

- Default: surface background and control border
- Focus: visible accent outline
- Invalid: aria-invalid and associated error message
- Validation feedback: role="alert"

### Navigation

- Default and active route states
- Hover feedback
- Visible keyboard focus
- Compact mobile labels

### File Upload

- Default dashed upload area
- Hover and focus-within feedback
- Selected file name and size
- Validation errors
- Upload progress and server validation feedback

### Data Visualization

- Responsive bar charts
- Scrollable tables
- Image comparison slider
- Segmentation overlay opacity control
- Minimum confidence filter
- Class visibility checkboxes
- Download controls

## 8. Accessibility

- WCAG 2.1 AA text contrast target: at least 4.5:1
  for normal text.
- Minimum 44px touch targets for primary controls.
- Visible keyboard focus indicators.
- Semantic form labels and validation messages.
- Status announcements for asynchronous operations.
- Skip-to-content navigation.
- Alternative text for result images.
- Reduced-motion media query.
- Responsive reflow and browser zoom support.

Automated contrast checks use axe-core through Playwright.
The checks cover the tested screens and themes; they are
not a certification of complete WCAG compliance.

## 9. Verification

Responsive viewport matrix:

- 320 x 568
- 390 x 844
- 844 x 390
- 768 x 1024
- 1024 x 768
- 1440 x 900
- 720 x 450 (200% zoom reflow equivalent)

Public screen coverage:

- Dashboard
- Satellite Image Analysis
- ML Experiments
- Sign In
- Registration

Automated checks cover document overflow, navigation
visibility, selected touch targets and text contrast.

Source: frontend/e2e/adaptive.spec.ts

## 10. Source of Truth

- frontend/src/style.css
- frontend/src/app/styles/design-system.css
- frontend/src/app/styles/adaptive.css
- frontend/src/shared/ui/workflow.css
- Feature-specific and page-specific stylesheets

The implemented CSS and React components are the
authoritative source of the design system.
