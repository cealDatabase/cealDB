# 🚀 Quick Start - Automated Survey Scheduling

## Run These Commands First!

```bash
# 1. Update database schema
npm run db:push

# 2. Generate Prisma client
npx prisma generate --schema=./prisma/schema

# 3. Generate a cron secret
openssl rand -base64 32
# Copy the output and update CRON_SECRET in .env

# 4. Deploy to Vercel
git add .
git commit -m "Add automated survey scheduling"
git push
```

## Add to Vercel Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables:

```
CRON_SECRET=[the secret you generated above]
RESEND_API_KEY=re_KgTBbcLJ_7iPNcCLWJsFyhPaBAMAXKo4g
```

## Access the Feature

1. Sign in as Super Admin at https://cealstats.org
2. Go to **Admin Guide**
3. Click **"📅 Open/Close Annual Surveys"**
4. Create your schedule!

## That's It!

The system will automatically:
- ✅ Open forms on your scheduled date
- ✅ Close forms on your scheduled date
- ✅ Send emails to all members
- ✅ Send admin alerts to super admins
- ✅ Log everything in audit trail

**Zero manual work required!** 🎉

---

For detailed docs, see: `/docs/AUTOMATED_SURVEY_SCHEDULING.md`
