
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';

const password = process.env.NEW_OFFICER_PASSWORD;

async function createOfficers() {
  if (!password || password.length < 12) {
    throw new Error('Set NEW_OFFICER_PASSWORD to at least 12 characters.');
  }

  const officerCodes = [
    'GCC-ROADS',
    'GCC-SWD',
    'CMWSSB',
    'TANGEDCO',
    'BBMP-ENG',
    'BWSSB',
    'GHMC-ENG',
    'HMWSSB',
  ];

  await connectDB();

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    for (const code of officerCodes) {
      const department = await Department.findOne({ code });

      if (!department) {
        console.log(`SKIPPED: Department ${code} not found`);
        continue;
      }

      const emailNormalized =
        `officer.${code.toLowerCase()}@transparancecity.demo`;

      await User.findOneAndUpdate(
        { emailNormalized },
        {
          $set: {
            emailNormalized,
            passwordHash,
            displayName: `Demo Officer — ${department.name}`,
            role: 'officer',
            department: department._id,
            isDemoAccount: true,
            active: true,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );

      console.log(`Created/updated: ${emailNormalized}`);
    }

    console.log('Officer account provisioning finished.');
  } finally {
    await disconnectDB();
  }
}

createOfficers().catch((error) => {
  console.error('Officer provisioning failed:', error.message);
  process.exitCode = 1;
});
