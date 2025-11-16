// ========================================
// Discord Slash Command Definitions
// ========================================

const { SlashCommandBuilder } = require('discord.js');

const commands = [
    // ========================================
    // /avatar upload - Upload avatar images
    // ========================================
    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Manage your EchoSprite avatar')
        .addSubcommand(subcommand =>
            subcommand
                .setName('upload')
                .setDescription('Upload your avatar images')
                .addAttachmentOption(option =>
                    option
                        .setName('idle')
                        .setDescription('Idle state image (required)')
                        .setRequired(true)
                )
                .addAttachmentOption(option =>
                    option
                        .setName('talking')
                        .setDescription('Talking state image (required)')
                        .setRequired(true)
                )
                .addAttachmentOption(option =>
                    option
                        .setName('muted')
                        .setDescription('Muted state image (optional)')
                        .setRequired(false)
                )
                .addAttachmentOption(option =>
                    option
                        .setName('deafened')
                        .setDescription('Deafened state image (optional)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your current avatar configuration')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('url')
                .setDescription('Get your OBS browser source URLs')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete your avatar configuration')
        ),

    // ========================================
    // /channel - Voice channel commands
    // ========================================
    new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Manage voice channel group viewing')
        .addSubcommand(subcommand =>
            subcommand
                .setName('url')
                .setDescription('Get group viewer URL for your current voice channel')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('preview')
                .setDescription('Preview all avatars in your current voice channel')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('members')
                .setDescription('List all members in your current voice channel')
        ),

    // ========================================
    // /settings - Configure avatar settings
    // ========================================
    new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure your avatar settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your current settings')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bounce')
                .setDescription('Toggle bounce animation')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable or disable bounce')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('fade')
                .setDescription('Toggle fade effect')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable or disable fade')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('spacing')
                .setDescription('Set avatar spacing in group view')
                .addIntegerOption(option =>
                    option
                        .setName('value')
                        .setDescription('Spacing value (0-100)')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(100)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('show-names')
                .setDescription('Toggle username display')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Show or hide usernames')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('include-self')
                .setDescription('Include yourself in group view')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Include or exclude yourself')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('dim-inactive')
                .setDescription('Dim inactive avatars')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable or disable dimming')
                        .setRequired(true)
                )
        ),

    // ========================================
    // /help - Get help with EchoSprite
    // ========================================
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with EchoSprite commands'),

    // ========================================
    // /status - Check bot and service status
    // ========================================
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check EchoSprite bot and service status'),
];

module.exports = commands;
