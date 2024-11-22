const express = require('express')
const app = express()
const port = 3000

const {queryForBatches} = require('./main.js')

async function wait(){

  app.get('/', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, name: Helmet}
    batches=await queryForBatches(req.name)
    */
    batches= await queryForBatches({_id: 1,name: "Chestplate"})
    res.send(batches)
  })
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()
