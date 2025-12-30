# Rise Up Admin - Complete System Understanding

*This document maps out every feature, flow, and functionality in the admin system.*

---

## 📊 **1. DASHBOARD & ANALYTICS**

### Overview
The dashboard shows payment analytics with filtering and comparison capabilities.

### Location
`/dashboard` (default landing page after login)

### Key Features

#### **Payment Analytics Display**
- **Total Revenue** - Sum of all payments
- **Total Payments** - Count of payment records
- **Payment Method Breakdown** - Shows:
  - Full Payment (Stripe)
  - Installments (Stripe)
  - Cash
  - Terminal
  - E-Transfer (NEW)
- **City Breakdown** - Revenue and count per city
- **Daily Trend Chart** - Revenue over time

#### **Filters**
1. **City Filter** - Dropdown to filter by specific city or "All Cities"
2. **Date Range** - Quick buttons:
   - Today
   - 7 Days
   - 28 Days
   - 60 Days
   - 90 Days
   - Custom (date picker)
3. **Comparison Mode** - Checkbox to compare with previous period

#### **Data Components**
- **MetricCards** - Summary cards at top (total revenue, payments, linkage rate)
- **RevenueChart** - Line chart showing daily trends
- **PaymentTypeBreakdown** - Table of payment methods
- **CityBreakdown** - Table of cities (only shows if multiple cities exist)
- **PaymentMethodList** - Full list of all payment records with pagination

### Technical Notes
- Timezone handling: All dates converted from EST to UTC for storage
- Filters update URL params (`?city=xxx&startDate=xxx&endDate=xxx&compare=true`)
- Data fetched server-side from `getPaymentAnalytics()`

---

## 💰 **2. PAYMENT MANAGEMENT SYSTEM**

### Overview
Central hub for tracking all player payments across different statuses.

### Location
`/payments`

### Payment Status Categories

The system categorizes players into 4 statuses:

#### **1. UNPAID** 🔴
Players who haven't started any payment.

**Actions Available:**
- Send Payment Reminder (SMS)
- Send Payment Link
- Notify Team Captain
- Link to User Account
- Mark as Cash Payment
- Mark as E-Transfer Payment

**View:** `UnpaidPlayerView.tsx`

---

#### **2. IN PROGRESS** 🟡
Players on installment plans with ongoing payments.

**Sub-categories:**
- **On Track** - All payments successful so far
- **Has Issues** - Some payments failed

**Actions Available (On Track):**
- View installment schedule (8 payments)
- See progress (X of 8 completed)
- Send payment reminders
- Notify team captain

**View:** `OnTrackPlayerView.tsx`

---

#### **3. HAS ISSUES** 🟠
Players with failed installment payments.

**What causes this:**
- Credit card declined
- Insufficient funds
- Expired card
- Payment failed after 3 retry attempts

**Actions Available:**
- **Charge Card Now** - Manual charge attempt (if valid card on file)
- **Pay via Terminal** - Process payment with card reader
- **Send Payment Link** - Email/SMS new payment link
- View failed payment details
- See retry attempt count

**View:** `HasIssuesPlayerView.tsx`

---

#### **4. PAID** ✅
Players who have completed payment fully.

**Payment Types:**
- Full Payment (Stripe one-time)
- Installments Completed (all 8 payments succeeded)
- Cash Payment (manually marked)
- Terminal Payment (card reader)
- E-Transfer (manually marked)

**Actions Available:**
- View payment history
- For Cash: Delete/Revert payment
- View payment receipt/details

**Views:**
- `PaidPlayerView.tsx` - Fully paid players
- Shows different details based on payment type

---

### Payment Dashboard Features

#### **Filters**
1. **Location** - Filter by game venue
2. **Division** - Filter by specific division
3. **Team** - Filter by team
4. **Payment Status** - Filter by: All, Unpaid, In Progress, Has Issues, Paid
5. **Search** - Search by player name

#### **Statistics Display**
Shows count breakdown:
- X Unpaid
- X In Progress
- X Has Issues
- X Paid
- Total: X Players

#### **Player List**
- Paginated table (20 per page)
- Columns:
  - Player Name
  - Team
  - Division
  - Payment Status (colored badge)
  - Payment Method
  - Amount Paid / Total
  - Progress Bar (for installments)
- Click player → Opens detail view

---

### Payment Processing Modals

#### **Mark as Cash Payment**
`MarkCashPaymentModal.tsx`

**Fields:**
- Amount Received
- Pricing Tier (Early Bird / Regular)
- Date Received
- Notes (optional)
- Received By (auto-filled with current admin)

**Process:**
1. Creates PaymentMethod record with type "CASH"
2. Adds cash payment details
3. Updates player status to PAID
4. Stores admin who received payment

---

#### **Mark as E-Transfer Payment**
`MarkETransferPaymentModal.tsx`

**Two Modes:**
1. **Individual Payment** - Single player
2. **Team Payment** - Multiple players (team captain bulk payment)

**Fields (Individual):**
- City (for e-transfer bank account tracking)
- Amount
- Pricing Tier
- Sender Email (optional)
- Reference Number (optional)
- Notes (optional)

**Team Payment Features:**
- Auto-loads all unpaid players from team
- Checkboxes to select players
- **Auto-split** button (divides total equally)
- Manual amount override per player
- Creates single transaction ID linking all payments

**Process:**
1. Creates/updates PaymentMethod with type "E_TRANSFER"
2. Adds to eTransferPayments array
3. Auto-calculates total (supports multiple partial payments)
4. Updates status: PENDING → IN_PROGRESS → COMPLETED

---

#### **Charge Card Modal**
`ChargeCardModal.tsx`

For failed installments - manually charge the card on file.

**Shows:**
- Card details (last 4 digits, expiry, brand)
- Amount to charge
- Payment number (e.g., "Payment #3")

**Process:**
1. Calls Stripe API to charge payment method
2. Updates installment payment status
3. Refreshes player view

---

#### **Pay via Terminal**
`PayInstallmentTerminalModal.tsx` / `MarkTerminalPaymentModal.tsx`

Process in-person card payments with Stripe Terminal reader.

**Fields:**
- Terminal Location (registered readers)
- Amount
- Payment details

**Process:**
1. Connects to Stripe Terminal
2. Initiates payment intent
3. Waits for card tap/insert
4. Processes payment
5. Updates PaymentMethod record

---

#### **Send Payment Link**
`SendPaymentLinkModal.tsx`

Sends player a unique Stripe payment link via SMS/email.

**Process:**
1. Generates Stripe payment link
2. Sends via Twilio SMS
3. Stores link reference in database
4. Player can pay online

---

#### **Send Reminder**
`SendReminderModal.tsx` / `SendSpecificReminderModal.tsx`

Send SMS reminder to player about unpaid balance.

**Types:**
- General reminder
- Specific failed payment reminder

**Process:**
1. Uses Twilio Messaging Service
2. Sends SMS to player's phone number
3. Logs reminder in database

---

#### **Notify Team Captain**
`NotifyCaptainModal.tsx`

Sends SMS to team captain about player's payment status.

**Process:**
1. Looks up team captain's phone number
2. Sends SMS via Twilio
3. Includes player name and payment details

---

## 🏀 **3. LEAGUE MANAGEMENT**

### 3.1 Cities
`/league/cities`

**Purpose:** Top-level geographic organization

**Fields:**
- City Name
- Region (e.g., "Ontario")
- Country
- Timezone
- Stripe Account ID (for connected account)
- Google Chat Webhook (for automated reports)
- E-Transfer Email (for receiving e-transfers)

**Actions:**
- Create City
- Edit City
- View Divisions per City

**Access:** EXECUTIVE only

---

### 3.2 Locations
`/league/locations`

**Purpose:** Game venues/courts

**Fields:**
- Location Name
- City (dropdown)
- Address
- Map Link (Google Maps URL)

**Actions:**
- Create Location
- Edit Location
- Delete Location

**Usage:** Assigned to divisions for game scheduling

**Access:** EXECUTIVE only

---

### 3.3 Competition Levels
`/league/levels`

**Purpose:** Skill tiers (Recreational, Competitive, Elite, etc.)

**Fields:**
- Level Name
- Description

**Actions:**
- Create Level
- Edit Level
- Delete Level

**Usage:** Assigned to divisions for categorization

**Access:** EXECUTIVE only

---

### 3.4 Pricing
`/league/prices`

**Purpose:** Define pricing structures for divisions

**Fields:**
- Price Name
- Division Type
- Early Bird Price
- Regular Price
- Full Payment Price (one-time)
- Installment Details:
  - Down Payment
  - Monthly Payment Amount
  - Number of Payments

**Actions:**
- Create Pricing Tier
- Edit Pricing
- View Pricing

**Usage:** Assigned to divisions

**Access:** EXECUTIVE only

---

### 3.5 Divisions
`/league/divisions`

**Purpose:** Seasonal competition groups

**Fields:**
- Division Name
- City (dropdown)
- Location (dropdown - filtered by city)
- Competition Level (dropdown)
- Pricing (dropdown)
- Game Day (Sunday, Monday, etc.)
- Game Time
- Capacity (max teams)
- Season Start/End Dates
- Active Status

**Actions:**
- Create Division
- Edit Division
- View Division Details (teams, players, stats)
- Activate/Deactivate

**Stats Shown:**
- X teams / Y capacity
- X players registered
- $X total revenue

**Access:** EXECUTIVE, COMMISSIONER

---

### 3.6 Teams
`/league/teams`

**Purpose:** Groups of players within a division

**Fields:**
- Team Name
- Division (dropdown)
- Team Captain (optional)
- Active Status

**Actions:**
- Create Team
- Edit Team
- View Roster (list of players)
- Delete Team (if no players)

**Roster View:**
- Shows all players on team
- Payment status for each
- Quick links to player details

**Access:** EXECUTIVE, COMMISSIONER

---

### 3.7 Players
`/league/players`

**Purpose:** Individual player records

**Fields:**
- Player Name
- Division (dropdown)
- Team (dropdown - filtered by division)
- Instagram Handle
- Linked User Account (optional - for online registration)

**Actions:**
- Create Player (manually add)
- Edit Player
- View Player Details
- Delete Player

**Player Detail View Shows:**
- Personal info
- Team assignment
- Division details
- Payment status and history
- Jersey order info

**Link to User Account:**
- Connects player to user who registered online
- Allows player to log in and view their info
- Shows user's email and phone

**Access:** EXECUTIVE, COMMISSIONER

---

## 👕 **4. JERSEY MANAGEMENT**

### Location
`/jerseys`

### Purpose
Track jersey orders and sizes for each team.

### Features

#### **Jersey Dashboard**
- **By Team View** - Shows all teams with jersey orders
- **Status Indicators:**
  - X jerseys ordered
  - X sizes collected
  - X pending

#### **Team Jersey View** (`/jerseys/[teamId]`)
Shows all players on team with:
- Player Name
- Jersey Size (if provided)
- Order Status
- Notes

**Actions:**
- View jersey details per player
- Export to CSV (for supplier orders)

#### **CSV Export**
Downloads file with:
- Player Name
- Team Name
- Jersey Size
- Division
- Any special notes

**Usage Flow:**
1. Players provide jersey sizes (usually during registration)
2. Admin views jersey dashboard
3. Sees which teams/players have pending sizes
4. Exports CSV to send to jersey supplier
5. Places bulk order

**Access:** EXECUTIVE, COMMISSIONER

---

## 🏆 **5. GAMES & SCHEDULING**

### Location
`/games`

### Purpose
Manage game schedules and results.

### Features

#### **Games List**
- Filter by Division
- Shows:
  - Date & Time
  - Home Team vs Away Team
  - Location
  - Status (Scheduled, In Progress, Completed)

#### **Create Game**
**Fields:**
- Division (dropdown)
- Home Team (dropdown - filtered by division)
- Away Team (dropdown - filtered by division)
- Game Date
- Game Time
- Location (dropdown)

**Validation:**
- Can't schedule same team twice at same time
- Location must be available
- Teams must be in same division

#### **Game Detail View** (`/games/[divisionId]`)
Shows:
- Game details
- Teams
- Location
- Score (if completed)
- Link to scorekeeper
- Link to photos

**Access:** EXECUTIVE, COMMISSIONER, SCOREKEEPER (view only), PHOTOGRAPHER (view only)

---

## 📊 **6. SCOREKEEPER SYSTEM**

### Location
`/scorekeeper`

### Purpose
Live game scoring interface for scorekeepers.

### Features

#### **Select Game**
- Shows games for today/this week
- Filter by division
- Click game to open scoring interface

#### **Scoring Interface** (`/scorekeeper/[gameId]`)

**Left Side - Team Rosters:**
- Home team players (clickable)
- Away team players (clickable)

**Center - Game Events:**
- Chronological list of:
  - Goals (player name, team, time)
  - Assists
  - Other events
- Edit/Delete buttons per event

**Right Side - Score & Time:**
- Current score (Home X - X Away)
- Game clock
- Period indicator
- Start/Stop/Reset buttons

**Adding a Goal:**
1. Click player name from roster
2. Goal auto-added to events
3. Score updates
4. Option to add assist

**Game Management:**
- Start clock
- Pause clock
- End period
- Final whistle
- Submit final score

**Access:** EXECUTIVE, COMMISSIONER, SCOREKEEPER

---

## 📸 **7. PHOTO MANAGEMENT**

### Two Types of Photos

---

### 7.1 Game Photos
`/photos`

#### **Overview**
- Shows games without photos
- Filter by division
- Click game to upload photos

#### **Upload Interface** (`/photos/[gameId]`)
- Drag & drop photo upload
- Bulk upload support
- Preview thumbnails
- Assign photos to game
- Auto-links to game record

**Usage:**
Photographers upload action shots from games.

---

### 7.2 Media Day Photos
`/photos/media-day`

#### **Overview**
Individual player headshots/team photos taken on media day.

#### **Select Session** (`/photos/media-day`)
- Shows available media day sessions by:
  - Location
  - Date
- Click to open upload interface

#### **Upload Interface** (`/photos/media-day/[locationId]/[date]`)
- Upload player photos
- Match photo to player (dropdown)
- Bulk upload with auto-matching (by file name)
- Preview and crop
- Save to player record

#### **Upload Page** (`/photos/media-day/upload`)
Create new media day session:
- Select location
- Select date
- Begin uploading

**Usage Flow:**
1. Schedule media day
2. Take player photos
3. Upload and match to player records
4. Photos visible in player profiles

**Access:** EXECUTIVE, COMMISSIONER, PHOTOGRAPHER

---

## ⚙️ **8. SETTINGS**

### 8.1 Staff Management
`/settings/admins`

**Purpose:** Manage admin accounts and roles.

#### **Staff List**
Shows all admins with:
- Name
- Email
- Role (EXECUTIVE, COMMISSIONER, SCOREKEEPER, PHOTOGRAPHER)
- Status (Active/Inactive)

#### **Create Staff** (`/settings/admins/new`)
**Fields:**
- Name
- Email (unique)
- Phone Number (optional)
- Role (dropdown)
- Password

**Process:**
1. Creates admin account
2. Hashes password
3. Sends credentials (manual)
4. Admin can log in

#### **Staff Detail View** (`/settings/admins/[id]`)
Shows:
- Personal info
- Role and permissions
- Account status
- Created date
- Last login

**Actions:**
- Edit Details → Opens edit page
- Deactivate/Reactivate
- Delete (permanent)

#### **Edit Staff** (`/settings/admins/[id]/edit`)
**Editable:**
- Name
- Email (with uniqueness check)
- Phone Number
- Role (disabled if editing own account)
- Reset Password (optional checkbox)

**Protections:**
- Can't change own role (prevents privilege loss)
- Email must be unique
- Can't delete own account

**Access:** EXECUTIVE only (manage_admins permission)

---

### 8.2 Profile Settings
`/settings/profile`

**Purpose:** Self-service profile management for all admins.

#### **Editable Fields:**
- Name
- Phone Number

#### **Read-Only:**
- Email (must contact admin to change)
- Role (determined by admin)

#### **Change Password:**
- Click "Change Password" button
- Modal opens requiring:
  - Current Password
  - New Password (8+ chars, uppercase, lowercase, number)
  - Confirm New Password

**Validation:**
- Current password must be correct
- New password must differ from current
- Password strength requirements enforced

**Access:** ALL ROLES

---

### 8.3 Terminal Settings
`/settings/terminal`

**Purpose:** Manage Stripe Terminal card readers.

#### **Features:**
- Register new terminal/reader
- View connected terminals
- Test connection
- Configure location assignment

#### **Usage:**
Terminals used for in-person card payments (Terminal payment type).

**Access:** EXECUTIVE, COMMISSIONER

---

## 📤 **9. EXPORTS**

### Location
`/exports/players`

### Purpose
Export player data to CSV for external use.

### Features

#### **Player Export**
**Fields Included:**
- Player Name
- Team Name
- Division
- City
- Location
- Email (if user linked)
- Phone (if user linked)
- Instagram
- Payment Status
- Amount Paid
- Jersey Size

**Filters:**
- By City
- By Division
- By Team
- By Payment Status

**Usage:**
- Email lists
- Jersey orders
- Event planning
- External reporting

**Access:** EXECUTIVE only (export_players permission)

---

## 🔐 **10. AUTHENTICATION & PERMISSIONS**

### Roles & Access Matrix

| Feature | Executive | Commissioner | Scorekeeper | Photographer |
|---------|-----------|--------------|-------------|--------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Payments | ✅ Full | ✅ Full | ❌ | ❌ |
| Cities | ✅ Full | ❌ | ❌ | ❌ |
| Locations | ✅ Full | ❌ | ❌ | ❌ |
| Levels | ✅ Full | ❌ | ❌ | ❌ |
| Pricing | ✅ Full | ❌ | ❌ | ❌ |
| Divisions | ✅ Full | ✅ Full | ❌ | ❌ |
| Teams | ✅ Full | ✅ Full | ❌ | ❌ |
| Players | ✅ Full | ✅ Full | ❌ | ❌ |
| Games | ✅ Full | ✅ Full | ✅ View | ✅ View |
| Jerseys | ✅ Full | ✅ Full | ❌ | ❌ |
| Photos | ✅ Full | ✅ Full | ❌ | ✅ Full |
| Scorekeeper | ✅ Full | ✅ Full | ✅ Full | ❌ |
| Staff | ✅ Full | ❌ | ❌ | ❌ |
| Terminal | ✅ Full | ✅ Full | ❌ | ❌ |
| Profile | ✅ | ✅ | ✅ | ✅ |
| Exports | ✅ | ❌ | ❌ | ❌ |

---

## 📋 **11. KEY WORKFLOWS**

### Workflow 1: New Season Setup (Executive)
1. Create City (if new location)
2. Add Location (venues/courts)
3. Create Competition Levels
4. Set up Pricing Tiers
5. Create Divisions (assign city, location, level, pricing)
6. Wait for teams to register online
7. Create teams manually (if needed)

### Workflow 2: Team Registration (Manual)
1. Go to Teams → Create New
2. Select Division
3. Enter Team Name
4. Add Players (one by one or wait for online registration)
5. Assign Team Captain
6. Players register online OR admin adds manually

### Workflow 3: Processing Payments
1. Go to Payments dashboard
2. Filter to "Unpaid"
3. Click player
4. Options:
   - **Paid Online?** → Already processed automatically
   - **Cash?** → Mark as Cash
   - **E-Transfer?** → Mark as E-Transfer (individual or team)
   - **In Person?** → Use Terminal
   - **Need Reminder?** → Send SMS or notify captain

### Workflow 4: Handling Failed Payments
1. Go to Payments → "Has Issues"
2. Click player with failed payment
3. See which payment(s) failed
4. Options:
   - Try charging card again (if card valid)
   - Send payment link (if card expired)
   - Process via terminal (in person)
   - Contact player directly

### Workflow 5: Jersey Orders
1. Wait for players to provide sizes (during registration)
2. Go to Jerseys dashboard
3. Review which players have provided sizes
4. Export to CSV (by team or division)
5. Send CSV to supplier
6. Place order

### Workflow 6: Game Day Operations
1. **Before:** Schedule games (assign teams, location, time)
2. **During:** Scorekeeper uses scorekeeper interface to record goals/events
3. **After:**
   - Photographer uploads game photos
   - Scores finalized and visible in games list

### Workflow 7: Media Day
1. Schedule media day session (location + date)
2. Set up equipment on-site
3. Take player photos
4. Upload to `/photos/media-day/upload`
5. Match photos to players
6. Photos now visible in player profiles

---

## 🔍 **12. IMPORTANT TECHNICAL DETAILS**

### Payment Status Logic

**UNPAID:**
- No PaymentMethod record exists for player

**IN PROGRESS:**
- PaymentMethod exists with type "INSTALLMENTS"
- Status is "IN_PROGRESS"
- At least 1 payment succeeded, but not all 8

**HAS ISSUES:**
- PaymentMethod type "INSTALLMENTS"
- At least 1 payment has status "failed"
- Requires manual intervention

**PAID:**
- PaymentMethod status is "COMPLETED"
- Could be: FULL_PAYMENT, INSTALLMENTS (all 8 done), CASH, TERMINAL, E_TRANSFER

### Installment Payment Schedule
- **Payment #1 (Down Payment):** $60
- **Payments #2-8 (Monthly):**
  - Early Bird: $25/month × 7 = $175
  - Regular: $30/month × 7 = $210
- **Total:**
  - Early Bird: $235
  - Regular: $270

### E-Transfer Transaction Linking
- Multiple players can be paid with single e-transfer
- System generates unique `transactionId` (UUID)
- All players from same e-transfer share this ID
- Helps track bulk payments from team captains

### Stripe Integration
- **Connected Accounts** - Each city has own Stripe account
- **Terminal Readers** - Physical card readers for in-person
- **Payment Links** - Generated for SMS/email payments
- **Automatic Retries** - Failed installments retry 3 times

### SMS/Communication
- **Twilio Messaging Service** - Used for all SMS
- **Reminder Types:**
  - Payment reminders
  - Team captain notifications
  - Payment link delivery

---

## ❓ **13. ANSWERS TO KEY TECHNICAL QUESTIONS**

### Q1: What is "Linkage Rate" in Dashboard?
**Answer:** Linkage rate tracks how many players are connected to user accounts (online registrations).
- **withUser** = Players who have a connected user account (can log in, registered online)
- **withoutUser** = Players added manually by admin without user account
- **linkageRate** = Percentage of players with user accounts
- **Why it matters:** Players with user accounts can view their info, make payments online, and receive automated emails

### Q2: E-Transfer Partial Payments - What status do they create?
**Answer:** E-Transfer payments support partial payments with automatic status progression:
- **First partial payment** (< full amount): Creates PaymentMethod with status "IN_PROGRESS"
- **Additional partial payments**: Adds to eTransferPayments array, remains "IN_PROGRESS"
- **Final payment** (total >= originalPrice): Auto-updates to "COMPLETED"
- **Technical:** Pre-save hook in PaymentMethod model auto-calculates total and updates status (lines 223-241)

### Q3: Is Pricing assigned per Division or per Player?
**Answer:** Pricing is assigned at the **Division level**, players inherit from their division.
- Division.prices object contains references to different Price records:
  - `earlyBird` - Early bird one-time price
  - `regular` - Regular one-time price
  - `installment` - Early bird installment pricing
  - `regularInstallment` - Regular installment pricing
- Players get pricing based on:
  - Which division they're in
  - What pricing tier they select (Early Bird vs Regular)
  - Whether earlyBird deadline has passed

### Q4: Can Games be edited/rescheduled after creation?
**Answer:** NO - There is no game edit functionality.
- No `/games/[id]/edit` route exists
- Games can only be:
  - Created (scheduled)
  - Viewed
  - Scored (via scorekeeper)
  - Deleted (presumably via API but no UI exists)
- **Workaround:** To reschedule, must delete and recreate the game

### Q5: Is there a limit to Media Day photos per player?
**Answer:** NO visible limit in the code.
- Upload interface allows multiple photo uploads
- Player model doesn't show max photo constraint
- Stored as array in database (no size limits defined)
- Practical limit would be storage/bandwidth

### Q6: Are there other export types besides Players?
**Answer:** YES - Jersey CSV export exists:
- **Player Export:** `/exports/players` - Full player data (Executives only)
- **Jersey Export:** Embedded in `/jerseys/[teamId]` - Team jersey order data (CSV button)
- Jersey export includes: Player name, team, size, division
- No other export endpoints found in codebase

### Q7: Does Terminal Payment require active reader?
**Answer:** YES - Terminal payments require a connected, online Stripe Terminal reader.
- Modal fetches available readers: `GET /api/v1/terminal/readers`
- Only shows readers with status "online"
- If no online readers: Shows warning message + link to register terminal
- Payment flow:
  1. Select online reader
  2. Enter amount
  3. System sends payment intent to reader
  4. Customer presents card at physical terminal
  5. Polls for payment status every 1 second (max 60 attempts)
  6. Updates PaymentMethod record when successful
- **Cannot process terminal payment manually** - requires physical card reader

### Q8: Test/Demo Data for Tutorials?
**Answer:** NO specific test city found in code, but I can see city structure:
- Tutorial screenshots should use generic examples: "Example City", "Toronto", etc.
- Or ask user to create a test city: "Demo City" for tutorial purposes
- Current system appears to be production with real cities (based on model structure)

---

*Last Updated: December 29, 2024*
*Status: COMPLETE - All major features documented and verified*
