---
title: 'Google Ads vs GA4: Why Numbers Don''t Match'
description: Why Google Ads and GA4 report different conversions, what is normal, what is a problem, and how to get numbers you can trust.
date: 2026-10-11 00:02:00 +0000
category: Analytics
services:
- ga4
- google-ads
- google-tag-manager
author: Raju Bepari
---
<div class="callout" markdown="1">
**Key takeaways**

- Google Ads and GA4 are built to count differently. Small gaps are normal.
- Big gaps usually come from different conversion definitions, tracking problems or consent.
- Pick one source of truth, ideally your own sales or leads list, and use the tools to explain the trends.
</div>

"Google Ads says 40 leads. GA4 says 28. My CRM says 31. Who is right?" It is one of the most common questions I get. The honest answer is that they are measuring different things in different ways.

## Why they differ

**1. Different jobs.** Google Ads credits only Google Ads clicks. GA4 looks at every channel (organic, email, direct and more) and can show a conversion under a different source.

**2. Different dates.** Google Ads usually reports a conversion on the day of the **ad click**. GA4 reports it on the day the **event happened**. A lead who clicks on Monday and fills the form on Thursday sits on different days in each tool.

**3. Different attribution.** Each tool uses its own attribution rules and its own lookback windows, so the same conversion can be credited to different channels.

**4. Different conversion definitions.** An action counted in one tool may not be counted in the other. A form "submit" in Ads might be a "generate_lead" event in GA4, and only one of them may be marked as a key event.

**5. Consent and blockers.** If a visitor declines cookies or uses an ad blocker, one tool may see them and the other may not, or one may model the data.

**6. Time zones and currencies.** An account set to one time zone and a property set to another will split days at different moments.

**7. Processing delays.** Both tools can take hours to update. Compare finished days, not today.

## What is normal?

A gap of a few percent is common. A gap of 30 percent or more is a sign to check your setup.

## How to narrow the gap

1. **Check the link.** Make sure Google Ads and GA4 are linked, and that auto-tagging is on in Google Ads.
2. **Compare the same thing.** Compare one conversion action in Ads with the matching key event in GA4, not all conversions with all events.
3. **Use the right date view.** In Google Ads, use the "by conversion time" columns when you want to compare with GA4 by event date.
4. **Match time zones.** Set the same time zone and currency in both.
5. **Remove duplicates.** One action should be tracked once. See our [conversion tracking checklist](/blog/google-ads-conversion-tracking-checklist/).
6. **Test consent.** Check how your tags behave when a visitor accepts or rejects cookies, and set up Consent Mode v2 if you need it.
7. **Look at the source.** Compare both tools with your CRM or booking list for the same dates.

## Which number should I use?

For decisions about money, start with your **own records**: leads, bookings and sales. Use Google Ads to see which campaigns and keywords bring them, and GA4 to see what visitors do on your site. When all three move in the same direction, you can trust the trend even if the totals differ.

## When to ask for help

Get a proper audit if the gap is large, if it suddenly changes, or if you are about to increase your budget. See [GA4 setup and audit](/services/ga4/) or message me for a free strategy call.
