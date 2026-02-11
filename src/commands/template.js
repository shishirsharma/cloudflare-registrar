const { Command } = require('commander');
const templates = require('../lib/templates');
const { promptForContactInfo, promptForTemplateName, confirmAction } = require('../utils/prompts');
const { formatContactInfo, formatTemplatesTable } = require('../lib/formatters');
const Logger = require('../utils/logger');

function createTemplateCommand(logger) {
  const template = new Command('template')
    .description('Manage contact templates')
    .addCommand(
      new Command('save')
        .description('Save a new contact template')
        .action(async () => {
          try {
            const existingNames = templates.getTemplateNames();

            // Get template name
            logger.blank();
            logger.info('Creating new template...');
            const name = await promptForTemplateName(existingNames);

            // Get contact info
            logger.blank();
            logger.info('Enter contact information:');
            const contactInfo = await promptForContactInfo();

            // Show preview
            logger.blank();
            logger.info(formatContactInfo(contactInfo));

            // Confirm
            logger.blank();
            const confirmed = await confirmAction('Save this template?');

            if (!confirmed) {
              logger.info('Cancelled');
              return;
            }

            templates.saveTemplate(name, contactInfo);
            logger.success(`Template "${name}" saved`);
          } catch (error) {
            logger.error(error.message);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('list')
        .description('List all saved templates')
        .action(() => {
          try {
            const templateList = templates.listTemplates();

            if (templateList.length === 0) {
              logger.warn('No templates saved');
              logger.info('Create a template with: cloudflare-registrar template save');
              return;
            }

            logger.blank();
            logger.table(formatTemplatesTable(templateList));
            logger.blank();
          } catch (error) {
            logger.error(error.message);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('load <name>')
        .description('Display a template')
        .action((name) => {
          try {
            const contactInfo = templates.loadTemplate(name);
            logger.blank();
            logger.info(formatContactInfo(contactInfo));
            logger.blank();
          } catch (error) {
            logger.error(error.message);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('delete <name>')
        .description('Delete a template')
        .action(async (name) => {
          try {
            const confirmed = await confirmAction(
              `Delete template "${name}"? This cannot be undone.`
            );

            if (!confirmed) {
              logger.info('Cancelled');
              return;
            }

            templates.deleteTemplate(name);
            logger.success(`Template "${name}" deleted`);
          } catch (error) {
            logger.error(error.message);
            process.exit(1);
          }
        })
    );

  return template;
}

module.exports = createTemplateCommand;
