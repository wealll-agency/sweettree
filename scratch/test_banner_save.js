import mongoose from 'mongoose';
import config from '../backend/src/config/env.js';
import Banner from '../backend/src/models/Banner.js';

async function testBannerSave() {
  await mongoose.connect(config.MONGODB_URI);
  console.log('DB Connected');

  const testBanner = await Banner.create({
    title: 'Test Contact Banner',
    image: 'http://localhost:7050/uploads/test-contact.png',
    placement: 'ContactBanner',
    isActive: true
  });

  console.log('Banner Created Successfully:', testBanner._id, testBanner.placement);

  // Clean up
  await Banner.deleteOne({ _id: testBanner._id });
  console.log('Test banner cleaned up');
  process.exit(0);
}

testBannerSave().catch(err => {
  console.error('Save failed:', err);
  process.exit(1);
});
