const { Command } = require('commander');
const ora = require('ora');
const apiClient = require('../lib/api-client');
const configManager = require('../lib/config');
const { formatDomainsTable, formatJSON } = require('../lib/formatters');
const Logger = require('../utils/logger');

function createListCommand(logger) {
  const list = new Command('list')
    .description('List all domains with registrant information')
    .option('-j, --json', 'Output as JSON')
    .option('-f, --filter <pattern>', 'Filter domains by name pattern')
    .action(async (options) => {
      try {
        // Check if configured
        if (!configManager.isConfigured()) {
          logger.error('Not configured. Run: cf-registrar config init');
          process.exit(1);
        }

        // Fetch domains
        const spinner = ora({
          text: 'Fetching domains...',
          spinner: 'dots'
        }).start();

        const domains = await apiClient.listDomains();
        spinner.succeed(`Found ${domains.length} domain(s)`);

        // Filter if pattern provided
        let filteredDomains = domains;
        if (options.filter) {
          const pattern = new RegExp(options.filter, 'i');
          filteredDomains = domains.filter((d) => pattern.test(d.name || d.domain));
          logger.info(`Filtered to ${filteredDomains.length} domain(s) matching pattern`);
        }

        if (filteredDomains.length === 0) {
          logger.warn('No domains found');
          return;
        }

        logger.blank();

        // Output
        if (options.json) {
          logger.json(filteredDomains);
        } else {
          logger.table(formatDomainsTable(filteredDomains));
        }

        logger.blank();
      } catch (error) {
        logger.error(error.message);
        process.exit(1);
      }
    });

  return list;
}

module.exports = createListCommand;
