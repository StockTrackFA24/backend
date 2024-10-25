const {MongoClient} = require('mongodb');
require('dotenv').config()

const nameOfDatabase="CurrentProject"
const catalogCollection="Catalog"
const stockCollection="Stock"

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = process.env.MONGO_URI
 
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        varId=0
        varName="Helmet"
        varDescription="A piece of Armor used to proctect your head"
        varCategory="Armor"
        varPrice=150
        //Add Listings
        //Generate SKU Id for new item
        while (true){
            SKU=""
            for (i=0; i<8; i++){
                rand=Math.floor(Math.random()*36)
                console.log(String(rand))
                if (rand<10){
                    SKU=SKU.concat(String(rand))
                }
                else{
                    rand=rand+55
                    SKU=SKU.concat(String.fromCharCode(rand))
                }
            }
            console.log(SKU)
            contains=await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: SKU})
            if (!contains){
                varId=SKU
                break
            }
        }
        await createItem(client, {
            _id: varId,
            name: varName,
            description: varDescription,
            catergory: varCategory,
            price: varPrice
        }, {
            _id: varId,
            stock: 0
        })

        //Remove any item given an id
        await removeItem(client, "43PVLBIA")
       
        //Get the stock of specific Item of Id
        await getStock(client, 0)

        //Update the stock of Specific item of Id, by value x, true if overwrite, false if additive
        await updateStock(client,0,4,true)

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//Create a new item in the catalog
async function createItem(client, newCatalog, newStock){
    const result=await client.db(nameOfDatabase).collection(catalogCollection).insertOne(newCatalog)
    await client.db(nameOfDatabase).collection(stockCollection).insertOne(newStock)

    console.log(`New Listing made with id of: ${result.insertedId}`)
}

//Remove item from Catalog given the id
async function removeItem(client, removeCatalog){
    await client.db(nameOfDatabase).collection(catalogCollection).deleteOne({_id: removeCatalog})
    await client.db(nameOfDatabase).collection(stockCollection).deleteOne({_id: removeCatalog})
}


//get the stock of an item given the id
async function getStock(client, id){
    stock= await client.db(nameOfDatabase).collection(stockCollection).findOne({_id: id})
    if (stock){
        console.log(stock.stock)
    }
    else{
        console.log("Error getStock, id not found")
    }
}

//Update the stock of an item given the id
async function updateStock(client, id, newStock, overwrite){
    if (overwrite){
        stock= await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: id},{$set: {stock: newStock}})
    }
    else{
        stock= await client.db(nameOfDatabase).collection(stockCollection).updateOne({_id: id},{$set: {stock: newStock+stock.stock}})
    }
}

main()