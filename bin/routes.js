const express = require('express')
const app = express()
const port = 4000

const {createItem, removeItem, createBatch, removeBatch, batchStock, queryFromString, queryForBatches} = require('./main.js')

async function wait(){

  app.get('/createItem', async (req, res) => {
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
    list= await createItem(req.sub)
    */
    item= await createItem({
        _id: "SSSSSSSS",
        name: "Helmet",
        description: "A piece of Armor",
        category: "Armor",
        price: 100,
        stock: 3
    })
    res.send("Item Created")
  })

  app.get('/removeItem', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, name: "Helment"}
    list= await removeItem(req.name)
    */
    list= await removeItem("Helmet")
    res.send("Item deleted")
  })

  app.get('/createBatch', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {
    _id: doesn't matter,
    name: "Helmet",
    stock: 3
    }
    await queryFromString(req.sub)
    */
    await createBatch({
    _id: "SSSSSSSS",
    name: "Chestplate",
    stock: 3
    })
    res.send("Batch added")
  })

  app.get('/removeBatch', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    {_id: "123456789012"}   id=batchId you want to remove
    await removeBatch(req.sub)
    */
    await removeBatch({_id: "612203935449"})
    res.send("Removed a batch")
  })

  app.get('/batchStock', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: "123456789012", stock: 3}   batchID and stock decrease. If you want to increase put negative stock
    await batchStock(req.sub)
    */
    list= await batchStock({_id: "612203935449", stock: 1})
    res.send("Edited the batch's stock")
  })

  app.get('/standardQuery', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, sub: "Arm"}
    list= await queryFromString(req.sub)
    */
    list= await queryFromString("Boo")
    res.send(list)
  })

  app.get('/batchesQuery', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, sub: Helmet}
    batches=await queryForBatches(req.name)
    */
    batches= await queryForBatches({_id: 1,sub: "R"})
    res.send(batches)
  })
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()