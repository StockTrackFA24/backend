const {MongoClient} = require('mongodb');

async function main() {
    //not sure the best way to handle securely getting the uri for the mongo deployment
}

main().catch(console.error);


async function findOneListingByAttr(client, nameOfDatabase, nameOfCollection, attr, attrValue){
    let query = {};
    query[attr] = attrValue;
    const result=await client.db(nameOfDatabase).collection(nameOfCollection).findOne(query)

    if (result){
        console.log(`Found result with ${attr} ${attrValue}`)
        console.log(result)
    } else{
        console.log("No Result")
    }
}