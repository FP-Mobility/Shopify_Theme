# LumiScent Typography and Image Tokens

Source of truth: assets/premium-perfume-v3.css (VISUAL CONSISTENCY PASS block).

## Typography Tokens

- `--type-step-h1`: `clamp(2.3rem, 4.2vw, 3.7rem)`
- `--type-step-h2`: `clamp(1.85rem, 2.35vw, 2.7rem)`
- `--type-step-h3`: `clamp(1.4rem, 1.8vw, 1.9rem)`
- `--type-step-body`: `clamp(1rem, 1.08vw, 1.14rem)`
- `--type-step-subtext`: `clamp(0.96rem, 1.02vw, 1.1rem)`
- `--type-line-heading`: `1.18`
- `--type-line-body`: `1.66`

## Product Image Tokens

- `--product-card-media-ratio`: `108%`
- `--product-image-fit`: `contain`
- `--product-image-padding`: `6px`
- `--product-image-bg`: `#f6f4f1`
- `--product-image-hover-scale`: `1.015`

## Where Tokens Are Applied

- Global heading ladder (`h1/h2/h3` classes)
- Section titles (`collection`, `featured`, `brand`, `testimonials`, `blog`, `rich-text`, `trust-badges`, `newsletter`)
- Section description/subtext sizing
- Product card images via `.product-card-wrapper` across collection/search/related/featured
- Recently viewed image fit and padding

## Editing Rules

- Change token values first, not component-level selectors.
- Keep one canonical ruleset in `assets/premium-perfume-v3.css` and avoid duplicate overrides in older blocks.
- If a section needs an exception, document the reason near the override.
