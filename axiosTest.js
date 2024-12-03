const axios = require('axios');

/*
// This request will create a new placeholder object
axios.post('http://localhost:4000/createItem',  data={
    name: "Test01",
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
  _id: '1A3WJIMK',
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

axios.post('http://localhost:4000/createBatch',  data={
  name: 'Test1',
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
  _id: "895098491006",
  stock: 16
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



axios.post('http://localhost:4000/removeBatch',  data={
  _id: "013805110083"
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
  _id: "F9BNVSVD",
  name: "Test01",
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
