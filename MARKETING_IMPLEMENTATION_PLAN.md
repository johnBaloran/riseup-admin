# Complete Marketing System - Phase-by-Phase Implementation Plan

**Goal:** Build a complete marketing/communications system to replace Mailchimp ($120/month) with integrated email + SMS campaigns, beautiful templates, analytics, and conversion tracking.

---

## 📋 PHASE 1: Foundation & MVP (Week 1 - 5 days)
**Goal:** Replace Mailchimp with basic email campaigns

### Day 1: Database Schema & Consent Management (6-8 hours)

**Morning: Database Models**
- [ ] 1.1: Add marketing fields to User model
  ```javascript
  // Add these fields to User schema
  - marketingEmailConsent: Boolean
  - marketingEmailConsentDate: Date
  - marketingEmailConsentSource: String
  - marketingSmsConsent: Boolean
  - marketingSmsConsentDate: Date
  - marketingSmsConsentSource: String
  - emailUnsubscribed: Boolean
  - emailUnsubscribedDate: Date
  - smsUnsubscribed: Boolean
  - smsUnsubscribedDate: Date
  ```

- [ ] 1.2: Create EmailTemplate model
  ```javascript
  EmailTemplate {
    name: String,
    subject: String,
    logo: String,
    body: String (HTML),
    category: String,
    createdBy: ObjectId,
    isDefault: Boolean,
    timesUsed: Number,
    createdAt: Date,
    updatedAt: Date
  }
  ```

- [ ] 1.3: Create Campaign model
  ```javascript
  Campaign {
    name: String,
    type: "email" | "sms" | "both",
    templateId: ObjectId,
    subject: String,
    body: String,
    smsMessage: String,

    // Filters
    filters: {
      cities: [ObjectId],
      divisions: [ObjectId],
      paymentStatuses: [String],
      registeredAfter: Date,
      registeredBefore: Date
    },

    // Stats
    status: "draft" | "sending" | "completed" | "failed",
    totalRecipients: Number,
    sent: Number,
    delivered: Number,
    failed: Number,
    opened: Number,
    clicked: Number,
    conversions: Number,
    revenue: Number,

    sentBy: ObjectId,
    sentAt: Date,
    completedAt: Date
  }
  ```

- [ ] 1.4: Create CampaignLog model
  ```javascript
  CampaignLog {
    campaignId: ObjectId,
    userId: ObjectId,

    // Email tracking
    email: String,
    resendEmailId: String,
    emailStatus: "sent" | "delivered" | "bounced" | "failed",
    sentAt: Date,
    deliveredAt: Date,
    opened: Boolean,
    openedAt: Date,
    openCount: Number,
    clicked: Boolean,
    clickedAt: Date,
    clickedUrl: String,

    // SMS tracking
    phoneNumber: String,
    twilioSid: String,
    smsStatus: "sent" | "delivered" | "failed",
    smsDeliveredAt: Date,

    // Errors
    errorMessage: String,
    failedAt: Date
  }
  ```

- [ ] 1.5: Run migration to add consent fields to existing users
  ```javascript
  // Migration script: Set all existing users to false
  await User.updateMany({}, {
    marketingEmailConsent: false,
    marketingSmsConsent: false
  });
  ```

**Afternoon: Registration Consent UI**
- [ ] 1.6: Update registration form with consent checkboxes
  - Add "I agree to receive marketing emails" checkbox (NOT pre-checked)
  - Add "I agree to receive marketing SMS" checkbox (NOT pre-checked)
  - Add help text explaining what they'll receive
  - CASL-compliant wording

- [ ] 1.7: Update registration API to save consent
  ```javascript
  // In registration handler
  user.marketingEmailConsent = formData.marketingEmailConsent || false;
  user.marketingEmailConsentDate = formData.marketingEmailConsent ? new Date() : null;
  user.marketingEmailConsentSource = 'registration';
  ```

- [ ] 1.8: Add consent management to user profile page
  - Toggle for email marketing consent
  - Toggle for SMS marketing consent
  - Show when they opted in
  - Save consent changes with timestamp

**Testing:**
- [ ] 1.9: Test registration flow with consent checkboxes
- [ ] 1.10: Verify consent is saved correctly
- [ ] 1.11: Test profile consent toggles

---

### Day 2: Campaign Builder - Audience Filters (6-8 hours)

**Morning: Marketing Page Structure**
- [ ] 2.1: Create `/marketing` route in app router
  ```
  src/app/(admin)/marketing/
    ├── page.tsx (campaign list)
    ├── new/page.tsx (create campaign)
    └── [campaignId]/page.tsx (campaign detail)
  ```

- [ ] 2.2: Create basic layout for marketing section
  - Navigation (Campaigns, Templates, Settings)
  - Permission check (only EXECUTIVE/COMMISSIONER)
  - Page header with tutorial link

- [ ] 2.3: Create campaign list page
  - Table showing past campaigns
  - Columns: Name, Type, Sent, Delivered, Opened, Date
  - "Create Campaign" button
  - Empty state

**Afternoon: Audience Filter Builder**
- [ ] 2.4: Create AudienceFilterBuilder component
  ```tsx
  <AudienceFilterBuilder
    filters={filters}
    onChange={setFilters}
  />
  ```

- [ ] 2.5: Implement filter options:
  - [ ] City multi-select (checkboxes)
  - [ ] Division multi-select
  - [ ] Payment status multi-select (paid, unpaid, on-track, issues)
  - [ ] Registration date range
  - [ ] "Only users with marketing consent" (always enforced)

- [ ] 2.6: Create API endpoint for preview count
  ```javascript
  // /api/marketing/preview
  POST: Calculate how many users match filters
  Return: { count, sampleUsers, breakdown }
  ```

- [ ] 2.7: Create PreviewPanel component
  - Shows recipient count in real-time
  - Shows breakdown (by city, division, etc.)
  - Shows first 10 sample recipients
  - Updates as filters change

**Testing:**
- [ ] 2.8: Test filter combinations
- [ ] 2.9: Verify preview count is accurate
- [ ] 2.10: Test with different user scenarios

---

### Day 3: Email Sending & Resend Integration (6-8 hours)

**Morning: Resend Setup**
- [ ] 3.1: Create Resend account
- [ ] 3.2: Verify domain (add DNS records)
  - SPF record
  - DKIM record
  - DMARC record (optional but recommended)
- [ ] 3.3: Install Resend SDK
  ```bash
  npm install resend
  ```
- [ ] 3.4: Add Resend API key to environment variables
  ```
  RESEND_API_KEY=re_xxxxx
  ```

**Afternoon: Email Sending Logic**
- [ ] 3.5: Create email sending service
  ```javascript
  // lib/services/emailCampaign.ts
  class EmailCampaignService {
    async sendCampaign(campaignId, filters)
    async sendToUser(campaignId, userId)
    async getUsersByFilters(filters)
  }
  ```

- [ ] 3.6: Implement batch sending
  ```javascript
  // Send in batches of 100, with 2-second delay
  for (let i = 0; i < users.length; i += 100) {
    const batch = users.slice(i, i + 100);
    await Promise.allSettled(batch.map(sendToUser));
    await sleep(2000);
  }
  ```

- [ ] 3.7: Create API endpoint for sending campaigns
  ```javascript
  // /api/marketing/campaigns/[campaignId]/send
  POST: Start sending campaign
  Returns: { success, campaignId }
  ```

- [ ] 3.8: Implement error handling & logging
  - Try-catch for each user
  - Log failures to CampaignLog
  - Continue on failure (don't stop entire campaign)

**Testing:**
- [ ] 3.9: Send test email to yourself
- [ ] 3.10: Test with 5 real users (with permission)
- [ ] 3.11: Verify delivery tracking works

---

### Day 4: Simple Templates & Campaign Flow (6-8 hours)

**Morning: Basic Email Composer**
- [ ] 4.1: Create EmailComposer component
  - Subject line input
  - Simple textarea for body (plain HTML for now)
  - Variable insertion buttons ({{userName}}, etc.)
  - Preview button

- [ ] 4.2: Create 2 hardcoded starter templates
  ```javascript
  const STARTER_TEMPLATES = {
    registration: {
      subject: "Registration is now open!",
      body: "<p>Hi {{userName}},</p><p>Register now...</p>"
    },
    payment: {
      subject: "Payment reminder",
      body: "<p>Hi {{userName}},</p><p>Complete payment...</p>"
    }
  };
  ```

- [ ] 4.3: Create variable replacement function
  ```javascript
  function replaceVariables(template, user) {
    return template
      .replace(/\{\{userName\}\}/g, user.name)
      .replace(/\{\{playerNames\}\}/g, getPlayerNames(user))
      // ... etc
  }
  ```

**Afternoon: Complete Campaign Builder**
- [ ] 4.4: Build complete campaign creation flow
  - Step 1: Name campaign
  - Step 2: Choose template
  - Step 3: Edit subject/body
  - Step 4: Select audience (filters)
  - Step 5: Preview
  - Step 6: Send

- [ ] 4.5: Create "Send Test" functionality
  ```javascript
  // Send only to current admin
  const testMode = true;
  const users = testMode
    ? [currentAdmin]
    : await getUsersByFilters(filters);
  ```

- [ ] 4.6: Create confirmation dialog
  - Show: "Send to 847 users?"
  - Show: Estimated cost (if SMS)
  - Require confirmation before sending

**Testing:**
- [ ] 4.7: Create test campaign end-to-end
- [ ] 4.8: Send test to yourself
- [ ] 4.9: Verify variables are replaced correctly

---

### Day 5: Campaign History & Unsubscribe (4-6 hours)

**Morning: Campaign Detail Page**
- [ ] 5.1: Create campaign detail page
  - Campaign name, sent date, sent by
  - Stats: Sent, Delivered, Failed
  - Recipient list (paginated)
  - Failed sends with error messages

- [ ] 5.2: Create real-time progress view
  ```tsx
  // Shows progress while sending
  <ProgressBar
    current={campaign.sent}
    total={campaign.totalRecipients}
  />
  ```

- [ ] 5.3: Add "Retry Failed" functionality
  - List all failed sends
  - Button to retry individual failures
  - Button to retry all failures

**Afternoon: Unsubscribe Flow**
- [ ] 5.4: Create unsubscribe page
  ```
  /marketing/unsubscribe?email=xxx&token=xxx
  ```

- [ ] 5.5: Implement token generation
  ```javascript
  function generateUnsubscribeToken(email) {
    return createHash('sha256')
      .update(email + process.env.UNSUBSCRIBE_SECRET)
      .digest('hex');
  }
  ```

- [ ] 5.6: Add unsubscribe link to all email templates
  ```javascript
  // Footer in every email
  <a href="{{unsubscribeUrl}}">Unsubscribe</a>
  ```

- [ ] 5.7: Handle unsubscribe action
  ```javascript
  // Updates User.emailUnsubscribed = true
  await User.updateOne(
    { email },
    { emailUnsubscribed: true, emailUnsubscribedDate: new Date() }
  );
  ```

**Polish:**
- [ ] 5.8: Add loading states throughout
- [ ] 5.9: Add error toast notifications
- [ ] 5.10: Test complete user flow

**🎉 END OF PHASE 1: You can now send email campaigns and cancel Mailchimp!**

---

## 📧 PHASE 2: Rich Templates & Analytics (Week 2 - 5 days)
**Goal:** Beautiful user-created templates + tracking

### Day 6-7: Rich Text Template Builder (1-2 days)

**Day 6 Morning: Tiptap Setup**
- [ ] 6.1: Install Tiptap and extensions
  ```bash
  npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-text-style
  ```

- [ ] 6.2: Create TemplateBuilder component
  - Initialize Tiptap editor
  - Basic toolbar (bold, italic, headings)
  - Save/load functionality

**Day 6 Afternoon: Editor Features**
- [ ] 6.3: Add formatting toolbar
  - Bold, Italic, Underline
  - Headings (H1, H2, H3)
  - Text alignment (left, center, right)
  - Text color picker
  - Background color

- [ ] 6.4: Add image upload
  - File input for images
  - Upload to Cloudinary/S3
  - Insert image into editor

- [ ] 6.5: Add link insertion
  - URL input dialog
  - Insert/edit links
  - Remove links

**Day 7 Morning: Custom Components**
- [ ] 7.1: Create "Insert Button" component
  ```javascript
  function insertButton(editor) {
    const buttonHTML = `
      <a href="https://..." style="...">
        Button Text
      </a>
    `;
    editor.chain().focus().insertContent(buttonHTML).run();
  }
  ```

- [ ] 7.2: Create "Insert Pricing Table" component
  - Modal to configure pricing options
  - Generate HTML table with styling
  - Insert into editor

- [ ] 7.3: Create "Insert Player List" component
  - Inserts {{playerNames}} variable
  - With nice formatting

**Day 7 Afternoon: Template Management**
- [ ] 7.4: Create template list page (`/marketing/templates`)
  - Grid view of templates
  - Preview thumbnails
  - Edit/Delete actions
  - "Create Template" button

- [ ] 7.5: Create template CRUD API
  ```javascript
  // /api/marketing/templates
  GET: List templates
  POST: Create template

  // /api/marketing/templates/[id]
  GET: Get template
  PUT: Update template
  DELETE: Delete template
  ```

- [ ] 7.6: Integrate templates into campaign builder
  - Template selector
  - Load template into campaign
  - Allow editing before sending

- [ ] 7.7: Variable insertion dropdown
  - Dropdown with available variables
  - Click to insert {{variable}}
  - Reference guide showing all variables

**Testing:**
- [ ] 7.8: Create 3 test templates
- [ ] 7.9: Use template in campaign
- [ ] 7.10: Verify variables work

---

### Day 8-9: Email Analytics - Opens & Clicks (1-2 days)

**Day 8 Morning: Resend Webhooks**
- [ ] 8.1: Create webhook endpoint
  ```javascript
  // /api/webhooks/resend
  POST: Handle Resend webhooks
  ```

- [ ] 8.2: Configure webhook in Resend dashboard
  - Add your webhook URL
  - Subscribe to events: email.sent, email.delivered, email.bounced, email.opened, email.clicked

- [ ] 8.3: Verify webhook signature
  ```javascript
  function verifyResendWebhook(payload, signature) {
    // Verify webhook is from Resend
  }
  ```

**Day 8 Afternoon: Tracking Implementation**
- [ ] 8.4: Handle `email.delivered` event
  ```javascript
  await CampaignLog.updateOne(
    { resendEmailId: event.data.email_id },
    { emailStatus: 'delivered', deliveredAt: new Date() }
  );
  ```

- [ ] 8.5: Handle `email.opened` event
  ```javascript
  await CampaignLog.updateOne(
    { resendEmailId: event.data.email_id },
    {
      opened: true,
      openedAt: new Date(),
      $inc: { openCount: 1 }
    }
  );
  ```

- [ ] 8.6: Handle `email.clicked` event
  ```javascript
  await CampaignLog.updateOne(
    { resendEmailId: event.data.email_id },
    { clicked: true, clickedAt: new Date(), clickedUrl: event.data.url }
  );
  ```

- [ ] 8.7: Handle `email.bounced` event
  ```javascript
  await CampaignLog.updateOne(
    { resendEmailId: event.data.email_id },
    { emailStatus: 'bounced', errorMessage: event.data.reason }
  );

  // Mark user email as invalid
  await User.updateOne(
    { email: event.data.email },
    { emailBounced: true }
  );
  ```

**Day 9 Morning: Stats Aggregation**
- [ ] 9.1: Create nightly aggregation job
  ```javascript
  // Cron job: Update campaign stats from logs
  async function aggregateCampaignStats(campaignId) {
    const stats = await CampaignLog.aggregate([
      { $match: { campaignId } },
      { $group: {
        _id: null,
        delivered: { $sum: { $cond: [{ $eq: ['$emailStatus', 'delivered'] }, 1, 0] }},
        opened: { $sum: { $cond: ['$opened', 1, 0] }},
        clicked: { $sum: { $cond: ['$clicked', 1, 0] }},
        bounced: { $sum: { $cond: [{ $eq: ['$emailStatus', 'bounced'] }, 1, 0] }}
      }}
    ]);

    await Campaign.updateOne({ _id: campaignId }, { stats: stats[0] });
  }
  ```

- [ ] 9.2: Create real-time stats API
  ```javascript
  // /api/marketing/campaigns/[id]/stats
  GET: Return current stats (for live updates)
  ```

**Day 9 Afternoon: Analytics UI**
- [ ] 9.3: Update campaign detail page with stats
  - Delivery rate chart
  - Open rate chart
  - Click rate chart
  - Timeline graph (opens/clicks over time)

- [ ] 9.4: Add campaign comparison view
  - Table comparing multiple campaigns
  - Sort by open rate, click rate, etc.

- [ ] 9.5: Create simple dashboard
  - Total campaigns sent
  - Average open rate
  - Average click rate
  - Best performing campaign

**Testing:**
- [ ] 9.6: Send test campaign
- [ ] 9.7: Open email, click links
- [ ] 9.8: Verify webhooks are received
- [ ] 9.9: Verify stats update correctly

---

### Day 10: React Email Templates (1 day)

**Morning: React Email Setup**
- [ ] 10.1: Install React Email
  ```bash
  npm install react-email @react-email/components
  npm install --save-dev @react-email/cli
  ```

- [ ] 10.2: Create email templates directory
  ```
  emails/
    ├── components/
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   └── Button.tsx
    └── templates/
        ├── RegistrationAnnouncement.tsx
        ├── PaymentReminder.tsx
        └── EarlyBirdWarning.tsx
  ```

- [ ] 10.3: Create reusable email components
  ```tsx
  // emails/components/Header.tsx
  export function EmailHeader({ logo }) {
    return (
      <Img src={logo} width="200" height="60" />
    );
  }

  // emails/components/Footer.tsx
  export function EmailFooter({ unsubscribeUrl }) {
    return (
      <Text>
        RiseUp Basketball | 123 Main St, Toronto
        <Link href={unsubscribeUrl}>Unsubscribe</Link>
      </Text>
    );
  }

  // emails/components/Button.tsx
  export function EmailButton({ href, children }) {
    return (
      <Button href={href} style={{ ... }}>
        {children}
      </Button>
    );
  }
  ```

**Afternoon: Create Templates**
- [ ] 10.4: Create Registration template
  ```tsx
  // emails/templates/RegistrationAnnouncement.tsx
  export function RegistrationEmail({ userName, seasonName, price }) {
    return (
      <Html>
        <EmailHeader logo="..." />
        <Heading>Registration Open!</Heading>
        <Text>Hi {userName},</Text>
        <Text>Register for {seasonName} now!</Text>
        <EmailButton href="...">Register Now</EmailButton>
        <EmailFooter unsubscribeUrl="..." />
      </Html>
    );
  }
  ```

- [ ] 10.5: Create Payment Reminder template
- [ ] 10.6: Create Early Bird Warning template
- [ ] 10.7: Create Photo Available template
- [ ] 10.8: Create General Announcement template

**Integration:**
- [ ] 10.9: Update email sending to use React Email
  ```javascript
  import { render } from '@react-email/render';
  import { RegistrationEmail } from '@/emails/templates/RegistrationAnnouncement';

  const html = render(
    <RegistrationEmail userName={user.name} seasonName="Spring 2025" />
  );

  await resend.emails.send({
    from: '...',
    to: user.email,
    subject: '...',
    html: html
  });
  ```

- [ ] 10.10: Add template previews to template selector
- [ ] 10.11: Set up React Email dev server
  ```bash
  npm run email:dev
  # Preview at http://localhost:3000
  ```

**Testing:**
- [ ] 10.12: Preview all templates locally
- [ ] 10.13: Send test emails with each template
- [ ] 10.14: Verify mobile responsiveness

**🎉 END OF PHASE 2: Beautiful templates + open/click tracking!**

---

## 📱 PHASE 3: SMS + Advanced Features (Week 3 - 5 days)
**Goal:** Add SMS capability + conversion tracking

### Day 11-12: SMS Integration (1-2 days)

**Day 11 Morning: Twilio Setup**
- [ ] 11.1: Create Twilio account
- [ ] 11.2: Purchase phone number
- [ ] 11.3: Get API credentials
- [ ] 11.4: Install Twilio SDK
  ```bash
  npm install twilio
  ```
- [ ] 11.5: Add Twilio credentials to env
  ```
  TWILIO_ACCOUNT_SID=ACxxx
  TWILIO_AUTH_TOKEN=xxx
  TWILIO_PHONE_NUMBER=+1234567890
  ```

**Day 11 Afternoon: SMS Sending**
- [ ] 11.6: Create SMS sending service
  ```javascript
  // lib/services/smsCampaign.ts
  class SMSCampaignService {
    async sendCampaign(campaignId, filters)
    async sendToUser(campaignId, userId)
  }
  ```

- [ ] 11.7: Update campaign builder for SMS
  - Add "Type" selector: Email only, SMS only, Both
  - SMS message textarea (160 char limit)
  - Character counter
  - SMS preview

- [ ] 11.8: Implement SMS sending
  ```javascript
  const message = await twilio.messages.create({
    body: campaign.smsMessage,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: user.phoneNumber
  });

  await CampaignLog.updateOne(
    { campaignId, userId },
    { twilioSid: message.sid, smsStatus: 'sent' }
  );
  ```

- [ ] 11.9: Add SMS cost estimation
  ```javascript
  // Show in preview: "Est. SMS cost: $8.47 (847 × $0.01)"
  const estimatedCost = recipientCount * 0.01;
  ```

**Day 12 Morning: SMS Webhooks**
- [ ] 12.1: Create Twilio webhook endpoint
  ```javascript
  // /api/webhooks/twilio
  POST: Handle delivery status
  ```

- [ ] 12.2: Configure webhook in Twilio console
- [ ] 12.3: Handle SMS delivery events
  ```javascript
  if (req.body.MessageStatus === 'delivered') {
    await CampaignLog.updateOne(
      { twilioSid: req.body.MessageSid },
      { smsStatus: 'delivered', smsDeliveredAt: new Date() }
    );
  }
  ```

- [ ] 12.4: Handle SMS failures
  ```javascript
  if (req.body.MessageStatus === 'failed') {
    await CampaignLog.updateOne(
      { twilioSid: req.body.MessageSid },
      { smsStatus: 'failed', errorMessage: req.body.ErrorMessage }
    );
  }
  ```

**Day 12 Afternoon: SMS Analytics**
- [ ] 12.5: Create link shortener for SMS clicks
  ```javascript
  // /r/[code] - Redirect & track
  const shortLink = await ShortLink.create({
    campaignId,
    userId,
    originalUrl: fullUrl,
    shortCode: generateCode()
  });
  ```

- [ ] 12.6: Track SMS link clicks
  ```javascript
  // When /r/code is accessed
  await CampaignLog.updateOne(
    { campaignId: link.campaignId, userId: link.userId },
    { smsClicked: true, smsClickedAt: new Date() }
  );
  ```

- [ ] 12.7: Handle SMS replies (STOP = unsubscribe)
  ```javascript
  // Incoming SMS webhook
  if (body.toLowerCase().includes('stop')) {
    await User.updateOne(
      { phoneNumber: from },
      { smsUnsubscribed: true }
    );
  }
  ```

- [ ] 12.8: Update campaign stats for SMS
  - SMS sent, delivered, failed
  - SMS clicks (via short links)

**Testing:**
- [ ] 12.9: Send test SMS to yourself
- [ ] 12.10: Test STOP unsubscribe
- [ ] 12.11: Test link tracking

---

### Day 13: Conversion Tracking (1 day)

**Morning: UTM Parameters**
- [ ] 13.1: Add UTM generator utility
  ```javascript
  function addUTMParams(url, campaignId) {
    return `${url}?utm_source=email&utm_medium=campaign&utm_campaign=${campaignId}`;
  }
  ```

- [ ] 13.2: Automatically add UTM to all links in emails
  ```javascript
  // When sending email
  const htmlWithUTM = addUTMToAllLinks(email.html, campaign._id);
  ```

- [ ] 13.3: Create Conversion model
  ```javascript
  Conversion {
    campaignId: ObjectId,
    userId: ObjectId,
    action: "registration" | "payment" | "jersey_purchase",
    revenue: Number,
    convertedAt: Date,
    utmSource: String,
    utmCampaign: String
  }
  ```

**Afternoon: Conversion Attribution**
- [ ] 13.4: Track conversions in registration flow
  ```javascript
  // When user completes registration
  const utmCampaign = req.query.utm_campaign;

  if (utmCampaign) {
    await Conversion.create({
      campaignId: utmCampaign,
      userId: user._id,
      action: 'registration',
      convertedAt: new Date()
    });

    await Campaign.updateOne(
      { _id: utmCampaign },
      { $inc: { conversions: 1 } }
    );
  }
  ```

- [ ] 13.5: Track conversions in payment flow
  ```javascript
  // When payment completes
  await Conversion.create({
    campaignId: utmCampaign,
    userId: user._id,
    action: 'payment',
    revenue: paymentAmount,
    convertedAt: new Date()
  });

  await Campaign.updateOne(
    { _id: utmCampaign },
    { $inc: { conversions: 1, revenue: paymentAmount } }
  );
  ```

- [ ] 13.6: Create conversion attribution report
  - List conversions for each campaign
  - Total revenue per campaign
  - ROI calculation (revenue / cost)

**Analytics UI:**
- [ ] 13.7: Add conversion metrics to campaign detail
  - Conversions count
  - Revenue generated
  - Conversion rate
  - ROI percentage

- [ ] 13.8: Create "Top Performing Campaigns" report
  - Sort by conversions
  - Sort by revenue
  - Sort by ROI

**Testing:**
- [ ] 13.9: Send campaign with tracking links
- [ ] 13.10: Complete registration via link
- [ ] 13.11: Verify conversion is tracked

---

### Day 14: Scheduled Sends (1 day)

**Morning: Scheduling System**
- [ ] 14.1: Add scheduling to campaign model
  ```javascript
  Campaign {
    // ... existing fields
    scheduledFor: Date,
    isScheduled: Boolean
  }
  ```

- [ ] 14.2: Update campaign builder UI
  - "Send now" vs "Schedule for later"
  - Date/time picker
  - Timezone selector

- [ ] 14.3: Create scheduled campaigns queue
  ```javascript
  // Option A: Simple cron job (every 5 minutes)
  // Check for campaigns where scheduledFor <= now

  // Option B: BullMQ (more robust)
  import { Queue } from 'bullmq';
  const campaignQueue = new Queue('campaigns');

  await campaignQueue.add('send', { campaignId }, {
    delay: scheduledDate - Date.now()
  });
  ```

**Afternoon: Queue Processing**
- [ ] 14.4: Create queue processor
  ```javascript
  // workers/campaignWorker.ts
  const worker = new Worker('campaigns', async (job) => {
    const { campaignId } = job.data;
    await sendCampaign(campaignId);
  });
  ```

- [ ] 14.5: Add "Scheduled Campaigns" view
  - List upcoming scheduled campaigns
  - Cancel scheduled campaign
  - Edit scheduled campaign

- [ ] 14.6: Send notification when campaign completes
  - Email to admin who created it
  - Summary stats

**Testing:**
- [ ] 14.7: Schedule campaign for 5 minutes from now
- [ ] 14.8: Verify it sends automatically
- [ ] 14.9: Test canceling scheduled campaign

---

### Day 15: Advanced Filters & Polish (1 day)

**Morning: Advanced Filters**
- [ ] 15.1: Add more filter options
  - Players who haven't paid in X days
  - Players registered but no payment method
  - Players with specific jersey size
  - Players on teams created before/after date
  - Combined AND/OR logic

- [ ] 15.2: Create saved filter presets
  ```javascript
  FilterPreset {
    name: "Toronto Unpaid Players",
    filters: { cities: [...], paymentStatus: ['unpaid'] },
    createdBy: ObjectId
  }
  ```

- [ ] 15.3: Quick-select saved filters
  - Dropdown of saved presets
  - Load preset into campaign builder

**Afternoon: Polish & UX**
- [ ] 15.4: Add campaign duplication
  - "Duplicate Campaign" button
  - Copies all settings, allows editing

- [ ] 15.5: Add bulk actions
  - Select multiple campaigns
  - Delete selected
  - Export selected stats

- [ ] 15.6: Add email preview in browser
  - "Preview in browser" link in emails
  - `/marketing/preview/[campaignId]` route

- [ ] 15.7: Add A/B testing (basic)
  - Test 2 subject lines
  - Split audience 50/50
  - Show which performed better

**Final Testing:**
- [ ] 15.8: Send real campaign to 50+ users
- [ ] 15.9: Monitor delivery, opens, clicks
- [ ] 15.10: Fix any issues

**🎉 END OF PHASE 3: Full-featured marketing system!**

---

## 🎨 PHASE 4: Optional Enhancements (Week 4+)

### Week 4: Advanced Analytics
- [ ] Create dashboard with charts (Recharts)
- [ ] Email client breakdown (Gmail, Apple Mail, etc.)
- [ ] Device breakdown (mobile vs desktop)
- [ ] Geographic open tracking
- [ ] Cohort analysis (compare campaign groups)
- [ ] Predictive analytics (best send time)

### Week 5: Automation
- [ ] Triggered campaigns (when user registers → send welcome)
- [ ] Drip campaigns (series of emails over time)
- [ ] Re-engagement campaigns (inactive users)
- [ ] Birthday emails

### Week 6: Segmentation
- [ ] Advanced segment builder
- [ ] Dynamic segments (auto-update)
- [ ] Segment overlap analysis
- [ ] Export segments to CSV

---

## 📊 Success Metrics

After Phase 3, you should have:
- ✅ Sent 500+ marketing emails
- ✅ 50%+ open rate (industry avg is 20-25%)
- ✅ 10%+ click rate
- ✅ Tracked conversions and revenue
- ✅ Saved $120/month on Mailchimp
- ✅ Added SMS capability (Mailchimp doesn't have this)

---

## 🛠️ Technical Stack Summary

**Frontend:**
- Next.js App Router
- React
- Tailwind CSS
- Tiptap (rich text editor)
- Recharts (analytics charts)
- React DnD (drag-drop, optional)

**Backend:**
- Next.js API routes
- MongoDB (existing)
- Resend (email delivery)
- Twilio (SMS delivery)
- React Email (templates)

**Infrastructure:**
- Webhooks (Resend + Twilio)
- Cron jobs or BullMQ (scheduling)
- Cloudinary/S3 (image uploads)

---

## 💰 Cost Breakdown

**Monthly Operating Costs:**

**Mailchimp Current:**
- Email only: $120/month
- **Total: $120/month**

**New System (Slow Month - 1-2 campaigns to 500 people):**
- Resend: $0 (free tier up to 3,000 emails/month)
- Twilio SMS: $5-10
- **Total: ~$5-10/month**

**New System (Active Month - 4-5 campaigns to 1000 people):**
- Resend: $20/month (50,000 emails)
- Twilio SMS: $40-50
- **Total: ~$60-70/month**

**New System (Peak Registration - 10+ campaigns):**
- Resend: $20/month
- Twilio SMS: $100-150
- **Total: ~$120-170/month**

**Annual Savings:**
- Mailchimp: $1,440/year
- Your system (average): $640-840/year
- **Savings: $600-800/year**

**Plus you get:**
- ✅ SMS capability (Mailchimp doesn't have)
- ✅ Better integration with your data
- ✅ Real conversion tracking
- ✅ Full customization
- ✅ No contact limits

---

## ⏱️ Total Estimated Time

**Phase 1 (MVP - Replace Mailchimp):** 5 days
**Phase 2 (Templates + Analytics):** 5 days
**Phase 3 (SMS + Advanced):** 5 days
**Total: 3 weeks for full system**

**If working part-time (10 hours/week):**
- Phase 1: 3-4 weeks
- Phase 2: 2-3 weeks
- Phase 3: 2 weeks
- **Total: 7-9 weeks**

---

## 🎯 Milestones & Decision Points

**After Phase 1 (5 days):**
- ✅ Can send basic email campaigns
- ✅ Can cancel Mailchimp immediately
- ✅ Start saving $120/month
- **Decision:** Continue to Phase 2 for better templates?

**After Phase 2 (10 days):**
- ✅ Beautiful user-created templates
- ✅ Open/click tracking
- ✅ Better than Mailchimp for your use case
- **Decision:** Add SMS in Phase 3?

**After Phase 3 (15 days):**
- ✅ Complete marketing system
- ✅ Email + SMS campaigns
- ✅ Full analytics and conversion tracking
- **Decision:** Maintain or add Phase 4 enhancements?

---

## 🚀 Getting Started

**Next Steps:**
1. Review this plan
2. Decide which phases to build (recommend starting with Phase 1)
3. Set up development environment
4. Begin Day 1: Database Schema & Consent Management

**Ready to start coding?** Let me know and I'll begin with Phase 1, Day 1!
