# Shopify Collections Setup Guide for Perfume Store

This guide walks you through creating the collections in Shopify Admin that your theme requires.

## Collections to Create

### 1. Category Collections (Top-Level)

Create these collections in Shopify Admin → Products → Collections

#### **Men's Fragrances**
- Description: "Discover our exclusive collection of fragrances designed for men. From fresh and citrus notes to warm and woody aromas."
- Slug/URL: `mens-fragrances`
- Products: All male-targeted fragrances
- Image: Male model or masculine perfume bottle

#### **Women's Fragrances**
- Description: "Explore elegant and luxurious fragrances designed for women. Featuring floral, fruity, and oriental scents."
- Slug/URL: `womens-fragrances`
- Products: All female-targeted fragrances
- Image: Female model or feminine perfume bottle

#### **Unisex Fragrances**
- Description: "Versatile fragrances that transcend gender boundaries. Perfect for anyone who wants true scent freedom."
- Slug/URL: `unisex-fragrances`
- Products: Unisex fragrances
- Image: Modern, inclusive imagery

#### **Gift Sets**
- Description: "Perfect gift sets for any occasion. Pre-curated perfume bundles at special prices."
- Slug/URL: `gift-sets`
- Products: Bundle/gift set products
- Image: Beautifully packaged gift set

---

### 2. Brand Collections (Create one per brand)

#### **Dumont**
- URL: `dumont`
- Products: All Dumont fragrances

#### **Lattafa**
- URL: `lattafa`
- Products: All Lattafa fragrances

#### **Rasasi**
- URL: `rasasi`
- Products: All Rasasi fragrances

#### **Ahmed Al Maghribi**
- URL: `ahmed-al-maghribi`
- Products: All Ahmed Al Maghribi fragrances

#### **Add more brands as needed**
- Paris Corner
- Burberry
- Givenchy
- Paco Rabanne
- Calvin Klein
- etc.

---

### 3. Curated Collections

#### **Best Sellers**
- Description: "Our most popular fragrances. Trusted by thousands of customers."
- URL: `best-sellers`
- Products: Filter by sales/bestselling products
- Tag method: Tag products with `best-seller`

#### **New Arrivals**
- Description: "Fresh fragrances just added to our collection. Explore the latest releases."
- URL: `new-arrivals`
- Products: Recently added products
- Tag method: Tag new products with `new-arrival`

#### **On Sale**
- Description: "Limited-time discounts on selected fragrances."
- URL: `on-sale`
- Products: Products with compare_at_price > price
- Note: This can be automatic or manually managed

#### **Bath & Body**
- Description: "Complementary bath and body products to enhance your fragrance experience."
- URL: `bath-body`
- Products: Bath & body products

---

## Steps to Create Collections in Shopify Admin

### Method 1: Manual Collections

1. Log in to Shopify Admin
2. Go to **Products > Collections**
3. Click **Create Collection**
4. Fill in:
   - **Title**: Collection name (e.g., "Men's Fragrances")
   - **Collection Type**: Choose "Manual" or "Automated"
   - **Description**: Add SEO-optimized description
   - **Collection Image**: Upload relevant image
   - **Handle (URL)**: Use slugs provided above
5. If **Manual**: Manually add products
6. If **Automated**: Set rules (e.g., Tag equals "best-seller")
7. Click **Save**

### Method 2: Automated Collections (Recommended for Curated Lists)

**Example: Best Sellers Collection**
1. Go to **Products > Collections**
2. Click **Create Collection**
3. Title: "Best Sellers"
4. Choose **Automated**
5. Set rule:
   - Product Tag | equals | best-seller
6. Save

**To use automated collections, tag your products:**
- Go to each product
- Scroll to **Organization** section
- Add tags: `best-seller`, `new-arrival`, etc.

---

## Product Tagging Strategy

Tag your products to enable automated collections:

```
CATEGORY TAGS:
- mens
- womens
- unisex
- bath-body

TYPE TAGS:
- eau-de-parfum
- eau-de-toilette
- cologne
- body-spray

STATUS TAGS:
- best-seller
- new-arrival
- on-sale
- limited-edition

OCCASION TAGS:
- daily-wear
- evening
- celebration
- date-night

SEASON TAGS:
- spring
- summer
- fall
- winter
```

---

## Collection URLs Quick Reference

```
Main Categories:
- /collections/mens-fragrances
- /collections/womens-fragrances
- /collections/unisex-fragrances
- /collections/gift-sets

Curated:
- /collections/best-sellers
- /collections/new-arrivals
- /collections/on-sale
- /collections/bath-body

Brands:
- /collections/dumont
- /collections/lattafa
- /collections/rasasi
- /collections/ahmed-al-maghribi
```

---

## Homepage Category Links to Update

After creating collections, update these links in your **Featured Categories** section on the homepage:

In theme customizer or code, set category links to:
1. Men's → `/collections/mens-fragrances`
2. Women's → `/collections/womens-fragrances`
3. Unisex → `/collections/unisex-fragrances`
4. Gift Sets → `/collections/gift-sets`

---

## Collections Configure

### SEO Settings for Each Collection

For better search visibility:
1. Add SEO title (unique, 50-60 characters)
2. Add meta description (120-160 characters)
3. Add canonical URL (automatically set)

Example SEO for Men's Fragrances:
- **Title**: "Men's Fragrances | Premium Colognes & Perfumes"
- **Description**: "Discover our curated collection of luxury men's fragrances. Shop fresh, woody, and spicy colognes from top brands."

---

## Priority Collections to Create First

1. **Men's Fragrances** (top priority)
2. **Women's Fragrances** (top priority)
3. **Gift Sets** (drives sales)
4. **Best Sellers** (social proof)
5. **New Arrivals** (keeps content fresh)
6. Brand collections (as you add products)

---

## CSV Import Method (For Large Inventory)

If you have many products to import:

1. Create CSV file with format:
```
Handle, Title, Vendor, Type, Tags, Price, Compare at Price
perfume-1, Product Name, Brand, Fragrance, mens;best-seller, 99.99, 129.99
```

2. Go to **Products > Import**
3. Upload CSV
4. Map columns
5. Review and confirm

Then create collections by these tags.

---

## Next Steps

1. Create the main category collections first
2. Upload product images
3. Add products to collections
4. Create brand collections
5. Tag products for automated collections
6. Test collection pages live
7. Customize collection page styling if needed

---

**Your homepage is now ready! Once you've created these collections and added products, your perfume store will be fully functional.**

