# VibeSimulation Site

An interactive physics and AI education platform featuring real-time fluid dynamics simulations and comprehensive learning tracks.

## 🌟 Features

- **Interactive Fluid Dynamics Simulation**: Real-time Navier-Stokes fluid simulation with multiple brushes and parameters
- **Comprehensive Learning Tracks**: Physics (Basics, Intermediate, Advanced) and AI content
- **Modern Responsive Design**: Mobile-optimized with beautiful animations
- **Video Integration**: Embedded YouTube videos for structured learning
- **Real-time Analytics**: Google Analytics integration

## 🚀 Deployment to Cloudflare Pages

### Prerequisites

1. **GitHub Account**: Your repository should be hosted on GitHub
2. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
3. **Custom Domain** (optional): Configure your domain in Cloudflare

### Step 1: Push Your Code to GitHub

```bash
# Add all changes
git add .

# Commit your changes
git commit -m "Add Painted Sky simulation integration"

# Push to GitHub
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. **Log into Cloudflare**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** in the sidebar

2. **Create a New Project**:
   - Click **"Create a project"**
   - Select **"Connect to Git"**
   - Choose your GitHub account
   - Select the `vibesimulation-site` repository

3. **Configure Build Settings**:
   - **Production branch**: `main`
   - **Build command**: (leave empty - static site)
   - **Build output directory**: `.` (root directory)
   - **Root directory**: `.` (leave empty)

4. **Environment Variables** (Optional):
   - Add your Google Analytics ID: `GOOGLE_ANALYTICS_ID`
   - Add other environment variables as needed

5. **Deploy**:
   - Click **"Save and Deploy"**
   - Cloudflare will build and deploy your site

### Step 3: Configure Custom Domain (Optional)

1. **Add Custom Domain**:
   - In your Pages project, go to **Custom domains**
   - Click **"Add custom domain"**
   - Enter your domain (e.g., `vibesimulation.com`)
   - Follow the DNS configuration instructions

2. **Update DNS**:
   - Go to your domain registrar
   - Add the CNAME record provided by Cloudflare
   - Wait for DNS propagation (can take up to 24 hours)

### Step 4: Update Configuration Files

Before deploying, update these files with your actual values:

#### _headers file
- Update Google Analytics ID if needed
- Add custom security headers as required

#### wrangler.toml
- Update your custom domain name
- Add environment variables

### Step 5: Test Your Deployment

1. **Check Deployment Status**:
   - In Cloudflare Pages dashboard, monitor the deployment
   - Check for any build errors

2. **Test Functionality**:
   - Visit your live site
   - Test the fluid dynamics simulation
   - Verify all links and videos work
   - Check mobile responsiveness

## 🔧 Local Development

```bash
# Start local development server
python -m http.server 8000

# Or use any static file server
# npx serve .
# php -S localhost:8000
```

Visit `http://localhost:8000` to view your site locally.

## 📁 Project Structure

```
vibesimulation-site/
├── index.html                 # Main page with fluid simulation
├── about.html                 # About page
├── basics.html               # Physics basics
├── intermediate.html         # Physics intermediate
├── advanced.html             # Physics advanced
├── ai.html                   # AI learning track
├── contact.html              # Contact page
├── assets/                   # CSS, JS, fonts
│   ├── css/
│   ├── js/
│   └── webfonts/
├── images/                   # Site images and thumbnails
├── videos/                   # Video lesson pages
├── _headers                  # Cloudflare security headers
├── _redirects                # URL redirects
├── wrangler.toml            # Cloudflare configuration
└── README.md                # This file
```

## 🎮 Fluid Dynamics Simulation

The interactive fluid simulation features:

- **Real-time Navier-Stokes solver**
- **Three brush types**: Stream, Spray, Ink-stamp
- **Three color palettes**: Aurora, Neon Tokyo, Sunstone
- **Adjustable parameters**: Shear, Vorticity, Seed
- **Stability monitoring**: CFL condition indicator
- **Mobile responsive**: Touch and mouse support

## 📊 Analytics & Monitoring

- **Google Analytics**: Track user engagement
- **Cloudflare Analytics**: Monitor performance and security
- **Error tracking**: Monitor 404s and failed requests

## 🔒 Security Features

- **HTTPS enforced**: Automatic SSL certificates
- **Security headers**: XSS protection, content type sniffing prevention
- **Frame options**: Prevents clickjacking attacks
- **Referrer policy**: Protects user privacy

## 🚨 Troubleshooting

### Common Issues:

1. **404 Errors**: Check that all referenced files exist
2. **Simulation Not Loading**: Ensure JavaScript is enabled
3. **Images Not Displaying**: Verify image paths and formats
4. **Mobile Issues**: Test responsive design on various devices

### Performance Tips:

1. **Optimize Images**: Use WebP format where possible
2. **Minimize HTTP Requests**: Combine CSS/JS files
3. **Enable Compression**: Cloudflare handles this automatically
4. **Use CDN**: Cloudflare Pages includes global CDN

## 📞 Support

If you encounter issues:

1. Check the Cloudflare Pages deployment logs
2. Verify all files are committed to GitHub
3. Test locally before deploying
4. Contact Cloudflare support for platform-specific issues

## 🔄 Updates & Maintenance

- **Automatic Deployments**: Changes to `main` branch auto-deploy
- **Preview Deployments**: Create PRs to test changes
- **Rollback**: Use Cloudflare dashboard to rollback deployments
- **Custom Builds**: Modify build settings as needed

---

**Built with ❤️ for physics and AI education**

*Deploy your interactive physics simulation today!*
