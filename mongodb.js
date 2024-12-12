require('./loadenv.js');
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DB_NAME);

const collections = {
  catalog: db.collection(process.env.CATALOG_COLLECTION),
  stock: db.collection(process.env.STOCK_COLLECTION),
  audit: db.collection(process.env.AUDIT_COLLECTION),
  role: db.collection(process.env.ROLE_COLLECTION),
  user: db.collection(process.env.USER_COLLECTION),
};

(async () => {
  await client.connect();

  await collections.audit.createIndex({timestamp: -1});
  await collections.catalog.createIndex({name: 1});

  // create indexes and do other collection setup here :) - cullen
  //create first role here manually by calling insertOne
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
