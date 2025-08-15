const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  // Create regular users
  const userPassword = await bcrypt.hash('user123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'User',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: userPassword,
      name: 'John Doe',
      role: 'USER',
    },
  });

  // Create sample providers
  const provider1 = await prisma.provider.create({
    data: {
      name: 'Warung Makan Sederhana',
      canGiveReceipt: true,
      hasStamp: true,
      canCredit: true,
      description: 'Warung makan dengan menu lengkap dan pelayanan ramah',
      address: 'Jl. Sudirman No. 123',
      phone: '081234567890',
    },
  });

  const provider2 = await prisma.provider.create({
    data: {
      name: 'Snack Corner',
      canGiveReceipt: true,
      hasStamp: false,
      canCredit: false,
      description: 'Toko snack dengan berbagai macam makanan ringan',
      address: 'Jl. Thamrin No. 456',
      phone: '081234567891',
    },
  });

  const provider3 = await prisma.provider.create({
    data: {
      name: 'Catering Bu Sari',
      canGiveReceipt: false,
      hasStamp: false,
      canCredit: true,
      description: 'Catering untuk acara kantor dan pribadi',
      address: 'Jl. Gatot Subroto No. 789',
      phone: '081234567892',
    },
  });

  // Create sample foods
  const foods = [
    // Warung Makan Sederhana
    {
      name: 'Nasi Gudeg',
      description: 'Nasi gudeg khas Yogyakarta dengan lauk lengkap',
      price: 25000,
      category: 'Makanan Utama',
      providerId: provider1.id,
    },
    {
      name: 'Ayam Bakar',
      description: 'Ayam bakar bumbu kecap manis',
      price: 30000,
      category: 'Makanan Utama',
      providerId: provider1.id,
    },
    {
      name: 'Es Teh Manis',
      description: 'Es teh manis segar',
      price: 5000,
      category: 'Minuman',
      providerId: provider1.id,
    },
    
    // Snack Corner
    {
      name: 'Keripik Singkong',
      description: 'Keripik singkong renyah original',
      price: 15000,
      category: 'Snack',
      providerId: provider2.id,
    },
    {
      name: 'Biskuit Coklat',
      description: 'Biskuit coklat premium',
      price: 12000,
      category: 'Snack',
      providerId: provider2.id,
    },
    {
      name: 'Kopi Sachet',
      description: 'Kopi instan sachet berbagai rasa',
      price: 3000,
      category: 'Minuman',
      providerId: provider2.id,
    },
    
    // Catering Bu Sari
    {
      name: 'Paket Nasi Box A',
      description: 'Nasi putih, ayam goreng, sayur, kerupuk, buah',
      price: 35000,
      category: 'Paket',
      providerId: provider3.id,
    },
    {
      name: 'Paket Nasi Box B',
      description: 'Nasi putih, ikan goreng, tahu tempe, sayur',
      price: 28000,
      category: 'Paket',
      providerId: provider3.id,
    },
  ];

  for (const food of foods) {
    await prisma.food.create({ data: food });
  }

  console.log('Database seeded successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });