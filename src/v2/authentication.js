const getCSV = require('get-csv');

function getUserData() {
  return getCSV('https://docs.google.com/spreadsheets/d/1t2nV4B9I7TR8FUPA1d-sEN7K0hAP0DpTJJuSkW5Hym4/pub?gid=0&single=true&output=csv').then((users) => {
    return formatUserPermissions(users)
  })
}

function formatUserPermissions (users) {
  return users.map((user) => {
    user.allowed_apps = {
      read: user.read.split(',').map(t => t.toLowerCase().trim()),
      write: user.write.split(',').map(t => t.toLowerCase().trim())
    }
    delete user.write
    delete user.read
    return user
  })
}

module.exports = function authenticate (req, res) {
  let requesting_user = req.body.user
  
  getUserData().then(users => {
    let found_user = users.find((user) => {
      return user.username == requesting_user.username
    })

    if (!found_user) {
      res.status(404).send({error: 'Unknown user', username: requesting_user.username});
    }

    if (found_user.password === requesting_user.password) {
      res.send(found_user)
    } else {
      res.status(404).send({error: 'Unknown user', username: requesting_user.username});
    }
  })
}