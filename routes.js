const express = require('express')
const app = express()
const port = 4000

app.use(express.json())

const {createItem, removeItem, createBatch, removeBatch, batchStock, queryFromString, queryForBatches, exportToCSV, itemUpdate, importFromCSV, auditQuery, createRole, roleQuery, createAccount, accountQuery} = require('./main.js')

app.post('/createItem', async (req, res) => {
  let itemAttributes = {
    name : req.body.name,
    description : req.body.description,
    category: req.body.category,
    price: req.body.price,
    stock: req.body.stock,
  };
  try{
    output=await createItem(itemAttributes)
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/removeItem', async (req, res) => {
  let item = {
    name: req.body.name,
    _id: req.body._id
  }
  try{
    output= await removeItem(item)
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/createBatch', async (req, res) => {
  let batchAttributes = {
    name: req.body.name,
    stock: req.body.stock,
  }
  try{
    output=await createBatch(batchAttributes)
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/removeBatch', async (req, res) => {
  let batchID = req.body._id;
  try{
    output=await removeBatch({_id: batchID})
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/batchStock', async (req, res) => {
  let batchID = req.body._id;
  let increment = req.body.stock;
  try{
    output= await batchStock({_id: batchID, stock: increment});
    res.send(output)
  } catch(e){
    console.error(e)
  }
})

app.post('/standardQuery', async (req, res) => {
  let query = req.body["sub"];
  try{
    list= await queryFromString(query)
    res.send(list)
  } catch(e){
    console.error(e)
  }
})

app.post('/batchesQuery', async (req, res) => {
  let query = req.body["sub"];
  try{
    batches= await queryForBatches({sub: query})
    res.send(batches)
  } catch(e){
    console.error(e)
  }
})

app.post('/roleQuery', async (req, res) => {
  try{
    roles = await roleQuery()
    res.send(roles)
  } catch(e){
    console.error(e)
  }
})

app.post('/accountQuery', async (req, res) => {
  try{
    accounts = await accountQuery()
    res.send(accounts)
  } catch(e){
    console.error(e)
  }
})

app.post('/batchesQuery', async (req, res) => {
  let query = req.body["sub"];
  try{
    batches= await queryForBatches({sub: query})
    res.send(batches)
  } catch(e){
    console.error(e)
  }
  batches= await queryForBatches({sub: query})
  res.send(batches)
})

app.post('/itemUpdate', async (req, res) => {
  let itemAttributes = {
    _id : req.body._id,
    name : req.body.name,
    description : req.body.description,
    category: req.body.category,
    price: req.body.price,
  };
  try{
    output=await itemUpdate(itemAttributes);
    res.send(output);
  } catch(e){
    console.error(e)
  }

})

app.post('/exportItems', async (req, res) => {
  try{
    let csvstring = await(exportToCSV())
    res.send(csvstring)
  } catch(e){
    console.error(e)
  }
})

app.post('/importCSV', async (req, res) => {
  let csvString = req.body.csvString
  try{
    await importFromCSV(csvString)
    res.send("import complete")
  } catch(e){
    console.error(e)
  }
})

app.post('/auditQuery', async (req, res) => {
  try{
    output = await auditQuery();
    res.send(output);
  } catch(e){
    console.error(e)
  }
})

app.post('/createRole', async (req, res) => {
  let roleAttributes = {
    role_name : req.body.role_name,
    description : req.body.description,
    display_name : req.body.display_name,
    Perms : req.body.Perms,
  };
  try{
    output = await createRole(roleAttributes);
    res.send(output);
  } catch(e){
    console.error(e)
  }
})

app.post('/createAccount', async (req, res) => {
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
    output = await createAccount(accountAttributes);
    res.send(output);
  } catch(e){
    console.error(e)
  }
})

app.set('port', port)
app.listen(port, () => {
  console.log(`The server is up!`)
})
