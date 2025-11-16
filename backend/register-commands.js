// ========================================
// Discord Slash Command Registration Script
// Run this once to register slash commands with Discord
// ========================================

const { REST, Routes } = require('discord.js');
const commands = require('./discord-commands');
require('dotenv').config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
    console.error('❌ Missing required environment variables:');
    console.error('   - DISCORD_BOT_TOKEN');
    console.error('   - DISCORD_CLIENT_ID');
    console.error('\nPlease set these in your .env file or Render environment variables.');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

async function registerCommands() {
    try {
        console.log('🚀 Started registering slash commands...');
        console.log(`📋 Registering ${commands.length} commands:\n`);

        commands.forEach(cmd => {
            console.log(`   - /${cmd.name} - ${cmd.description}`);
        });

        console.log('\n⏳ Sending to Discord API...');

        // Register commands globally
        const data = await rest.put(
            Routes.applicationCommands(DISCORD_CLIENT_ID),
            { body: commands.map(cmd => cmd.toJSON()) }
        );

        console.log(`\n✅ Successfully registered ${data.length} slash commands!`);
        console.log('\n💡 Commands are now available in all servers where your bot is present.');
        console.log('💡 It may take up to 1 hour for commands to appear globally.');
        console.log('💡 To use commands immediately, invite your bot to a server.\n');

        console.log('🎉 Registration complete!\n');

    } catch (error) {
        console.error('❌ Failed to register commands:');
        console.error(error);
        process.exit(1);
    }
}

// For guild-specific registration (faster, but only works in that guild)
async function registerGuildCommands(guildId) {
    try {
        console.log(`🚀 Started registering slash commands for guild ${guildId}...`);
        console.log(`📋 Registering ${commands.length} commands:\n`);

        commands.forEach(cmd => {
            console.log(`   - /${cmd.name} - ${cmd.description}`);
        });

        console.log('\n⏳ Sending to Discord API...');

        const data = await rest.put(
            Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId),
            { body: commands.map(cmd => cmd.toJSON()) }
        );

        console.log(`\n✅ Successfully registered ${data.length} slash commands for guild!`);
        console.log('💡 Commands are immediately available in this guild.\n');

        console.log('🎉 Registration complete!\n');

    } catch (error) {
        console.error('❌ Failed to register commands:');
        console.error(error);
        process.exit(1);
    }
}

// Delete all commands (useful for testing)
async function deleteAllCommands() {
    try {
        console.log('🗑️  Deleting all global slash commands...');

        await rest.put(
            Routes.applicationCommands(DISCORD_CLIENT_ID),
            { body: [] }
        );

        console.log('✅ All global commands deleted!\n');

    } catch (error) {
        console.error('❌ Failed to delete commands:');
        console.error(error);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const guildId = args[1];

if (command === 'delete') {
    deleteAllCommands();
} else if (command === 'guild' && guildId) {
    registerGuildCommands(guildId);
} else if (command === 'global' || !command) {
    registerCommands();
} else {
    console.log('Usage:');
    console.log('  npm run register-commands           # Register globally (recommended)');
    console.log('  npm run register-commands global    # Register globally');
    console.log('  npm run register-commands guild <guild_id>  # Register to specific server (instant)');
    console.log('  npm run register-commands delete    # Delete all commands');
    console.log('\nExample:');
    console.log('  npm run register-commands guild 123456789012345678');
}
