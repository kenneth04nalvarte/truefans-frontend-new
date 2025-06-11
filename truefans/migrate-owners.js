const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');
const Owner = mongoose.model('Owner', userSchema, 'owners');

async function migrateOwners() {
  await mongoose.connect(MONGO_URI);

  // 1. Copy owners from users to owners
  const owners = await User.find({ role: { $in: ['owner', 'restaurant_owner'] } });
  for (const owner of owners) {
    // Avoid duplicate _id
    const exists = await Owner.findById(owner._id);
    if (!exists) {
      await Owner.create(owner.toObject());
      console.log(`Migrated owner: ${owner.email}`);
    }
  }

  console.log('Migration complete!');
  await mongoose.disconnect();
}

migrateOwners().catch(err => {
  console.error(err);
  process.exit(1);
}); 