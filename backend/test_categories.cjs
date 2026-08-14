const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const Product = require('./src/models/Product.js').default || require('./src/models/Product.js');
  const categories = await Product.distinct('category');
  console.log('Categories:', categories);
  
  process.exit();
}
test();
