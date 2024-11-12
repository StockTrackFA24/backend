const {MongoClient} = require('mongodb');

let converter = require('json-2-csv');
const fs = require('fs');
const {json2csv} = require("json-2-csv");
require('dotenv').config();

const uri =process.env.MONGO_URI;
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
        console.log("We got connected")
        //await exportToCSV(client, './test.csv');
        //await importFromCSV(client, './test_data.csv');
        /*
        let varId = 0;
        varName = "Helmet"
        varDescription = "A piece of Armor used to protect your head"
        varCategory = "Armor"
        varPrice = 150
        //Add Listings
        //Generate SKU Id for new item
        varId = await generateSKU(client)

        await createItem(client, {
            _id: varId,
            name: varName,
            description: varDescription,
            category: varCategory,
            price: varPrice
        }, {
            _id: varId,
            stock: 3,
            batchCount: 0
        })
        
        //Remove any item given an id
        await removeItem(client, "43PVLBIA")

        //Get the stock of specific Item of Id
        await getStock(client, 0)
        

        //Create a new batch with a new batch Id
        varBatchId= await generateBatchId(client)
        await addBatch(client, "GWO7PTM9", 4, varBatchId)
        

        //Remove a batch knowing its batch id
        await removeBatch(client, 323413363648)

        await batchStock(client, "015987121978", -2)
        */
        //query function
        await queryFromString(client, "GW")

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//Create a new item in the catalog
async function createItem(client, newCatalog, newStock){
    newName=newCatalog.name
    contains=await client.db(nameOfDatabase).collection(catalogCollection).findOne({name: newName})
    
    if (contains){
        SKU=contains._id
        varBatchId= await generateBatchId(client)
        await addBatch(client, SKU, newStock.stock, varBatchId)
        return
    }

    const result=await client.db(nameOfDatabase).collection(catalogCollection).insertOne(newCatalog)
    await client.db(nameOfDatabase).collection(stockCollection).insertOne(newStock)

    if (newStock.stock !=0){
        await client.db(nameOfDatabase).collection(stockCollection).updateOne({stock: newStock.stock}, {$set: {stock: 0}})
        varBatchId= await generateBatchId(client)
        await addBatch(client, newCatalog._id, newStock.stock, varBatchId)
    }

    console.log(`New Listing made with id of: ${result.insertedId}`)
}

//Remove item from Catalog given the id
async function removeItem(client, removeCatalog){
    await client.db(nameOfDatabase).collection(catalogCollection).deleteOne({_id: removeCatalog})
    await client.db(nameOfDatabase).collection(stockCollection).deleteOne({_id: removeCatalog})
}


//get the total stock of an item given the id
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

//Add a batch given the stock of batch, SKU of item, and batch id
async function addBatch(client, SKU, newStock, id){
    item= await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: SKU})
    await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: SKU},{$set: {stock: newStock+item.stock}})
    batchCount=item.batchCount+1
    await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: SKU},{$set: {batchCount: batchCount}})

    batch={
        _id: id,
        stock: newStock
    }

    await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: SKU},{$set: {batch: batch}})

    await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: SKU},{$rename: {batch: "batch".concat(id)}})
}

//Remove a batch given the batch id
async function removeBatch(client, id){
    batch="batch".concat(String(id))

    item=await client.db(nameOfDatabase).collection(stockCollection).findOne({[batch]: {$exists: true}})

    //Update stock value and batch count value
    await client.db(nameOfDatabase).collection(stockCollection).updateOne({[batch]: {$exists: true}}, {$set: {stock: item.stock-item[batch].stock}})
    await client.db(nameOfDatabase).collection(stockCollection).updateOne({[batch]: {$exists: true}}, {$set: {batchCount: item.batchCount-1}})

    await client.db(nameOfDatabase).collection(stockCollection).updateOne({}, {$unset: {[batch]: ""}})
}

//Take some stock away or increase stock in anyt given batch given batch id, and stock change
async function batchStock(client, id, stockChange){
    batch="batch".concat(String(id))

    item=await client.db(nameOfDatabase).collection(stockCollection).findOne({[batch]: {$exists: true}})

    await client.db(nameOfDatabase).collection(stockCollection).updateOne({[batch]: {$exists: true}}, {$set: {[batch]: {
        _id: id,
        stock: item[batch].stock-stockChange
    }}})
    await client.db(nameOfDatabase).collection(stockCollection).updateOne({[batch]: {$exists: true}}, {$set: {stock: item.stock-stockChange}})

}

async function exportToCSV(client, file_path) {
    let catalogList = []
    let stockList = []
    let catalogCursor = await client.db(nameOfDatabase).collection(catalogCollection).find({})
    let stockCursor = await client.db(nameOfDatabase).collection(stockCollection).find({})
    catalogList = await catalogCursor.toArray();
    stockList = await stockCursor.toArray();
    catalogList.sort((a,b) => a._id > b._id ? 1 : -1)
    stockList.sort((a,b) => a._id > b._id ? 1 : -1)
    console.log(catalogList);
    console.log(stockList);
    numItems = catalogList.length
    // This has the assumption that each item in the catalog will have a corresponding item in stock
    for (let i=0; i<numItems; i++){
        catalogList[i].stock =stockList[i].stock
    }
    csvString = json2csv(catalogList);
    console.log(csvString);
    fs.writeFile(file_path, csvString, err => {
        if (err) {
            console.error(err);
        }
        else {
            console.log(`CSV output written to ${file_path}`);
        }
    });
}

//Create a unique SKU value
async function generateSKU(client) {
    let SKU = ""
    while (true) {
        SKU = ""
        for (i = 0; i < 8; i++) {
            rand = Math.floor(Math.random() * 36)
            if (rand < 10) {
                SKU = SKU.concat(String(rand))
            } else {
                rand = rand + 55
                SKU = SKU.concat(String.fromCharCode(rand))
            }
        }
        //Make sure it isn't a duplicate
        contains = await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: SKU})
        if (!contains) {
            break
        }
    }
    return SKU
}

//Create a unique batch id
async function generateBatchId(client) {
    let id = ""
    while (true) {
        id = ""
        for (i = 0; i < 12; i++) {
            rand = Math.floor(Math.random() * 10)
            id = id.concat(String(rand))
        }
        //Make sure it isn't a duplicate
        batch="batch".concat(String(id))
        contains=await client.db(nameOfDatabase).collection(stockCollection).find({ [batch]: { $exists: true } }).toArray()
        if (contains.length==0) {
            break
        }
        else{
            console.log("Error")
        }
    }
    return id
}

async function importFromCSV(client, file_path) {
    let file_contents = fs.readFileSync(file_path,{
        trimHeaderFields: true,
        trimFieldValues: true
    }).toString();
    file_contents = file_contents.replaceAll("\r\n", "\n");
    let converted_objects = converter.csv2json(file_contents);
    console.log(converted_objects)
    for (const item of converted_objects) {
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
        await createItem(client, converted_catalog, converted_stock);
    }
}

//Return an array of any item that matches the substring given. Checks name and id. Array includes items name and total stock level
async function queryFromString(client, queryString){

    //A list of everything in the catalog
    list=await client.db(nameOfDatabase).collection(catalogCollection).find({ _id: { $exists: true } }).toArray()

    //remove anything that doesn't contain the substring
    for (i=0; i<list.length;i++){
        if (!(list[i].name.includes(queryString) || (list[i]._id.includes(queryString)) || list[i].category.includes(queryString))){
            list.splice(i,1)
            i--
        }
    }

    //add in the total stock
    for (i=0; i<list.length;i++){
        stock=await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: list[i]._id})
        list[i].stock=stock.stock;
    }

    console.log(list)
}

main()
