---
title: 'Consent Mode v2: What It Is and Do You Need It?'
description: 'Consent Mode v2 in plain English: what it does, who needs it, how it affects Google Ads and GA4 data, and what to set up first.'
date: 2026-10-19 08:00:00 +0000
category: Tracking
services:
- google-tag-manager
- ga4
- server-side-tracking
author: Raju Bepari
image: /assets/images/blog/consent-mode-v2-explained.jpg
feature: /assets/images/blog/consent-mode-v2-explained.webp
feature_alt: 'Four consent toggles: ad_storage, analytics_storage, ad_user_data and ad_personalization'
---
<div class="callout" markdown="1">
**Key takeaways**

- Consent Mode v2 tells Google tags what a visitor agreed to, so they behave accordingly.
- If you advertise to people in the European Economic Area or the UK, Google expects you to use it.
- It does not replace a cookie banner or legal advice. You still need a proper consent tool and a privacy policy.
</div>

## What it is

Consent Mode is a way of passing the visitor's cookie choice to Google tags. Version 2 adds two signals, **ad_user_data** and **ad_personalization**, to the existing **ad_storage** and **analytics_storage**. Each one is set to granted or denied.

## What happens when consent is denied

Tags adjust. Instead of storing cookies, they can send limited, cookieless pings. Google can use those signals to model some of the missing conversions in reports. This is modelling, not exact counting, so numbers will not match your own records perfectly.

## Who needs it

If you run Google Ads or use Google's audience features for visitors in the EEA or the UK, Google requires consent signals. If you only serve other regions, you may not be required to, but many businesses set it up anyway. The right choice depends on your visitors and your local law, so ask a legal adviser if you are unsure.

## The order matters

The defaults must be set **before** the Google tag loads. If a tag loads first, it can fire without knowing the visitor's choice. On this site, I set all four signals to denied by default and update them when the visitor accepts.

## A simple setup order

1. Choose a consent banner that supports Consent Mode.
2. Set default consent to denied for the four signals.
3. Update the signals when the visitor makes a choice.
4. Check in Tag Manager preview that tags respect the choice.
5. Test that conversions still appear in Google Ads and GA4 after consent.

## Where it connects to the rest of tracking

Consent decides what data can be sent. [Server-side tracking](/blog/server-side-tracking-worth-it/) and [enhanced conversions](/blog/send-crm-sales-back-to-google-ads/) both need to respect it. I include consent logic in every [Google Tag Manager setup](/services/google-tag-manager/). If you want your setup checked, [ask me for a free audit](/contact/?service=google-tag-manager).
