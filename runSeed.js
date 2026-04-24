import { seedDatabase } from './server/seedDatabase.js';

async function run() {
  try {
    await seedDatabase();
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

run();