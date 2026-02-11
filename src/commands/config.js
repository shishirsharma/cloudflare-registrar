const { Command } = require('commander');
const configManager = require('../lib/config');
const Logger = require('../utils/logger');

function createConfigCommand(logger) {
  const config = new Command('config')
    .description('Manage Cloudflare authentication configuration')
    .addCommand(
      new Command('show')
        .description('Show current configuration')
        .action(() => {
          try {
            const config = configManager.getConfig();
            logger.blank();
            logger.info('Current Configuration:');
            logger.info('─'.repeat(40));

            if (config.email) {
              logger.info(`Email: ${config.email}`);
            } else {
              logger.warn('No email configured');
            }

            if (config.apiKey) {
              const masked = '*'.repeat(Math.max(0, config.apiKey.length - 8)) + config.apiKey.slice(-8);
              logger.info(`Global API Key: ${masked}`);
            } else {
              logger.warn('No Global API Key configured');
            }

            if (config.accountId) {
              logger.info(`Account ID: ${config.accountId}`);
            }

            if (config.createdAt) {
              logger.info(`Created: ${new Date(config.createdAt).toLocaleString()}`);
            }

            if (config.updatedAt) {
              logger.info(`Updated: ${new Date(config.updatedAt).toLocaleString()}`);
            }

            logger.blank();
          } catch (error) {
            logger.error(error.message);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('reset')
        .description('Reset configuration')
        .action(async () => {
          try {
            const { confirmAction } = require('../utils/prompts');
            const confirmed = await confirmAction(
              'Are you sure you want to reset configuration? This cannot be undone.'
            );

            if (!confirmed) {
              logger.info('Reset cancelled');
              return;
            }

            configManager.resetConfig();
            logger.success('Configuration reset');
            logger.info('Run "cloudflare-registrar login" to set up again');
          } catch (error) {
            logger.error(error.message);
            process.exit(1);
          }
        })
    );

  return config;
}

module.exports = createConfigCommand;
