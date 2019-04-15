// 导入mysql扩展

const mysql = require("mysql");

// 设置mysql连接的属性

let connect = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"chl123456789",
	database:"blog",
});

// mysql连接

connect.connect();

module.exports = connect;