#!/usr/bin/env node

const { Command } = require('commander');
const Logger = require('./utils/logger');
const { handleError } = require('./utils/errors');

// Import commands
const createLoginCommand = require('./commands/login');
const createConfigCommand = require('./commands/config');
const createCheckPermissionsCommand = require('./commands/check-permissions');
const createListCommand = require('./commands/list');
const createUpdateCommand = require('./commands/update');
const createBulkUpdateCommand = require('./commands/bulk-update');
const createTemplateCommand = require('./commands/template');
const createStatusCommand = require('./commands/status');

const program = new Command();

// Global options
program
  .name('cloudflare-registrar')
  .description('Cloudflare Domain Registrant Contact CLI Tool')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--no-color', 'Disable colored output')
  .option('-j, --json', 'Output as JSON');

// Create logger (we'll update it after parsing if needed)
let logger = new Logger(false, false);

// Add commands
program.addCommand(createLoginCommand(logger));
program.addCommand(createConfigCommand(logger));
program.addCommand(createCheckPermissionsCommand(logger));
program.addCommand(createListCommand(logger));
program.addCommand(createStatusCommand(logger));
program.addCommand(createUpdateCommand(logger));
program.addCommand(createBulkUpdateCommand(logger));
program.addCommand(createTemplateCommand(logger));

// Global error handler
process.on('unhandledRejection', (error) => {
  const exitCode = handleError(error, logger);
  process.exit(exitCode);
});

process.on('uncaughtException', (error) => {
  const exitCode = handleError(error, logger);
  process.exit(exitCode);
});

// Handle program errors
program.on('error', (error) => {
  const exitCode = handleError(error, logger);
  process.exit(exitCode);
});

// Show help if no arguments
if (process.argv.length < 3) {
  program.help();
}

// Parse and run
program.parse(process.argv);
