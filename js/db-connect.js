const mysql = require('mysql');

module.exports.pool = mysql.createPool({
    host:'localhost',
    port:'3306',
    user:'root',
    password:'',
    database:'data'
});




