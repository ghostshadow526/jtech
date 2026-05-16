# Paystack Integration Setup for Vercel Production

## Overview
This guide explains how to properly configure Paystack payment gateway for your JT Tech application running on Vercel with the domain `https://jcreativetechnologies.com/`.

## Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables (they're already in `.env` locally):

| Variable Name | Value | Environment |
|---|---|---|
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_live_YOUR_PUBLIC_KEY` | Production |
| `PAYSTACK_SECRET_KEY` | `sk_live_YOUR_SECRET_KEY` | Production |
| `DOMAIN` | `https://jcreativetechnologies.com` | Production |

4. Click "Save" for each variable
5. **Redeploy** your project for changes to take effect

## Step 2: Configure Paystack Dashboard

1. Go to https://dashboard.paystack.com/ and log in
2. Navigate to **Settings → API Keys & Webhooks**

### Update Live URLs:

**Live Callback URL:**
```
https://jcreativetechnologies.com
```

**Live Webhook URL:**
```
https://jcreativetechnologies.com/api/webhook/paystack
```

3. Click **Save Changes**

## Step 3: IP Whitelist (Optional)

If you want to restrict webhook access to Paystack's IP addresses:
1. Go to **Settings → IP Whitelist**
2. Add Paystack's server IP addresses (Paystack will provide these)
3. Click **Save**

## Step 4: Verify Setup

1. Test payment flow:
   - Go to Add Funds page on your live site
   - Select an amount
   - Click "Initialize Payment"
   - Complete test transaction (use Paystack test cards if switching to test mode)

2. Check webhook:
   - Once payment succeeds, your user's balance should update instantly
   - Server logs at `/api/webhook/paystack` should show successful verification

## How It Works in Production

### Client Flow:
1. User visits Add Funds page at `https://jcreativetechnologies.com/dashboard`
2. Selects amount and clicks "Initialize Payment"
3. Paystack payment dialog opens using your **Live Public Key**
4. After successful payment, balance updates in Firestore
5. Payment reference is shown to user

### Backend Flow:
1. Paystack sends payment confirmation to `https://jcreativetechnologies.com/api/webhook/paystack`
2. Server verifies webhook signature using **Secret Key**
3. Transaction is logged (optional)
4. Response sent to Paystack

## Security Notes

- ✅ **Public Key** (`VITE_PAYSTACK_PUBLIC_KEY`): Safe to expose in frontend code
- 🔒 **Secret Key** (`PAYSTACK_SECRET_KEY`): Only used on backend, never exposed to client
- 🔒 **Webhook Signature**: Verified with HMAC-SHA512 to prevent tampering

## Troubleshooting

### Payment dialog doesn't appear
- Check browser console for errors
- Verify `VITE_PAYSTACK_PUBLIC_KEY` is set in Vercel environment
- Clear browser cache and reload

### Webhook not working
- Verify webhook URL is exactly: `https://jcreativetechnologies.com/api/webhook/paystack`
- Check Paystack dashboard webhook logs
- Ensure `PAYSTACK_SECRET_KEY` matches what's in Paystack dashboard

### Balance not updating
- Check Firestore rules allow updates to user balance
- Verify user is logged in when making payment
- Check browser console and server logs for errors

## Switching Between Test and Live Mode

To use test mode instead:
1. Get test keys from Paystack dashboard
2. Update environment variables in Vercel
3. Use test cards provided by Paystack
4. Redeploy project

To switch back to live:
1. Use live keys (already configured)
2. Real payments will be processed
3. Redeploy project

## Support

- Paystack Support: https://support.paystack.com
- Paystack API Docs: https://paystack.com/docs/api/
