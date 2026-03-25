# Shopify Perfume Website - Code Snippets & Examples

This file contains practical code examples you can use when building your perfume store.

---

## #1: Custom Featured Categories Section

**File to create**: `sections/featured-categories.liquid`

This creates a 4-column grid for Men, Women, Unisex, and Gifts.

```liquid
<section class="featured-categories">
  <div class="container">
    <h2 class="section-title">{{ section.settings.title }}</h2>
    
    <div class="categories-grid">
      {% for block in section.blocks %}
        <div class="category-card">
          {% if block.settings.image %}
            <div class="category-image">
              {{ block.settings.image | image_url: width: 500 | image_tag }}
            </div>
          {% endif %}
          
          <div class="category-content">
            <h3>{{ block.settings.title }}</h3>
            <p>{{ block.settings.description }}</p>
            <a href="{{ block.settings.collection.url }}" class="button">
              Shop {{ block.settings.title }}
            </a>
          </div>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

<style>
  .featured-categories {
    padding: 60px 20px;
    background-color: #fafafa;
  }
  
  .section-title {
    text-align: center;
    font-size: 32px;
    margin-bottom: 40px;
    font-weight: 600;
  }
  
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin: 0 auto;
    max-width: 1200px;
  }
  
  .category-card {
    text-align: center;
    transition: transform 0.3s ease;
  }
  
  .category-card:hover {
    transform: translateY(-10px);
  }
  
  .category-image {
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 20px;
    height: 300px;
  }
  
  .category-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .category-content h3 {
    font-size: 22px;
    margin-bottom: 10px;
  }
  
  .button {
    display: inline-block;
    background-color: #000;
    color: #fff;
    padding: 12px 24px;
    margin-top: 15px;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  
  .button:hover {
    background-color: #333;
  }
  
  @media (max-width: 768px) {
    .categories-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .categories-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

{% schema %}
{
  "name": "Featured Categories",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Section Title",
      "default": "Shop by Category"
    }
  ],
  "blocks": [
    {
      "type": "category",
      "name": "Category",
      "settings": [
        {
          "type": "text",
          "id": "title",
          "label": "Category Name",
          "default": "Men's Fragrances"
        },
        {
          "type": "text",
          "id": "description",
          "label": "Description",
          "default": "Explore bold and sophisticated fragrances for men"
        },
        {
          "type": "image_picker",
          "id": "image",
          "label": "Category Image"
        },
        {
          "type": "collection",
          "id": "collection",
          "label": "Collection"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Featured Categories",
      "blocks": [
        {
          "type": "category",
          "settings": {
            "title": "Men's Fragrances"
          }
        },
        {
          "type": "category",
          "settings": {
            "title": "Women's Fragrances"
          }
        },
        {
          "type": "category",
          "settings": {
            "title": "Unisex"
          }
        },
        {
          "type": "category",
          "settings": {
            "title": "Gift Sets"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## #2: Brand Showcase Grid

**File to create**: `sections/brand-showcase.liquid`

Displays brand logos in a responsive grid with hover effects.

```liquid
<section class="brand-showcase">
  <div class="container">
    <h2 class="section-title">{{ section.settings.title }}</h2>
    <p class="section-subtitle">{{ section.settings.subtitle }}</p>
    
    <div class="brands-grid">
      {% for block in section.blocks %}
        <a href="{{ block.settings.brand_collection.url }}" class="brand-item">
          {% if block.settings.brand_logo %}
            <div class="brand-logo">
              {{ block.settings.brand_logo | image_url: width: 200 | image_tag }}
            </div>
          {% endif %}
          <p class="brand-name">{{ block.settings.brand_name }}</p>
        </a>
      {% endfor %}
    </div>
    
    {% if section.settings.show_all_link %}
      <div class="view-all">
        <a href="{{ section.settings.all_brands_page }}" class="button button-secondary">
          View All Brands
        </a>
      </div>
    {% endif %}
  </div>
</section>

<style>
  .brand-showcase {
    padding: 60px 20px;
    background-color: #fff;
  }
  
  .section-title {
    text-align: center;
    font-size: 32px;
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .section-subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 40px;
    font-size: 16px;
  }
  
  .brands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 30px;
    margin: 0 auto 40px;
    max-width: 1200px;
  }
  
  .brand-item {
    text-decoration: none;
    text-align: center;
    padding: 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 1px solid #e5e5e5;
  }
  
  .brand-item:hover {
    border-color: #000;
    transform: translateY(-5px);
  }
  
  .brand-logo {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    overflow: hidden;
  }
  
  .brand-logo img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  }
  
  .brand-name {
    font-size: 14px;
    color: #333;
    margin: 0;
  }
  
  .view-all {
    text-align: center;
  }
  
  @media (max-width: 768px) {
    .brands-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .brands-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>

{% schema %}
{
  "name": "Brand Showcase",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Section Title",
      "default": "Top Perfume & Cologne Brands"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtitle",
      "default": "Shop from the world's finest fragrance brands"
    },
    {
      "type": "checkbox",
      "id": "show_all_link",
      "label": "Show 'View All Brands' Button",
      "default": true
    },
    {
      "type": "page",
      "id": "all_brands_page",
      "label": "All Brands Page"
    }
  ],
  "blocks": [
    {
      "type": "brand",
      "name": "Brand",
      "settings": [
        {
          "type": "text",
          "id": "brand_name",
          "label": "Brand Name",
          "default": "Brand Name"
        },
        {
          "type": "image_picker",
          "id": "brand_logo",
          "label": "Brand Logo"
        },
        {
          "type": "collection",
          "id": "brand_collection",
          "label": "Brand Collection"
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## #3: Trust Badges Section

**File to create**: `sections/trust-badges.liquid`

Displays trust elements (authentic, shipping, etc.)

```liquid
<section class="trust-badges">
  <div class="container">
    <div class="badges-grid">
      {% for block in section.blocks %}
        <div class="badge-item">
          {% if block.settings.icon_type == 'emoji' %}
            <div class="badge-icon emoji">{{ block.settings.icon_emoji }}</div>
          {% else %}
            <div class="badge-icon">
              {{ block.settings.icon_image | image_url: width: 60 | image_tag }}
            </div>
          {% endif %}
          
          <h3>{{ block.settings.title }}</h3>
          <p>{{ block.settings.description }}</p>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

<style>
  .trust-badges {
    padding: 60px 20px;
    background-color: #f9f9f9;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .badges-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
  }
  
  .badge-item {
    text-align: center;
  }
  
  .badge-icon {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }
  
  .badge-icon.emoji {
    font-size: 48px;
  }
  
  .badge-icon img {
    width: 60px;
    height: 60px;
  }
  
  .badge-item h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 10px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .badge-item p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .badges-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
    }
  }
  
  @media (max-width: 480px) {
    .badges-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

{% schema %}
{
  "name": "Trust Badges",
  "blocks": [
    {
      "type": "badge",
      "name": "Badge",
      "settings": [
        {
          "type": "text",
          "id": "title",
          "label": "Badge Title",
          "default": "100% Authentic"
        },
        {
          "type": "text",
          "id": "description",
          "label": "Description",
          "default": "All products are guaranteed authentic"
        },
        {
          "type": "select",
          "id": "icon_type",
          "label": "Icon Type",
          "options": [
            {
              "value": "emoji",
              "label": "Emoji"
            },
            {
              "value": "image",
              "label": "Custom Image"
            }
          ],
          "default": "emoji"
        },
        {
          "type": "text",
          "id": "icon_emoji",
          "label": "Emoji Icon",
          "default": "✓"
        },
        {
          "type": "image_picker",
          "id": "icon_image",
          "label": "Custom Icon"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Trust Badges",
      "blocks": [
        {
          "type": "badge",
          "settings": {
            "title": "100% Authentic",
            "description": "Guaranteed authentic products",
            "icon_emoji": "✓"
          }
        },
        {
          "type": "badge",
          "settings": {
            "title": "Free Shipping",
            "description": "On orders over $59",
            "icon_emoji": "🚚"
          }
        },
        {
          "type": "badge",
          "settings": {
            "title": "Fast Delivery",
            "description": "Quick and secure shipping",
            "icon_emoji": "⚡"
          }
        },
        {
          "type": "badge",
          "settings": {
            "title": "Satisfaction",
            "description": "30-day money back guarantee",
            "icon_emoji": "❤️"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## #4: Product Page - Fragrance Details Snippet

**File to create/edit**: `snippets/fragrance-details.liquid`

Add detailed fragrance information to product pages.

```liquid
{% if product.metafields.custom.fragrance_type %}
  <div class="fragrance-details">
    <h3 class="details-title">Fragrance Details</h3>
    
    <div class="details-grid">
      {% if product.metafields.custom.fragrance_type %}
        <div class="detail-item">
          <label>Type</label>
          <span>{{ product.metafields.custom.fragrance_type.value }}</span>
        </div>
      {% endif %}
      
      {% if product.metafields.custom.fragrance_notes %}
        <div class="detail-item">
          <label>Notes</label>
          <span>{{ product.metafields.custom.fragrance_notes.value }}</span>
        </div>
      {% endif %}
      
      {% if product.metafields.custom.longevity %}
        <div class="detail-item">
          <label>Longevity</label>
          <span>{{ product.metafields.custom.longevity.value }}</span>
        </div>
      {% endif %}
      
      {% if product.metafields.custom.best_for %}
        <div class="detail-item">
          <label>Best For</label>
          <span>{{ product.metafields.custom.best_for.value }}</span>
        </div>
      {% endif %}
      
      {% if product.metafields.custom.occasion %}
        <div class="detail-item">
          <label>Occasion</label>
          <span>{{ product.metafields.custom.occasion.value }}</span>
        </div>
      {% endif %}
      
      {% if product.metafields.custom.season %}
        <div class="detail-item">
          <label>Season</label>
          <span>{{ product.metafields.custom.season.value }}</span>
        </div>
      {% endif %}
    </div>
  </div>
{% endif %}

<style>
  .fragrance-details {
    margin: 30px 0;
    padding: 30px 0;
    border-top: 1px solid #e5e5e5;
  }
  
  .details-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
  }
  
  .detail-item label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .detail-item span {
    color: #666;
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    .details-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

To use this, add to your product template:
```liquid
{% render 'fragrance-details' %}
```

---

## #5: Testimonials Section

**File to create**: `sections/testimonials.liquid`

Display rotating customer reviews and testimonials.

```liquid
<section class="testimonials-section">
  <div class="container">
    <div class="testimonials-header">
      <h2>{{ section.settings.title }}</h2>
      {% if section.settings.show_rating %}
        <div class="overall-rating">
          <span class="stars">★★★★★</span>
          <span class="rating-text">{{ section.settings.rating }} from {{ section.settings.review_count }} reviews</span>
        </div>
      {% endif %}
    </div>
    
    <div class="testimonials-grid">
      {% for block in section.blocks %}
        <div class="testimonial-card">
          <div class="stars">
            {% for i in (1..block.settings.rating) %}
              ★
            {% endfor %}
          </div>
          
          <p class="testimonial-text">{{ block.settings.text }}</p>
          
          <div class="testimonial-author">
            <p class="author-name">{{ block.settings.author_name }}</p>
            {% if block.settings.author_location %}
              <p class="author-location">{{ block.settings.author_location }}</p>
            {% endif %}
          </div>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

<style>
  .testimonials-section {
    padding: 60px 20px;
    background-color: #fafafa;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .testimonials-header {
    text-align: center;
    margin-bottom: 50px;
  }
  
  .testimonials-header h2 {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 15px;
  }
  
  .overall-rating {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  
  .stars {
    font-size: 20px;
    color: #ffc107;
  }
  
  .rating-text {
    color: #666;
    font-size: 14px;
  }
  
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }
  
  .testimonial-card {
    background-color: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }
  
  .testimonial-card:hover {
    transform: translateY(-5px);
  }
  
  .testimonial-card .stars {
    display: inline-block;
    font-size: 16px;
    margin-bottom: 15px;
    color: #ffc107;
  }
  
  .testimonial-text {
    font-size: 15px;
    color: #555;
    line-height: 1.6;
    margin: 15px 0;
    font-style: italic;
  }
  
  .testimonial-author {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #e5e5e5;
  }
  
  .author-name {
    font-weight: 600;
    margin: 0 0 5px 0;
    color: #333;
  }
  
  .author-location {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .testimonials-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

{% schema %}
{
  "name": "Testimonials",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Section Title",
      "default": "What People Are Saying About Us"
    },
    {
      "type": "checkbox",
      "id": "show_rating",
      "label": "Show Overall Rating",
      "default": true
    },
    {
      "type": "text",
      "id": "rating",
      "label": "Overall Rating",
      "default": "4.8 stars"
    },
    {
      "type": "text",
      "id": "review_count",
      "label": "Review Count",
      "default": "21,000+"
    }
  ],
  "blocks": [
    {
      "type": "testimonial",
      "name": "Testimonial",
      "settings": [
        {
          "type": "range",
          "id": "rating",
          "label": "Rating",
          "min": 1,
          "max": 5,
          "default": 5
        },
        {
          "type": "textarea",
          "id": "text",
          "label": "Review Text",
          "default": "Amazing products and fantastic customer service!"
        },
        {
          "type": "text",
          "id": "author_name",
          "label": "Author Name",
          "default": "John Doe"
        },
        {
          "type": "text",
          "id": "author_location",
          "label": "Location",
          "default": "USA"
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## #6: Perfume-Specific Navigation Menu Code

**File**: `sections/header.liquid` (Update your existing header)

Add this to create a mega menu for categories:

```liquid
<nav class="main-navigation">
  <ul class="nav-list">
    <li class="nav-item">
      <a href="/collections/new-arrivals">New Arrivals</a>
    </li>
    
    <li class="nav-item has-submenu">
      <a href="/collections/womens-fragrances">Women's Fragrances</a>
      <ul class="submenu">
        <li><a href="/collections/womens-fragrances">View All</a></li>
        <li><a href="/collections/womens-fragrances?filter=best-seller">Best Sellers</a></li>
        <li><a href="/collections/womens-fragrances?filter=new-arrival">New Arrivals</a></li>
        <li><a href="/collections/womens-gift-sets">Gift Sets</a></li>
      </ul>
    </li>
    
    <li class="nav-item has-submenu">
      <a href="/collections/mens-fragrances">Men's Fragrances</a>
      <ul class="submenu">
        <li><a href="/collections/mens-fragrances">View All</a></li>
        <li><a href="/collections/mens-fragrances?filter=best-seller">Best Sellers</a></li>
        <li><a href="/collections/mens-fragrances?filter=new-arrival">New Arrivals</a></li>
        <li><a href="/collections/mens-gift-sets">Gift Sets</a></li>
      </ul>
    </li>
    
    <li class="nav-item has-submenu">
      <a href="/pages/brands">Brands</a>
      <ul class="submenu">
        <li><a href="/collections/dumont">Dumont</a></li>
        <li><a href="/collections/lattafa">Lattafa</a></li>
        <li><a href="/collections/ahmed-al-maghribi">Ahmed Al Maghribi</a></li>
        <li><a href="/collections/rasasi">Rasasi</a></li>
        <li><a href="/pages/brands">View All Brands</a></li>
      </ul>
    </li>
    
    <li class="nav-item">
      <a href="/collections/gift-sets">Gifts</a>
    </li>
    
    <li class="nav-item">
      <a href="/blogs/news">Blog</a>
    </li>
  </ul>
</nav>

<style>
  .main-navigation {
    display: flex;
    justify-content: center;
  }
  
  .nav-list {
    display: flex;
    list-style: none;
    gap: 30px;
    margin: 0;
    padding: 0;
  }
  
  .nav-item {
    position: relative;
  }
  
  .nav-item > a {
    text-decoration: none;
    font-weight: 500;
    color: #333;
    transition: color 0.3s ease;
  }
  
  .nav-item:hover > a {
    color: #000;
  }
  
  /* Submenu Styling */
  .submenu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    min-width: 200px;
    list-style: none;
    margin: 0;
    padding: 10px 0;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    z-index: 1000;
  }
  
  .has-submenu:hover .submenu {
    display: block;
  }
  
  .submenu li {
    padding: 0;
  }
  
  .submenu a {
    display: block;
    padding: 12px 20px;
    color: #333;
    text-decoration: none;
    font-size: 14px;
    transition: background-color 0.3s ease;
  }
  
  .submenu a:hover {
    background-color: #f5f5f5;
    color: #000;
  }
  
  @media (max-width: 768px) {
    .nav-list {
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .submenu {
      position: static;
      display: none;
      border: none;
      box-shadow: none;
      padding-left: 20px;
      background: #f9f9f9;
    }
  }
</style>
```

---

## #7: Email Signup Form with Validation

**File**: `sections/newsletter.liquid` (Update existing)

```liquid
<section class="newsletter-section">
  <div class="container">
    <div class="newsletter-content">
      <h2>{{ section.settings.title }}</h2>
      <p>{{ section.settings.description }}</p>
      
      {% if section.settings.disclaimer %}
        <p class="disclaimer">{{ section.settings.disclaimer }}</p>
      {% endif %}
      
      <form method="post" action="/contact#contact-form" class="newsletter-form" id="newsletter-form">
        <input type="hidden" name="form_type" value="customer">
        
        <div class="form-group">
          <input 
            type="email" 
            name="customer[email]" 
            placeholder="Enter your email"
            required
            class="form-input"
          >
          <button type="submit" class="form-button">
            {{ section.settings.button_text }}
          </button>
        </div>
        
        <p class="form-message" style="display:none;"></p>
      </form>
    </div>
  </div>
</section>

<style>
  .newsletter-section {
    padding: 60px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  
  .container {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }
  
  .newsletter-content h2 {
    font-size: 32px;
    margin-bottom: 15px;
  }
  
  .newsletter-content p {
    font-size: 16px;
    margin-bottom: 30px;
  }
  
  .disclaimer {
    font-size: 12px;
    opacity: 0.9;
  }
  
  .newsletter-form {
    width: 100%;
  }
  
  .form-group {
    display: flex;
    gap: 10px;
  }
  
  .form-input {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .form-input::placeholder {
    color: #999;
  }
  
  .form-button {
    padding: 12px 24px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
    white-space: nowrap;
  }
  
  .form-button:hover {
    background-color: #000;
  }
  
  .form-message {
    margin-top: 15px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    .form-group {
      flex-direction: column;
    }
    
    .form-button {
      width: 100%;
    }
  }
</style>

{% schema %}
{
  "name": "Newsletter",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Subscribe to Our Newsletter"
    },
    {
      "type": "textarea",
      "id": "description",
      "label": "Description",
      "default": "Get exclusive offers, new arrivals, and perfume tips delivered to your inbox."
    },
    {
      "type": "text",
      "id": "disclaimer",
      "label": "Disclaimer Text",
      "default": "We respect your privacy. Unsubscribe at any time."
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text",
      "default": "Subscribe"
    }
  ]
}
{% endschema %}
```

---

## #8: Sale Badge / Flash Sale Component

**File**: `snippets/sale-badge.liquid`

```liquid
{% if product.compare_at_price > product.price %}
  <div class="sale-badge">
    {% assign discount_percentage = product.compare_at_price | minus: product.price | times: 100 | divided_by: product.compare_at_price | round %}
    <span class="discount">{{ discount_percentage }}% OFF</span>
  </div>
{% endif %}

<style>
  .sale-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
  }
  
  .discount {
    background-color: #d63384;
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    display: block;
  }
</style>
```

Use in product cards:
```liquid
{% render 'sale-badge', product: product %}
```

---

## #9: Image with Text Overlay (Hero Banner Alternative)

**File**: `sections/hero-with-text.liquid`

```liquid
<section class="hero-section">
  <div class="hero-image">
    {% if section.settings.image %}
      {{ section.settings.image | image_url: width: 1500 | image_tag: loading: 'lazy' }}
    {% else %}
      <div class="placeholder-image">{{ 'image' | placeholder_svg_tag }}</div>
    {% endif %}
  </div>
  
  <div class="hero-content">
    <div class="hero-text">
      {% if section.settings.overline %}
        <p class="overline">{{ section.settings.overline }}</p>
      {% endif %}
      
      <h1>{{ section.settings.title }}</h1>
      
      {% if section.settings.description %}
        <p class="description">{{ section.settings.description }}</p>
      {% endif %}
      
      {% if section.settings.button_text and section.settings.button_link %}
        <a href="{{ section.settings.button_link }}" class="button">
          {{ section.settings.button_text }}
        </a>
      {% endif %}
    </div>
  </div>
</section>

<style>
  .hero-section {
    position: relative;
    height: 500px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .hero-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  
  .hero-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .hero-image::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
  }
  
  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #fff;
    max-width: 600px;
  }
  
  .hero-text .overline {
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  
  .hero-text h1 {
    font-size: 48px;
    font-weight: 700;
    margin: 15px 0;
    line-height: 1.2;
  }
  
  .hero-text .description {
    font-size: 18px;
    margin-bottom: 30px;
  }
  
  .button {
    display: inline-block;
    background-color: #fff;
    color: #000;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    transition: transform 0.3s ease;
  }
  
  .button:hover {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    .hero-section {
      height: 350px;
    }
    
    .hero-text h1 {
      font-size: 32px;
    }
    
    .hero-text .description {
      font-size: 16px;
    }
  }
</style>

{% schema %}
{
  "name": "Hero with Text",
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "Image"
    },
    {
      "type": "text",
      "id": "overline",
      "label": "Overline",
      "default": "Premium Fragrances"
    },
    {
      "type": "textarea",
      "id": "title",
      "label": "Heading",
      "default": "Discover Your Signature Scent"
    },
    {
      "type": "textarea",
      "id": "description",
      "label": "Description",
      "default": "Elegant fragrances for every occasion"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text",
      "default": "Shop Now"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button Link"
    }
  ],
  "presets": [
    {
      "name": "Hero with Text"
    }
  ]
}
{% endschema %}
```

---

## #10: Product Recommendations / Related Products

**File**: `snippets/related-products.liquid`

```liquid
{% if product.metafields.custom.related_products %}
  <section class="related-products">
    <h2>Complete Your Collection</h2>
    
    <div class="products-grid">
      {% for product in product.metafields.custom.related_products.value limit: 4 %}
        <div class="product-card">
          <div class="product-image">
            {% if product.featured_image %}
              <img src="{{ product.featured_image | image_url: width: 300 }}" alt="{{ product.title }}">
            {% endif %}
          </div>
          
          <h3>{{ product.title }}</h3>
          
          <div class="product-price">
            {% if product.compare_at_price %}
              <span class="original-price">${{ product.compare_at_price | money }}</span>
            {% endif %}
            <span class="sale-price">${{ product.price | money }}</span>
          </div>
          
          <a href="{{ product.url }}" class="button button-secondary">
            View Product
          </a>
        </div>
      {% endfor %}
    </div>
  </section>
{% endif %}

<style>
  .related-products {
    margin: 60px 0;
    padding: 40px 0;
    border-top: 1px solid #e5e5e5;
  }
  
  .related-products h2 {
    font-size: 24px;
    margin-bottom: 30px;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .product-card {
    text-align: center;
  }
  
  .product-image {
    margin-bottom: 15px;
    overflow: hidden;
    border-radius: 8px;
    height: 300px;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-card h3 {
    font-size: 16px;
    margin: 10px 0;
  }
  
  .product-price {
    margin: 10px 0 15px 0;
  }
  
  .original-price {
    text-decoration: line-through;
    color: #999;
    margin-right: 8px;
  }
  
  .sale-price {
    font-weight: 600;
    color: #333;
  }
  
  .button-secondary {
    background-color: #f5f5f5;
    color: #000;
    border: 1px solid #e5e5e5;
  }
  
  .button-secondary:hover {
    background-color: #e5e5e5;
  }
  
  @media (max-width: 1024px) {
    .products-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .products-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .products-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

---

## Quick Implementation Tips

1. **Copy code blocks**: Take sections and paste into your theme files
2. **Update paths**: Change file paths to match your structure
3. **Install apps**: Use Shopify app store for reviews, email, etc.
4. **Test locally**: Use Shopify theme customizer before deploying
5. **Mobile first**: Test all sections on mobile devices
6. **Images**: Upload high-quality perfume images
7. **SEO**: Add alt text to all images
8. **Performance**: Optimize images using Image Optimizer apps

---

## Where to Find More Help

- **Shopify Theme Docs**: https://shopify.dev/themes
- **Liquid Documentation**: https://shopify.dev/api/liquid
- **Community Forums**: https://community.shopify.com
- **GitHub Themes**: github.com/Shopify/dawn

---

Good luck building your perfume store! 🌹✨

