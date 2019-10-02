var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'classmysql.engr.oregonstate.edu',
  user  : 'cs290_olginj',
  password: 'NWtx2048',
  database: 'cs290_olginj'
});

module.exports.pool = pool;
