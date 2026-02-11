const { Command } = require('commander');
const Logger = require('../utils/logger');

function createCheckPermissionsCommand(logger) {
  const check = new Command('check-permissions')
    .description('Guide to check what permissions are available in your Cloudflare account')
    .action(() => {
      try {
        logger.blank();
        logger.info('Checking Available Cloudflare Permissions');
        logger.info('═'.repeat(70));
        logger.blank();

        logger.info('To see what permissions are ACTUALLY available on your account:');
        logger.info('');
        logger.info('1. Go to: https://dash.cloudflare.com/profile/api-tokens');
        logger.info('');
        logger.info('2. Click the blue "Create Token" button');
        logger.info('');
        logger.info('3. You\'ll see a form with "Permissions" section');
        logger.info('');
        logger.info('4. Look at the first dropdown - it shows your available categories:');
        logger.info('   (These vary by Cloudflare plan!)');
        logger.info('   ');
        logger.info('   Common categories include:');
        logger.info('   • Account');
        logger.info('   • Zone');
        logger.info('   • Domain (on some plans)');
        logger.info('   • User');
        logger.info('   • Cache Rules');
        logger.info('');
        logger.info('5. Click on "Zone" (or "Domain" if that\'s what you have)');
        logger.info('');
        logger.info('6. Look at the second dropdown - THIS shows what\'s available:');
        logger.info('   ');
        logger.info('   Common Zone/Domain sub-options:');
        logger.info('   • Zone (root level)');
        logger.info('   • Zone Settings');
        logger.info('   • DNS');
        logger.info('   • Registrar (IF YOUR PLAN HAS IT)');
        logger.info('   • Page Rules');
        logger.info('   • etc.');
        logger.info('');
        logger.info('⚠️  KEY POINT:');
        logger.info('   Not all plans have all permissions!');
        logger.info('   If you don\'t see "Registrar", your plan might not');
        logger.info('   support domain registrant management via API.');
        logger.info('');
        logger.info('📋 FOR cloudflare-registrar TO WORK:');
        logger.info('   ');
        logger.info('   You need at least ONE of these:');
        logger.info('   ✓ Zone → Registrar (if available)');
        logger.info('   ✓ Zone → Zone Settings');
        logger.info('   ✓ Zone → Zone (root level)');
        logger.info('     Set to "Edit" permission');
        logger.info('');
        logger.info('❓ DON\'T SEE ANY ZONE OPTIONS?');
        logger.info('   ');
        logger.info('   1. Check your Cloudflare plan includes domain registration');
        logger.info('   2. Check if you need Account-level permissions instead');
        logger.info('   3. Contact Cloudflare support for your plan\'s API capabilities');
        logger.info('');
        logger.info('📖 TO VERIFY YOU HAVE THE RIGHT TOKEN:');
        logger.info('   ');
        logger.info('   1. Create a token with the permission(s) you found');
        logger.info('   2. Run: cloudflare-registrar login');
        logger.info('   3. Paste the token');
        logger.info('   4. The tool will validate it works');
        logger.info('');
        logger.info('═'.repeat(70));
        logger.blank();
      } catch (error) {
        logger.error(error.message);
        process.exit(1);
      }
    });

  return check;
}

module.exports = createCheckPermissionsCommand;
