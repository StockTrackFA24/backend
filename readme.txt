This is a readme file for the backend it will cover how to setup and run the backend.

To start copy and paste .env.default rename .env.default to .env
Open .env and rename everything
MONGO_URI needs to be set equal to your mongodb cluster's connection string.
DB_Name is the name of your database.
the following collection variables are the name for each collection.
PASSWORD_PORT you just need the port to match the port in auth's env for port_internal

JWT_ALG set to the same JWT_ALG as in auth
JWT_PUB_KEY needs to be set to the public key you generated with auth

after you have setup and saved your env you just need to run routes.js
To do this you will have to navigate to the folder you have it saved in, then run 
npm i   this will install any dependencies required
node routes.js  this will run the backend