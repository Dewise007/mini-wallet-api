import dataSource from '../../data-source';
import { User } from '../users/entities/user.entity';

async function run() {
  const email = process.argv[2];

  if (!email) {
    throw new Error('Usage: npm run seed:admin -- <email>');
  }

  await dataSource.initialize();

  try {
    const result = await dataSource
      .getRepository(User)
      .update({ email }, { role: 'admin' });

    if (!result.affected) {
      throw new Error(`No user with email ${email}`);
    }

    console.log(`Promoted ${email} to admin`);
  } finally {
    await dataSource.destroy();
  }
}

void run();
