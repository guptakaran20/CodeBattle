const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection;
  const log = await db.collection('importlogs').findOne({validationStatus: 'FAILED'}, {sort: {_id: -1}});
  console.log(log.errors);
  process.exit(0);
}

run();
