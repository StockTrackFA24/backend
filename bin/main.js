const {MongoClient} = require('mongodb');
let converter = require('json-2-csv');
const fs = require('fs');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const nameOfDatabase=process.env.DB_NAME;
const catalogCollection=process.env.CATALOG_COLLECTION;
const stockCollection=process.env.STOCK_COLLECTION;

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */

    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();
        let varId = 0;
        varName = "Helmet"
        varDescription = "A piece of Armor used to protect your head"
        varCategory = "Armor"
        varPrice = 150
        //Add Listings
        //Generate SKU Id for new item
        varId = await generateSKU(client)
        console.log(varId)
        await createItem(client, {
            _id: varId,
            name: varName,
            description: varDescription,
            category: varCategory,
            price: varPrice
        }, {
            _id: varId,
            stock: 0
        })

        //Remove any item given an id
        await removeItem(client, "43PVLBIA")

        //Get the stock of specific Item of Id
        await getStock(client, 0)

        //Update the stock of Specific item of Id, by value x, true if overwrite, false if additive
        await updateStock(client, 0, 4, true)

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//Create a new item in the catalog
async function createItem(client, newCatalog, newStock){
    const result=await client.db(nameOfDatabase).collection(catalogCollection).insertOne(newCatalog)
    await client.db(nameOfDatabase).collection(stockCollection).insertOne(newStock)

    console.log(`New Listing made with id of: ${result.insertedId}`)
}

//Remove item from Catalog given the id
async function removeItem(client, removeCatalog){
    await client.db(nameOfDatabase).collection(catalogCollection).deleteOne({_id: removeCatalog})
    await client.db(nameOfDatabase).collection(stockCollection).deleteOne({_id: removeCatalog})
}


//get the stock of an item given the id
async function getStock(client, id){
    stock= await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: id})
    if (stock){
        console.log(stock.stock)
        return stock.stock
    }
    else{
        console.log("Error getStock, id not found")
        return false
    }
}

//Update the stock of an item given the id
async function updateStock(client, id, newStock, overwrite){
    if (overwrite){
        stock= await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: id},{$set: {stock: newStock}})
    }
    else{
        stock= await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: id},{$set: {stock: newStock+stock.stock}})
    }
}

async function exportToCSV(client, file_path) {

}

async function generateSKU(client) {
    let SKU = ""
    while (true) {
        SKU = ""
        for (i = 0; i < 8; i++) {
            rand = Math.floor(Math.random() * 36)
            console.log(String(rand))
            if (rand < 10) {
                SKU = SKU.concat(String(rand))
            } else {
                rand = rand + 55
                SKU = SKU.concat(String.fromCharCode(rand))
            }
        }
        contains = await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: SKU})
        if (!contains) {
            break
        }
    }
    return SKU
}

async function importFromCSV(client, file_path) {
    let file_contents = fs.readFileSync('test.csv',{
        trimHeaderFields: true,
        trimFieldValues: true
    }).toString();
    file_contents = file_contents.replaceAll("\r\n", "\n");
    let converted_objects = converter.csv2json(file_contents);
    converted_objects.forEach(item =>{
        let extra_keys = Object.keys(item);
        delete extra_keys[extra_keys.indexOf('_id')];
        delete extra_keys[extra_keys.indexOf('stock')];
        let converted_catalog = {}
        let converted_stock = {}
        converted_catalog['_id'] = item._id;
        extra_keys.forEach(key=>{
            converted_catalog[key] = item[key];
        })
        converted_stock['_id'] = item._id;
        converted_stock['stock'] = item.stock;
        createItem(client, converted_catalog, converted_stock);
    })
}

main()
