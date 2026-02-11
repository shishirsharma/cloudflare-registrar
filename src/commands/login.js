const { Command } = require('commander');
const inquirer = require('inquirer');
const open = require('open');
const configManager = require('../lib/config');
const apiClient = require('../lib/api-client');
const Logger = require('../utils/logger');
const { AuthenticationError } = require('../utils/errors');

const CLOUDFLARE_ACCOUNT_URL = 'https://dash.cloudflare.com/profile/api-tokens';

function createLoginCommand(logger) {
  const login = new Command('login')
    .alias('auth')
    .description('Authenticate with Cloudflare using Global API Key')
    .action(async () => {
      try {
        logger.blank();
        logger.info('Cloudflare Global API Key Setup');
        logger.info('═'.repeat(70));
        logger.blank();

        logger.info('📌 IMPORTANT: This tool uses Cloudflare\'s Global API Key');
        logger.info('   (NOT API Tokens - they don\'t work with Registrar API)');
        logger.info('');
        logger.info('STEP-BY-STEP GUIDE:');
        logger.info('');
        logger.info('1️⃣  GET YOUR CLOUDFLARE EMAIL');
        logger.info('   This is the email address you use to log in to Cloudflare');
        logger.info('');
        logger.info('2️⃣  FIND YOUR GLOBAL API KEY');
        logger.info('   Go to: https://dash.cloudflare.com/profile/api-tokens');
        logger.info('');
        logger.info('3️⃣  SCROLL DOWN to "API Keys" section');
        logger.info('   You\'ll see:');
        logger.info('   • Email address (read-only)');
        logger.info('   • Global API Key (with "View" button)');
        logger.info('');
        logger.info('4️⃣  CLICK "View" next to Global API Key');
        logger.info('   Your API key will be revealed');
        logger.info('   ⚠️  KEEP THIS SECRET - it\'s like a password!');
        logger.info('');
        logger.info('5️⃣  COPY YOUR GLOBAL API KEY');
        logger.info('   It\'s a long string of characters');
        logger.info('');
        logger.info('═'.repeat(70));
        logger.blank();

        // Ask if user wants to open browser
        const openBrowser = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'open',
            message: 'Open Cloudflare dashboard in browser?',
            default: true
          }
        ]);

        if (openBrowser.open) {
          logger.info('Opening Cloudflare dashboard...');
          try {
            await open(CLOUDFLARE_ACCOUNT_URL);
          } catch (error) {
            logger.warn('Could not open browser automatically');
            logger.info(`Visit: ${CLOUDFLARE_ACCOUNT_URL}`);
          }
        }

        logger.blank();

        // Get email and API key from user
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: 'Enter your Cloudflare email address:',
            validate: (input) => {
              if (!input || input.trim().length === 0) {
                return 'Email cannot be empty';
              }
              if (!input.includes('@')) {
                return 'Please enter a valid email address';
              }
              return true;
            }
          },
          {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your Global API Key:',
            mask: '*',
            validate: (input) => {
              if (!input || input.trim().length === 0) {
                return 'Global API Key cannot be empty';
              }
              if (input.trim().length < 30) {
                return 'Global API Key seems too short. Check if you copied it correctly.';
              }
              return true;
            }
          }
        ]);

        const email = answers.email.trim();
        const apiKey = answers.apiKey.trim();

        // Test the credentials
        logger.blank();
        logger.info('Validating credentials...');

        try {
          // Temporarily set credentials for testing
          configManager.setEmail(email);
          configManager.setApiKey(apiKey);

          // Try to get account ID
          const accountId = await apiClient.getAccountId();

          logger.success('✓ Authentication successful!');
          logger.blank();

          // Save configuration
          configManager.setAccountId(accountId);
          logger.success('Configuration saved!');
          logger.info('Location: ~/.cloudflare/config.json');
          logger.info('Permissions: Owner read/write only (0600)');
          logger.blank();

          logger.info('═'.repeat(70));
          logger.info('🎉 You are now authenticated!');
          logger.info('═'.repeat(70));
          logger.blank();

          logger.info('📝 What you can do next:');
          logger.info('');
          logger.info('  List all your domains:');
          logger.info('    $ cloudflare-registrar list');
          logger.info('');
          logger.info('  View a domain\'s registrant info:');
          logger.info('    $ cloudflare-registrar list --filter example.com');
          logger.info('');
          logger.info('  Create a contact template (save time on updates):');
          logger.info('    $ cloudflare-registrar template save personal');
          logger.info('');
          logger.info('  Update a domain registrant:');
          logger.info('    $ cloudflare-registrar update example.com --template personal');
          logger.info('');
          logger.info('  Bulk update multiple domains:');
          logger.info('    $ cloudflare-registrar bulk-update --domains domains.txt --template personal');
          logger.info('');
          logger.info('Get help anytime:');
          logger.info('  $ cloudflare-registrar --help');
          logger.info('  $ cloudflare-registrar <command> --help');
          logger.info('');
          logger.info('═'.repeat(70));
          logger.blank();
        } catch (error) {
          if (error instanceof AuthenticationError) {
            logger.blank();
            logger.error('❌ Authentication failed!');
            logger.blank();
            logger.info('This usually means:');
            logger.info('');
            logger.info('1. ❌ Global API Key was not fully copied');
            logger.info('   → Make sure you copied the ENTIRE key');
            logger.info('');
            logger.info('2. ❌ Email or API Key is incorrect');
            logger.info('   → Double-check both are correct');
            logger.info('   → Email is case-sensitive');
            logger.info('');
            logger.info('3. ❌ Global API Key is revoked or invalid');
            logger.info('   → Go to Cloudflare dashboard');
            logger.info('   → Check the API key is still valid');
            logger.info('   → Try viewing it again');
            logger.info('');
            logger.info('NEXT STEPS:');
            logger.info('');
            logger.info('Option A: Try again');
            logger.info('  $ cloudflare-registrar login');
            logger.info('');
            logger.info('Option B: Use manual setup');
            logger.info('  $ cloudflare-registrar config init');
            logger.info('');
            logger.info('Need more help?');
            logger.info('  Visit: https://dash.cloudflare.com/profile/api-tokens');
            logger.info('  Look for the "API Keys" section (not "API Tokens")');
            logger.blank();

            // Clear failed credentials
            configManager.resetConfig();
            process.exit(1);
          }
          throw error;
        }
      } catch (error) {
        logger.error(error.message);
        process.exit(1);
      }
    });

  return login;
}

module.exports = createLoginCommand;
