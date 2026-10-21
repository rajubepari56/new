# Raju Bepari: personal-brand creative direction and design specification

Status: **proposal for approval. No code has been changed.**

## 0. What I found in the current project

- Stack: Jekyll 4.4, plain HTML/CSS/JS, GSAP + Lenis + Three.js from CDN, Netlify. I will keep all of it.
- Already in place: the palette you listed (as CSS variables), Space Grotesk / Inter / JetBrains Mono, 9 services, 3 landing pages for niches, blog (7 posts), case studies, 7 result snapshots, 9 reviews, contact form with email notification, WhatsApp widget, leads dashboard, editor at /admin.
- Photos: `raju-hero.webp` is only **500 px square**. That is too small for a large hero and will look soft on retina screens. I need the original glasses photo (ideally 1600 px or wider). `raju-avatar.webp` (840 px) is fine for About, favicon and social image.
- Voice problems to fix in the build (all verified by search):
  - "We agree on goals..." (home, landing pages), "We set a starting budget...", "we can send those results back" (two landing pages), "so we can talk" (About), "See our service page" (2 blog posts).
  - "agencies" appears on the home page and About as a client type.
  - Reviews contain "our/we". These are clients' exact words, so I will **not** edit them.
- Visual problems: many equal glass cards in a row (the "repetitive cards" you want to avoid), 16 px rounded corners everywhere, one gradient-glow look on every section.

## 1. Personal brand positioning

**One-line value proposition (hero H1 candidates)**
1. "I fix the tracking behind your ads, then grow what the data proves works."
2. "Accurate data first. Profitable ad growth second. One specialist, start to finish."
Recommended: option 1. Sub-line: "Google Ads, GA4, GTM and server-side tracking for established businesses in the US, UK, Australia and Europe. You work with me directly. No account managers, no junior staff, no handoffs."

**Three proof pillars** (each backed by something real on the page)
1. **Direct access.** The person on the discovery call is the person in your ad account. Proof: 7+ years hands-on, Upwork profile link.
2. **Tracking before spend.** I audit and repair measurement first, so every decision rests on numbers that match your sales. Proof: how-I-track flow, the 9 services, the blog checklists.
3. **Verified results.** Real account screenshots, labelled with period and context, plus 200+ projects and 180 five-star reviews (your numbers). Proof: case studies, snapshots, reviews.

**Ideal client profile**
- Already spends on paid ads and wants accurate data and profitable scale.
- Local service businesses (home services, remodeling, flooring, legal), ecommerce stores (Shopify, WooCommerce, Wix), and marketing businesses that need a white-label tracking specialist.
- Has a working website and an offer, can give me account access, and wants a long-term specialist rather than a one-off favour.

**"Not a fit" list** (shown on the page, polite, plain)
- You want a guaranteed ranking, ROAS or lead count. I do not promise outcomes.
- You are not advertising yet and have no website or offer to send traffic to. (Start there first.)
- Your monthly ad budget is below [MINIMUM, to be confirmed by you].
- You want the lowest price or a bulk, no-access service.
- You need a large in-house team, 24/7 phone support, or work in a restricted category I do not take.
- You cannot give me access to your ad and analytics accounts.

**Messaging rules**
- First person singular only. Banned in my copy: agency, we, our, team, studio, firm, staff.
- Use "I" plus verbs: "I audit", "I fix", "I report".
- Quote client reviews exactly, never rewrite them.

## 2. Visual identity and art direction

Concept: **"Signal & Ledger."** A Swiss editorial page (strict grid, big quiet type, hairline rules, generous white space) with a technical layer of live data: event signals travelling along thin lines into a clean dashboard. The page reads like a well-edited report; the motion shows how data moves.

Principles:
- **Rules, not boxes.** Sections are separated by 1 px hairlines and numbered labels (01, 02...), not stacked glass cards. Cards are kept only where content is a distinct object (a case study, a screenshot).
- **One accent moment per screen.** Indigo is the structure; the four data colours appear only inside data graphics (event dots, chart series, status marks), never as decoration.
- **Photography:** Raju only. The glasses photo in the hero, cropped tight, on its indigo background, with a thin outline and a small data annotation. No stock images, no robots, no Google logos, no partner badges.
- **Imagery of work:** real, cropped dashboard screenshots with period labels (already honest-labelled in the current build).
- **Signature graphic:** a horizontal "signal line" that runs through the page: click > event > tag > conversion > report. It appears in the hero, the services section and the process, so the whole site shares one visual idea.
- **Tone of voice:** calm, specific, slightly dry. Numbers instead of adjectives.

## 3. Colour system

| Token | Hex | Use |
|---|---|---|
| `--bg` | #0A0B1E | page background |
| `--surface` | #12143A | panels, form, screenshots frame |
| `--surface-2` | #1A1D4D | raised or hovered panel (new) |
| `--primary` | #2B2FC7 | buttons, filled marks, active states |
| `--primary-deep` | #1E2390 | button hover, deep sections |
| `--primary-tint` | #8B8FFF | links and small accent text on dark (new) |
| `--text` | #F5F6FF | headings, body |
| `--muted` | #A7A9D6 | secondary text |
| `--line` | rgba(167,169,214,.18) | hairlines |
| `--blue` | #4285F4 | data series 1 |
| `--red` | #EA4335 | data series 2, errors |
| `--yellow` | #FBBC05 | data series 3, caution |
| `--green` | #34A853 | positive, WhatsApp-adjacent success |

Contrast (approximate, I will verify with axe during the build): text on bg ≈ 17:1, muted on bg ≈ 8.6:1, white on primary ≈ 9:1. **#2B2FC7 on the dark background is only about 2.2:1, so it is for fills only, never for text or thin lines.** Small accent text uses `--primary-tint` (≈ 6.9:1). The WhatsApp button keeps the darker green (#16763a) for white-text contrast.

## 4. Typography

- **Headlines:** Inter Tight 600, tight tracking (-0.02em). Swiss, sharp, more refined than the current Space Grotesk.
- **Editorial accent:** Instrument Serif italic, used for one or two words in a headline ("one *specialist*"). This is the single "custom" detail that separates the site from template looks.
- **Body:** Inter 400/500.
- **Data and labels:** JetBrains Mono 400/500, uppercase 12 px for section numbers and metric labels.
- Loading: Google Fonts, 4 families, `display=swap`, preconnect (as now).

Fluid type scale (clamp, 360 px to 1440 px):
`display 44→88` · `h1 36→64` · `h2 28→44` · `h3 20→26` · `lead 18→21` · `body 16→17` · `small 14` · `label 12 mono`.
Line-height: display 1.04, headings 1.12, body 1.6. Measure: body max 66 characters.

## 5. Design tokens

```
--space: 4px base → 4 8 12 16 24 32 48 64 96 144 (section padding 96 desktop / 64 mobile)
--radius-s: 4px  --radius-m: 8px  --radius-l: 14px (screenshots only)
--border: 1px solid var(--line)
--shadow-glow: 0 0 0 1px rgba(139,143,255,.25), 0 20px 60px rgba(43,47,199,.25)  (used once per screen)
--ease-out: cubic-bezier(.22,1,.36,1)   --ease-io: cubic-bezier(.65,0,.35,1)
--dur-fast: 160ms  --dur-base: 420ms  --dur-slow: 900ms
--z: nav 50, widget 60, consent 70, cursor 100
```
Tokens live in `:root` in `main.css` (existing pattern), so the editor and every page inherit them.

## 6. Layout and spacing

- 12-column grid, max width 1200 px, 24 px gutters (16 px on phones). Editorial asymmetry: text on columns 1-7, visual on 8-12; section label sits in a narrow left rail on desktop.
- Breakpoints: 390 / 768 / 1024 / 1440. Mobile first, no horizontal scroll.
- Vertical rhythm on an 8 px baseline; sections separated by a hairline and a numbered label.
- Section order alternates density: dense (data) then airy (statement), to avoid predictable stacking.

## 7. Component principles

- **Buttons:** one primary (WhatsApp, with real icon), one secondary (book a discovery call), text link as tertiary. Max two buttons per viewport.
- **Result badge:** `[metric] [value] · [period] · [context]`. A multiplier like 5X or 10X can appear **only** inside this component, only with all four parts and a source (screenshot or review). Without verified data the component does not render. Always followed by "Results vary by account."
- **Case study:** big headline number, a one-paragraph context, the work I did, the screenshot with its period label.
- **Fit filter:** two columns, "Right for me" and "Probably not a fit", written kindly and plainly.
- **Direct-line comparison:** a simple two-row table, "Working with me" vs "Typical hand-off setup", without naming anyone.
- **Form:** only name, email and service required (as now); budget optional and monthly; short helper text that states what happens next and when I reply.
- **Navigation:** slim top bar with the 8 services in a dropdown, profile icons, sticky WhatsApp widget (kept).
- **Accessibility:** visible focus rings, 4.5:1 text contrast, tap targets 44 px, semantic landmarks. I will re-run axe on every page.

## 8. Animation philosophy

"Motion explains the data." Every animation shows cause and effect (a signal travels, a number counts up, a line draws), never decoration.
- Always on for every visitor (your standing decision). I keep this; the one cost is that visitors who set "reduce motion" in their device still get animation. Say so if you ever want that changed.
- Hero: signal dots travel along the signal line into a small dashboard; counters for the real numbers.
- Scroll: GSAP ScrollTrigger reveals (translate 24 px + fade, 420 ms), the pinned process section, parallax only on the photo.
- Cursor: kept, simplified.
- Rules: nothing loops faster than 6 s, maximum two moving things per viewport, no content hidden behind an animation that fails (content is visible by default).
- Performance: keep Lighthouse performance 90+ on mobile; Three.js limited to the hero and loaded after first paint.

## 9. Homepage section strategy

| # | Section | Job |
|---|---|---|
| 01 | Hero: headline, glasses photo, WhatsApp + book-a-call, trust strip (7+ years, 200+ projects, 180 five-star reviews, US/UK/AU/EU) | Say who I am and what I fix in 5 seconds |
| 02 | Working with me directly (comparison + 3 proof pillars) | The advantage over agencies, without naming any |
| 03 | The measurement stack: the 8 services along the signal line | Show the system, link to service pages |
| 04 | Proof: case studies, result badges (only when verified), dashboard snapshots, reviews | Evidence, labelled honestly |
| 05 | How I work: Audit, Fix, Scale, Report (4 steps, I do all of them) | Reduce risk and uncertainty |
| 06 | Who I help / who I do not (fit filter) | Attract better leads, politely filter others |
| 07 | About me: avatar, short story, location and time zone | Human trust |
| 08 | Insights: 3 latest blog posts | Authority and SEO |
| 09 | FAQ (cost, timeline, access, reporting, white-label) | Remove objections |
| 10 | Final CTA: WhatsApp, book a discovery call, form | Convert |

The 8 services, in this order: Google Ads, GA4, GTM, Meta Pixel & CAPI, Server-Side Tracking, Enhanced & Offline Conversions, Merchant Center, Local SEO. (The build currently has a ninth, AI Search Optimization. Please tell me whether to keep it, hide it or remove it.)

## 10. Content, conversion and qualification strategy

- **Primary conversion:** WhatsApp message with a prefilled, context-aware text (already built). **Secondary:** a booked discovery call. **Tertiary:** the form.
- **Qualification, in order of visibility:** the fit filter on the home page and About; a one-line qualifier above the form ("Best for businesses already spending on ads"); optional budget field; the leads dashboard marks each lead's status.
- **Discovery call:** 20-30 minutes, free, I review the account tracking live. (You approved a free strategy call earlier.) Booking tool suggestion: Cal.com or Calendly free plan.
- **Claims discipline:** "growth-focused" wording until verified data exists. Result badges render only with metric + timeframe + context + source. No guarantees, no ranking promises, no Google logos or partner badge.
- **Social proof order:** real reviews first, then screenshots, then case studies. Client names stay hidden.
- **SEO and AI search:** keep the schema (Person, ProfessionalService, Service, FAQPage), `llms.txt`, one H1 per page, and service-page internal links.
- **Measurement:** keep the existing events (whatsapp_click, generate_lead, cta_click, etc.); add `booking_click`.

## 11. Build plan (after you approve)

1. Tokens, fonts and base components. 2. Home page rebuild. 3. Services hub and 8 service pages. 4. About, Results, Contact. 5. Landing pages and blog rewrites to the first-person voice. 6. QA: axe, Lighthouse, mobile, overflow, schema, banned-word scan. 7. ZIP and pushed branch, as before.

## 12. Questions I need answered before coding

1. **Booking link:** which tool and URL? (Cal.com or Calendly are free.) Without one, the second button becomes "Message me on WhatsApp to book a call".
2. **Threads:** your earlier instruction was to remove Threads everywhere. This brief lists Threads again. Add it back or keep it removed?
3. **"Agencies" as a client type:** the brief bans the word but lists agencies as clients. My proposal: say "marketing businesses that need a white-label tracking specialist". OK?
4. **Minimum monthly ad budget** for a good fit (for example $1,000)? I will leave it as a placeholder if you do not know.
5. **Hero photo:** please upload the original glasses photo at full resolution.
6. **Real numbers:** your hero numbers are 200+ projects and 180 five-star reviews. Do you want me to keep the revenue bar hidden until you have a verified figure?
7. **5X to 10X:** do you have any verified 5X or 10X case with metric, period and context? If not, the result badge stays dormant and the copy says "growth-focused".
8. **AI Search Optimization service:** keep, hide or remove?
