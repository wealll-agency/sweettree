import mongoose from 'mongoose';
import config from '../backend/src/config/env.js';

async function checkAdmins() {
  await mongoose.connect(config.MONGODB_URI);
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('Users found:', users.map(u => ({ email: u.email, role: u.role, name: u.name, _id: u._id })));
  process.exit(0);
}

checkAdmins().catch(err => { console.error(err); process.exit(1); });
