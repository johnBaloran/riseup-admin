# Google Chat Daily Report Setup

This document explains how to set up the automated daily payment report that sends to Google Chat.

## 1. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Google Chat Webhook URL (required)
# Get this from Google Chat > Create Webhook in your space
GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/YOUR_SPACE/messages?key=YOUR_KEY&token=YOUR_TOKEN

# Daily Report Secret (optional but recommended)
# Generate with: openssl rand -hex 32
DAILY_REPORT_SECRET=your-random-secret-key-here
```

## 2. Create Google Chat Webhook

1. Open Google Chat and navigate to the space where you want reports
2. Click the space name at the top
3. Click "Apps & integrations"
4. Click "Add webhooks"
5. Give it a name like "Daily Payment Report"
6. Click "Save"
7. Copy the webhook URL and add to `.env.local` as `GOOGLE_CHAT_WEBHOOK_URL`

## 3. Test the Webhook

You can manually test the report by calling:

```bash
# Without authentication
curl http://localhost:3001/api/v1/reports/google-chat-daily

# With authentication (recommended)
curl -H "Authorization: Bearer your-random-secret-key-here" \
  http://localhost:3000/api/v1/reports/google-chat-daily
```

## 4. Set Up Daily Automation

### Option A: Vercel Cron Jobs (Recommended for Vercel deployments)

1. Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/v1/reports/google-chat-daily",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9:00 AM UTC. Adjust the cron expression as needed.

2. Deploy to Vercel - cron jobs work automatically in production

### Option B: External Cron Service

Use a service like:
- **cron-job.org** (free)
- **EasyCron** (free tier available)
- **UptimeRobot** (can ping URLs on schedule)

Configure them to call:
```
GET https://your-domain.com/api/v1/reports/google-chat-daily
Authorization: Bearer your-random-secret-key-here
```

### Option C: GitHub Actions

Create `.github/workflows/daily-report.yml`:

```yaml
name: Daily Payment Report

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-report:
    runs-on: ubuntu-latest
    steps:
      - name: Send Report
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.DAILY_REPORT_SECRET }}" \
            https://your-domain.com/api/v1/reports/google-chat-daily
```

Add `DAILY_REPORT_SECRET` to your GitHub repository secrets.

## 5. Report Format

The report will show:

```
📊 Daily Payment Report (Last 24 Hours)

🏙️ By City
• Toronto: 15 payments ($4,065)
• Vancouver: 8 payments ($2,168)
• Montreal: 3 payments ($813)

💰 Total Revenue: $7,046
👥 Total Payments: 26 players registered
```

## 6. Security Notes

- Always use the `DAILY_REPORT_SECRET` in production
- Keep your Google Chat webhook URL private
- The webhook URL should only be in `.env.local` (not committed to git)
- `.env.local` is already in `.gitignore`

## 7. Troubleshooting

**No message appears in Google Chat:**
- Check that `GOOGLE_CHAT_WEBHOOK_URL` is correct
- Verify the webhook is active in Google Chat settings
- Check Next.js logs for errors

**"Unauthorized" error:**
- Ensure `DAILY_REPORT_SECRET` matches in both `.env.local` and your cron service
- Include `Bearer ` prefix in Authorization header

**Empty report:**
- This is normal if no payments were made in the last 24 hours
- The message will show "No payments in the last 24 hours"

## 8. API Endpoint

**Endpoint:** `GET /api/v1/reports/google-chat-daily`

**Headers:**
```
Authorization: Bearer <DAILY_REPORT_SECRET>
```

**Response:**
```json
{
  "success": true,
  "message": "Daily report sent to Google Chat",
  "data": {
    "citiesBreakdown": [...],
    "totalRevenue": 7046,
    "totalPayments": 26
  }
}
```
