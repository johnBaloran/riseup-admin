# Tutorial System Implementation Guide

## Overview

The Riseup Admin tutorial system is a comprehensive, role-based documentation system integrated directly into the admin portal. It provides step-by-step guidance for all admin roles with deep linking support, contextual help icons, and rich interactive features.

## System Architecture

### Phase 1: Tutorial Content (✅ Complete)

All 40 tutorials have been written across all roles with detailed step-by-step instructions.

### Phase 2: Tutorial Pages & Navigation (✅ Complete)

Interactive tutorial browsing interface with filtering, search, and role-based access control.

---

## Tutorial Content Structure

### Tutorial Count by Role

- **ALL ROLES**: 2 tutorials (Login, Profile Settings)
- **EXECUTIVE**: 22 tutorials
  - Dashboard: 3 tutorials
  - Payments: 5 tutorials
  - League Setup: 3 tutorials
  - League Operations: 6 tutorials
  - Operations: 10 tutorials
- **COMMISSIONER**: 4 tutorials (includes reference tutorials)
- **SCOREKEEPER**: 6 tutorials
- **PHOTOGRAPHER**: 6 tutorials

**Total: 40 comprehensive tutorials**

### Tutorial Categories

1. **getting-started** 🚀 - Essential tutorials to get started
2. **dashboard** 📊 - Dashboard and analytics
3. **payments** 💳 - Payment management
4. **league-management** 🏒 - Divisions, teams, players
5. **jerseys** 👕 - Jersey management
6. **games** 🎮 - Game scheduling and management
7. **photos** 📸 - Photo management
8. **settings** ⚙️ - System setup and staff management
9. **scorekeeper** 📋 - Scorekeeping
10. **reports** 📈 - Reports and exports

---

## File Structure

```
src/
├── types/
│   └── tutorial.ts                     # TypeScript type definitions
├── data/
│   └── tutorials/
│       ├── index.ts                    # Central aggregator with helper functions
│       ├── all-roles.ts                # Universal tutorials
│       ├── executive-dashboard.ts      # Executive dashboard tutorials
│       ├── executive-payments.ts       # Payment management tutorials
│       ├── executive-league-setup.ts   # League setup tutorials (EXECUTIVE only)
│       ├── executive-league-operations.ts # League operations tutorials
│       ├── executive-operations.ts     # Operational tutorials
│       ├── commissioner.ts             # Commissioner tutorials
│       ├── scorekeeper.ts              # Scorekeeper tutorials
│       └── photographer.ts             # Photographer tutorials
├── app/(admin)/
│   └── tutorials/
│       ├── page.tsx                    # Main tutorials page (server component)
│       └── [tutorialId]/
│           └── page.tsx                # Tutorial detail page (server component)
└── components/features/tutorials/
    ├── TutorialsPageClient.tsx         # Interactive tutorials list
    ├── TutorialDetailClient.tsx        # Interactive tutorial display
    └── TutorialLink.tsx                # Reusable info icon component
```

---

## Key Features

### 1. Role-Based Filtering

Tutorials automatically filter based on user role. Each tutorial specifies which roles can access it:

```typescript
{
  id: "payment-dashboard-overview",
  title: "Payment Dashboard Overview",
  roles: ["EXECUTIVE", "COMMISSIONER"],
  // ...
}
```

### 2. Deep Linking

Link directly to specific sections within tutorials:

```
/tutorials/payment-dashboard-overview?section=understanding-payment-statuses
```

### 3. Search & Filtering

- **Text search**: Search by title, description, or tags
- **Category filter**: Filter by category
- **Difficulty filter**: Beginner, Intermediate, Advanced
- **Tag filter**: Multiple tag selection

### 4. Prerequisites & Related Tutorials

Tutorials can specify prerequisites and link to related content:

```typescript
{
  prerequisites: ["login-first-time-setup"],
  sections: [
    {
      relatedSections: ["understanding-payment-statuses", "payment-filters"],
    }
  ]
}
```

### 5. Interactive Tutorial Content

Each tutorial includes:
- **Sections** - Logical groupings of steps
- **Steps** - Individual instructions with numbering
- **Substeps** - Detailed breakdowns
- **Tips** - Four types (info, warning, success, tip)
- **Images** - Screenshots with captions (to be added in Phase 4)
- **Related sections** - Cross-references

### 6. Table of Contents

Sidebar navigation with clickable sections for quick jumping.

### 7. Print & Share

- Print-friendly formatting
- Native share API support (mobile)
- Copy link to clipboard (desktop)

---

## Helper Functions (src/data/tutorials/index.ts)

### `getTutorialsByRole(userRole: Role)`
Get all tutorials accessible to a specific role.

### `getTutorialsByCategory(category, userRole?)`
Filter tutorials by category, optionally by role.

### `getTutorialById(id: string)`
Get a specific tutorial by its ID.

### `getTutorialSection(tutorialId, sectionId)`
Get a specific section within a tutorial.

### `searchTutorials(query: string, userRole?)`
Search tutorials by keyword (title, description, tags).

### `getAllTags(userRole?)`
Get all unique tags, optionally filtered by role.

### `getTutorialsByTag(tag: string, userRole?)`
Filter tutorials by tag.

### `getRelatedTutorials(tutorialId: string)`
Get recommended related tutorials.

### `getCategoriesForRole(userRole: Role)`
Get available categories for a role.

### `getTutorialStats(userRole?)`
Get statistics (total count, by category, by difficulty, total time).

---

## Using the TutorialLink Component

The `TutorialLink` component provides contextual help icons throughout the app.

### Basic Usage

```tsx
import TutorialLink from "@/components/features/tutorials/TutorialLink";

// Link to entire tutorial
<TutorialLink tutorialId="payment-dashboard-overview" />

// Link to specific section
<TutorialLink
  tutorialId="payment-dashboard-overview"
  sectionId="understanding-payment-statuses"
/>
```

### Variants

```tsx
// Default (blue circle with info icon)
<TutorialLink tutorialId="creating-divisions" />

// Inline (small, for use within text)
<TutorialLink
  tutorialId="cash-and-etransfer-payments"
  variant="inline"
/>

// Button (larger, standalone)
<TutorialLink
  tutorialId="processing-unpaid-players"
  variant="button"
/>

// Help (help circle icon)
<TutorialLink
  tutorialId="jersey-dashboard"
  variant="help"
  showLabel
/>
```

### Custom Tooltip

```tsx
<TutorialLink
  tutorialId="processing-unpaid-players"
  tooltip="Learn how to send payment reminders"
/>
```

### TutorialLinkGroup

Group multiple related tutorial links:

```tsx
import { TutorialLinkGroup } from "@/components/features/tutorials/TutorialLink";

<TutorialLinkGroup label="Learn more about payments:">
  <TutorialLink tutorialId="payment-dashboard-overview" />
  <TutorialLink tutorialId="processing-unpaid-players" />
  <TutorialLink tutorialId="cash-and-etransfer-payments" />
</TutorialLinkGroup>
```

---

## Navigation Integration

The Tutorials section has been added to the main sidebar navigation:

**Location**: Between "Exports" and "Settings"
**Icon**: BookOpen 📚
**Permission**: `view_dashboard` (all roles)

All users can access tutorials appropriate to their role.

---

## Tutorial Template

Use this template when creating new tutorials:

```typescript
{
  id: "tutorial-unique-id",
  title: "Tutorial Title",
  description: "Brief description of what this tutorial covers.",
  roles: ["EXECUTIVE", "COMMISSIONER"], // Who can access
  category: "payments", // Category
  estimatedTime: 5, // Minutes
  difficulty: "beginner", // beginner | intermediate | advanced
  tags: ["payment", "processing", "stripe"],
  lastUpdated: "2024-12-29",
  prerequisites: ["login-first-time-setup"], // Optional
  sections: [
    {
      id: "section-unique-id",
      heading: "Section Heading",
      description: "Optional section description",
      steps: [
        {
          stepNumber: 1,
          instruction: "Click the 'Payments' menu item.",
          substeps: [ // Optional
            "First substep detail",
            "Second substep detail",
          ],
          tips: [ // Optional
            {
              type: "info",
              content: "Helpful information about this step."
            }
          ],
          image: { // Optional (Phase 4)
            src: "/tutorials/payments/dashboard.png",
            alt: "Payment dashboard screenshot",
            caption: "The payment dashboard showing all statuses"
          }
        },
      ],
      relatedSections: ["other-section-id"], // Optional
    },
  ],
}
```

---

## Tutorial Writing Guidelines

### 1. Be Specific and Actionable

✅ Good: "Click the 'Create Division' button in the top-right corner."
❌ Bad: "Create a new division."

### 2. Use Substeps for Complex Actions

```typescript
{
  stepNumber: 1,
  instruction: "Fill out the division form:",
  substeps: [
    "Enter division name (e.g., 'Monday Night Recreational')",
    "Select city from dropdown",
    "Choose competition level",
    "Set game day and time",
  ]
}
```

### 3. Add Tips for Important Information

- **info** 💙 - General helpful information
- **warning** ⚠️ - Important warnings or things to watch out for
- **success** ✅ - Confirmation or what success looks like
- **tip** 💡 - Best practices or pro tips

### 4. Link Related Content

Use `relatedSections` to guide users to related tutorials or sections.

### 5. Keep It Current

Update `lastUpdated` when making changes.

---

## Remaining Work (Future Phases)

### Phase 3: Info Icon Embedding (Not Started)

Embed `TutorialLink` components throughout the application:

**Priority Pages**:
1. Payment Dashboard (`/payments`) - Link to payment tutorials
2. Division Management (`/league/divisions`) - Link to division tutorials
3. Jersey Management (`/jerseys`) - Link to jersey tutorials
4. Game Management (`/games`) - Link to game tutorials
5. Photo Management (`/photos`) - Link to photo tutorials

**Example Implementation**:

```tsx
// In /payments/page.tsx header
<div className="flex items-center gap-2">
  <h1>Payment Management</h1>
  <TutorialLink
    tutorialId="payment-dashboard-overview"
    tooltip="Learn how to use the payment dashboard"
  />
</div>
```

### Phase 4: Tutorial Images & Screenshots (Not Started)

1. Create `/public/tutorials/` directory structure
2. Capture screenshots of each major feature
3. Optimize images (WebP format, responsive sizes)
4. Add images to tutorial steps

**Recommended Tools**:
- Screenshot tool with annotation capabilities
- Image optimization (squoosh.app or similar)
- Naming convention: `{category}/{tutorial-id}/{section-id}-{step-number}.png`

### Phase 5: Role-Based Access Control Enhancement (Not Started)

Current implementation filters tutorials on the server. Future enhancement:

- Add role verification in middleware
- Implement audit logging for tutorial access
- Track which tutorials users have viewed

### Phase 6: Polish & Enhancement (Not Started)

1. **Search Enhancement**
   - Fuzzy search
   - Search result highlighting
   - Recent searches

2. **Progress Tracking**
   - Mark tutorials as "completed"
   - Track progress per user
   - Achievement badges

3. **Feedback System**
   - "Was this helpful?" buttons
   - Tutorial improvement suggestions
   - Analytics on most-viewed tutorials

4. **Offline Support**
   - Service worker for offline access
   - Download tutorials as PDF

---

## Testing Checklist

### Functional Testing

- [ ] All 40 tutorials load correctly
- [ ] Role filtering works (test each role)
- [ ] Deep linking to sections works
- [ ] Search returns relevant results
- [ ] Category filtering works
- [ ] Tag filtering works
- [ ] Difficulty filtering works
- [ ] Related tutorials display correctly
- [ ] Print functionality works
- [ ] Share functionality works
- [ ] Table of contents navigation works
- [ ] Prerequisites display correctly

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Sufficient color contrast
- [ ] Focus indicators visible

### Responsive Testing

- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Sidebar collapses on mobile
- [ ] Print layout is readable

---

## Performance Considerations

### Current Implementation

- All tutorials are imported statically (no database queries)
- Server-side filtering reduces client bundle
- Client-side search/filter is instant (no API calls)
- Tutorial content is ~150KB (all 40 tutorials)

### Future Optimization (if needed)

- Lazy load tutorial content per page
- Implement virtual scrolling for large tutorial lists
- Add service worker for offline caching
- Consider moving to CMS if content grows significantly

---

## Adding New Tutorials

### Step 1: Create Tutorial Object

Add to appropriate file in `/src/data/tutorials/`:

```typescript
export const myNewTutorial: Tutorial = {
  id: "my-new-tutorial",
  title: "My New Tutorial",
  // ... rest of tutorial
};
```

### Step 2: Add to Export Array

```typescript
export const executivePaymentTutorials: Tutorial[] = [
  // ... existing tutorials
  myNewTutorial,
];
```

### Step 3: Import in Index

If creating a new tutorial file, add to `/src/data/tutorials/index.ts`:

```typescript
import { myNewTutorials } from "./my-new-category";

export const allTutorials: Tutorial[] = [
  // ... existing
  ...myNewTutorials,
];
```

### Step 4: Test

1. Run dev server: `npm run dev`
2. Navigate to `/tutorials`
3. Verify tutorial appears for correct roles
4. Test all sections and steps
5. Verify deep linking works

---

## Troubleshooting

### Tutorial Not Showing

1. Check role assignment in tutorial object
2. Verify user session role matches
3. Check category spelling
4. Ensure tutorial is exported from its file
5. Ensure file is imported in `index.ts`

### Deep Linking Not Working

1. Verify section ID matches exactly (case-sensitive)
2. Check URL format: `/tutorials/{tutorialId}?section={sectionId}`
3. Ensure `sectionRefs` are being set correctly

### Search Not Working

1. Check that tags array is populated
2. Verify search query normalization (toLowerCase)
3. Ensure tutorial title/description contains searchable terms

---

## Support & Maintenance

### Keeping Tutorials Updated

- Review quarterly for accuracy
- Update `lastUpdated` field when making changes
- Archive outdated tutorials rather than deleting
- Version tutorials if significant changes occur

### Adding Screenshots (Future)

When Phase 4 is implemented:

1. Take screenshots in consistent browser/window size
2. Annotate important elements
3. Optimize images before committing
4. Use descriptive alt text
5. Add captions for context

---

## Summary

✅ **Complete**:
- 40 detailed tutorials written
- Type system created
- Tutorial aggregation & helper functions
- Main tutorials page with search/filtering
- Tutorial detail page with TOC
- TutorialLink component for embedding
- Navigation integration

🚧 **Pending** (Future Phases):
- Embedding TutorialLink throughout app
- Adding screenshots to tutorials
- Progress tracking
- Feedback system
- Advanced search features

The tutorial system foundation is complete and ready for use. Users can now access comprehensive, role-based documentation directly within the admin portal.

---

**Last Updated**: 2024-12-29
**System Version**: 1.0.0
**Status**: Phase 1 & 2 Complete
