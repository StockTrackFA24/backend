const express = require('express')
const app = express()
const port = 3000

const {queryFromString} = require('./main.js')

async function wait(){

  app.get('/', async (req, res) => {
    /*  Working when recieving json value for req that we need to search
    example is {_id: doesn't matter, sub: "Arm"}
    list= await queryFromString(req.sub)
    */
    list= await queryFromString("Arm")
    res.send(list)
  })
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()
