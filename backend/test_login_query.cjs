const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const rootEnvPath = path.join(__dirname, '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({
    phone: String,
    email: { type: String, lowercase: true }
  }, { collection: 'users' }));
  
  const all = await User.find({}, 'email phone name');
  console.log('All Users:', all);
  mongoose.disconnect();
}
test();
