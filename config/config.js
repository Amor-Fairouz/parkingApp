module.exports = {
  "development": {
    "username": "postgres",
    "password": process.env.PG_PASSWORD,
    "database": "parking",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  },

  "test": {
    "username": "postgres",
    //"password": "postgres",
    "password": "BAC=jjQ95*",
    "database": "parking",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  },
  "production": {
    "username": "parking",
    "password": "BAC=jjQ95*",
    "database": "parking",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  },
  "local": {
    "username": "postgres",
    "password": "fay",
    "database": "parking",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  }
}
