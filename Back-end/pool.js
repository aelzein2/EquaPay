// file used to connect to MYSQL database.

const mysql = require('mysql'); // imports mysql module

const pool = mysql.createPool({ // creates a pool of connections to the database
    connectionLimit: 10, // limit of 10 connections
    user: 'root',
    host: 'localhost',
    database: 'EquaPay',
    password: 'equapay123',
    port: 3306
});

  module.exports = pool; // exports the pool to be used in other files