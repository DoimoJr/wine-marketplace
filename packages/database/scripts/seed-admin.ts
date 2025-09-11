import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating admin user...')
  
  // Hash the password 'admin123' using bcrypt with salt 10 (same as in auth service)
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@winemarketplace.com' }
  })
  
  if (existingAdmin) {
    console.log('Admin user already exists. Updating...')
    
    // Update existing user to admin role and password
    await prisma.user.update({
      where: { email: 'admin@winemarketplace.com' },
      data: {
        role: 'ADMIN',
        hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        verified: true,
        profileComplete: true
      }
    })
    
    console.log('✅ Existing user updated to admin successfully!')
  } else {
    console.log('Creating new admin user...')
    
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@winemarketplace.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        hashedPassword,
        verified: true,
        profileComplete: true
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log(`Admin ID: ${adminUser.id}`)
  }
  
  console.log('📝 Admin credentials:')
  console.log('Email: admin@winemarketplace.com')
  console.log('Password: admin123')
  console.log('Role: ADMIN')
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })