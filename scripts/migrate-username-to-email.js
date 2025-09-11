/**
 * MIGRATION SCRIPT: Convert Username to Email
 * 
 * This script migrates existing users from username-based auth to email-based auth
 * by populating the email field with appropriate email addresses.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateUsernameToEmail() {
  console.log('🔄 Starting username to email migration...');
  
  try {
    // Get all users that don't have email addresses
    const usersWithoutEmail = await prisma.user.findMany({
      where: {
        email: null
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true
      }
    });

    console.log(`📊 Found ${usersWithoutEmail.length} users without email addresses`);

    if (usersWithoutEmail.length === 0) {
      console.log('✅ All users already have email addresses');
      return;
    }

    // Migrate each user
    for (const user of usersWithoutEmail) {
      let email;
      
      // If username looks like an email, use it directly
      if (user.username && user.username.includes('@')) {
        email = user.username.toLowerCase();
      } else {
        // Create email from username with a default domain
        // You may want to customize this logic based on your institutional needs
        const cleanUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
        email = `${cleanUsername}@ceal.edu`; // Replace with your institution's domain
      }

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            email: email
          }
        });
        
        console.log(`✅ Migrated user ID ${user.id}: ${user.username} → ${email}`);
      } catch (error) {
        if (error.code === 'P2002') {
          // Handle duplicate email - add a number suffix
          let suffix = 1;
          let uniqueEmail = email;
          
          while (true) {
            try {
              uniqueEmail = email.replace('@', `${suffix}@`);
              await prisma.user.update({
                where: { id: user.id },
                data: { 
                  email: uniqueEmail
                }
              });
              console.log(`✅ Migrated user ID ${user.id}: ${user.username} → ${uniqueEmail} (with suffix)`);
              break;
            } catch (innerError) {
              if (innerError.code === 'P2002') {
                suffix++;
                if (suffix > 100) {
                  throw new Error(`Could not create unique email for user ${user.username}`);
                }
              } else {
                throw innerError;
              }
            }
          }
        } else {
          throw error;
        }
      }
    }

    // Verify migration
    const remainingUsers = await prisma.user.count({
      where: { email: null }
    });

    if (remainingUsers === 0) {
      console.log('🎉 Migration completed successfully!');
      console.log(`✅ ${usersWithoutEmail.length} users migrated from username to email`);
    } else {
      console.log(`⚠️ Warning: ${remainingUsers} users still without email addresses`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateUsernameToEmail()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateUsernameToEmail };
