# Motion system

Timing: micro-interactions 200-280 ms, entrances 650-900 ms, one easing family (`--ease: cubic-bezier(.22,1,.36,1)`). Everything uses transform and opacity, so nothing shifts layout.

| Pattern | How to use it |
|---|---|
| Page transition | Native view transitions (`@view-transition`) in `motion.css`. No JavaScript, never delays a click. Browsers without support navigate normally. |
| Reveal | Add `reveal` to any element. Siblings stagger by 60 ms. |
| Image mask reveal | Add `mask` to an `<img>`. |
| Counters | Add `data-ct` (or `data-count`) to an element whose text is a real number, such as `4x`, `+120%`, `A$0.20`. The prefix and suffix are kept. |
| Section line | Sections with `h-sec`, `h-final` or `cs-sec` draw their top line when they enter the view. |
| Process timeline | `#h-steps` on the home page, driven by scroll position in `home.js`. |
| Mobile WhatsApp | `_includes/wa-fab.html`, shown at 860 px and below. |

Reduced motion: when the device asks for it, `html.rm` is set, reveals and counters show final states immediately, the hero signals sit still with labels, and all transitions are near-instant.
Removed: the full-screen wipe between pages (it delayed every link by 460 ms), the smooth-scroll library, 3D card tilt, the looping floating photo and the endless pulses.

## Update: animations are always on
Animations no longer depend on the device's "reduce motion" setting, and the hero flow no longer needs any external library, so everything runs even if a CDN is blocked. This follows your standing instruction that animations should be on for every visitor.
