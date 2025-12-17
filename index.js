const { Client, Events, GatewayIntentBits } = require('discord.js');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fetch = require('node-fetch');
const fs = require('fs');
const config = require("./config.js");

// Getting Config
if (!config.token) {
    console.error('Error: Bot token is required in config.js');
    process.exit(1);
}
if (!config.channel_name) {
    console.error('Error: Channel name is required in config.js');
    process.exit(1);
}

const role_id = config.role_id || null;
const keywords = config.keywords || null;
const save_data = config.save_data || 'false';



// Creating a Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});



// Check if a user got bypass within last 7 days
const hasRecentBypass = (userId) => {
    if (!fs.existsSync('subscriber.json')) return null;

    try {
        const fileContent = fs.readFileSync('subscriber.json', 'utf8').trim();
        
        // If file is empty or invalid, return null
        if (!fileContent || fileContent === '' || fileContent === '1' || fileContent === '0') {
            // Fix corrupted file
            fs.writeFileSync('subscriber.json', '[]');
            return null;
        }

        const subscribers = JSON.parse(fileContent);
        
        // Ensure it's an array
        if (!Array.isArray(subscribers)) {
            fs.writeFileSync('subscriber.json', '[]');
            return null;
        }

        const user = subscribers.find(sub => sub.id === userId);
        
        if (!user || !user.bypassAddedAt) return null;

        const bypassDate = new Date(user.bypassAddedAt);
        const now = new Date();
        const daysDiff = (now - bypassDate) / (1000 * 60 * 60 * 24); // Convert to days

        if (daysDiff < 7) {
            const daysPassed = Math.floor(daysDiff);
            const daysRemaining = Math.ceil(7 - daysDiff);
            const hoursRemaining = Math.ceil((7 - daysDiff) * 24);
            
            return {
                hasBypass: true,
                daysPassed: daysPassed,
                daysRemaining: daysRemaining,
                hoursRemaining: hoursRemaining,
                lastBypassDate: bypassDate
            };
        }

        return { hasBypass: false };
    } catch (error) {
        console.error('Error reading subscriber.json:', error);
        // Fix corrupted file
        fs.writeFileSync('subscriber.json', '[]');
        return null;
    }
};

// Save user bypass data
const saveBypassData = (userId, username, uid) => {
    let subscribers = [];
    
    if (fs.existsSync('subscriber.json')) {
        try {
            const fileContent = fs.readFileSync('subscriber.json', 'utf8').trim();
            
            // If file is empty or invalid, start with empty array
            if (!fileContent || fileContent === '' || fileContent === '1' || fileContent === '0') {
                subscribers = [];
            } else {
                const parsed = JSON.parse(fileContent);
                subscribers = Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.error('Error reading subscriber.json:', error);
            subscribers = [];
        }
    }

    const userData = {
        username: username,
        id: userId,
        uid: uid,
        bypassAddedAt: new Date().toISOString(),
        time: new Date().toISOString()
    };

    // Check if user already exists, update or add
    const existingIndex = subscribers.findIndex(sub => sub.id === userId);
    if (existingIndex >= 0) {
        subscribers[existingIndex] = { ...subscribers[existingIndex], ...userData };
    } else {
        subscribers.push(userData);
    }

    try {
        fs.writeFileSync('subscriber.json', JSON.stringify(subscribers, null, 2));
    } catch (error) {
        console.error('Error writing subscriber.json:', error);
    }
};



// Command handling - Message based command !uid
client.on(Events.MessageCreate, async message => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check if message starts with !uid
    if (!message.content.toLowerCase().startsWith('!uid')) return;

    // Check if bot should only work in specific channel
    if (config.channel_id && config.channel_id.trim() !== '') {
        if (message.channel.id !== config.channel_id) {
            // Don't reply if wrong channel, just ignore
            return;
        }
    }

    const member = message.member;
    if (!member) {
        await message.reply('❌ Member not found.');
        return;
    }

    // Check if message has attachment (screenshot)
    if (message.attachments.size === 0) {
        await message.reply('❌ Screenshot is required! Without screenshot, UID will not be added. Please attach a screenshot with your message.');
        return;
    }

    const screenshot = message.attachments.first();

    // Check the file extension for screenshot
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    const url = new URL(screenshot.url);
    const fileExtension = url.pathname.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        await message.reply('❌ Unsupported screenshot format. Please upload a JPEG, PNG, WEBP, or GIF image.');
        return;
    }

    // Parse UID from message: !uid 232322434
    const uidMatch = message.content.match(/!uid\s+(\d+)/i);
    if (!uidMatch) {
        await message.reply('❌ Invalid format. Please use: `!uid 232322434` with screenshot attached.');
        return;
    }

    const uid = uidMatch[1];

    // Check if user already got bypass within 7 days
    const bypassCheck = hasRecentBypass(member.user.id);
    if (bypassCheck && bypassCheck.hasBypass) {
        let timeMessage = '';
        if (bypassCheck.daysRemaining >= 1) {
            timeMessage = `${bypassCheck.daysRemaining} day${bypassCheck.daysRemaining > 1 ? 's' : ''}`;
        } else {
            timeMessage = `${bypassCheck.hoursRemaining} hour${bypassCheck.hoursRemaining > 1 ? 's' : ''}`;
        }
        
        const daysPassedText = bypassCheck.daysPassed === 0 ? 'today' : `${bypassCheck.daysPassed} day${bypassCheck.daysPassed > 1 ? 's' : ''} ago`;
        
        await message.reply(`⏰ You already received a UID bypass ${daysPassedText}. Please wait **${timeMessage}** before requesting again.`);
        return;
    }

    // Send processing message
    const processingMsg = await message.reply('⏳ Processing verification and UID submission...');

    try {
        // Step 1: Verify the screenshot (check for subscription)
        const response = await fetch(screenshot.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use sharp to preprocess the image
        const processedImage = await sharp(buffer)
            .resize({ width: 1000 })
            .toBuffer();

        // Use Tesseract to extract text
        const { data: { text } } = await Tesseract.recognize(processedImage);

        // Convert extracted text and channel name to lowercase for case-insensitive comparison
        const extractedTextLower = text.toLowerCase();
        const channelNameLower = config.channel_name.toLowerCase();

        console.log(`Extracted text: ${text}`);
        console.log(`Looking for channel: ${config.channel_name}`);

        // STRICT VERIFICATION: Must contain the exact channel name from config
        // Remove @ symbol for matching (some screenshots might not have it)
        const channelNameClean = channelNameLower.replace('@', '').trim();
        const extractedTextClean = extractedTextLower.replace('@', '').trim();
        
        // Check if channel name is in the extracted text
        let containsChannelName = extractedTextClean.includes(channelNameClean);
        
        // Also check with @ symbol in case it's present
        if (!containsChannelName) {
            containsChannelName = extractedTextLower.includes(channelNameLower);
        }

        // Additional check: if channel name has @, also check without it
        if (channelNameLower.startsWith('@') && !containsChannelName) {
            const channelWithoutAt = channelNameLower.substring(1);
            containsChannelName = extractedTextClean.includes(channelWithoutAt);
        }

        console.log(`Channel match result: ${containsChannelName ? '✅ MATCHED' : '❌ NOT MATCHED'}`);

        // If verification fails, don't add UID
        if (!containsChannelName) {
            await processingMsg.edit(`❌ Verification failed! Screenshot does not match channel **${config.channel_name}**. Please provide a screenshot showing subscription to **${config.channel_name}**.`);
            return;
        }

        // Step 2: Verification passed, now add UID via API
        const apiUrl = `https://uidbypass.com/public/api/bypassapi.php?api=uid_892079dfb994f7fd2a883e9f074d9711&action=create&uid=${uid}&duration=24`;
        
        const apiResponse = await fetch(apiUrl);
        const apiResult = await apiResponse.text();

        console.log(`API Response for UID ${uid}:`, apiResult);

        // Save user bypass data (always save, not just if save_data is true)
        saveBypassData(member.user.id, member.user.username, uid);

        await processingMsg.edit(`✅ Verified! User: **${member.user.username}** | UID: **${uid}** has been added successfully! You can request again in 7 days.`);
    } catch (error) {
        console.error('Error processing:', error);
        await processingMsg.edit('❌ There was an error processing your request. Please try again.');
    }
});


client.login(config.token).catch(err => {
    console.error('Failed to login:', err);
});
/*/* ALL CREDITS TO 
/* https://www.youtube.com/@devuuu_xd (YOUTUBE)
/* https://github.com/devuuuxd (GITHUB)
/* MAKE SURE TO GIVE ME CREDITS 😼😼
/*/
