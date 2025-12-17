# Installation Commands

## Quick Install (All Packages)

```bash
npm install
```

This will install all required packages automatically from `package.json`.

---

## Manual Install (Individual Packages)

If you need to install packages individually:

```bash
npm install discord.js@^14.15.3
npm install sharp@^0.33.4
npm install tesseract.js@^5.1.0
npm install node-fetch@^2.7.0
```

---

## Required Packages List

1. **discord.js** (v14.15.3) - Discord bot framework
   ```bash
   npm install discord.js
   ```

2. **sharp** (v0.33.4) - Image processing
   ```bash
   npm install sharp
   ```

3. **tesseract.js** (v5.1.0) - OCR for text recognition
   ```bash
   npm install tesseract.js
   ```

4. **node-fetch** (v2.7.0) - HTTP requests
   ```bash
   npm install node-fetch
   ```

---

## Complete Setup Commands

```bash
# 1. Install all packages
npm install

# 2. Configure bot (edit config.js file)
# Add your bot token and channel name

# 3. Run the bot
node index.js
```

---

## For Windows (PowerShell/CMD)

```powershell
npm install
node index.js
```

---

## For Linux/Mac

```bash
npm install
node index.js
```

---

## Verify Installation

After running `npm install`, check if packages are installed:

```bash
npm list
```

You should see:
- discord.js
- sharp
- tesseract.js
- node-fetch

---

## Troubleshooting

**If npm install fails:**
```bash
# Clear cache and reinstall
npm cache clean --force
npm install
```

**If you get permission errors:**
```bash
# Windows: Run PowerShell as Administrator
# Linux/Mac: Use sudo (not recommended, better to fix permissions)
```

**Check Node.js version:**
```bash
node --version
# Should be v16 or higher
```

**Check npm version:**
```bash
npm --version
```

