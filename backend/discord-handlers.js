// ========================================
// Discord Slash Command Handlers
// ========================================

const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const db = require('./db');
const logger = require('./logger');
const {
    handleProfileCreate,
    handleProfileUpload,
    handleProfileList,
    handleProfileSwitch,
    handleProfileUrl,
    handleProfileDelete,
    handleProfileRename
} = require('./discord-profile-handlers');

// ========================================
// Helper Functions
// ========================================

async function downloadImageAsBase64(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000
        });

        const buffer = Buffer.from(response.data);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers['content-type'] || 'image/png';

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        logger.error(`Failed to download image: ${error.message}`);
        throw new Error('Failed to download image');
    }
}

function validateImageAttachment(attachment) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(attachment.contentType)) {
        throw new Error(`Invalid file type: ${attachment.contentType}. Allowed: PNG, JPEG, GIF, WebP`);
    }

    if (attachment.size > maxSize) {
        throw new Error(`File too large: ${(attachment.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`);
    }

    return true;
}

function createSuccessEmbed(title, description, fields = []) {
    return new EmbedBuilder()
        .setColor(0x8a2be2)
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'EchoSprite - Reactive VTuber Avatars' });
}

function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0xff4444)
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setTimestamp()
        .setFooter({ text: 'EchoSprite - Reactive VTuber Avatars' });
}

function createInfoEmbed(title, description, fields = []) {
    return new EmbedBuilder()
        .setColor(0x4488ff)
        .setTitle(`ℹ️ ${title}`)
        .setDescription(description)
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'EchoSprite - Reactive VTuber Avatars' });
}

// ========================================
// Avatar Command Handlers
// ========================================

async function handleAvatarUpload(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        // Get attachments
        const idleAttachment = interaction.options.getAttachment('idle');
        const talkingAttachment = interaction.options.getAttachment('talking');
        const mutedAttachment = interaction.options.getAttachment('muted');
        const deafenedAttachment = interaction.options.getAttachment('deafened');

        // Validate required attachments
        validateImageAttachment(idleAttachment);
        validateImageAttachment(talkingAttachment);

        if (mutedAttachment) validateImageAttachment(mutedAttachment);
        if (deafenedAttachment) validateImageAttachment(deafenedAttachment);

        // Download images as base64
        logger.info(`Downloading avatar images for user ${userId}`);

        const idleBase64 = await downloadImageAsBase64(idleAttachment.url);
        const talkingBase64 = await downloadImageAsBase64(talkingAttachment.url);
        const mutedBase64 = mutedAttachment ? await downloadImageAsBase64(mutedAttachment.url) : null;
        const deafenedBase64 = deafenedAttachment ? await downloadImageAsBase64(deafenedAttachment.url) : null;

        // Get or create user in database
        let user = await db.users.findByDiscordId(userId);
        if (!user) {
            user = await db.users.create(
                userId,
                username,
                interaction.user.discriminator,
                interaction.user.avatar
            );
        }

        // Save avatar to database
        await db.avatars.upsert(user.id, {
            idle: idleBase64,
            talking: talkingBase64,
            muted: mutedBase64,
            deafened: deafenedBase64,
            settings: {}
        });

        // Log analytics
        await db.analytics.logEvent('avatar_upload_discord', user.id, {
            states: {
                idle: true,
                talking: true,
                muted: !!mutedBase64,
                deafened: !!deafenedBase64
            }
        });

        logger.info(`Avatar uploaded successfully for user ${userId}`);

        // Generate URLs
        const frontendUrl = process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite';
        const individualUrl = `${frontendUrl}/viewer.html?userId=${userId}&mode=discord`;

        const embed = createSuccessEmbed(
            'Avatar Uploaded!',
            'Your avatar has been saved successfully.',
            [
                { name: '📊 States Uploaded', value: `Idle: ✅\nTalking: ✅\nMuted: ${mutedBase64 ? '✅' : '❌'}\nDeafened: ${deafenedBase64 ? '✅' : '❌'}`, inline: true },
                { name: '🔗 Individual Viewer URL', value: `\`\`\`${individualUrl}\`\`\``, inline: false },
                { name: '💡 Next Steps', value: '1. Copy the URL above\n2. Add it as a Browser Source in OBS\n3. Set size to 1920x1080\n4. Join a Discord voice channel\n5. Your avatar will react automatically!', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Avatar upload failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Upload Failed',
            error.message || 'Failed to upload avatar. Please try again.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleAvatarView(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const avatar = await db.avatars.findByDiscordId(userId);

        if (!avatar) {
            const embed = createErrorEmbed(
                'No Avatar Found',
                'You haven\'t uploaded an avatar yet. Use `/avatar upload` to get started!'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const embed = createInfoEmbed(
            'Your Avatar Configuration',
            'Here are your current avatar states:',
            [
                { name: '📊 Avatar States', value: `Idle: ${avatar.idle_image ? '✅' : '❌'}\nTalking: ${avatar.talking_image ? '✅' : '❌'}\nMuted: ${avatar.muted_image ? '✅' : '❌'}\nDeafened: ${avatar.deafened_image ? '✅' : '❌'}`, inline: true },
                { name: '⚙️ Settings', value: JSON.stringify(avatar.settings || {}, null, 2) || 'Default settings', inline: false },
                { name: '🕐 Last Updated', value: new Date(avatar.updated_at).toLocaleString(), inline: true }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Avatar view failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to View Avatar',
            'An error occurred while retrieving your avatar.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleAvatarUrl(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const avatar = await db.avatars.findByDiscordId(userId);

        if (!avatar) {
            const embed = createErrorEmbed(
                'No Avatar Found',
                'You haven\'t uploaded an avatar yet. Use `/avatar upload` to get started!'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite';
        const individualUrl = `${frontendUrl}/viewer.html?userId=${userId}&mode=discord`;

        const embed = createSuccessEmbed(
            'Your OBS Browser Source URLs',
            'Use these URLs in OBS Studio:',
            [
                { name: '👤 Individual Viewer', value: `Shows only your avatar\n\`\`\`${individualUrl}\`\`\``, inline: false },
                { name: '📺 OBS Settings', value: '**Width:** 1920\n**Height:** 1080\n**FPS:** 30\n✅ Shutdown source when not visible\n✅ Refresh browser when scene becomes active', inline: false },
                { name: '💡 Tip', value: 'For group viewing with others in your voice channel, join a voice channel and use `/channel url`', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Avatar URL failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Get URLs',
            'An error occurred while generating your URLs.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleAvatarDelete(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const user = await db.users.findByDiscordId(userId);

        if (!user) {
            const embed = createErrorEmbed(
                'No Avatar Found',
                'You don\'t have any avatar data to delete.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Delete avatar (cascade will handle it)
        await db.query('DELETE FROM avatars WHERE user_id = $1', [user.id]);

        // Log analytics
        await db.analytics.logEvent('avatar_delete_discord', user.id);

        logger.info(`Avatar deleted for user ${userId}`);

        const embed = createSuccessEmbed(
            'Avatar Deleted',
            'Your avatar configuration has been permanently deleted.'
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Avatar delete failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Delete Avatar',
            'An error occurred while deleting your avatar.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

// ========================================
// Channel Command Handlers
// ========================================

async function handleChannelUrl(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        // Check if user is in a voice channel
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            const embed = createErrorEmbed(
                'Not in Voice Channel',
                'You must be in a voice channel to use this command.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const channelId = voiceChannel.id;
        const channelName = voiceChannel.name;
        const frontendUrl = process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite';
        const groupUrl = `${frontendUrl}/viewer-group.html?channelId=${channelId}`;

        const embed = createSuccessEmbed(
            'Group Viewer URL',
            `URL for **${channelName}**:`,
            [
                { name: '👥 Group Viewer', value: `Shows all avatars in this voice channel\n\`\`\`${groupUrl}\`\`\``, inline: false },
                { name: '📺 OBS Settings', value: '**Width:** 1920\n**Height:** 1080\n**FPS:** 30\n✅ Shutdown source when not visible\n✅ Refresh browser when scene becomes active', inline: false },
                { name: '💡 Features', value: '• Automatically shows everyone in voice\n• Updates in real-time when people join/leave\n• Shows talking, muted, and deafened states\n• Perfect for collaborations!', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Channel URL failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Get URL',
            'An error occurred while generating the channel URL.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleChannelPreview(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            const embed = createErrorEmbed(
                'Not in Voice Channel',
                'You must be in a voice channel to use this command.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const members = voiceChannel.members;
        const memberList = members.map(m => {
            const state = m.voice.selfMute ? '🔇' : m.voice.selfDeaf ? '🔕' : m.voice.streaming ? '📹' : '🎤';
            return `${state} ${m.displayName}`;
        }).join('\n');

        const embed = createInfoEmbed(
            `Voice Channel: ${voiceChannel.name}`,
            `**${members.size} member(s) in voice:**\n${memberList}`,
            [
                { name: '💡 Tip', value: 'Use `/channel url` to get the group viewer URL for OBS!', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Channel preview failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Preview Channel',
            'An error occurred while previewing the channel.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleChannelMembers(interaction) {
    await handleChannelPreview(interaction); // Same as preview
}

// ========================================
// Settings Command Handlers
// ========================================

async function handleSettingsView(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const avatar = await db.avatars.findByDiscordId(userId);

        if (!avatar) {
            const embed = createErrorEmbed(
                'No Avatar Found',
                'You haven\'t uploaded an avatar yet. Upload one first with `/avatar upload`.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const settings = avatar.settings || {};

        const embed = createInfoEmbed(
            'Your Settings',
            'Current avatar settings:',
            [
                { name: '🎨 Animations', value: `Bounce: ${settings.bounce ? '✅' : '❌'}\nFade: ${settings.fade ? '✅' : '❌'}`, inline: true },
                { name: '👥 Group View', value: `Show Names: ${settings.showNames !== false ? '✅' : '❌'}\nInclude Self: ${settings.includeSelf !== false ? '✅' : '❌'}\nDim Inactive: ${settings.dimInactive ? '✅' : '❌'}`, inline: true },
                { name: '📏 Spacing', value: `${settings.spacing || 20}px`, inline: true },
                { name: '💡 Tip', value: 'Use `/settings <option> <value>` to change settings!', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Settings view failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to View Settings',
            'An error occurred while retrieving your settings.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleSettingsUpdate(interaction, settingName, value) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const user = await db.users.findByDiscordId(userId);

        if (!user) {
            const embed = createErrorEmbed(
                'No Avatar Found',
                'You haven\'t uploaded an avatar yet. Upload one first with `/avatar upload`.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const avatar = await db.avatars.findByUserId(user.id);
        if (!avatar) {
            const embed = createErrorEmbed(
                'No Avatar Found',
                'You haven\'t uploaded an avatar yet. Upload one first with `/avatar upload`.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Update settings
        const currentSettings = avatar.settings || {};
        currentSettings[settingName] = value;

        await db.query(
            'UPDATE avatars SET settings = $1, updated_at = NOW() WHERE user_id = $2',
            [JSON.stringify(currentSettings), user.id]
        );

        // Log analytics
        await db.analytics.logEvent('settings_update_discord', user.id, { setting: settingName, value });

        logger.info(`Settings updated for user ${userId}: ${settingName} = ${value}`);

        const embed = createSuccessEmbed(
            'Settings Updated',
            `**${settingName}** has been set to **${value}**`
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Settings update failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Update Settings',
            'An error occurred while updating your settings.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

// ========================================
// Help Command Handler
// ========================================

async function handleHelp(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
        .setColor(0x8a2be2)
        .setTitle('🎮 EchoSprite - Discord Commands')
        .setDescription('Reactive VTuber avatars for OBS, Twitch, and YouTube')
        .addFields(
            { name: '📸 Avatar Commands', value: '`/avatar upload` - Upload your avatar images\n`/avatar view` - View your current avatar\n`/avatar url` - Get OBS browser source URL\n`/avatar delete` - Delete your avatar', inline: false },
            { name: '👥 Channel Commands', value: '`/channel url` - Get group viewer URL\n`/channel preview` - Preview voice channel members\n`/channel members` - List members in voice', inline: false },
            { name: '⚙️ Settings Commands', value: '`/settings view` - View your settings\n`/settings bounce` - Toggle bounce animation\n`/settings fade` - Toggle fade effect\n`/settings spacing` - Set avatar spacing\n`/settings show-names` - Toggle username display\n`/settings include-self` - Include yourself in group view\n`/settings dim-inactive` - Dim inactive avatars', inline: false },
            { name: '🔧 Utility Commands', value: '`/help` - Show this help message\n`/status` - Check bot status', inline: false },
            { name: '🌐 Web Dashboard', value: `${process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite'}`, inline: false },
            { name: '📚 Documentation', value: '[GitHub](https://github.com/RattusKing/echosprite) • [Setup Guide](https://github.com/RattusKing/echosprite/blob/main/SETUP-DISCORD.md)', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'EchoSprite - Made for VTubers' });

    await interaction.editReply({ embeds: [embed] });
}

// ========================================
// Status Command Handler
// ========================================

async function handleStatus(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        // Check backend health
        const apiUrl = process.env.API_URL || 'http://localhost:3000';
        const healthResponse = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
        const health = healthResponse.data;

        const embed = new EmbedBuilder()
            .setColor(health.status === 'healthy' ? 0x00ff88 : 0xff4444)
            .setTitle('🤖 EchoSprite Status')
            .setDescription(`**Overall Status:** ${health.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}`)
            .addFields(
                { name: '🤖 Discord Bot', value: health.discord?.bot ? '✅ Online' : '❌ Offline', inline: true },
                { name: '🔐 OAuth', value: health.discord?.oauth ? '✅ Configured' : '❌ Not Configured', inline: true },
                { name: '🗄️ Database', value: health.database === 'connected' ? '✅ Connected' : '❌ Disconnected', inline: true },
                { name: '🔌 WebSocket', value: `✅ Active\n${health.websocket?.connections || 0} connection(s)`, inline: true },
                { name: '📍 Backend', value: apiUrl, inline: false },
                { name: '📅 Version', value: health.version || 'Unknown', inline: true },
                { name: '🕐 Timestamp', value: new Date(health.timestamp).toLocaleString(), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'EchoSprite Status Check' });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Status check failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Status Check Failed',
            `Could not connect to backend API.\n\nError: ${error.message}`
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

// ========================================
// Main Handler Router
// ========================================

async function handleSlashCommand(interaction) {
    const { commandName } = interaction;

    try {
        if (commandName === 'avatar') {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'upload':
                    await handleAvatarUpload(interaction);
                    break;
                case 'view':
                    await handleAvatarView(interaction);
                    break;
                case 'url':
                    await handleAvatarUrl(interaction);
                    break;
                case 'delete':
                    await handleAvatarDelete(interaction);
                    break;
            }
        } else if (commandName === 'channel') {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'url':
                    await handleChannelUrl(interaction);
                    break;
                case 'preview':
                    await handleChannelPreview(interaction);
                    break;
                case 'members':
                    await handleChannelMembers(interaction);
                    break;
            }
        } else if (commandName === 'settings') {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'view':
                    await handleSettingsView(interaction);
                    break;
                case 'bounce':
                    await handleSettingsUpdate(interaction, 'bounce', interaction.options.getBoolean('enabled'));
                    break;
                case 'fade':
                    await handleSettingsUpdate(interaction, 'fade', interaction.options.getBoolean('enabled'));
                    break;
                case 'spacing':
                    await handleSettingsUpdate(interaction, 'spacing', interaction.options.getInteger('value'));
                    break;
                case 'show-names':
                    await handleSettingsUpdate(interaction, 'showNames', interaction.options.getBoolean('enabled'));
                    break;
                case 'include-self':
                    await handleSettingsUpdate(interaction, 'includeSelf', interaction.options.getBoolean('enabled'));
                    break;
                case 'dim-inactive':
                    await handleSettingsUpdate(interaction, 'dimInactive', interaction.options.getBoolean('enabled'));
                    break;
            }
        } else if (commandName === 'profile') {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'create':
                    await handleProfileCreate(interaction);
                    break;
                case 'upload':
                    await handleProfileUpload(interaction);
                    break;
                case 'list':
                    await handleProfileList(interaction);
                    break;
                case 'switch':
                    await handleProfileSwitch(interaction);
                    break;
                case 'url':
                    await handleProfileUrl(interaction);
                    break;
                case 'delete':
                    await handleProfileDelete(interaction);
                    break;
                case 'rename':
                    await handleProfileRename(interaction);
                    break;
            }
        } else if (commandName === 'help') {
            await handleHelp(interaction);
        } else if (commandName === 'status') {
            await handleStatus(interaction);
        }

        // Log analytics
        const user = await db.users.findByDiscordId(interaction.user.id);
        if (user) {
            await db.analytics.logEvent('slash_command', user.id, { command: commandName });
        }

    } catch (error) {
        logger.error(`Slash command error (${commandName}): ${error.message}`);
        logger.error(error.stack);

        // Try to respond with error if possible
        try {
            const embed = createErrorEmbed(
                'Command Failed',
                `An unexpected error occurred while processing your command.\n\nError: ${error.message}`
            );

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (replyError) {
            logger.error(`Failed to send error message: ${replyError.message}`);
        }
    }
}

module.exports = {
    handleSlashCommand
};
