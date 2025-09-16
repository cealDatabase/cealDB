/**
 * Password Migration Script
 * Migrates existing passwords to Argon2id format
 * 
 * IMPORTANT: This script requires users to reset their passwords
 * It cannot automatically convert existing hashes to Argon2id
 */

import db from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';

async function migratePasswords() {
  console.log('🔄 Starting password migration to Argon2id...');
  
  try {
    // Find all users with non-Argon2id passwords
    const users = await db.user.findMany({
      where: {
        password: {
          not: {
            startsWith: '$argon2id$'
          }
        }
      },
      select: {
        id: true,
        username: true,
        password: true
      }
    });

    console.log(`📊 Found ${users.length} users with legacy password formats`);

    if (users.length === 0) {
      console.log('✅ All users already have Argon2id passwords!');
      return;
    }

    // Analyze password formats
    const formats = {
      bcrypt: 0,
      md5crypt: 0,
      plaintext: 0,
      unknown: 0
    };

    users.forEach(user => {
      const password = user.password;
      if (!password) return;
      
      if (password.startsWith('$2y$') || password.startsWith('$2b$') || password.startsWith('$2a$')) {
        formats.bcrypt++;
      } else if (password.startsWith('$1$')) {
        formats.md5crypt++;
      } else if (password.length < 20 && !/^\$/.test(password)) {
        formats.plaintext++;
      } else {
        formats.unknown++;
      }
    });

    console.log('📈 Password format breakdown:');
    console.log(`   - bcrypt: ${formats.bcrypt}`);
    console.log(`   - MD5-crypt: ${formats.md5crypt}`);
    console.log(`   - Plaintext: ${formats.plaintext}`);
    console.log(`   - Unknown: ${formats.unknown}`);

    // For plaintext passwords, we can migrate them directly
    const plaintextUsers = users.filter(user => 
      user.password && 
      user.password.length < 20 && 
      !/^\$/.test(user.password)
    );

    if (plaintextUsers.length > 0) {
      console.log(`\n🔧 Migrating ${plaintextUsers.length} plaintext passwords...`);
      
      for (const user of plaintextUsers) {
        try {
          const argon2Hash = await hashPassword(user.password);
          
          await db.user.update({
            where: { id: user.id },
            data: { password: argon2Hash }
          });
          
          console.log(`✅ Migrated plaintext password for: ${user.username}`);
        } catch (error) {
          console.error(`❌ Failed to migrate password for ${user.username}:`, error);
        }
      }
    }

    // For hashed passwords, we need to flag them for password reset
    const hashedUsers = users.filter(user => 
      user.password && 
      (user.password.startsWith('$2') || user.password.startsWith('$1$'))
    );

    if (hashedUsers.length > 0) {
      console.log(`\n🚨 ${hashedUsers.length} users need to reset their passwords:`);
      
      // Set requires_password_reset flag
      await db.user.updateMany({
        where: {
          id: {
            in: hashedUsers.map(u => u.id)
          }
        },
        data: {
          requires_password_reset: true
        }
      });

      console.log('✅ Marked users for password reset');
      
      // List affected users
      hashedUsers.forEach(user => {
        const format = user.password.startsWith('$2') ? 'bcrypt' : 'MD5-crypt';
        console.log(`   - ${user.username} (${format})`);
      });
    }

    console.log('\n🎉 Password migration completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Users with legacy passwords will be prompted to reset');
    console.log('   2. New passwords will use secure Argon2id encryption');
    console.log('   3. Authentication now only accepts Argon2id passwords');

  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await db.$disconnect();
  }
}

// Run the migration
migratePasswords();
