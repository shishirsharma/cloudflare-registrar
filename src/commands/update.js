const { Command } = require('commander');
const inquirer = require('inquirer');
const ora = require('ora');
const apiClient = require('../lib/api-client');
const configManager = require('../lib/config');
const templates = require('../lib/templates');
const { validateContactInfo, normalizeContactInfo } = require('../lib/validators');
const { promptForContactInfo, promptForAllContacts, selectTemplate, confirmAction } = require('../utils/prompts');
const { formatContactInfo, formatDifference, formatJSON } = require('../lib/formatters');
const Logger = require('../utils/logger');

function createUpdateCommand(logger) {
  const update = new Command('update')
    .arguments('<domain>')
    .description('Update a domain\'s registrant contact')
    .option('-t, --template <name>', 'Use a contact template')
    .option('-i, --interactive', 'Interactive mode (prefilled with current values)')
    .option('-j, --json', 'Output as JSON')
    .action(async (domain, options) => {
      try {
        // Check if configured
        if (!configManager.isConfigured()) {
          logger.error('Not configured. Run: cf-registrar config init');
          process.exit(1);
        }

        // Fetch current domain info
        logger.info(`Fetching current registrant info for ${domain}...`);
        const domainInfo = await apiClient.getDomainRegistrant(domain);

        // Check if domain is locked
        if (domainInfo.locked) {
          logger.blank();
          logger.warn('Domain is currently LOCKED with pending changes');
          logger.info('This means: A previous update is awaiting email verification');

          if (domainInfo.material_changes && domainInfo.material_changes.length > 0) {
            logger.info('Pending material changes: ' + domainInfo.material_changes.join(', '));
          }

          logger.blank();
          logger.info('To unlock the domain:');
          logger.info('1. Check your email for a verification message from Cloudflare');
          logger.info('2. Click the verification link to complete the pending changes');
          logger.info('3. Once verified, you can make new updates');
          logger.blank();

          const { continueAnyway } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'continueAnyway',
              message: 'Continue with new update anyway? (Not recommended)',
              default: false
            }
          ]);

          if (!continueAnyway) {
            logger.info('Cancelled. Please verify the pending changes first.');
            return;
          }
        }

        if (!domainInfo) {
          logger.error(`Domain ${domain} not found`);
          process.exit(1);
        }

        const currentRegistrant = domainInfo.registrant;

        // Ask if user wants to update all contacts or just registrant
        logger.blank();
        const { updateAll } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'updateAll',
            message: 'Update all contacts (registrant, admin, technical, billing)?',
            default: true
          }
        ]);

        // Get new contact info
        let newContactInfo;

        if (options.template) {
          // Use template
          try {
            const template = templates.loadTemplate(options.template);
            logger.success(`Using template "${options.template}"`);

            if (updateAll) {
              // Apply template to all contacts
              newContactInfo = {
                registrant: template,
                admin: template,
                technical: template,
                billing: template
              };
            } else {
              newContactInfo = { registrant: template };
            }
          } catch (error) {
            logger.error(error.message);
            process.exit(1);
          }
        } else if (options.interactive) {
          // Interactive mode with current values prefilled
          logger.blank();
          logger.info('Edit contact information (current values prefilled):');
          logger.blank();

          if (updateAll) {
            const { promptForAllContacts } = require('../utils/prompts');
            newContactInfo = await promptForAllContacts(currentRegistrant);
          } else {
            newContactInfo = { registrant: await promptForContactInfo(currentRegistrant) };
          }
        } else {
          // Interactive mode by default
          logger.blank();
          logger.info('Enter new contact information:');
          logger.blank();

          if (updateAll) {
            const { promptForAllContacts } = require('../utils/prompts');
            newContactInfo = await promptForAllContacts();
          } else {
            newContactInfo = { registrant: await promptForContactInfo() };
          }
        }

        // Normalize
        newContactInfo = normalizeContactInfo(newContactInfo);

        // Validate
        const errors = validateContactInfo(newContactInfo);
        if (errors) {
          logger.error('Validation errors:');
          errors.forEach((err) => logger.error(`  • ${err}`));
          process.exit(1);
        }

        // Show difference
        logger.blank();
        logger.info(formatDifference(currentRegistrant, newContactInfo));

        // Confirm
        logger.blank();
        const confirmed = await confirmAction('Apply these changes?');

        if (!confirmed) {
          logger.info('Cancelled');
          return;
        }

        // Update domain
        const spinner = ora({
          text: `Updating ${domain}...`,
          spinner: 'dots'
        }).start();

        try {
          const result = await apiClient.updateDomainRegistrant(domain, newContactInfo);
          spinner.succeed(`Domain ${domain} updated successfully`);

          logger.blank();

          if (options.json) {
            logger.json(result);
          } else {
            logger.success('Registrant contact updated successfully');
            logger.blank();
            logger.info(formatContactInfo(result.registrant || newContactInfo));
          }

          logger.blank();
        } catch (error) {
          spinner.fail(error.message);
          process.exit(1);
        }
      } catch (error) {
        logger.error(error.message);
        process.exit(1);
      }
    });

  return update;
}

module.exports = createUpdateCommand;
