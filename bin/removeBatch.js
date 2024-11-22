const express = require('express')
const app = express()
const port = 3000

const {removeBatch} = require('./main.js')

async function wait(){

  app.get('/', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    {_id: "123456789012"}   id=batchId you want to remove
    await removeBatch(req.sub)
    */
    await removeBatch({_id: "562560138076"})
    res.send("Removed a batch")
  })
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()