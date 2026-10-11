---
title: How to Send CRM Sales Back to Google Ads
description: How offline conversion import works, what you need to capture on your forms, and how to teach Google Ads which leads became customers.
date: 2026-10-11 00:05:00 +0000
category: Google Ads
services:
- enhanced-offline-conversions
- google-ads
- server-side-tracking
author: Raju Bepari
---
<div class="callout" markdown="1">
**Key takeaways**

- Many leads never become customers. Google Ads cannot tell the difference unless you tell it.
- Offline conversion import sends your real outcomes (booked jobs, sales) back to Google Ads.
- You need a way to link each lead back to the ad click that brought it.
</div>

Imagine two leads. One fills your form and never answers the phone. The other books a job worth thousands. To Google Ads, both look the same: one form. So the system learns to find more form fills, not more customers.

Sending your real results back fixes this.

## How it works

1. A visitor clicks your ad. Google adds a click ID to the page address (the **GCLID**, or on some iPhone traffic a **GBRAID** or **WBRAID**).
2. Your website saves that ID with the form entry.
3. The lead goes into your CRM or sheet with the ID attached.
4. When the lead becomes a customer, you send Google Ads the click ID, the time and the value.
5. Google Ads connects the sale to the click and the keyword, and can use it for reporting and bidding.

## What to set up

**On your website**

- Capture the click ID in a hidden form field
- Pass it to your CRM with the lead

**In your CRM or sheet**

- Store the click ID, lead date and status
- Add the sale date and value when the lead converts

**In Google Ads**

- Create an **import** conversion action for the offline event (for example "Booked job")
- Decide the stage that counts, such as "Qualified lead" or "Sale"

## Three ways to send the data

- **Manual upload.** Export a sheet and upload it on a schedule. Good for low volume.
- **Scheduled upload.** Google Ads can read a file or Google Sheet on a schedule.
- **Integration or API.** Your CRM, a tool or a developer sends the data automatically.

## If you do not have a click ID

Use **enhanced conversions for leads**. It uses hashed customer details, like an email address from the form, to match leads to ad clicks. It can work alongside the click ID method.

## Rules of thumb

- Upload soon. Click IDs can only be used for a limited time after the click, so check Google's current limits and upload regularly.
- Send a **value** when you can. It helps Google Ads understand which leads matter most.
- Keep your conversion time and time zone consistent.
- Check **diagnostics** in Google Ads after your first uploads to catch errors.
- Be patient. Bidding needs enough conversions to learn from.

## Which stage should I send?

Do not send only the final sale if sales are rare. A good plan is to send two or three stages, such as "Qualified lead" and "Sale", and use the earlier one for bidding until you have enough sales.

## Privacy

Handle customer data with care. Only send what your privacy policy allows, hash personal data where Google requires it, and respect consent.

## Where I can help

I set up the form capture, CRM mapping and uploads, and I check the results in diagnostics. Read about [enhanced and offline conversions](/services/enhanced-offline-conversions/), or see how this fits local businesses on my [Google Ads for contractors](/google-ads-for-contractors/) and [Google Ads for junk removal](/google-ads-for-junk-removal/) pages.
