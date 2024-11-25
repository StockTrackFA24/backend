const axios = require('axios');



/*
// This request will create a new placeholder object
axios.post('http://localhost:4000/createItem',  data={
    name: 'TestObject',
    description: 'This is a test to ensure routes are working.',
    category: 'Placeholder',
    price: 500,
    stock: 15,
  },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

 */

// This is a basic request that will fetch all the items in the entire database
axios.post('http://localhost:4000/standardQuery', data={
  sub: ""
},
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(function (response) {
  console.log(response);
})
    .catch(function (error) {
      console.log(error);
    });