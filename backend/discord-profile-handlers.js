// ========================================
// Discord Profile Command Handlers
// ========================================

const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const db = require('./db');
const logger = require('./logger');

// ========================================
// Helper Functions
// ========================================

// Convert profile name to URL-friendly slug
function nameToSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

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
// Profile Command Handlers
// ========================================

async function handleProfileCreate(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const profileName = interaction.options.getString('name');
        const profileSlug = nameToSlug(profileName);

        // Get or create user
        let user = await db.users.findByDiscordId(userId);
        if (!user) {
            user = await db.users.create(
                userId,
                username,
                interaction.user.discriminator,
                interaction.user.avatar
            );
        }

        // Check if profile already exists
        const existing = await db.profiles.findByUserAndSlug(user.id, profileSlug);
        if (existing) {
            const embed = createErrorEmbed(
                'Profile Already Exists',
                `You already have a profile named "**${existing.profile_name}**".\n\nUse \`/profile list\` to see all your profiles.`
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Check profile limit (max 20 profiles per user)
        const count = await db.profiles.count(user.id);
        if (count >= 20) {
            const embed = createErrorEmbed(
                'Profile Limit Reached',
                `You can have a maximum of **20 profiles**.\n\nDelete an existing profile with \`/profile delete\` before creating a new one.`
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Create profile
        const isFirstProfile = count === 0;
        const profile = await db.profiles.create(user.id, profileName, profileSlug, isFirstProfile);

        // Log analytics
        await db.analytics.logEvent('profile_create', user.id, { profile_name: profileName });

        logger.info(`Profile "${profileName}" created for user ${userId}`);

        const frontendUrl = process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite';
        const profileUrl = `${frontendUrl}/viewer.html?userId=${userId}&mode=discord&profile=${profileSlug}`;

        const embed = createSuccessEmbed(
            'Profile Created!',
            `Your profile "**${profileName}**" has been created!`,
            [
                { name: '🆔 Profile Slug', value: `\`${profileSlug}\``, inline: true },
                { name: '⭐ Status', value: isFirstProfile ? '✅ Active (First Profile)' : '⏸️ Inactive', inline: true },
                { name: '📊 Total Profiles', value: `${count + 1}`, inline: true },
                { name: '📸 Next Step', value: `Upload images to this profile:\n\`/profile upload profile:"${profileName}"\``, inline: false },
                { name: '🔗 Profile URL', value: `\`\`\`${profileUrl}\`\`\``, inline: false },
                { name: '💡 Tip', value: 'Upload images to activate this profile!', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Profile create failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Create Profile',
            error.message || 'An error occurred while creating the profile.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleProfileUpload(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const profileName = interaction.options.getString('profile');
        const profileSlug = nameToSlug(profileName);

        // Get attachments
        const idleAttachment = interaction.options.getAttachment('idle');
        const talkingAttachment = interaction.options.getAttachment('talking');
        const mutedAttachment = interaction.options.getAttachment('muted');
        const deafenedAttachment = interaction.options.getAttachment('deafened');

        // Validate attachments
        validateImageAttachment(idleAttachment);
        validateImageAttachment(talkingAttachment);
        if (mutedAttachment) validateImageAttachment(mutedAttachment);
        if (deafenedAttachment) validateImageAttachment(deafenedAttachment);

        // Get or create user
        let user = await db.users.findByDiscordId(userId);
        if (!user) {
            user = await db.users.create(
                userId,
                username,
                interaction.user.discriminator,
                interaction.user.avatar
            );
        }

        // Find profile
        let profile = await db.profiles.findByUserAndSlug(user.id, profileSlug);
        if (!profile) {
            const embed = createErrorEmbed(
                'Profile Not Found',
                `Profile "**${profileName}**" doesn't exist.\n\nCreate it first with:\n\`/profile create name:"${profileName}"\``
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Download images
        logger.info(`Downloading images for profile "${profileName}" for user ${userId}`);

        const idleBase64 = await downloadImageAsBase64(idleAttachment.url);
        const talkingBase64 = await downloadImageAsBase64(talkingAttachment.url);
        const mutedBase64 = mutedAttachment ? await downloadImageAsBase64(mutedAttachment.url) : null;
        const deafenedBase64 = deafenedAttachment ? await downloadImageAsBase64(deafenedAttachment.url) : null;

        // Update profile
        await db.profiles.update(profile.id, {
            idle: idleBase64,
            talking: talkingBase64,
            muted: mutedBase64,
            deafened: deafenedBase64,
            settings: profile.settings || {}
        });

        // Log analytics
        await db.analytics.logEvent('profile_upload', user.id, {
            profile_name: profileName,
            states: { idle: true, talking: true, muted: !!mutedBase64, deafened: !!deafenedBase64 }
        });

        logger.info(`Profile "${profileName}" uploaded for user ${userId}`);

        const frontendUrl = process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite';
        const profileUrl = `${frontendUrl}/viewer.html?userId=${userId}&mode=discord&profile=${profileSlug}`;

        const embed = createSuccessEmbed(
            'Profile Uploaded!',
            `Images uploaded to profile "**${profileName}**"!`,
            [
                { name: '📊 States Uploaded', value: `Idle: ✅\nTalking: ✅\nMuted: ${mutedBase64 ? '✅' : '❌'}\nDeafened: ${deafenedBase64 ? '✅' : '❌'}`, inline: true },
                { name: '⭐ Status', value: profile.is_active ? '✅ Active' : '⏸️ Inactive', inline: true },
                { name: '🔗 Profile URL', value: `\`\`\`${profileUrl}\`\`\``, inline: false },
                { name: '🎯 Make Active', value: profile.is_active ? 'This profile is already active!' : `Switch to this profile:\n\`/profile switch profile:"${profileName}"\``, inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Profile upload failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Upload Failed',
            error.message || 'Failed to upload images to profile.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleProfileList(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const user = await db.users.findByDiscordId(userId);

        if (!user) {
            const embed = createErrorEmbed(
                'No Profiles Found',
                'You haven\'t created any profiles yet.\n\nCreate your first profile with:\n`/profile create name:"My First Profile"`'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const profiles = await db.profiles.findByUserId(user.id);

        if (profiles.length === 0) {
            const embed = createErrorEmbed(
                'No Profiles Found',
                'You haven\'t created any profiles yet.\n\nCreate your first profile with:\n`/profile create name:"My First Profile"`'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const profileList = profiles.map((p, index) => {
            const status = p.is_active ? '⭐ **ACTIVE**' : '⏸️ Inactive';
            const hasImages = p.idle_image && p.talking_image ? '✅' : '❌';
            return `${index + 1}. **${p.profile_name}** (${status}) ${hasImages}`;
        }).join('\n');

        const frontendUrl = process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite';

        const embed = createInfoEmbed(
            'Your Avatar Profiles',
            `You have **${profiles.length}** profile(s):`,
            [
                { name: '📋 Profiles', value: profileList, inline: false },
                { name: '💡 Tips', value: '✅ = Has images uploaded\n⭐ = Currently active profile\n⏸️ = Inactive profile', inline: false },
                { name: '🔄 Switch Profiles', value: 'Use `/profile switch` to change active profile', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Profile list failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to List Profiles',
            'An error occurred while retrieving your profiles.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleProfileSwitch(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const profileName = interaction.options.getString('profile');
        const profileSlug = nameToSlug(profileName);

        const user = await db.users.findByDiscordId(userId);
        if (!user) {
            const embed = createErrorEmbed(
                'Profile Not Found',
                'You haven\'t created any profiles yet.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const profile = await db.profiles.findByUserAndSlug(user.id, profileSlug);
        if (!profile) {
            const embed = createErrorEmbed(
                'Profile Not Found',
                `Profile "**${profileName}**" doesn't exist.\n\nUse \`/profile list\` to see your profiles.`
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        if (profile.is_active) {
            const embed = createInfoEmbed(
                'Already Active',
                `Profile "**${profile.profile_name}**" is already your active profile!`
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Set as active
        await db.profiles.setActive(profile.id, user.id);

        // Log analytics
        await db.analytics.logEvent('profile_switch', user.id, { profile_name: profile.profile_name });

        logger.info(`Switched to profile "${profile.profile_name}" for user ${userId}`);

        const embed = createSuccessEmbed(
            'Profile Switched!',
            `Now using profile "**${profile.profile_name}**"`,
            [
                { name: '⭐ Active Profile', value: profile.profile_name, inline: true },
                { name: '🔗 Default URL', value: 'Your default viewer URL now shows this profile!', inline: false },
                { name: '💡 Tip', value: 'If you\'re already streaming, your OBS browser source will update automatically!', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Profile switch failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Switch Profile',
            error.message || 'An error occurred while switching profiles.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleProfileUrl(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const profileName = interaction.options.getString('profile');

        const user = await db.users.findByDiscordId(userId);
        if (!user) {
            const embed = createErrorEmbed(
                'No Profiles Found',
                'You haven\'t created any profiles yet.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        let profile;
        if (profileName) {
            const profileSlug = nameToSlug(profileName);
            profile = await db.profiles.findByUserAndSlug(user.id, profileSlug);
            if (!profile) {
                const embed = createErrorEmbed(
                    'Profile Not Found',
                    `Profile "**${profileName}**" doesn't exist.\n\nUse \`/profile list\` to see your profiles.`
                );
                return await interaction.editReply({ embeds: [embed] });
            }
        } else {
            profile = await db.profiles.getActive(user.id);
            if (!profile) {
                const embed = createErrorEmbed(
                    'No Active Profile',
                    'You don\'t have an active profile.\n\nCreate one with `/profile create`'
                );
                return await interaction.editReply({ embeds: [embed] });
            }
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite';
        const profileUrl = `${frontendUrl}/viewer.html?userId=${userId}&mode=discord&profile=${profile.profile_slug}`;
        const defaultUrl = `${frontendUrl}/viewer.html?userId=${userId}&mode=discord`;

        const embed = createSuccessEmbed(
            'Profile URL',
            `URL for profile "**${profile.profile_name}**":`,
            [
                { name: '🔗 Profile-Specific URL', value: `\`\`\`${profileUrl}\`\`\`\nThis URL always shows this specific profile`, inline: false },
                { name: '🔗 Default URL', value: `\`\`\`${defaultUrl}\`\`\`\nThis URL shows your active profile (changes when you switch)`, inline: false },
                { name: '⭐ Status', value: profile.is_active ? '✅ Active' : '⏸️ Inactive', inline: true },
                { name: '📺 OBS Setup', value: '**Width:** 1920\n**Height:** 1080\n**FPS:** 30', inline: true }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Profile URL failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Get URL',
            error.message || 'An error occurred while generating the URL.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleProfileDelete(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const profileName = interaction.options.getString('profile');
        const profileSlug = nameToSlug(profileName);

        const user = await db.users.findByDiscordId(userId);
        if (!user) {
            const embed = createErrorEmbed(
                'Profile Not Found',
                'You don\'t have any profiles to delete.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const profile = await db.profiles.findByUserAndSlug(user.id, profileSlug);
        if (!profile) {
            const embed = createErrorEmbed(
                'Profile Not Found',
                `Profile "**${profileName}**" doesn't exist.\n\nUse \`/profile list\` to see your profiles.`
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Check if it's the last profile
        const count = await db.profiles.count(user.id);
        if (count === 1) {
            const embed = createErrorEmbed(
                'Cannot Delete',
                'You cannot delete your only profile.\n\nCreate another profile first if you want to delete this one.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // If deleting active profile, activate another one
        if (profile.is_active) {
            const allProfiles = await db.profiles.findByUserId(user.id);
            const nextProfile = allProfiles.find(p => p.id !== profile.id);
            if (nextProfile) {
                await db.profiles.setActive(nextProfile.id, user.id);
            }
        }

        // Delete profile
        await db.profiles.delete(profile.id, user.id);

        // Log analytics
        await db.analytics.logEvent('profile_delete', user.id, { profile_name: profile.profile_name });

        logger.info(`Profile "${profile.profile_name}" deleted for user ${userId}`);

        const embed = createSuccessEmbed(
            'Profile Deleted',
            `Profile "**${profile.profile_name}**" has been permanently deleted.`,
            [
                { name: '📊 Remaining Profiles', value: `${count - 1}`, inline: true }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Profile delete failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Delete Profile',
            error.message || 'An error occurred while deleting the profile.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleProfileRename(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const oldName = interaction.options.getString('old');
        const newName = interaction.options.getString('new');
        const oldSlug = nameToSlug(oldName);
        const newSlug = nameToSlug(newName);

        const user = await db.users.findByDiscordId(userId);
        if (!user) {
            const embed = createErrorEmbed(
                'Profile Not Found',
                'You don\'t have any profiles to rename.'
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        const profile = await db.profiles.findByUserAndSlug(user.id, oldSlug);
        if (!profile) {
            const embed = createErrorEmbed(
                'Profile Not Found',
                `Profile "**${oldName}**" doesn't exist.\n\nUse \`/profile list\` to see your profiles.`
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Check if new name conflicts
        const existing = await db.profiles.findByUserAndSlug(user.id, newSlug);
        if (existing && existing.id !== profile.id) {
            const embed = createErrorEmbed(
                'Name Conflict',
                `You already have a profile named "**${existing.profile_name}**".\n\nChoose a different name.`
            );
            return await interaction.editReply({ embeds: [embed] });
        }

        // Rename
        await db.profiles.rename(profile.id, user.id, newName, newSlug);

        // Log analytics
        await db.analytics.logEvent('profile_rename', user.id, { old_name: oldName, new_name: newName });

        logger.info(`Profile renamed from "${oldName}" to "${newName}" for user ${userId}`);

        const frontendUrl = process.env.FRONTEND_URL || 'https://rattusking.github.io/echosprite';
        const newUrl = `${frontendUrl}/viewer.html?userId=${userId}&mode=discord&profile=${newSlug}`;

        const embed = createSuccessEmbed(
            'Profile Renamed',
            `Profile renamed from "**${oldName}**" to "**${newName}**"!`,
            [
                { name: '🆔 New Slug', value: `\`${newSlug}\``, inline: true },
                { name: '🔗 New URL', value: `\`\`\`${newUrl}\`\`\``, inline: false },
                { name: '⚠️ Important', value: 'If you were using the profile-specific URL in OBS, you\'ll need to update it!', inline: false }
            ]
        );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error(`Profile rename failed: ${error.message}`);

        const embed = createErrorEmbed(
            'Failed to Rename Profile',
            error.message || 'An error occurred while renaming the profile.'
        );

        await interaction.editReply({ embeds: [embed] });
    }
}

module.exports = {
    handleProfileCreate,
    handleProfileUpload,
    handleProfileList,
    handleProfileSwitch,
    handleProfileUrl,
    handleProfileDelete,
    handleProfileRename,
    nameToSlug
};
