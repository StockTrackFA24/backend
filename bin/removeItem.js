const express = require('express')
const app = express()
const port = 3000

const {removeItem} = require('./main.js')

async function wait(){

  app.get('/', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, name: "Helment"}
    list= await removeItem(req.name)
    */
    list= await removeItem("Helmet")
    res.send("Item deleted")
  })
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()