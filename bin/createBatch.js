const express = require('express')
const app = express()
const port = 3000

const {createBatch} = require('./main.js')

async function wait(){

  app.get('/', async (req, res) => {
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
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()