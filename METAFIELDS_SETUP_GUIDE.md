# Product Metafields Setup Guide

This guide explains how to add perfume-specific details (fragrance type, notes, longevity, etc.) to your products.

## What Are Metafields?

Metafields are custom data fields you can add to products. They appear on product pages using the `fragrance-details.liquid` snippet.

---

## Metafields to Create

### Setting Up Metafields in Shopify Admin

**Go to:** Settings → Custom Data → Metafields → Products

Click **Add Definition** to create each of these:

#### 1. Fragrance Type
- **Name**: Fragrance Type
- **Namespace**: custom
- **Key**: fragrance_type
- **Type**: Single line text
- **Example values**: Eau de Parfum, Eau de Toilette, Cologne, Extrait de Parfum

#### 2. Fragrance Notes
- **Name**: Fragrance Notes
- **Namespace**: custom
- **Key**: fragrance_notes
- **Type**: Single line text
- **Example values**: "Citrus, Lavender, Sandalwood" or "Bergamot (Top) | Rose (Heart) | Musk (Base)"

#### 3. Longevity
- **Name**: Longevity
- **Namespace**: custom
- **Key**: longevity
- **Type**: Single line text
- **Example values**: "6-8 hours", "8-10 hours", "12+ hours", "Long-lasting"

#### 4. Best For
- **Name**: Best For
- **Namespace**: custom
- **Key**: best_for
- **Type**: Multiple select (create options):
  - Men
  - Women
  - Unisex

#### 5. Occasion
- **Name**: Occasion
- **Namespace**: custom
- **Key**: occasion
- **Type**: Multiple select (create options):
  - Daily Wear
  - Evening
  - Celebration
  - Date Night
  - Professional
  - Casual

#### 6. Season
- **Name**: Season
- **Namespace**: custom
- **Key**: season
- **Type**: Multiple select (create options):
  - Spring
  - Summer
  - Fall
  - Winter

---

## How to Add Metafield Values to Products

### Method 1: Individual Product Edit

1. Go to **Products**
2. Click on a product
3. Scroll down to **Custom data** section
4. Fill in the custom fields:
   - **Fragrance Type**: "Eau de Parfum"
   - **Fragrance Notes**: "Orange Blossom, Jasmine, Amber"
   - **Longevity**: "8-10 hours"
   - **Best For**: Select Men, Unisex
   - **Occasion**: Select Daily Wear, Evening
   - **Season**: Select Spring, Summer

5. Click **Save**

### Method 2: Bulk Edit (CSV Import)

If you have many products, use bulk edit:

1. **Export** current products (Products > Bulk operations)
2. **Edit** metafields in spreadsheet:
   ```
   Handle | Custom.Fragrance_Type | Custom.Longevity | Custom.Best_For
   perfume-1 | Eau de Parfum | 8-10 hours | Men;Unisex
   perfume-2 | Eau de Toilette | 6 hours | Women
   ```
3. **Import** back to Shopify
4. **Map** columns to metafields

---

## Example Product Data

### Example 1: Premium Men's Fragrance

```
Product: "Dumont Nitro Gold EDP 100ml"

Metafields:
- Fragrance Type: Eau de Parfum
- Fragrance Notes: 
  Top: Bergamot, Pink Pepper
  Heart: Amber, Vanilla
  Base: Sandalwood, Musk
- Longevity: 12+ hours
- Best For: Men, Unisex
- Occasion: Evening, Celebration, Date Night
- Season: Fall, Winter
```

### Example 2: Fresh Women's Fragrance

```
Product: "Lattafa Yara EDP 100ml"

Metafields:
- Fragrance Type: Eau de Parfum
- Fragrance Notes:
  Top: Lemon, Grapefruit
  Heart: Peony, Rose
  Base: Sandalwood, Cedarwood
- Longevity: 8-10 hours
- Best For: Women
- Occasion: Daily Wear, Professional, Casual
- Season: Spring, Summer
```

### Example 3: Unisex Fragrance

```
Product: "Rasasi Hawas EDP 100ml"

Metafields:
- Fragrance Type: Eau de Parfum
- Fragrance Notes:
  Top: Cardamom, Lemon
  Heart: Rose, Incense
  Base: Sandalwood, Oud
- Longevity: 10-12 hours
- Best For: Men, Women, Unisex
- Occasion: Daily Wear, Evening
- Season: All
```

---

## Display on Product Pages

Once metafields are added, they'll automatically display on product pages using this snippet:

```liquid
{% render 'fragrance-details' %}
```

The section will show:
```
FRAGRANCE DETAILS

Type                 Eau de Parfum
Notes                Top: Bergamot | Heart: Rose | Base: Sandalwood
Longevity            8-10 hours
Best For             Men, Unisex
Occasion             Evening, Celebration
Season               Fall, Winter
```

---

## Metafield Display Customization

### Option 1: Show in Theme Customizer
The `fragrance-details.liquid` snippet automatically displays any filled metafields.

### Option 2: Add to Product Template
If you want to customize the display, edit `sections/main-product.liquid` and find this line:

```liquid
{% render 'fragrance-details' %}
```

Add it after the product description section.

### Option 3: Custom Styling
To customize how metafields look, edit the CSS in `snippets/fragrance-details.liquid`:

```css
.details-title { /* Customize title styling */ }
.details-grid { /* Customize grid layout */ }
.detail-item label { /* Customize labels */ }
.detail-item span { /* Customize values */ }
```

---

## Pre-Filled Metafield Templates

Here are common templates to speed up data entry:

### Eau de Parfum Standards
```
Type: Eau de Parfum
Longevity: 8-12 hours
Best For: [Your choice]
Occasion: Evening, Celebration
```

### Eau de Toilette Standards
```
Type: Eau de Toilette
Longevity: 6-8 hours
Best For: [Your choice]
Occasion: Daily Wear, Professional
```

### Cologne Standards
```
Type: Eau de Cologne
Longevity: 3-4 hours
Best For: [Your choice]
Occasion: Daily Wear, Professional
```

---

## Common Fragrance Notes

### Top Notes (Opening, fades in 5-15 mins)
Bergamot | Lemon | Orange | Grapefruit | Lavender | Mint | Ginger | Basil | Cardamom | Pink Pepper

### Heart/Middle Notes (Core, 15 mins - 1 hour)
Rose | Jasmine | Peony | Lily | Dove | Tuberose | Gardenia | Geranium | Iris | Violet | Amber

### Base Notes (Lasting, 30+ mins)
Sandalwood | Cedar | Vetiver | Musk | Vanilla | Oud | Tobacco | Amber | Leather | Patchouli

---

## Tips for Filling Metafields

1. **Be consistent**: Use same terms across products
2. **Be specific**: "8-10 hours" is better than just "long-lasting"
3. **Match your inventory**: Only fill with real data
4. **Use line breaks**: Format notes clearly for readability
5. **Update regularly**: As you get reviews, update fields with customer feedback

---

## What if Metafields Don't Show up?

**Issue**: Metafields section not appearing on product page

**Solutions**:
1. ✅ Make sure you added the snippet to product template
2. ✅ Verify metafield namespace is "custom"
3. ✅ Check that you filled values (empty fields don't display)
4. ✅ Clear browser cache and reload
5. ✅ Ensure snippet `fragrance-details.liquid` exists

---

## Next Steps

1. **Create** all metafield definitions in Shopify
2. **Add** metafield values to 3-5 sample products first
3. **Test** if they display on product pages
4. **Bulk edit** remaining products once confirmed
5. **Monitor** and update based on customer feedback

---

## Quick Reference: Metafield Keys

```
Product page will look for these exact keys:

custom.fragrance_type
custom.fragrance_notes
custom.longevity
custom.best_for
custom.occasion
custom.season
```

**Make sure namespace is "custom" and keys match exactly!**

---

**Your product pages will now showcase detailed fragrance information!**

