#!/usr/bin/env node

/**
 * EchoSprite Startup Script
 *
 * This script runs automatically on Render deployment.
 * It performs necessary setup steps before starting the server:
 * 1. Database migrations
 * 2. Discord command registration
 * 3. Server startup
 */

const { spawn } = require('child_process');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        log(`\n${'='.repeat(60)}`, 'blue');
        log(`Running: ${command} ${args.join(' ')}`, 'blue');
        log('='.repeat(60), 'blue');

        const proc = spawn(command, args, {
            stdio: 'inherit',
            cwd: __dirname,
            shell: true
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`${command} exited with code ${code}`));
            } else {
                log(`✅ ${command} completed successfully`, 'green');
                resolve();
            }
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

async function startup() {
    try {
        log('\n🚀 EchoSprite Startup Sequence Initiated', 'yellow');
        log('='.repeat(60), 'yellow');

        // Step 1: Run database migrations
        log('\n📊 Step 1/3: Running database migrations...', 'yellow');
        await runCommand('node', ['migrations/run.js']);

        // Step 2: Register Discord commands
        log('\n🎮 Step 2/3: Registering Discord slash commands...', 'yellow');
        await runCommand('node', ['register-commands.js']);

        // Step 3: Start the server
        log('\n🌐 Step 3/3: Starting server...', 'yellow');
        log('\n' + '='.repeat(60), 'green');
        log('✅ EchoSprite is ready!', 'green');
        log('='.repeat(60) + '\n', 'green');

        // Start server (this keeps running)
        const server = spawn('node', ['server.js'], {
            stdio: 'inherit',
            cwd: __dirname
        });

        server.on('error', (err) => {
            log(`❌ Server error: ${err.message}`, 'red');
            process.exit(1);
        });

        server.on('close', (code) => {
            if (code !== 0) {
                log(`❌ Server exited with code ${code}`, 'red');
                process.exit(code);
            }
        });

    } catch (error) {
        log(`\n❌ Startup failed: ${error.message}`, 'red');
        log('\nThis is usually caused by:', 'yellow');
        log('  • Missing environment variables', 'yellow');
        log('  • Database connection issues', 'yellow');
        log('  • Invalid Discord credentials', 'yellow');
        log('\nCheck your Render logs for more details.', 'yellow');
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    log('\n👋 Received SIGTERM, shutting down gracefully...', 'yellow');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('\n👋 Received SIGINT, shutting down gracefully...', 'yellow');
    process.exit(0);
});

// Run startup
startup();
