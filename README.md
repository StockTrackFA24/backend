This is a readme file for the backend, it will cover how to setup and run the backend.

Node.js can be downloaded from https://nodejs.org/en/download/prebuilt-installer.

MongoDB Community Server can be downloaded from https://www.mongodb.com/try/download/community. During the install process, also intall MongoDB Compass. Once installed, open Compass and create a new connection on the port of your choice and, within that connection, a database (i.e. named "StockTrack").

Before continuing, follow the setup instructions in the authentication service's readme file.

To start, make a copy of `.env.default` named `.env` and place it in the same directory as `.env.default`
Open .env and set the environment variables to match your MongoDB deployment and 
MONGO_URI needs to be set equal to your mongodb cluster's connection string.
DB_Name is the name of your database.
the following collection variables are the name for each collection. If collections with the given names do not exist, they will be created when needed.
PASSWORD_PORT must match the port in auth's env for port_internal

JWT_ALG set to the same JWT_ALG as in auth
JWT_PUB_KEY needs to be set to the public key you generated with auth that matches auth's private key

after you have setup and saved your env you just need to run routes.js
To do this you will have to navigate to the folder you have it saved in, then run 
npm i   this will install any dependencies required
node bin/routes.js  this will run the backend and will start the server on localhost port 4000

Note: make sure to run routes.js from the directory above bin (the one containing .env) so that the environment variables can be loaded properly.