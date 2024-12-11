const express = require('express')
const app = express()
const port = 4000

app.use(express.json())
const permissions = require('./permissions.js');

const {createItem, removeItem, createBatch, removeBatch, batchStock, queryFromString, queryForBatches, exportToCSV, itemUpdate, importFromCSV, auditQuery, createRole, roleQuery, createAccount, accountQuery} = require('./main.js')
const {requireAuth}=require('./auth.js')

app.post('/createItem', requireAuth(permissions.CREATE_ITEM), async (req, res) => {
  let itemAttributes = {
    name : req.body.name,
    description : req.body.description,
    category: req.body.category,
    price: req.body.price,
    stock: req.body.stock,
  };
  try{
    output=await createItem(itemAttributes, req.body.uid, req.permissions)
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/removeItem', requireAuth(permissions.DELETE_ITEM), async (req, res) => {
  let item = {
    name: req.body.name,
    _id: req.body._id
  }
  try{
    output= await removeItem(item, req.body.uid)
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/createBatch', requireAuth(permissions.CREATE_BATCH), async (req, res) => {
  let batchAttributes = {
    name: req.body.name,
    stock: req.body.stock,
  }
  try{
    output=await createBatch(batchAttributes, req.body.uid)
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/removeBatch', requireAuth(permissions.DELETE_BATCH), async (req, res) => {
  let batchID = req.body._id;
  try{
    output=await removeBatch({_id: batchID}, req.body.uid)
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/batchStock', requireAuth(permissions.EDIT_BATCH), async (req, res) => {
  let batchID = req.body._id;
  let increment = req.body.stock;
  try{
    output= await batchStock({_id: batchID, stock: increment}, req.body.uid);
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/standardQuery', requireAuth(permissions.ITEM_QUERY), async (req, res) => {
  let query = req.body["sub"];
  try{
    list= await queryFromString(query, req.body.uid)
    res.send(list)
  } catch(e){
    console.error(e)
  }
})

app.post('/batchesQuery', requireAuth(permissions.BATCH_QUERY), async (req, res) => {
  let query = req.body["sub"];
  try{
    batches= await queryForBatches({sub: query}, req.body.uid)
    res.send(batches)
  } catch(e){
    console.error(e)
  }
})

app.post('/roleQuery', async (req, res) => {
  try{
    roles = await roleQuery(req.body.uid)
    res.send(roles)
  } catch(e){
    console.error(e)
  }
})

app.post('/accountQuery', requireAuth(permissions.ACCOUNT_QUERY), async (req, res) => {
  try{
    accounts = await accountQuery(req.body.uid)
    res.send(accounts)
  } catch(e){
    console.error(e)
  }
})

app.post('/itemUpdate', requireAuth(permissions.EDIT_ITEM), async (req, res) => {
  let itemAttributes = {
    _id : req.body._id,
    name : req.body.name,
    description : req.body.description,
    category: req.body.category,
    price: req.body.price,
  };
  try{
    output=await itemUpdate(itemAttributes, req.body.uid);
    res.send(output);
  } catch(e){
    console.error(e)
  }

})

app.post('/exportItems', async (req, res) => {
  try{
    let csvstring = await(exportToCSV(req.body.uid))
    res.send(csvstring)
  } catch(e){
    console.error(e)
  }
})

app.post('/importCSV', async (req, res) => {
  let csvString = req.body.csvString
  try{
    await importFromCSV(csvString, req.body.uid)
    res.send("import complete")
  } catch(e){
    console.error(e)
  }
})

app.post('/auditQuery', requireAuth(permissions.AUDIT_QUERY), async (req, res) => {
  try{
    output = await auditQuery(req.body.uid);
    res.send(output);
  } catch(e){
    console.error(e)
  }
})

app.post('/createRole', requireAuth(permissions.CREATE_ROLE), async (req, res) => {
  let roleAttributes = {
    role_name : req.body.role_name,
    description : req.body.description,
    display_name : req.body.display_name,
    Perms : req.body.Perms,
  };
  try{
    output = await createRole(roleAttributes, req.body.uid);
    res.send(output);
  } catch(e){
    console.error(e)
  }
})

app.post('/createAccount', requireAuth(permissions.CREATE_ACCOUNT), async (req, res) => {
  let accountAttributes = {
    name: {
      first : req.body.name.first,
      middle : req.body.name.middle,
      last : req.body.name.last,
    },
    role : req.body.role,
    username : req.body.username,
    password: req.body.password,
  };

  try{
    output = await createAccount(accountAttributes, req.body.uid);
    res.send(output);
  } catch(e){
    console.error(e)
  }
})

app.set('port', port)
app.listen(port, () => {
  console.log(`The server is up!`)
})
