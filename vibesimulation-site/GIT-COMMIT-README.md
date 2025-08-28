# VibeSimulation Git Commit Script

## 🚀 Quick Commit & Push Script

A comprehensive PowerShell script to commit and push your VibeSimulation website changes to Git.

### 📋 Usage

#### **Run the script:**
```powershell
.\commit-and-push.ps1
```

#### **From project root:**
```powershell
cd vibesimulation-site
.\commit-and-push.ps1
```

### ✨ What It Does

#### **Automatic Workflow:**
1. **Checks** if you're in a Git repository
2. **Shows** current branch and status
3. **Stages** all changes (`git add .`)
4. **Creates** descriptive commit message with timestamp
5. **Commits** changes with detailed message
6. **Pushes** to remote repository
7. **Reports** success/failure with clear messages

#### **Smart Features:**
- ✅ **Error handling** - Stops on failures with helpful messages
- ✅ **No changes check** - Only commits if there are actual changes
- ✅ **Unpushed commits detection** - Handles existing unpushed commits
- ✅ **Branch awareness** - Works with any branch you're on
- ✅ **Color-coded output** - Easy to read success/error messages

### 📝 Commit Message Format

The script generates a comprehensive commit message:

```
feat: Update VibeSimulation website - YYYY-MM-DD HH:mm

- Added comprehensive blog section with main article
- Updated sitemap with blog pages
- Enhanced navigation with blog link
- Added SEO optimizations and structured data
- Improved responsive design and styling
```

### 🔧 Troubleshooting

#### **Common Issues:**

**❌ "Not in a Git repository"**
- Make sure you're running from the `vibesimulation-site` directory
- Initialize git if needed: `git init`

**❌ "Failed to push changes"**
- Pull latest changes first: `git pull origin main`
- Check your remote: `git remote -v`
- Verify authentication

**❌ "Permission denied"**
- Check your Git credentials
- Use SSH key or personal access token

### 📊 What Gets Committed

#### **Recent Changes Include:**
- ✅ **Blog section** (`/blog/` directory)
- ✅ **Blog articles** (Introducing Vibe Simulation)
- ✅ **Blog styling** (`assets/css/blog.css`)
- ✅ **Updated navigation** (Blog links)
- ✅ **Enhanced sitemaps** (blog URLs added)
- ✅ **SEO improvements** (meta tags, structured data)
- ✅ **Footer updates** (blog links)

### 🚀 Quick Commands

#### **Check status first:**
```powershell
git status
```

#### **Manual commit (alternative):**
```powershell
git add .
git commit -m "Your message here"
git push origin main
```

#### **View commit history:**
```powershell
git log --oneline -5
```

### 📈 Best Practices

#### **Before Running Script:**
1. **Test locally** - Make sure everything works
2. **Check changes** - Review what will be committed
3. **Backup important files** - If needed

#### **Regular Workflow:**
1. **Make changes** to website files
2. **Test locally** with `python -m http.server 8080`
3. **Run script** to commit and push
4. **Verify deployment** on live site

### 🔍 Monitoring

#### **Check Your Commits:**
- **GitHub/GitLab**: View commits in repository
- **Local history**: `git log --oneline`
- **Status**: `git status`

#### **Verify Deployment:**
- Visit `https://vibesimulation.com`
- Check blog: `https://vibesimulation.com/blog/`
- Test all links and functionality

### 🎯 Pro Tips

#### **Custom Commit Messages:**
Edit the script to customize the commit message for specific changes.

#### **Branch Strategy:**
- Use feature branches for major changes
- Merge to main when ready for production

#### **Large Files:**
- The script handles all file types
- Consider `.gitignore` for large/unnecessary files

---

## 📞 Support

If you encounter issues:
1. Check the error messages (they're designed to be helpful)
2. Verify you're in the correct directory
3. Ensure Git is properly configured
4. Check your internet connection for push operations

**Happy coding!** 🚀

*Script created for VibeSimulation project - Interactive Physics Simulations*
