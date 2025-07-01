import { connectToDatabase } from './mongodb';
import User from './models/User';
import Case from './models/Case';
import Client from './models/Client';

async function migrateTenantIsolation() {
  try {
    await connectToDatabase();
    console.log('Starting tenant isolation migration...');

    // Step 1: Update existing advocates to be main advocates
    const advocates = await User.find({ roles: 'advocate' });
    console.log(`Found ${advocates.length} advocates to update`);

    for (const advocate of advocates) {
      await User.findByIdAndUpdate(advocate._id, {
        isMainAdvocate: true,
        advocateId: undefined, // Main advocates don't have an advocateId
      });
      console.log(`Updated advocate: ${advocate.email}`);
    }

    // Step 2: Update existing cases to associate with their creators
    const cases = await Case.find({ advocateId: { $exists: false } });
    console.log(`Found ${cases.length} cases to update`);

    for (const case_ of cases) {
      const creator = await User.findById(case_.createdBy);
      if (creator && creator.isMainAdvocate) {
        await Case.findByIdAndUpdate(case_._id, {
          advocateId: creator._id,
        });
        console.log(`Updated case: ${case_.caseNumber}`);
      }
    }

    // Step 3: Update existing clients to associate with their advocates
    const clients = await User.find({ 
      roles: 'client',
      advocateId: { $exists: false }
    });
    console.log(`Found ${clients.length} clients to update`);

    // For clients without advocateId, we need to find their cases to determine the advocate
    for (const client of clients) {
      const clientCase = await Case.findOne({ clientId: client._id });
      if (clientCase && clientCase.advocateId) {
        await User.findByIdAndUpdate(client._id, {
          advocateId: clientCase.advocateId,
        });
        console.log(`Updated client: ${client.email}`);
      }
    }

    console.log('Tenant isolation migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
migrateTenantIsolation()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

export default migrateTenantIsolation; 