# Login Command Guide - Detailed Cloudflare UI Walkthrough

## What You'll See When You Run `cloudflare-registrar login`

When you execute the login command, you'll see a detailed step-by-step guide:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║  Cloudflare API Token Setup                                             ║
║  ══════════════════════════════════════════════════════════════════     ║
║                                                                          ║
║  STEP-BY-STEP GUIDE TO CREATE YOUR API TOKEN:                           ║
║                                                                          ║
║  1️⃣  OPEN CLOUDFLARE DASHBOARD                                          ║
║     Go to: https://dash.cloudflare.com/profile/api-tokens               ║
║                                                                          ║
║  2️⃣  CREATE NEW TOKEN                                                    ║
║     • Look for the blue "Create Token" button (top right area)           ║
║     • Click it                                                          ║
║                                                                          ║
║  3️⃣  CHOOSE TEMPLATE (EASIEST WAY)                                       ║
║     You'll see a list of templates:                                     ║
║     • Find "Edit domain registrar" template                             ║
║     • Click "Use template" on that card                                 ║
║     • This automatically sets the correct permissions!                  ║
║                                                                          ║
║  4️⃣  IF YOU PREFER CUSTOM SETUP                                          ║
║     OR if "Edit domain registrar" template isn't available:             ║
║                                                                          ║
║     a) Create custom token with "Create Token" button                   ║
║     b) Set token name (e.g., "cloudflare-registrar")                            ║
║     c) Under PERMISSIONS section, click "Add more"                      ║
║     d) Add TWO permissions:                                             ║
║                                                                          ║
║        Permission #1:                                                   ║
║        - Dropdown: "Account"                                            ║
║        - Sub-dropdown: "Account Settings"                               ║
║        - Permission: "Read"                                             ║
║                                                                          ║
║        Permission #2:                                                   ║
║        - Dropdown: "Zone" (or "Domain")                                 ║
║        - Sub-dropdown: "Registrar"                                      ║
║        - Permission: "Edit"                                             ║
║                                                                          ║
║  5️⃣  FINISH & COPY TOKEN                                                 ║
║     • Click "Continue to summary" button                                ║
║     • Review the token (optional)                                       ║
║     • Click "Create Token"                                              ║
║     • ⚠️  IMPORTANT: You'll only see the token ONCE!                     ║
║     • Copy the long token string (starts with "v1.0x...")               ║
║                                                                          ║
║  6️⃣  PASTE TOKEN HERE                                                    ║
║     • Return to this terminal                                           ║
║     • Paste the token when prompted below                               ║
║                                                                          ║
║  ══════════════════════════════════════════════════════════════════     ║
║                                                                          ║
║  Open Cloudflare dashboard in browser? (Y/n) _                          ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Screenshots of Cloudflare UI Steps

### Step 1: Go to API Tokens Page

**URL:** `https://dash.cloudflare.com/profile/api-tokens`

You should see:
- Your profile dropdown menu on top right
- "API Tokens" section
- A blue "Create Token" button

### Step 2: Click "Create Token"

You'll see the token creation interface with:
- A text field for "Token name"
- A "Permissions" section
- "Create Token" and "Cancel" buttons

### Step 3: Add Permissions

**Set Token Name** (top of form)
- Example: `cloudflare-registrar`

**Add Zone Edit Permission** (required):

The exact permission structure varies by Cloudflare plan. Try this:

```
Category:    Zone (or "Domain")
Sub-option:  Zone (or "Zone Settings")
Permission:  Edit

[+ Add permission]
```

**Alternative options if above doesn't work:**

If you don't see "Zone", try:
- Account → any Account option → Read
- Zone → Zone Settings → Edit
- Any Zone-level Edit access

The key requirement is **Zone-level Edit access** for managing domain registrants.

**Location of dropdowns in Cloudflare UI:**
- First dropdown = Category (Account, Zone, Domain, etc.)
- Second dropdown = Sub-option (Zone, Zone Settings, etc.)
- Right side = Permission level (Read, Edit, etc.)

### Step 4: Review and Create

1. Click "Continue to summary" button
2. Review page shows your token's permissions
3. Click the blue "Create Token" button
4. **IMPORTANT:** The token only appears ONCE - copy it immediately!

### Step 5: Copy the Token

The page shows your new token:
```
Your API token:
v1.0x_abc123def456...xyz789_very_long_token_string_do_not_share

[Copy to clipboard]
```

**Copy the entire token** (usually 200+ characters)

### Step 6: Paste in Terminal

Return to your terminal and paste when prompted:

```
? Paste your Cloudflare API Token: ••••••••••••••••••••••••••••••••••
```

Press Enter. The tool validates the token and saves it!

## Common Issues & Solutions

### ❌ "Token validation failed"

**Problem:** The token was rejected.

**Causes & Fixes:**

1. **Incomplete token copy**
   - You may have missed the beginning or end
   - Go back to Cloudflare, create a NEW token
   - Be very careful to copy the ENTIRE string
   - Paste it completely in the terminal

2. **Wrong permissions**
   - Check Cloudflare dashboard → API Tokens section
   - Find your token in the list
   - Click on it to view details
   - Verify it has these TWO permissions:
     - ✓ Account level Read access
     - ✓ Zone/Domain Registrar Edit access
   - If missing or wrong:
     - Delete the token (click trash icon)
     - Create a new one with correct permissions
     - When creating: add both permissions as described above

3. **Token expired**
   - Go to Cloudflare → API Tokens
   - Check the token's expiration date
   - If expired, create a fresh token with longer expiration
   - Use the "Edit domain registrar" template for easy setup

4. **Copy/paste corruption**
   - Some terminals modify pasted text
   - Try manually pasting character by character
   - Or use: `cat | cloudflare-registrar login`

### ❌ Can't find "Create Token" button

**Solution:**
1. Make sure you're logged in to Cloudflare
2. Go to: https://dash.cloudflare.com/profile/api-tokens
3. The blue button should be in the top right area
4. If you see "API Keys" section, scroll down or look for "API Tokens" tab

### ❌ Can't find "Registrar" or expected permission options

**Solution:**
Permission options vary significantly by Cloudflare account plan.

**What to do:**
1. Focus on finding **Zone-level Edit** access
2. In the Category dropdown, look for:
   - "Zone" (most common)
   - "Domain" (some plans)
   - Other top-level categories

3. In the Sub-option dropdown, look for:
   - "Zone" (root level access)
   - "Zone Settings"
   - "DNS" (some plans)
   - Just pick whatever gives Zone edit access

4. Set Permission to "Edit"

5. Add this permission and test with `cloudflare-registrar login`

**If you still can't find suitable permissions:**
1. Check your Cloudflare plan - does it support domain registrations?
2. Visit: https://support.cloudflare.com/hc/en-us/articles
3. Search for "API token permissions"
4. Contact Cloudflare support - they can tell you exact permissions for your plan

**Minimum required:**
- Zone-level Edit access (for managing registrant info)

### ❌ Lost the token after creating it

**Problem:** Cloudflare only shows the token ONCE.

**Solution:**
1. Go back to Cloudflare dashboard
2. Find the token in your list
3. Click the **delete** icon (trash can)
4. Create a NEW token
5. Use the correct template or permissions
6. Copy it immediately when it appears
7. Come back to `cloudflare-registrar login`

## After Successful Login

Once authenticated, you'll see:

```
✓ Token is valid!

Configuration saved!
Location: ~/.cloudflare/config.json
Permissions: Owner read/write only (0600)

╚════════════════════════════════════════════════════════════════════════╝
🎉 You are now authenticated!
╚════════════════════════════════════════════════════════════════════════╝

📝 What you can do next:

  List all your domains:
    $ cloudflare-registrar list

  View a domain's registrant info:
    $ cloudflare-registrar list --filter example.com

  Create a contact template (save time on updates):
    $ cloudflare-registrar template save personal

  Update a domain registrant:
    $ cloudflare-registrar update example.com --template personal

  Bulk update multiple domains:
    $ cloudflare-registrar bulk-update --domains domains.txt --template personal

Get help anytime:
  $ cloudflare-registrar --help
  $ cloudflare-registrar <command> --help

╚════════════════════════════════════════════════════════════════════════╝
```

## Quick Reference: Permissions

Your token needs **Zone-level Edit** access for domain registrant management.

**Exact permissions vary by Cloudflare plan**, but typically:

| Category | Sub-Category | Permission | Status |
|----------|--------------|-----------|--------|
| Zone | Zone / Zone Settings | Edit | ✓ Required |
| Account | (any account option) | Read | Optional |

**What varies by plan:**
- Permission names might differ (Zone vs Domain)
- Sub-options might be named differently
- Some permissions might not be available on your plan

**Key principle:** You need **Zone-level Edit access** at minimum.
The exact naming doesn't matter as long as it provides that access.

## Security Note

Your token is saved locally at:
- **File:** `~/.cloudflare/config.json`
- **Permissions:** Read/write by owner only (mode 0600)
- **Encryption:** No (stored in plain text locally)

**Never share your token!** It has write access to your domain registrations.

## Need Help?

1. Check the error message - it usually tells you what's wrong
2. Review the steps above matching your situation
3. Make sure you're using the correct Cloudflare account
4. Check that your Cloudflare account has domain registrations
5. Verify your API token has the two required permissions

Still stuck?
- Run: `cloudflare-registrar config show` to see your current config
- Run: `cloudflare-registrar config reset` to clear and start over
- Run: `cloudflare-registrar login` again to re-authenticate

---

**That's it!** Once you've logged in with `cloudflare-registrar login`, you're ready to manage your domain registrant contacts from the command line.
