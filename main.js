const {ObjectId, MongoClient, Long} = require('mongodb');

const axios = require('axios');
require('./loadenv.js');
let converter = require('json-2-csv');
const fs = require('fs');
const {json2csv} = require("json-2-csv");

const { collections } = require('./mongodb.js');

const permissions = require('./permissions.js');

//const {defPermissionFunction} = require('./auth.js')

//Create a new item in the catalog
async function createItem(newCatalog, uid, perms){

    if (typeof newCatalog.name == "undefined"){
        return "Error: Item had no name."
    }
    else  if (typeof newCatalog.description == "undefined"){
        return "Error: Item had no description."
    }
    else  if (typeof newCatalog.category == "undefined"){
        return "Error: Item had no category."
    }
    else  if (typeof newCatalog.price == "undefined"){
        return "Error: Item had no price."
    }
    else  if (typeof newCatalog.stock == "undefined"){
        return "Error: Item had no stock."
    }

    id=await generateSKU()

    newStock={
        _id: id,
        stock: newCatalog.stock,
        batchCount: 0
    }
    delete newCatalog.stock
    newCatalog._id=id

    newName=newCatalog.name
    contains=await collections.catalog.findOne({name: newName})
    if (contains){
        if ((permissions.CREATE_BATCH & perms) !== permissions.CREATE_BATCH){
            return "No perms to create batch"
        }

        SKU=contains._id
        await createBatch({
            name: newName,
            stock: newStock.stock
        }, uid)
        return "Item already existed, so new batch created instead"
    }

    const result=await collections.catalog.insertOne(newCatalog)
    await collections.stock.insertOne(newStock)

    if (newStock.stock !=0){
        await collections.stock.updateOne({_id: id}, {$set: {stock: 0}})
        await createBatch({
            name: newName,
            stock: newStock.stock
        }, uid)
    }


    await auditLogs(uid, `Created item, `+JSON.stringify(newCatalog))

    return `New Listing made with id of: ${result.insertedId}, and initial stock of ${newStock.stock}`
}

//Remove item from Catalog given the name
async function removeItem(removeCatalog, uid){
    if (removeCatalog.name !=null ){
        deleting=await collections.catalog.findOne({name: removeCatalog.name})
    }
    else{
        deleting=await collections.catalog.findOne({_id: removeCatalog._id})
    }
    if (deleting == null){
        return "Error: Name or ID does not exist"
    }
    itemName=deleting.name
    await collections.catalog.deleteOne({name: itemName})
    id=deleting._id
    await collections.stock.deleteOne({_id: id})

    await auditLogs(uid, `Deleted item: ${itemName}`)

    return `Deleted item: ${itemName}`
}


//get the total stock of an item given the id
async function getStock(id){
    stock= await collections.stock.findOne({_id: id})
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
async function createBatch(newBatch, uid){
    if (typeof newBatch.name == "undefined"){
        return "Error: Need an item name."
    }
    else  if (typeof newBatch.stock == "undefined"){
        return "Error: Batch had no stock."
    }

    itemName=newBatch.name
    newStock=newBatch.stock
    catalogItem= await collections.catalog.findOne({name: itemName})

    totalStock=catalogItem.stock+newStock
    oldStock=catalogItem.stock

    if (catalogItem == null){
        return "Error: Item name does not exist"
    }
    SKU=catalogItem._id
    stockItem=await collections.stock.findOne({_id: SKU})
    batchCount= Number(stockItem.batchCount) + 1
    await collections.stock.updateOne({_id: SKU},{$set: {stock: Number(newStock) + Number(stockItem.stock), batchCount: batchCount}})

    id=await generateBatchId();

    batch={
        _id: id,
        stock: newStock
    }

    await collections.stock.updateOne({_id: SKU},{$set: {batch: batch}})

    await collections.stock.updateOne({_id: SKU},{$rename: {batch: "batch".concat(id)}})

    await auditLogs(uid, `New batch created, `+JSON.stringify(batch))

    return `New batch created with id: ${id}`
}

//Remove a batch given the batch id
async function removeBatch(batchId, uid){
    if (typeof batchId._id == "undefined"){
        return "Error: Need a batch id."
    }

    id=batchId._id

    batch="batch".concat(String(id))

    item=await collections.stock.findOne({[batch]: {$exists: true}})
    if (item == null){
        return "Error: Batch ID does not exist"
    }

    //Update stock value and batch count value
    await collections.stock.updateOne({[batch]: {$exists: true}}, {$set: {stock: item.stock-item[batch].stock}})
    await collections.stock.updateOne({[batch]: {$exists: true}}, {$set: {batchCount: item.batchCount-1}})

    await collections.stock.updateOne({[batch]: {$exists: true}}, {$unset: {[batch]: ""}})

    if (item.batchCount==1){
        SKU=item._id
        remove=await collections.catalog.findOne({_id: SKU})
        await removeItem(remove.name)
        return "Item was removed due to final batch being removed"
    }

    await auditLogs(uid, `${batch} was removed.`)

    return `${batch} was removed.`
}

//Take some stock away or increase stock in anyt given batch given batch id, and stock change
async function batchStock(editBatch, uid){
    if (typeof editBatch._id == "undefined"){
        return "Error: Need a batch id."
    }
    else  if (typeof editBatch.stock == "undefined"){
        return "Error: Need stock alteration."
    }

        id=editBatch._id
        stockChange=editBatch.stock

        batch="batch".concat(String(id))

        item=await collections.stock.findOne({[batch]: {$exists: true}})
        if (item == null){
            return "Error: Batch ID does not exist"
        }
        originalItem=item

        batchStock=item[batch].stock
        if (batchStock<=stockChange){
            await removeBatch({_id: item[batch]._id})
            if (batchStock==item.stock){
                SKU=item._id
                remove=await collections.catalog.findOne({_id: SKU})
                await removeItem(remove.name)
                return "Item was removed due to all stock of final batch being depleted"
            }

            if (batchStock<stockChange){
                return `Warning ${batch} did not have ${stockChange} stock remaining. It only had ${batchStock}.`
            }
            return "The batch was removed due to no stock remaining."
        }

        await collections.stock.updateOne({[batch]: {$exists: true}}, {$set: {[batch]: {
            _id: id,
            stock: item[batch].stock-stockChange
        }}})
        await collections.stock.updateOne({[batch]: {$exists: true}}, {$set: {stock: item.stock-stockChange}})
        newItem=await collections.stock.findOne({[batch]: {$exists: true}})

        await auditLogs(uid, `Batch change: `+JSON.stringify(item[batch])+` was changed to `+JSON.stringify(newItem[batch]))

        return `${batch} stock was altered.`

}

async function exportToCSV(uid) {
    let catalogList = []
    let stockList = []
    let catalogCursor = await collections.catalog.find({})
    let stockCursor = await collections.stock.find({})
    catalogList = await catalogCursor.toArray();
    stockList = await stockCursor.toArray();
    catalogList.sort((a,b) => a._id > b._id ? 1 : -1)
    stockList.sort((a,b) => a._id > b._id ? 1 : -1)
    let numItems = catalogList.length
    // This has the assumption that each item in the catalog will have a corresponding item in stock
    for (let i=0; i<numItems; i++){
        catalogList[i].stock =stockList[i].stock
    }

    await auditLogs(uid, "Exported a file")
    return json2csv(catalogList);
    /*
    console.log(csvString);
    fs.writeFile(file_path, csvString, err => {
        if (err) {
            console.error(err);
        }
        else {
            console.log(`CSV output written to ${file_path}`);
        }


    });
     */
}

//Create a unique SKU value
async function generateSKU() {
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
        contains = await collections.stock.findOne({_id: SKU})
        if (!contains) {
            break
        }
    }
    return SKU
}

//Create a unique batch id
async function generateBatchId() {
    let id = ""
    while (true) {
        id = ""
        for (i = 0; i < 12; i++) {
            rand = Math.floor(Math.random() * 10)
            id = id.concat(String(rand))
        }
        //Make sure it isn't a duplicate
        batch="batch".concat(String(id))
        contains=await collections.stock.find({ [batch]: { $exists: true } }).toArray()
        if (contains.length==0) {
            break
        }
        else{
            console.log("Error")
        }
    }

    return id
}

async function importFromCSV(csvString, uid, perms) {
    csvString = csvString.replaceAll("\r\n", "\n");
    let converted_objects = converter.csv2json(csvString);
    for (const item of converted_objects) {
        const newItemCatalog = {
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            stock: item.stock,
        }
        await createItem(newItemCatalog, uid, perms);

    }

    await auditLogs(uid, "imported a file")
    /*
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
        await createItem(mongo, converted_catalog, converted_stock);
        await auditLogs("Bob", "Imported a file")
    }

     */
}

//Return an array of any item that matches the substring given. Checks name and id, and category. Array includes items name and total stock level
async function queryFromString(queryString, uid){

    //A list of everything in the catalog
    list=await collections.catalog.find({ _id: { $exists: true } }).toArray()

    queryString=queryString.toLowerCase()
    //remove anything that doesn't contain the substring
    for (i=0; i<list.length;i++){
        if (!(list[i].name.toLowerCase().includes(queryString) || (list[i]._id.toLowerCase().includes(queryString)) || list[i].category.toLowerCase().includes(queryString))){
            list.splice(i,1)
            i--
        }
    }

    //add in the total stock
    for (i=0; i<list.length;i++){
        stock=await collections.stock.findOne({_id: list[i]._id})
        list[i].stock=stock.stock;
    }

    if (queryString==""){
        await auditLogs(uid, "Searched the database")
    }
    else {
        await auditLogs(uid, `Searched the database for items with ${queryString}`)
    }

    return list
}

async function roleQuery(uid){

    list = await collections.role.find({ _id: { $exists: true } }).toArray();

    await auditLogs(uid, "Searched for roles")

    return list;
}

async function accountQuery(uid) {


    list = await collections.user.aggregate( [
        {
            $lookup: {
                from: process.env.ROLE_COLLECTION,
                localField: 'roles',
                foreignField: '_id',
                as: 'roleInfo',
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            displayName: 1
                        }
                    }
                ]
            },
        },
        {
            $project: {
                username: 1,
                roleInfo: 1,
                name: 1
            }
        }
    ]).toArray();

    await auditLogs(uid, "Searched for accounts")

    return list;
}

//Returns all batches associated with a substr tied to either name or SKU
async function queryForBatches(subString, uid){

    substr=subString.sub.toLowerCase()

    allBatches=[]
    allBatchIds=[]

    batchId=subString.sub
    list=await collections.catalog.find({ _id: { $exists: true } }).toArray()
    for (i=0; i<list.length;i++){
        SKU=list[i]._id
        batches=await collections.stock.findOne({_id: SKU})
        batchList=Object.keys(batches)
        batchList.splice(0,3)
        for (b=0; b<batchList.length;b++){
            batchTest=batchList[b].slice(5)
            if (batchTest.includes(batchId)){
                batch=batches[batchList[b]]
                batch.name=list[i].name
                batch.SKU=list[i]._id
                allBatches.push(batches[batchList[b]])
                allBatchIds.push(batch._id)
            }
        }
    }

    list=await collections.catalog.find({ _id: { $exists: true } }).toArray()

    //remove anything that doesn't contain the substring
    for (i=0; i<list.length;i++){
        if (!(list[i].name.toLowerCase().includes(substr) || list[i]._id.toLowerCase().includes(substr))){
            list.splice(i,1)
            i--
        }
    }

    for (i=0; i<list.length;i++){
        SKU=list[i]._id
        itemName=list[i].name
        batches=await collections.stock.findOne({_id: SKU})
        delete batches._id
        delete batches.stock
        delete batches.batchCount
        allEntries=Object.entries(batches)
        for (x=0; x<allEntries.length;x++){
            batch=allEntries[x][1]
            batch.name=itemName
            batch.SKU=SKU
            if (!allBatchIds.includes(batch._id)){
                allBatches.push(batch)
            }
        }
    }

    if (subString.sub==""){
        await auditLogs(uid, "Searched for batches")
    }
    else {
        await auditLogs(uid, "Searched for batches with "+subString.sub)
    }

    return allBatches
}

//Update an item based off of SKU
async function itemUpdate(newItem, uid){

    contains=await collections.catalog.findOne({_id: newItem._id})
    if (!contains){
        return "Error: SKU not found."
    }
    contains=await collections.catalog.findOne({name: newItem.name})
    if (contains){
        if (contains._id!=newItem._id){
            return "Error: Item name already exists."
        }
    }

    if (typeof newItem.name != "undefined"){
        await collections.catalog.updateOne({_id: newItem._id}, {$set: {name: newItem.name}})
    }
    if (typeof newItem.category != "undefined"){
        await collections.catalog.updateOne({_id: newItem._id}, {$set: {category: newItem.category}})
    }
    if (typeof newItem.description != "undefined"){
        await collections.catalog.updateOne({_id: newItem._id}, {$set: {description: newItem.description}})
    }
    if (typeof newItem.price != "undefined"){
        await collections.catalog.updateOne({_id: newItem._id}, {$set: {price: newItem.price}})
    }

    newItem=await collections.catalog.findOne({name: newItem.name})

    await auditLogs(uid, `Updated Listing: `+ JSON.stringify(contains)+` was changed to `+JSON.stringify(newItem))

    return `Updated Listing with id of: ${newItem._id}`
}

//Add to the audit logs
async function auditLogs(user, description){
    await collections.audit.insertOne({
        user: user,
        timestamp: new Date(),
        description: description
    })

    return
}

//Return a list of all logs sorted by time
async function auditQuery(uid){
    logs=await collections.audit.aggregate([
        {
            $sort: {
                timestamp: -1
            }
        },
        {
            $lookup: {
                from: process.env.USER_COLLECTION,
                localField: 'user',
                foreignField: '_id',
                as: 'actor',
                pipeline: [
                    {
                        $project: {
                            username: 1
                        }
                    }
                ]
            },
        },
    ]).toArray();

    await auditLogs(uid, `Looked at the audit logs`)

    return logs
}

async function createRole(newRole, uid){

    if (typeof newRole.role_name == "undefined") {
        return "Error: Role had no name."
    }
    else  if (typeof newRole.display_name == "undefined") {
        return "Error: Role had no display name."
    }
    else  if (typeof newRole.description == "undefined") {
        return "Error: Role had no description."
    }
    else  if (typeof newRole.Perms == "undefined") {
        return "Error: Role had no permissions."
    }

    if (newRole.Perms == '') {
        newRole.Perms = '0';
    }

    newName = newRole.role_name;
    contains = await collections.role.findOne({name: newName});

    if (contains)
    {
        return `Role with name ${newName} already exists.`;
    }

    newDisplayName = newRole.display_name;
    contains = await collections.role.findOne({displayName: newDisplayName});



    let newerRole = {
        name: newRole.role_name,
        description: newRole.description,
        displayName: newRole.display_name,
        permissions: Long.fromString(newRole.Perms),
    }

    const result = await collections.role.insertOne(newerRole);

    await auditLogs(uid, `Created a role: ${JSON.stringify(newRole)}`)

    return `New role created with id of ${result.insertedId}`;
}

async function createAccount(newUser, uid) {

    if (typeof newUser.name == "undefined") {
        return "Error: User had no name."
    }
    else if (typeof newUser.role == "undefined") {
        return "Error: User had no role."
    }
    else if (typeof newUser.username == "undefined") {
        return "Error: User had no username."
    }
    else if (typeof newUser.password == "undefined") {
        return "Error: User had no password."
    }

    let newerUser = {
        name: newUser.name,
        username: newUser.username,
        roles: [ await getRoleId(newUser.role) ],
        adminNotes: "N/A",
        tokenInvalidTime: new Date(),
    }

    const result  = await collections.user.insertOne(newerUser);

    axios.post(process.env.PASSWORD_PORT,  {
        uid: result.insertedId.toString('base64'),
        password: newUser.password
      }
      )
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error);
      });
      
    await auditLogs(uid, `Created a user: ${JSON.stringify(newUser)}`);

    return `New user created with id of ${result.insertedId}`;
}

async function getRoleId(roleName) {
    return (await collections.role.findOne({name : roleName}))._id;
}

module.exports={queryFromString, createItem, removeItem, createBatch, removeBatch, batchStock, queryForBatches, exportToCSV, itemUpdate, importFromCSV, auditQuery, createRole, roleQuery, createAccount, accountQuery};
