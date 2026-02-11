const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const ora = require('ora');
const apiClient = require('../lib/api-client');
const configManager = require('../lib/config');
const templates = require('../lib/templates');
const { validateContactInfo, normalizeContactInfo } = require('../lib/validators');
const { selectDomains, confirmAction, selectTemplate } = require('../utils/prompts');
const { formatUpdateResult, formatJSON } = require('../lib/formatters');
const Logger = require('../utils/logger');

/**
 * Parse domains from file
 */
function parseDomainFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Try JSON format first
  if (filePath.endsWith('.json')) {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data.map((item) => (typeof item === 'string' ? item : item.domain || item.name)).filter(d => d);
      }
      return [];
    } catch (error) {
      throw new Error(`Invalid JSON format in ${filePath}`);
    }
  }

  // Otherwise, treat as plain text (one domain per line)
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function createBulkUpdateCommand(logger) {
  const bulkUpdate = new Command('bulk-update')
    .description('Bulk update multiple domains\' registrant contact')
    .option('-d, --domains <file>', 'File with domain list (plain text or JSON)')
    .option('-t, --template <name>', 'Template name (required)')
    .option('--dry-run', 'Show what would be changed without applying')
    .option('-j, --json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Check if configured
        if (!configManager.isConfigured()) {
          logger.error('Not configured. Run: cf-registrar config init');
          process.exit(1);
        }

        // Check template
        if (!options.template) {
          logger.error('Template is required. Use: --template <name>');
          process.exit(1);
        }

        // Load template
        let templateData;
        try {
          templateData = templates.loadTemplate(options.template);
          logger.success(`Using template "${options.template}"`);
        } catch (error) {
          logger.error(error.message);
          process.exit(1);
        }

        // Ask if user wants to update all contacts
        logger.blank();
        const { updateAll } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'updateAll',
            message: 'Update all contacts (registrant, admin, technical, billing)?',
            default: true
          }
        ]);

        // Create contact structure
        let contactInfo;
        if (updateAll) {
          contactInfo = {
            registrant: templateData,
            admin: templateData,
            technical: templateData,
            billing: templateData
          };
        } else {
          contactInfo = { registrant: templateData };
        }

        // Validate contact info
        let hasErrors = false;
        if (updateAll) {
          for (const [type, contact] of Object.entries(contactInfo)) {
            const errors = validateContactInfo(contact);
            if (errors) {
              logger.error(`Template validation failed for ${type}:`);
              errors.forEach((err) => logger.error(`  • ${err}`));
              hasErrors = true;
            }
          }
        } else {
          const errors = validateContactInfo(contactInfo.registrant);
          if (errors) {
            logger.error('Template validation failed:');
            errors.forEach((err) => logger.error(`  • ${err}`));
            hasErrors = true;
          }
        }

        if (hasErrors) {
          process.exit(1);
        }

        // Get domains
        let domainsToUpdate = [];

        if (options.domains) {
          // Load from file
          try {
            domainsToUpdate = parseDomainFile(options.domains);
            if (domainsToUpdate.length === 0) {
              logger.error('No domains found in file');
              process.exit(1);
            }
            logger.success(`Loaded ${domainsToUpdate.length} domain(s) from file`);
          } catch (error) {
            logger.error(error.message);
            process.exit(1);
          }
        } else {
          // Interactive selection from all domains
          logger.info('Fetching your domains...');
          const allDomains = await apiClient.listDomains();

          if (allDomains.length === 0) {
            logger.warn('No domains found');
            return;
          }

          const domainNames = allDomains.map((d) => d.name || d.domain);
          logger.blank();
          domainsToUpdate = await selectDomains(domainNames);
        }

        // Check for locked domains
        logger.blank();
        logger.info('Checking domain lock status...');
        const lockedDomains = [];
        const unlockedDomains = [];

        for (const domainName of domainsToUpdate) {
          try {
            const info = await apiClient.getDomainRegistrant(domainName);
            if (info.locked) {
              lockedDomains.push({
                domain: domainName,
                changes: info.material_changes || []
              });
            } else {
              unlockedDomains.push(domainName);
            }
          } catch (error) {
            logger.warn(`Could not check status for ${domainName}: ${error.message}`);
            unlockedDomains.push(domainName); // Proceed anyway if check fails
          }
        }

        // Warn if any domains are locked
        if (lockedDomains.length > 0) {
          logger.blank();
          logger.warn(`${lockedDomains.length} domain(s) are LOCKED with pending changes:`);
          lockedDomains.forEach(({ domain, changes }) => {
            logger.info(`  • ${domain}${changes.length > 0 ? ' (' + changes.join(', ') + ')' : ''}`);
          });

          logger.blank();
          logger.info('These domains are waiting for email verification.');
          logger.info('Updates will be queued but won\'t take effect until verified.');
          logger.blank();

          const { proceedWithLocked } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'proceedWithLocked',
              message: 'Proceed with update on locked domains?',
              default: false
            }
          ]);

          if (!proceedWithLocked) {
            logger.info('Cancelled. Please verify pending changes on locked domains first.');
            return;
          }
        }

        // Normalize contact info
        if (updateAll) {
          // Normalize each contact type
          for (const contactType of ['registrant', 'admin', 'technical', 'billing']) {
            contactInfo[contactType] = normalizeContactInfo(contactInfo[contactType]);
          }
        } else {
          contactInfo.registrant = normalizeContactInfo(contactInfo.registrant);
        }

        // Show summary
        logger.blank();
        logger.info('Bulk Update Summary:');
        logger.info('─'.repeat(50));
        logger.info(`Template: ${options.template}`);
        logger.info(`Domains to update: ${domainsToUpdate.length}`);
        logger.info(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`);

        // Confirm
        logger.blank();
        const message = options.dryRun
          ? 'Preview this bulk update (dry run)?'
          : 'Apply this bulk update?';
        const confirmed = await confirmAction(message);

        if (!confirmed) {
          logger.info('Cancelled');
          return;
        }

        // Process updates
        logger.blank();
        const results = [];
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < domainsToUpdate.length; i++) {
          const domain = domainsToUpdate[i];
          const progress = `[${i + 1}/${domainsToUpdate.length}]`;

          try {
            if (options.dryRun) {
              logger.info(`${progress} ${domain} (would be updated)`);
              results.push({
                domain,
                success: true,
                message: 'Would be updated'
              });
            } else {
              logger.info(`${progress} Updating ${domain}...`);
              await apiClient.updateDomainRegistrant(domain, contactInfo);
              logger.success(`${progress} ${domain} updated`);
              results.push({
                domain,
                success: true
              });
              successCount++;
            }
          } catch (error) {
            logger.warn(`${progress} ${domain} failed: ${error.message}`);
            results.push({
              domain,
              success: false,
              error: error.message
            });
            failureCount++;
          }

          // Rate limiting friendly - add small delay between requests
          if (i < domainsToUpdate.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // Summary
        logger.blank();
        if (options.json) {
          logger.json(results);
        } else {
          const summary = {
            successful: successCount,
            failed: failureCount,
            total: domainsToUpdate.length,
            dryRun: options.dryRun
          };
          logger.table(formatUpdateResult(results));
          logger.blank();
        }
      } catch (error) {
        logger.error(error.message);
        process.exit(1);
      }
    });

  return bulkUpdate;
}

module.exports = createBulkUpdateCommand;
