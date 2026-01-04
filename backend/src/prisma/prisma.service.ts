import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    
    // Ensure default admin user exists if in development or SEED_DEFAULT_ADMIN is true
    if (process.env.SEED_DEFAULT_ADMIN === 'true') {
      await this.ensureDefaultAdmin();
    }
  }

  async ensureDefaultAdmin() {
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'rotorial@admin.com';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
    
    // Check if admin user already exists
    const existingAdmin = await this.users.findFirst({
      where: {
        email: defaultEmail,
        role: 'admin',
      },
    });

    if (!existingAdmin) {
      // Create admin user if it doesn't exist
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      
      await this.users.create({
        data: {
          email: defaultEmail,
          password_hash: passwordHash,
          full_name: 'Admin User',
          role: 'admin',
          status: 'active',
        },
      });
      
      console.log('Default admin user created');
    } else {
      console.log('Default admin user already exists');
    }
    
    console.log('Default admin ensured');
  }
}
