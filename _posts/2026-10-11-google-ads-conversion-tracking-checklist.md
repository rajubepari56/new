---
title: Google Ads Conversion Tracking Checklist
description: A simple checklist to set up and verify Google Ads conversion tracking for calls, forms and sales, so bidding learns from real results.
date: 2026-10-11 00:01:00 +0000
category: Google Ads
services:
- google-ads
- google-tag-manager
- enhanced-offline-conversions
author: Raju Bepari
---
<div class="callout" markdown="1">
**Key takeaways**

- Google Ads optimises toward whatever you tell it to count. If you count the wrong things, it finds more of the wrong things.
- Track real business outcomes: calls, quote forms, bookings and purchases.
- Test every conversion yourself before you trust it.
</div>

If your campaigns bring clicks but few real customers, the problem is often not the ads. It is the tracking. Smart Bidding uses your conversion data to decide who to show your ads to. Bad data means bad decisions.

This checklist covers what to set up and how to confirm it works.

## 1. Write down the outcomes that make you money

Start with a short list. For a local service business it might be:

- A phone call from an ad or from your website
- A quote or booking form submitted
- A booked appointment

For a store it is usually a purchase, with its value.

Do not start with "page views" or "time on site". They are not outcomes.

## 2. Choose your primary conversion actions

In Google Ads, each conversion action is either **primary** or **secondary**. Primary actions are used for bidding. Secondary actions are only for reporting.

Make only your real outcomes primary. A button click, a scroll or a visit to a thank-you page you can reach without ordering should not be primary.

## 3. Use one clean tagging setup

The most common setup is the Google tag and conversion tags managed in Google Tag Manager. Whichever you pick, avoid mixing several methods for the same action. Two tags for one form means double counting.

## 4. Track forms when they succeed

Fire the conversion when the form is **successfully submitted**, not when someone clicks the Submit button. A person who sees an error is not a lead.

Common ways to do this are a thank-you page, or a success event your site sends to the data layer.

## 5. Track calls in all three places

- **Calls from ads:** call assets and call-only ads, with a minimum call length so very short calls do not count.
- **Click-to-call on your site:** track taps on the phone number on mobile.
- **Calls from your website:** use a Google forwarding number if you want website calls tied back to the ad.

## 6. Send value for purchases

For online sales, send the **order value**, the currency and a **transaction ID**. The ID stops the same order being counted twice if someone refreshes the page.

## 7. Set the counting method

For leads, counting **one** conversion per click is usually right. For purchases, counting **every** conversion is usually right. This is set on each conversion action.

## 8. Add enhanced conversions

Enhanced conversions send hashed customer details (such as an email address from your form) to Google to improve matching when cookies are limited. They are worth turning on for both web sales and lead forms. See my service page on [enhanced and offline conversions](/services/enhanced-offline-conversions/) for more.

## 9. Respect consent

If you have visitors from the European Economic Area or the UK, set up **Consent Mode v2** so your tags follow each visitor's choice. Measurement still works where consent allows it.

## 10. Test it yourself

Do not trust a green tick. Test:

1. Open your site in a private window.
2. Click through an ad (or use Google Tag Assistant or Tag Manager Preview mode).
3. Submit a test form, make a test call and complete a test order if you can.
4. Check that each action appears in Tag Manager Preview and later as a recorded conversion in Google Ads. Some conversions take hours to show.

## Mistakes that come up often

- Counting page views or button clicks as conversions
- Two tags for the same action, so every lead counts twice
- GA4 imports and native Google Ads conversions both set as primary for the same outcome
- Forms that fire on click, not on success
- No value on purchases

## What next

Do this check every few months, and after any website change. If you would like someone to audit your setup, see [Google Tag Manager](/services/google-tag-manager/) and [Google Ads management](/services/google-ads/), or message me for a free strategy call.
