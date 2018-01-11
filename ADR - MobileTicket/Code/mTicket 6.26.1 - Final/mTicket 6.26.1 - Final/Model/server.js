var express = require("express");
var app = express();
var fs = require("fs");
var path = require('path');

var http = require("http");
var request = require("request");

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var tokenGenerator = require("uuid-token-generator");
var tokenG = new tokenGenerator();

var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "webitcloud.net",
    user: "webitclo_G503",
    password: "BD1617G503640",
    database: "webitclo_G503"
});
connection.connect();

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    host: 'cp26.webserver.pt',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'adr@webitcloud.net',
        pass: 'PW21617G502394'
    }
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var port = process.env.PORT || 3000;

module.exports = {
    connection: connection,
    request: request,
    transporter: transporter,
    tokenG: tokenG
}

var func = require("./script/functions.js");
func.startFillTimer();
func.fillServico();



require("./script/login.js")(app, cookieParser, connection, request);
require("./script/pages.js")(app, cookieParser, connection, request);
require("./script/mticket_api.js")(app, connection);
require("./script/users/common.js")(app, cookieParser, connection, request, transporter);
require("./script/users/client.js")(app, cookieParser, connection, request);
require("./script/users/admin.js")(app, cookieParser, connection, request);
require("./script/users/employee.js")(app, cookieParser, connection, request);


// START SERVER
app.listen(port, function () {

    var today = new Date();
    var hh = today.getHours() + 1;

    var min = today.getMinutes();

    var hour = hh + ":" + min;
    console.log("-----------------------------------------------------------------");
    console.log("Servidor em execucao: " + hour);
    console.log("-----------------------------------------------------------------");
});