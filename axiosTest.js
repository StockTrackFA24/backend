const axios = require('axios');




// This request will create a new placeholder object
axios.post('http://localhost:4000/createItem',  data={
    name: 'TestO1',
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

/*
axios.post('http://localhost:4000/removeItem',  data={
  name: 'TestObject',
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


axios.post('http://localhost:4000/createBatch',  data={
  name: 'Helmet',
  stock: 3
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


axios.post('http://localhost:4000/batchStock',  data={
  _id: "806312733672",
  stock: 1
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


// This is a basic request that will fetch all the items in the entire database
axios.post('http://localhost:4000/standardQuery', data={
  sub: "R"
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


axios.post('http://localhost:4000/batchesQuery',  data={
  sub: "Helm"
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

/*
axios.post('http://localhost:4000/removeBatch',  data={
  _id: "806312733672"
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
