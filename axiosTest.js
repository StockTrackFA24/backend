const axios = require('axios');


// This request will create a new placeholder object
/*
axios.post('http://localhost:4000/createItem',  data={
    name: "Test0123",
    description: 'This is a test to ensure routes are working.',
    category: 'Placeholder',
    price: 500,
    stock: 15
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


axios.post('http://localhost:4000/removeItem',  data={
  _id: 'PKNR7J00',
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
  name: 'Test01',
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
  _id: "813047045543",
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


// This is a basic request that will fetch all the items in the entire database
axios.post('http://localhost:4000/standardQuery', data={
  sub: "test"
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
  sub: "b"
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


axios.post('http://localhost:4000/removeBatch',  data={
  _id: "846247299823"
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


axios.post('http://localhost:4000/itemUpdate',  data={
  _id: "S6YPD8NW",
  name: "Test02",
  description: 'This is a test to ensure routes.',
  category: 'Place',
  price: 50,
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

