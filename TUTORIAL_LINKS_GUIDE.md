# Tutorial Links Implementation Guide

## ✅ Completed

### 1. Tutorial Drawer System
- ✅ Created Sheet component (shadcn)
- ✅ Created TutorialDrawer component
- ✅ Created TutorialContext with `useTutorial()` hook
- ✅ Updated TutorialLink to open drawer
- ✅ Added TutorialProvider to AdminLayout

### 2. PageHeader Enhancement
- ✅ Added `tutorialId` and `tutorialSectionId` props to PageHeader
- ✅ Auto-displays tutorial link when tutorialId is provided

### 3. Added Tutorial Links
- ✅ **Payments** (`/payments/page.tsx`) - `payment-dashboard-overview`
- ✅ **Divisions** (`/league/divisions/page.tsx`) - `creating-divisions`

---

## 📋 Remaining Pages to Add Tutorial Links

### How to Add Tutorial Links

#### Option 1: For pages using `PageHeader`
Just add the `tutorialId` prop:

```tsx
<PageHeader
  title="Teams"
  description="Manage teams, rosters, and assignments"
  tutorialId="creating-teams"  // ← Add this
  actions={...}
/>
```

#### Option 2: For pages with custom headers
Import and use TutorialLink:

```tsx
import TutorialLink from "@/components/features/tutorials/TutorialLink";

<div className="flex items-center gap-2">
  <h1>Page Title</h1>
  <TutorialLink tutorialId="tutorial-id" />
</div>
```

---

## Pages Needing Tutorial Links

### League Management

#### Teams
**File**: `/src/app/(admin)/league/teams/page.tsx`
```tsx
<PageHeader
  title="Teams"
  description="Manage teams, rosters, and assignments"
  tutorialId="creating-teams"  // ← Add
  actions={...}
/>
```

**File**: `/src/app/(admin)/league/teams/new/page.tsx`
```tsx
<PageHeader
  title="Create Team"
  tutorialId="creating-teams"  // ← Add
/>
```

**File**: `/src/app/(admin)/league/teams/[id]/page.tsx`
```tsx
<PageHeader
  title={team.name}
  tutorialId="managing-teams"  // ← Add
/>
```

#### Players
**File**: `/src/app/(admin)/league/players/page.tsx`
```tsx
<PageHeader
  title="Players"
  description="Manage player rosters and profiles"
  tutorialId="adding-players-manually"  // ← Add
  actions={...}
/>
```

**File**: `/src/app/(admin)/league/players/new/page.tsx`
```tsx
tutorialId="adding-players-manually"  // ← Add
```

**File**: `/src/app/(admin)/league/players/[id]/page.tsx`
```tsx
tutorialId="viewing-editing-players"  // ← Add
```

#### Divisions
**File**: `/src/app/(admin)/league/divisions/new/page.tsx`
```tsx
tutorialId="creating-divisions"  // ← Add
```

**File**: `/src/app/(admin)/league/divisions/[id]/page.tsx`
```tsx
tutorialId="editing-managing-divisions"  // ← Add
```

#### Cities (EXECUTIVE only)
**File**: `/src/app/(admin)/league/cities/page.tsx`
```tsx
import TutorialLink from "@/components/features/tutorials/TutorialLink";

<div className="flex items-center gap-2">
  <h1 className="text-3xl font-bold">Cities</h1>
  <TutorialLink tutorialId="setting-up-cities" />
</div>
```

**File**: `/src/app/(admin)/league/cities/new/page.tsx`
```tsx
tutorialId="setting-up-cities"
```

#### Locations (EXECUTIVE only)
**File**: `/src/app/(admin)/league/locations/page.tsx`
```tsx
tutorialId="managing-locations"
```

#### Levels (EXECUTIVE only)
**File**: `/src/app/(admin)/league/levels/page.tsx`
```tsx
tutorialId="creating-competition-levels"
```

#### Prices
**File**: `/src/app/(admin)/league/prices/page.tsx`
```tsx
tutorialId="managing-pricing-tiers"
```

### Game Management

**File**: `/src/app/(admin)/games/page.tsx`
```tsx
tutorialId="creating-games"
```

**File**: `/src/app/(admin)/games/[divisionId]/page.tsx`
```tsx
tutorialId="managing-games"
```

### Jersey Management

**File**: `/src/app/(admin)/jerseys/page.tsx`
```tsx
tutorialId="jersey-dashboard"
```

**File**: `/src/app/(admin)/jerseys/[teamId]/page.tsx`
```tsx
tutorialId="managing-jersey-orders"
```

### Photo Management

**File**: `/src/app/(admin)/photos/page.tsx`
```tsx
tutorialId="game-photos"
```

**File**: `/src/app/(admin)/photos/[gameId]/page.tsx`
```tsx
tutorialId="game-photos"
sectionId="uploading-photos"
```

**File**: `/src/app/(admin)/photos/media-day/page.tsx`
```tsx
tutorialId="media-day-setup"
```

**File**: `/src/app/(admin)/photos/media-day/upload/page.tsx`
```tsx
tutorialId="media-day-setup"
sectionId="media-day-upload-workflow"
```

### Settings

**File**: `/src/app/(admin)/settings/admins/page.tsx`
```tsx
tutorialId="understanding-admin-roles"
```

**File**: `/src/app/(admin)/settings/admins/new/page.tsx`
```tsx
tutorialId="adding-new-staff"
```

**File**: `/src/app/(admin)/settings/terminal/page.tsx`
```tsx
tutorialId="stripe-terminal-setup"
```

**File**: `/src/app/(admin)/settings/profile/page.tsx`
```tsx
tutorialId="profile-settings"
```

### Scorekeeper

**File**: `/src/app/(admin)/scorekeeper/page.tsx`
```tsx
tutorialId="scorekeeper-dashboard"
```

**File**: `/src/app/(admin)/scorekeeper/[gameId]/page.tsx`
```tsx
tutorialId="opening-game-for-scoring"
```

### Dashboard

**File**: `/src/app/(admin)/dashboard/page.tsx`
```tsx
tutorialId="understanding-dashboard"
```

### Exports

**File**: `/src/app/(admin)/exports/players/page.tsx`
```tsx
tutorialId="exporting-data"
```

---

## Tutorial ID Reference

Quick reference of all tutorial IDs:

### ALL ROLES
- `login-and-first-time-setup`
- `profile-settings`

### EXECUTIVE - Dashboard
- `understanding-dashboard`
- `dashboard-filters`
- `exporting-data`

### EXECUTIVE - Payments
- `payment-dashboard-overview`
- `processing-unpaid-players`
- `handling-in-progress-payments`
- `managing-payment-issues`
- `cash-and-etransfer-payments`

### EXECUTIVE - League Setup
- `setting-up-cities`
- `managing-locations`
- `creating-competition-levels`

### EXECUTIVE - League Operations
- `managing-pricing-tiers`
- `creating-divisions`
- `editing-managing-divisions`
- `creating-teams`
- `managing-teams`
- `adding-players-manually`
- `viewing-editing-players`

### EXECUTIVE - Operations
- `stripe-terminal-setup`
- `jersey-dashboard`
- `managing-jersey-orders`
- `creating-games`
- `managing-games`
- `game-photos`
- `media-day-setup`
- `understanding-admin-roles`
- `adding-new-staff`
- `managing-staff`

### COMMISSIONER
- `commissioner-dashboard`
- `commissioner-limitations`
- `commissioner-payment-processing`
- `commissioner-league-management`

### SCOREKEEPER
- `scorekeeper-dashboard`
- `viewing-game-schedules`
- `opening-game-for-scoring`
- `recording-game-events`
- `managing-game-time`
- `finalizing-scores`

### PHOTOGRAPHER
- `photographer-dashboard`
- `viewing-game-schedules-photographer`
- `uploading-game-photos-photographer`
- `photo-organization-tips-photographer`
- `media-day-overview-photographer`
- `uploading-media-day-photos-photographer`

---

## Testing Checklist

After adding tutorial links:

- [ ] Click tutorial link opens drawer (not new page)
- [ ] Drawer shows correct tutorial content
- [ ] Drawer has section navigation on left
- [ ] Tutorial content scrolls properly
- [ ] "Open Full Tutorial" button works (opens in new tab)
- [ ] Close button works
- [ ] Clicking overlay closes drawer
- [ ] Tooltip shows correct tutorial name
- [ ] No console errors

---

## Best Practices

1. **One tutorial link per page header** - Don't overwhelm users
2. **Link to the most relevant tutorial** - Choose the tutorial that best matches the page's primary action
3. **Use specific sections** - If a page is about one specific task, link directly to that section
4. **Keep tooltips clear** - Default tooltip from tutorial title is usually fine
5. **Test on mobile** - Ensure drawer is usable on small screens

---

## Next Steps

1. Add `tutorialId` prop to all remaining pages listed above
2. Test each page to ensure drawer works correctly
3. Consider adding contextual tutorial links to forms (e.g., division creation form)
4. Add tutorial links to error states or empty states where helpful
5. Gather user feedback on tutorial placement

---

**Status**: Tutorial drawer system complete. PageHeader updated. Now just need to add `tutorialId` props to remaining pages.

**Files Modified So Far**:
- ✅ `/src/components/ui/sheet.tsx` (created)
- ✅ `/src/components/features/tutorials/TutorialDrawer.tsx` (created)
- ✅ `/src/contexts/TutorialContext.tsx` (created)
- ✅ `/src/components/features/tutorials/TutorialLink.tsx` (updated)
- ✅ `/src/components/layout/AdminLayout.tsx` (added TutorialProvider)
- ✅ `/src/components/layout/PageHeader.tsx` (added tutorialId support)
- ✅ `/src/app/(admin)/payments/page.tsx` (added tutorial link)
- ✅ `/src/app/(admin)/league/divisions/page.tsx` (added tutorial link)
