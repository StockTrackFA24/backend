const {MongoClient} = require('mongodb');

/*
let converter = require('json-2-csv');
const fs = require('fs');
const {json2csv} = require("json-2-csv");
require('dotenv').config();

const uri =process.env.MONGO_URI;
const nameOfDatabase=process.env.DB_NAME;
const catalogCollection=process.env.CATALOG_COLLECTION;
const stockCollection=process.env.STOCK_COLLECTION;
*/

//Chris's Work List

//Then
//Work on audit logs, audit everything
//audit log is new collection in database
//log had timestamp, user, and description
//functions for viewing audit logs sort from newest to oldest.

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
        varName = "Boots"
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
            price: varPrice,
            stock: 3
        })
        
        //Remove any item given an id
        await removeItem(client, "43PVLBIA")

        //Get the stock of specific Item of Id
        await getStock(client, 0)
        

        //Create a new batch with a new batch Id
        varBatchId= await generateBatchId(client)
        await createBatch(client, "GWO7PTM9", 4, varBatchId)
        

        //Remove a batch knowing its batch id
        await removeBatch(client, 323413363648)

        await batchStock(client, "015987121978", -2)
        
        //query function
        await queryFromString(client, "GW")

        await queryForBatches(client, "Chestplate")
        */

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}


//Create a new item in the catalog
async function createItem(newCatalog){

    id=await generateSKU()

    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        newStock={
            _id: id,
            stock: newCatalog.stock,
            batchCount: 0
        }
        delete newCatalog.stock
        newCatalog._id=id

        newName=newCatalog.name
        contains=await client.db(nameOfDatabase).collection(catalogCollection).findOne({name: newName})
        if (contains){
            SKU=contains._id
            varBatchId= await generateBatchId(client)
            await createBatch(client, SKU, newStock.stock, varBatchId)
            return
        }

        const result=await client.db(nameOfDatabase).collection(catalogCollection).insertOne(newCatalog)
        await client.db(nameOfDatabase).collection(stockCollection).insertOne(newStock)

        if (newStock.stock !=0){
            await client.db(nameOfDatabase).collection(stockCollection).updateOne({stock: newStock.stock}, {$set: {stock: 0}})
            varBatchId= await generateBatchId(client)
            await createBatch(client, newCatalog._id, newStock.stock, varBatchId)
        }

        console.log(`New Listing made with id of: ${result.insertedId}`)
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//Remove item from Catalog given the name
async function removeItem(removeCatalog){
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        deleting=await client.db(nameOfDatabase).collection(catalogCollection).findOne({name: removeCatalog})
        await client.db(nameOfDatabase).collection(catalogCollection).deleteOne({name: removeCatalog})
        id=deleting._id
        await client.db(nameOfDatabase).collection(stockCollection).deleteOne({_id: id})
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
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

//Add a batch given the stock of batch, name of item
async function createBatch(newBatch){
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        itemName=newBatch.name
        newStock=newBatch.stock
        catalogItem= await client.db(nameOfDatabase).collection(catalogCollection).findOne({name: itemName})
        SKU=catalogItem._id
        stockItem=await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: SKU})
        await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: SKU},{$set: {stock: newStock+stockItem.stock}})
        batchCount=stockItem.batchCount+1
        await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: SKU},{$set: {batchCount: batchCount}})

        id=await generateBatchId();

        batch={
            _id: id,
            stock: newStock
        }

        await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: SKU},{$set: {batch: batch}})

        await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: SKU},{$rename: {batch: "batch".concat(id)}})
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//Remove a batch given the batch id
async function removeBatch(batchId){
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        id=batchId._id

        batch="batch".concat(String(id))

        item=await client.db(nameOfDatabase).collection(stockCollection).findOne({[batch]: {$exists: true}})

        //Update stock value and batch count value
        await client.db(nameOfDatabase).collection(stockCollection).updateOne({[batch]: {$exists: true}}, {$set: {stock: item.stock-item[batch].stock}})
        await client.db(nameOfDatabase).collection(stockCollection).updateOne({[batch]: {$exists: true}}, {$set: {batchCount: item.batchCount-1}})

        await client.db(nameOfDatabase).collection(stockCollection).updateOne({}, {$unset: {[batch]: ""}})
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//Take some stock away or increase stock in anyt given batch given batch id, and stock change
async function batchStock(editBatch){
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        id=editBatch._id
        stockChange=editBatch.stock

        batch="batch".concat(String(id))

        item=await client.db(nameOfDatabase).collection(stockCollection).findOne({[batch]: {$exists: true}})

        await client.db(nameOfDatabase).collection(stockCollection).updateOne({[batch]: {$exists: true}}, {$set: {[batch]: {
            _id: id,
            stock: item[batch].stock-stockChange
        }}})
        await client.db(nameOfDatabase).collection(stockCollection).updateOne({[batch]: {$exists: true}}, {$set: {stock: item.stock-stockChange}})
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

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
async function generateSKU() {
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
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
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//Create a unique batch id
async function generateBatchId() {
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
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
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
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

//Return an array of any item that matches the substring given. Checks name and id, and category. Array includes items name and total stock level
async function queryFromString(queryString){

    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        //console.log("We got connected")
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

        return list
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//Returns all batches associated with a specific item by name
async function queryForBatches(name){
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        itemName=name.name

        item=await client.db(nameOfDatabase).collection(catalogCollection).findOne({name: itemName})
        SKU=item._id
        batches=await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: SKU})
        delete batches._id
        delete batches.stock
        delete batches.batchCount
        return batches
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

module.exports={queryFromString, createItem, removeItem, createBatch, removeBatch, batchStock, queryForBatches};

//main()
