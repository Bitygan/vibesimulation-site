# Product Specification: MVP for VibeSimulation.com

## 1. Overview

### Project Summary
VibeSimulation.com is an educational website focused on delivering high-quality physics animations created with Manim Community Edition. The site aims to teach physics concepts from basic to advanced levels through short (2-3 minute) video clips embedded from the associated YouTube channel (Vibe Simulation). The MVP emphasizes simplicity, user-friendliness, discoverability, and retention to build an audience organically. Content is organized into learning paths (tracks) for progressive learning, with SEO optimization to drive traffic.

The site will be built using a no-code/low-code approach for rapid development, with a focus on mobile responsiveness and fast load times. Deployment will leverage GitHub for version control and Cloudflare for hosting, DNS, and performance optimization (e.g., via Cloudflare Pages for static assets). This setup ensures low costs, scalability, and easy updates.

### Goals
- Provide an intuitive platform for users to explore physics visualizations.
- Embed YouTube videos to leverage dual-platform traction (site + YouTube).
- Optimize for SEO and analytics to monitor growth.
- Achieve launch in 1-2 weeks with minimal features.
- Budget: $100-300/year (covering any premium plugins/themes if needed; Cloudflare and GitHub are free for basics).

### Target Audience
- Students (high school/college) struggling with abstract physics concepts.
- Educators seeking visual aids.
- Hobbyists/self-learners interested in Manim animations.
- Expected traffic: Initially 100-500 daily views, scaling with content uploads.

### Non-Goals for MVP
- User accounts, quizzes, or interactive elements (defer to v2).
- Custom backend (e.g., no databases beyond what's needed for comments/blog).
- Advanced e-commerce (monetization hooks like affiliate links can be added manually).

## 2. Requirements

### Functional Requirements
- Users can browse and watch embedded YouTube videos without leaving the site.
- Site supports search and filtering for quick content discovery.
- Content is categorized into tracks with related recommendations.
- Basic engagement via comments.
- SEO-friendly structure for organic search traffic.
- Analytics integration to track user behavior.

### Non-Functional Requirements
- **Performance**: Page load < 3 seconds; optimize for video embeds (use lazy loading).
- **Accessibility**: WCAG 2.1 compliant (e.g., alt text for images, keyboard navigation).
- **Security**: HTTPS via Cloudflare; no user data collection in MVP.
- **Scalability**: Handle up to 1k daily users without slowdowns.
- **Mobile Responsiveness**: Fully responsive design (test on devices 320px-1920px).
- **Browser Compatibility**: Latest Chrome, Firefox, Safari, Edge.
- **Uptime**: 99.9% via Cloudflare.

### Constraints
- Build time: 1-2 weeks.
- Deployment: Use GitHub repository for code/version control; host via Cloudflare (e.g., Pages for static site or CDN for dynamic if WordPress).
- No heavy dev: Prioritize no-code tools.

## 3. Tech Stack

To align with deployment via GitHub and Cloudflare while keeping it no-code/low-code:
- **Primary Builder**: Webflow (recommended for polished design without code; exports clean HTML/CSS/JS). Alternative: WordPress with Elementor (if dynamic blog/comments are prioritized, but requires server hosting).
  - Rationale: Webflow allows drag-and-drop, exports static code for GitHub/Cloudflare Pages deployment. WordPress can use GitHub for theme files, with Cloudflare as CDN.
- **If Webflow**:
  - Design in Webflow interface.
  - Export code and push to GitHub repo.
  - Deploy to Cloudflare Pages (connects directly to GitHub for auto-builds).
- **If WordPress**:
  - Install on a low-cost host (e.g., SiteGround at ~$100/year), use GitHub for custom theme/plugin files.
  - Point DNS via Cloudflare for caching/CDN.
- **Plugins/Integrations** (if WordPress):
  - Elementor: For drag-and-drop page building.
  - Yoast SEO: For meta tags, sitemaps.
  - Disqus: For comments (free tier).
  - EmbedPress or native embeds: For YouTube videos.
- **Static Enhancements** (for both):
  - CSS Framework: Webflow's built-in or Tailwind (if custom).
  - JavaScript: Minimal; use for carousel (e.g., Slick Slider library).
- **Analytics**: Google Analytics (free; add tracking code to header).
- **SEO Tools**: Built-in (Webflow/Yoast); generate XML sitemap.
- **Hosting/Deployment**:
  - GitHub: Repo for site code (public or private).
  - Cloudflare: DNS management for vibesimulation.com; Pages for hosting (free for static sites); enable caching, minification, and HTTPS.
- **Other**:
  - Image Optimization: Compress Manim-generated images (use TinyPNG or built-in tools).
  - No additional servers needed beyond basic hosting.

## 4. Site Structure and Features

### Navigation
- Simple top menu (sticky on scroll for mobile/desktop):
  - Home
  - Basics
  - Intermediate
  - Advanced
  - Blog
  - Contact
- Footer: Copyright, links to YouTube channel, privacy policy (placeholder text), and social icons (YouTube, potential X/LinkedIn).

### Pages and Components

#### Homepage
- **Hero Section**:
  - Full-width background (subtle physics-themed image or gradient).
  - Tagline: "Visualize Physics: From Basics to Advanced with Manim Animations." (H1, bold, centered).
  - Subheadline: "Short animations to make complex concepts crystal clear." (Paragraph).
  - Call-to-Action (CTA) Button: "Explore Videos" linking to Basics track.
- **Carousel**:
  - Rotating slider of 3-5 featured videos (auto-rotate every 5s, manual navigation arrows/dots).
  - Each slide: Embedded YouTube thumbnail (click to play inline), title (e.g., "Newton's Laws in 2 Minutes"), short description (50 words), view count (pulled from YouTube if possible, or static).
  - Use responsive design: 1 slide on mobile, 3 on desktop.
- **Search and Filters**:
  - Search bar: Full-site search (integrate with Webflow/WordPress search; query titles/descriptions).
  - Category Filters: Dropdown or buttons for Mechanics, Electromagnetism, Quantum, etc. (filter content dynamically if possible; static links otherwise).
- **Featured Tracks Teaser**:
  - 3 cards: Basics, Intermediate, Advanced (each with image, short desc, "Start Learning" button linking to track page).

#### Content Pages (Tracks)
- **Structure**: One page per track (e.g., /basics, /intermediate, /advanced).
- **Track Layout**:
  - Header: Track title (e.g., "Basics: Foundational Physics Concepts").
  - Grid/List of Videos: 10-15 for Basics, 10 for Intermediate, 5-10 for Advanced.
    - Each Video Card: Thumbnail (YouTube), title, duration (e.g., "2:30"), short teaser (20 words), "Watch Now" button linking to individual video page.
  - Pagination if >10 videos (simple next/prev).
- **Individual Video Pages** (e.g., /videos/newtons-laws):
  - Embedded YouTube Player: Full-width, autoplay off, lazy load.
  - Description: 200-300 words (concept explanation + key takeaways; markdown support for bullets/formulas).
  - Related Videos Sidebar: 3-5 thumbnails/links (manually curated or based on tags).
  - Comment Section: Disqus integration (load below content; moderate via Disqus dashboard).
  - SEO: Unique title (e.g., "Manim Animation: Understanding Newton's Laws in 2 Minutes"), meta description, keywords.

#### About/Blog Section
- **About Page** (/about):
  - Bio: 300-500 words on your Manim expertise, background, and site mission.
  - Image: Profile photo or Manim screenshot.
  - CTA: "Subscribe to YouTube" button.
- **Blog Page** (/blog):
  - List of Posts: Chronological grid (title, excerpt, date, read time).
  - Individual Post: Full content (e.g., "How I Animate Physics with Manim"), images, SEO optimized.
  - Initial Posts: 2-3 placeholders (add more via CMS).
  - If static (Webflow), use collections for easy updates.

#### Contact Page
- Simple form: Name, Email, Message (integrate Webflow form or WordPress Contact Form 7; submissions to your email).
- Additional: Email address, YouTube link.

### Design Guidelines
- **Theme**: Clean, modern, science-inspired (blues/greens, sans-serif fonts like Roboto/Open Sans).
- **Colors**: Primary #007BFF (blue), Secondary #28A745 (green), Background #F8F9FA.
- **Typography**: H1 36px, Paragraph 16px; use LaTeX for formulas if needed (via MathJax script).
- **Images**: All compressed (<100KB); alt text mandatory.
- ** Responsiveness**: Breakpoints at 480px, 768px, 1024px.

## 5. SEO and Analytics
- **SEO Implementation**:
  - Titles/Metas: Use Yoast (WordPress) or Webflow SEO fields (e.g., "Manim Physics Animation: [Topic]").
  - Sitemap: Auto-generate and submit to Google Search Console.
  - Keywords: Integrate long-tail (e.g., "manim quantum physics tutorial").
  - Internal Links: From homepage to tracks, videos to related.
- **Analytics**:
  - Google Analytics: Track pageviews, bounce rate, traffic sources.
  - YouTube: Monitor via dashboard (no site integration in MVP).
  - Event Tracking: Clicks on videos, searches.

## 6. Deployment and Launch Checklist

### Deployment Process
1. **Setup GitHub Repo**: Create repo (e.g., vibesimulation-site); add .gitignore for builds.
2. **Build Site**:
   - In Webflow: Design, export code.
   - In WordPress: Develop locally (via LocalWP), export theme/files.
3. **Push to GitHub**: Commit exported code or theme.
4. **Cloudflare Integration**:
   - Add domain vibesimulation.com to Cloudflare.
   - For Static (Webflow): Connect GitHub to Cloudflare Pages; auto-deploy on push.
   - For Dynamic (WordPress): Use Cloudflare as DNS/CDN; point A records to host (e.g., SiteGround IP).
   - Enable: Auto-minify, caching (cache everything except dynamic parts), SSL.
5. **Testing**: Local preview, then staging on Cloudflare.

### Launch Checklist
- **Week 1**:
  - Set up builder (Webflow/WordPress).
  - Build skeleton: Navigation, Homepage (hero + carousel), Track pages with placeholders.
  - Embed first 5-10 videos (use dummy YouTube IDs initially).
  - Add search/filters.
- **Week 2**:
  - Complete content pages, About/Blog, Contact.
  - Integrate Disqus, Analytics.
  - Optimize SEO metas, compress assets.
  - Test embeds, load times (use GTmetrix).
  - Deploy to GitHub/Cloudflare.
  - Go Live: Update DNS, monitor for issues.

## 7. Maintenance and Future Considerations
- **Updates**: GitHub for code changes; push to deploy.
- **Costs**: Cloudflare free; Webflow ~$200/year (starter plan); WordPress hosting ~$100/year.
- **Testing**: Manual (functionality, responsiveness); automate if v2.
- **v2 Ideas**: User logins, quizzes (after traction).

This specification provides a complete blueprint for an AI agent to build and deploy the site. Provide the agent with access to your GitHub, Cloudflare, and YouTube details as needed.