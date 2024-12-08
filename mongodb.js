require('./loadenv.js');
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db();

const collections = {
  catalog: db.collection(process.env.CATALOG_COLLECTION),
  stock: db.collection(process.env.STOCK_COLLECTION),
  audit: db.collection(process.env.AUDIT_COLLECTION),
  role: db.collection(process.env.ROLE_COLLECTION),
  user: db.collection(process.env.USER_COLLECTION),
};

(async () => {
  await client.connect();

  // create indexes and do other collection setup here :) - cullen
})().catch((e) => {
  console.dir(e);
  console.error("Failed to set up MongoDB (see above exception)! exploding");
  process.exit(2);
});

module.exports = {
  mongo: client,
  db: db,
  collections: collections
}
