const { Command } = require('commander');
const apiClient = require('../lib/api-client');
const configManager = require('../lib/config');

function createStatusCommand(logger) {
  const status = new Command('status')
    .arguments('<domain>')
    .description('Check domain registration status and pending changes')
    .action(async (domain, options) => {
      try {
        if (!configManager.isConfigured()) {
          logger.error('Not configured. Run: cloudflare-registrar login');
          process.exit(1);
        }

        logger.info(`Checking status for ${domain}...`);
        const domainInfo = await apiClient.getDomainRegistrant(domain);

        if (!domainInfo) {
          logger.error(`Domain ${domain} not found`);
          process.exit(1);
        }

        logger.blank();
        logger.info('Domain Status');
        logger.log('──────────────────────────────────────────────────');
        logger.log(`  Domain:    ${domainInfo.name}`);
        logger.log(`  Registrar: ${domainInfo.current_registrar}`);
        logger.log(`  Status:    ${domainInfo.last_known_status}`);
        logger.log(`  Expires:   ${domainInfo.expires_at ? domainInfo.expires_at.split('T')[0] : 'N/A'}`);
        logger.log(`  Privacy:   ${domainInfo.privacy ? 'Enabled' : 'Disabled'}`);

        // Lock status
        logger.blank();
        if (domainInfo.locked) {
          logger.warn('Domain is LOCKED — pending verification of material changes');

          if (domainInfo.material_changes && domainInfo.material_changes.length > 0) {
            logger.blank();
            logger.info('Pending material changes');
            domainInfo.material_changes.forEach(change => {
              logger.log(`  - ${change}`);
            });
          }

          logger.blank();
          logger.info('Action Required');
          logger.log('  1. Check your email for a verification message from Cloudflare');
          logger.log('  2. Look in spam/junk folder if not found in inbox');
          logger.log('  3. Click the verification link to complete the changes');
          logger.log('  4. The domain will be unlocked automatically once verified');
        } else {
          logger.success('Domain is unlocked and ready for updates');
        }

        // Current contacts
        logger.blank();
        logger.info('Current Contacts');
        logger.log('──────────────────────────────────────────────────');

        const contactTypes = [
          ['registrant_contact', 'Registrant (Domain Owner)'],
          ['administrator_contact', 'Administrator'],
          ['technical_contact', 'Technical'],
          ['billing_contact', 'Billing']
        ];

        for (const [contactType, label] of contactTypes) {
          const contact = domainInfo[contactType];
          if (contact) {
            logger.blank();
            logger.log(`  ${label}:`);
            logger.log(`    Name:    ${contact.first_name} ${contact.last_name}`);
            logger.log(`    Email:   ${contact.email}`);
            logger.log(`    Phone:   ${contact.phone}`);
            logger.log(`    Address: ${contact.address}${contact.address2 ? ', ' + contact.address2 : ''}`);
            logger.log(`    City:    ${contact.city}, ${contact.state || ''} ${contact.zip}`);
            logger.log(`    Country: ${contact.country}`);

            if (contact.material_changes && contact.material_changes.length > 0) {
              logger.log(`    Pending: ${contact.material_changes.join(', ')}`);
            }
          }
        }

        logger.blank();

      } catch (error) {
        logger.error(error.message);
        process.exit(1);
      }
    });

  return status;
}

module.exports = createStatusCommand;
