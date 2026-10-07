---
title: Meta Conversions API Setup
description: Meta Conversions API setup with Pixel, deduplication and event match quality in mind, so Meta sees the sales your ads drive.
service_name: Meta Pixel & Conversions API
short_name: Meta CAPI
keyword: Meta Conversions API setup
h1: Meta Conversions API Setup With Pixel Deduplication
outcome: Browser and server events working together, so Meta can optimise on the sales your ads really drive.
who_title: Who needs Meta CAPI
who:
- Advertisers who lost signal after iOS and browser privacy changes.
- Stores whose Meta purchases are far below the shop's orders.
- Lead businesses that want better lead quality from Meta.
problems_title: Meta tracking problems I fix
problems:
- Purchases missing or counted twice in Events Manager.
- Low event match quality.
- Pixel fires before consent.
- CAPI sends events with no matching Pixel event ID.
included_title: What a CAPI setup includes
included:
- Pixel and Events Manager audit
- Standard event setup (Lead, Purchase and more)
- Conversions API via GTM server or direct
- Event ID deduplication
- Customer data matching, hashed
- Test Events verification
- Consent-aware firing
- Handover notes
diagram_title: Pixel plus Conversions API
diagram:
- Browser Pixel
- Server event
- Dedupe by event ID
- Meta Events Manager
- Better optimisation
process_title: How a CAPI project runs
timeline: about 1 week, depending on platform and server setup.
process:
- t: Audit
  d: Check current Pixel and events.
- t: Plan
  d: Choose the CAPI route for your stack.
- t: Build
  d: Set up events and server sending.
- t: Dedupe
  d: Match browser and server events.
- t: Verify
  d: Test in Events Manager and report.
faq_title: Meta Pixel and CAPI questions
faqs:
- q: Do I still need the Pixel if I use CAPI?
  a: Yes. Meta recommends both, with deduplication so events count once.
- q: Does CAPI need a server?
  a: Not always. Some platforms have built-in options. For full control I use a server GTM setup.
- q: Will this fix iOS tracking losses?
  a: It improves the signal Meta receives. It cannot restore data users have opted out of.
- q: Do you set up Meta ads too?
  a: This service is tracking only. I can recommend the right next step for ads.
- q: How do we know it works?
  a: I check Test Events and the match quality score, and send you screenshots.
related:
- server-side-tracking
- google-tag-manager
- ga4
cta_title: Get Meta seeing your real sales
related_title: Related tracking for Meta ads
crumb: Meta Pixel & Conversions API
permalink: /services/meta-pixel-capi/
---
