const axios = require('axios');




axios.post('localhost:4000/standardQuery', {
    sub: 'R'
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });