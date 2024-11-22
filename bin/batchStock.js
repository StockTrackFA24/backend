const express = require('express')
const app = express()
const port = 3000

const {batchStock} = require('./main.js')

async function wait(){

  app.get('/', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: "123456789012", stock: 3}   batchID and stock decrease. If you want to increase put negative stock
    await batchStock(req.sub)
    */
    list= await batchStock({_id: "393051633867", stock: 1})
    res.send("Edited the batch's stock")
  })
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()