# GTM and tracking setup

The website only pushes to `dataLayer`. You build the tags, triggers and variables in Google Tag Manager. Nothing is connected until you set the container ID and publish.

## 1. GTM is on
`gtm_id` is set to **GTM-TZVTKKVM** in `_data/settings.yml` (editable in `/admin` > Site settings). It loads after you deploy. Until you publish tags in that container, nothing is measured. The site's own snippet is the standard GTM snippet, preceded by the Consent Mode v2 defaults. Consent Mode v2 defaults (all four set to `denied`) are always pushed first, before GTM.

## 2. Consent
- Banner: Accept / Reject / Privacy link. Footer: "Cookie settings".
- Accept sets `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` to `granted`. Reject keeps them `denied`.
- The choice is stored in `localStorage` key `rb_consent` (`granted` or `denied`).
- In GTM, turn on **Consent Overview** and give each tag its built-in consent checks (Google tags check automatically; for Meta use `ad_storage`).

## 3. Events the site pushes

| Event | Parameters | When |
|---|---|---|
| `generate_lead` | `service_name`, `business_type`, `budget_range`, `form_location`, and `user_data.email` only if `ad_user_data` consent is granted | Once, on the thank-you page after a successful enquiry |
| `whatsapp_click` | `link_location`, `service_name`, `page_path` | Any WhatsApp button or link |
| `email_click` | `link_location`, `page_path` | Any mailto link |
| `booking_click` | `link_location` | Booking link (when `booking_url` is set) |
| `upwork_click` | `link_location` | Upwork profile link |
| `cta_click` | `cta_text`, `link_location` | Main buttons and links with `data-event="cta_click"` |
| `social_click` | `platform` | Social profile links |
| `faq_open` | `question` | FAQ item opened |

`generate_lead` is pushed on the thank-you page (not on the form page) so a refresh or a slow redirect cannot lose or double-count it.

## 4. Variables to create (Data Layer Variable, version 2)
`service_name`, `business_type`, `budget_range`, `form_location`, `link_location`, `cta_text`, `page_path`, `platform`, `question`, and `user_data.email` (name it `DLV - user_data.email`).
For Enhanced Conversions create a **User-Provided Data** variable: type *Manual*, Email = `{{DLV - user_data.email}}`. GTM hashes it for Google.

## 5. Triggers to create (Custom Event)
`generate_lead`, `whatsapp_click`, `email_click`, `booking_click`, `upwork_click`, `cta_click`, `social_click`, `faq_open`.

## 6. Tags to create
1. **Google tag / GA4 Configuration** (All Pages), measurement ID `G-XXXXXXXXXX`.
2. **GA4 Event: generate_lead** (trigger `generate_lead`), parameters `service_name`, `business_type`, `budget_range`, `form_location`. Mark `generate_lead` as a **key event** in GA4 admin.
3. **GA4 Event: whatsapp_click**, **email_click**, **booking_click**, **upwork_click** (each with its trigger and parameters). Mark `whatsapp_click` as a key event if you count chats as leads.
4. **GA4 Event: cta_click** (parameters `cta_text`, `link_location`). Optional.
5. **Google Ads Conversion Tracking: Lead** (trigger `generate_lead`), with your conversion ID and label, and **Include user-provided data from your website** switched on, pointing at the User-Provided Data variable.
6. **Google Ads Conversion: WhatsApp click** (trigger `whatsapp_click`) if you want it as a secondary conversion.
7. **Google Ads Remarketing** (All Pages), only if you use it.
8. **Meta Pixel** base code (All Pages) and **Meta Pixel Lead** (trigger `generate_lead`), plus Conversions API if you set it up. Use the same event ID in both for deduplication.
9. Optional: **Microsoft Clarity** or another tool, if you use one.

## 7. Test before publishing
GTM Preview + GA4 DebugView. Submit the form with safe test data. Check that `generate_lead` fires once, that `user_data` appears only after you press Accept, and that it is absent after Reject.
