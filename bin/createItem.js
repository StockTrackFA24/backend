const express = require('express')
const app = express()
const port = 3000

const {createItem} = require('./main.js')

async function wait(){

  app.get('/', async (req, res) => {
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
        name: "Books",
        description: "A piece of Armor",
        category: "Armor",
        price: 100,
        stock: 3
    })
    res.send("Item Created")
  })
  
  app.listen(port, () => {
    console.log(`The server is up!`)
  })

}

wait()