# YouTube Subscriber Verifier 🎥✔️

## Description

The **YouTube Subscriber Verifier** is a Discord bot designed to verify if users have subscribed to a specified YouTube channel. It analyzes images uploaded by users to check for text that matches the channel's name or specific keywords. After verification, users can submit their UID with a screenshot to be added to the bypass system. The bot supports saving subscriber data for record-keeping. 📜

## Features ✨

- **Image Analysis**: Uses Tesseract.js and sharp to process and analyze uploaded images. 🖼️
- **Keyword Matching**: Checks for specific keywords or the channel name in the image text. 🔍
- **UID Submission**: After verification, users can submit their UID with screenshot. 🆔
- **API Integration**: Automatically adds verified UIDs to the bypass system via API. 🔗
- **Data Saving**: Optionally saves verified user data in a `subscriber.json` file. 💾
- **Ephemeral Responses**: Sends ephemeral messages to users for privacy. 🔒

## Prerequisites 🛠️

- Node.js (v16 or higher recommended) 🚀
- `npm` or `yarn` for managing packages 📦
- A Discord bot token 🔑
- A YouTube channel name to verify subscriptions 📺

## Installation 🛠️

### Step 1: Prerequisites
- **Node.js** (v16 or higher recommended) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Discord Bot Token** - Get from [Discord Developer Portal](https://discord.com/developers/applications)

### Step 2: Download/Clone the Repository

**Option A - Using Git:**
```bash
git clone https://github.com/devuuuxd/YouTube-Subscriber-Verifier.git
cd YouTube-Subscriber-Verifier
```

**Option B - Direct Download:**
- Download the ZIP file and extract it
- Open terminal/command prompt in the extracted folder

### Step 3: Install Dependencies

Open terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install all required packages:
- `discord.js` - Discord bot library
- `tesseract.js` - OCR for image text recognition
- `sharp` - Image processing
- `node-fetch` - HTTP requests

### Step 4: Configure the Bot

Create or edit `config.js` file in the root directory:

```js
module.exports = {
    token: "YOUR_BOT_TOKEN_HERE", // Add your bot's token here (REQUIRED)
    channel_name: "@devuuuu_xd", // Specify your YouTube channel's name here (REQUIRED)
    role_id: "", // ID of the role (OPTIONAL - not used in current version)
    keywords: "SUBSCRIBED", // Specify keywords separated by commas (OPTIONAL)
    save_data: "true" // Set to "true" to save data in subscriber.json (OPTIONAL)
};
```

**How to get Discord Bot Token:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to "Bot" section
4. Click "Reset Token" or "Copy" to get your token
5. Paste it in `config.js`

**Bot Permissions Required:**
- Send Messages
- Read Message History
- Attach Files
- Use Slash Commands

### Step 5: Run the Bot

```bash
node index.js
```

You should see:
```
Ready! Logged in as YourBotName#1234
Started refreshing application (/) commands.
Successfully reloaded application (/) commands.
```

### Step 6: Invite Bot to Your Server

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "OAuth2" → "URL Generator"
4. Select scopes: `bot` and `applications.commands`
5. Select permissions: `Send Messages`, `Read Message History`, `Attach Files`
6. Copy the generated URL and open it in browser
7. Select your server and authorize

## Commands 📋

### `/verify` - Verify Subscription
Verifies if a user has subscribed to the YouTube channel.

**Usage:**
```
/verify image:<attachment>
```

**Parameters:**
- `image` (required): Screenshot/image showing subscription status

**How it works:**
1. User uploads a screenshot of their subscription
2. Bot analyzes the image using OCR
3. Checks if channel name or keywords are found
4. If verified, user can proceed to submit UID

**Example:**
```
/verify image:[screenshot of subscription]
```

---

### `/uid` - Submit UID with Screenshot
Submits user's UID to the bypass system. **Requires verification first!**

**Usage:**
```
/uid uid_text:"!uid 232322434" screenshot:<attachment>
```

**Parameters:**
- `uid_text` (required): UID in format `!uid 232322434` or just the number
- `screenshot` (required): Screenshot attachment (MUST be provided)

**Requirements:**
- User must be verified first using `/verify`
- Screenshot is **mandatory** - UID will NOT be added without screenshot
- UID format: `!uid 232322434` or just `232322434`

**How it works:**
1. Checks if user is verified
2. Validates screenshot is provided
3. Extracts UID from the text
4. Calls API to add UID to bypass system
5. Confirms successful addition

**Example:**
```
/uid uid_text:"!uid 123456789" screenshot:[screenshot]
```

**Important Notes:**
- ⚠️ **Screenshot is REQUIRED** - Without screenshot, UID will NOT be added
- You must verify first using `/verify` before using `/uid`
- UID will be added to bypass system with 72 hours duration

## Bot Workflow 🔄

1. **User runs `/verify`** with subscription screenshot
   - Bot analyzes image
   - If verified → User is confirmed ✅
   - If not verified → Error message ❌

2. **User runs `/uid`** with UID and screenshot
   - Bot checks if user is verified
   - Bot validates screenshot is provided
   - Bot extracts UID from text
   - Bot calls API: `https://uidbypass.com/public/api/bypassapi.php?api=uid_892079dfb994f7fd2a883e9f074d9711&action=create&uid={uid}&duration=72`
   - Bot confirms UID added ✅

## Quick Start Guide 🚀

### For Users:

1. **First, verify your subscription:**
   ```
   /verify image:[upload screenshot of your subscription]
   ```
   - Wait for confirmation message: "✅ Verified! You are now confirmed."

2. **Then, submit your UID:**
   ```
   /uid uid_text:"!uid 123456789" screenshot:[upload screenshot]
   ```
   - Make sure to include screenshot!
   - Wait for confirmation: "✅ UID 123456789 has been added successfully with screenshot!"

### For Server Admins:

1. Follow installation steps above
2. Configure `config.js` with your bot token and channel name
3. Run `node index.js`
4. Invite bot to your server
5. Bot will automatically register slash commands

## Troubleshooting 🛠️

### Common Issues:

**Bot Not Responding:**
- ✅ Check if bot is online (green status in Discord)
- ✅ Verify token in `config.js` is correct
- ✅ Check console for error messages
- ✅ Make sure bot has necessary permissions

**Commands Not Showing:**
- ✅ Wait a few minutes after starting bot (Discord needs time to sync)
- ✅ Try restarting Discord client
- ✅ Verify bot has `applications.commands` scope when invited

**Verification Not Working:**
- ✅ Ensure screenshot clearly shows channel name or keywords
- ✅ Check `channel_name` in `config.js` matches your channel
- ✅ Try cropping image to focus on subscription text
- ✅ Supported formats: JPEG, PNG, WEBP, GIF

**UID Command Not Working:**
- ✅ Make sure you verified first using `/verify`
- ✅ Screenshot is REQUIRED - command will fail without it
- ✅ Check UID format: `!uid 123456789` or just `123456789`
- ✅ Verify screenshot format is supported

**Permission Errors:**
- ✅ Bot needs: Send Messages, Read Message History, Attach Files
- ✅ Check bot's role position in server settings
- ✅ Ensure bot role is above user roles

**Installation Errors:**
- ✅ Make sure Node.js v16+ is installed: `node --version`
- ✅ Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- ✅ On Windows, you may need to run PowerShell/CMD as Administrator

## Changelog 📜

- Check the changelog and other releases [here](https://github.com/devuuuxd/Youtube-Subscriber-Verfier/releases). 🚀

## Contact 📧

For any questions or support, please open an issue on the [GitHub repository](https://github.com/devuuuxd/YouTube-Subscriber-Verifier) or contact me directly on our Team's [Discord Server](https://discord.gg/V9jAnPKTg6) [Kronix Development](https://www.teamkronix.tech).

Happy verifying! 🎉
