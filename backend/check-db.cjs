const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection;
  const count = await db.collection('problems').countDocuments();
  console.log('Total problems in DB:', count);
  const problems = await db.collection('problems').find({}, { projection: { title: 1, isPublished: 1, status: 1 } }).toArray();
  console.log(problems);
  process.exit(0);
}

run();
