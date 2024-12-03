const express = require('express')
const app = express()
const port = 4000

app.use(express.json())

const {createItem, removeItem, createBatch, removeBatch, batchStock, queryFromString, queryForBatches, exportToCSV, itemUpdate} = require('./main.js')

async function wait(){

  app.post('/createItem', async (req, res) => {
    /*  Working when recieving json value for req that we need to create
    example is 
    {
        _id: will be overwritten,
        name: varName,
        description: varDescription,
        category: varCategory,
        price: varPrice,
        stock: varStock
    }
    */

    let itemAttributes = {
      name : req.body.name,
      description : req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
    };
    output=await createItem(itemAttributes);

    res.send(output);

  })

  app.post('/removeItem', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, name: "Helment"}
    list= await removeItem(req.name)
    */

    let item = {
      name: req.body.name,
      _id: req.body._id
    }
    output= await removeItem(item)
    res.send(output)
  })

  app.post('/createBatch', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {
    _id: doesn't matter,
    name: "Helmet",
    stock: 3
    }
    await queryFromString(req.sub)
    */
    let batchAttributes = {
      name: req.body.name,
      stock: req.body.stock,
    }

    output=await createBatch(batchAttributes)
    res.send(output)
  })

  app.post('/removeBatch', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    {_id: "123456789012"}   id=batchId you want to remove
    await removeBatch(req.sub)
    */
    let batchID = req.body._id;
    output=await removeBatch({_id: batchID})
    res.send(output)
  })

  //Add more error checking for if batch goes to or below 0
  app.post('/batchStock', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: "123456789012", stock: 3}   batchID and stock decrease. If you want to increase put negative stock
    await batchStock(req.sub)
    */
    let batchID = req.body._id;
    let increment = req.body.stock;
    output= await batchStock({_id: batchID, stock: increment});
    res.send(output)
  })

  app.post('/standardQuery', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, sub: "Arm"}
    list= await queryFromString(req.sub)
    */
    let query = req.body["sub"];
    list= await queryFromString(query)
    res.send(list)
  })

  app.post('/batchesQuery', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, sub: Helmet}
    batches=await queryForBatches(req.name)
    */
    let query = req.body["sub"];
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
    output=await itemUpdate(itemAttributes);

    res.send(output);

  })

  app.post('/exportItems', async (req, res) => {
    let csvstring = await(exportToCSV())
    res.send(csvstring)
  })
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()