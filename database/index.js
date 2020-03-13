const mysql = require('mysql')

const connect = mysql.createConnection({
    host    :'localhost',
    user    :'agus',
    password:'1234',
    database:'db_kop_v1',
    port    :'3305'
    // multipleStatements:true
});

module.exports = {
    myDB : connect
}