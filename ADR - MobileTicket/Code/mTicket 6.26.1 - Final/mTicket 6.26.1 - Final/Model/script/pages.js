var func = require("./functions.js");

module.exports = function (app, cookieParser, connection, request) {
    // SEND HTML FILES TO CLIENT
    app.get(["/PaginaPrincipal", "/", "/Sobre", "/HistoricoSenhas", "/Contactos", "/Configuracoes"], function (req, res) {

        request('https://webitcloud.net/PW/1617/ADR/index/html/Template.html').pipe(res);


        // res.sendFile(path.resolve('../../View/HMTL/Template.html'));


    });

    app.post("/getHomePage", function (req, res) {

        var user_Token = req.cookies.user_Token;


        if (user_Token != "") {
            connection.query("SELECT * FROM proj_funcionario WHERE token_funcionario = '" + user_Token + "';", function (err, rows1, fields) {

                if (rows1.length == 0) {

                    connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows2, fields) {

                        if (rows2.length == 1) {
                            var obj = {};

                            request({
                                url: 'https://webitcloud.net/PW/1617/ADR/index/html/Admin/HomePage.html',
                                json: true
                            }, function (error, response, body) {
                                if (!error) {
                                    obj.user = "admin";
                                    obj.page = body;
                                    res.send(obj);
                                }
                            });
                        } else if (rows2.length == 0) {
                            var obj = {};

                            request({
                                url: 'https://webitcloud.net/PW/1617/ADR/index/html/Client/HomePage.html',
                                json: true
                            }, function (error, response, body) {
                                if (!error) {
                                    obj.user = "client";
                                    obj.page = body;
                                    res.send(obj);
                                }
                            });
                        }
                    });




                } else if (rows1.length == 1) {

                    var obj = {};

                    request({
                        url: 'https://webitcloud.net/PW/1617/ADR/index/html/Employee/HomePage.html',
                        json: true
                    }, function (error, response, body) {
                        if (!error) {
                            obj.user = "employee";
                            obj.page = body;
                            res.send(obj);
                        }
                    });
                }

            });
        } else {

            var obj = {};

            request({
                url: 'https://webitcloud.net/PW/1617/ADR/index/html/Client/HomePage.html',
                json: true
            }, function (error, response, body) {
                if (!error) {
                    obj.user = "client";
                    obj.page = body;
                    res.send(obj);
                }
            });
        }

    });

    app.post("/getAbout", function (req, res) {

        request({
            url: 'https://webitcloud.net/PW/1617/ADR/index/html/About.html',
            json: true
        }, function (error, response, body) {
            if (!error) {
                res.send(body)
            }
        });

    });

    app.post("/getTicketHistory", function (req, res) {

        request({
            url: 'https://webitcloud.net/PW/1617/ADR/index/html/TicketHistory.html',
            json: true
        }, function (error, response, body) {
            if (!error) {
                res.send(body)
            }
        });

    });

    app.post("/getContacts", function (req, res) {

        request({
            url: 'https://webitcloud.net/PW/1617/ADR/index/html/Contacts.html',
            json: true
        }, function (error, response, body) {
            if (!error) {
                res.send(body)
            }
        });

    });

    app.post("/getConfig", function (req, res) {

        var user_Token = req.body.user_Token;
        var obj = {};

        connection.query("SELECT * FROM proj_cliente WHERE token_user='" + user_Token + "';", function (err, rows, fields) {
            if (rows.length == 1) {
                request({
                    url: 'https://webitcloud.net/PW/1617/ADR/index/html/Client/Config.html',
                    json: true
                }, function (error, response, body) {
                    if (!error) {
                        obj.user = "client";
                        obj.page = body;
                        res.send(obj);
                    }
                });
            } else {
                connection.query("SELECT * FROM proj_clienteGoogle WHERE token_user='" + user_Token + "';", function (err, rows, fields) {
                    if (!err) {
                        if (rows.length == 1) {
                            request({
                                url: 'https://webitcloud.net/PW/1617/ADR/index/html/Client/Config-Google.html',
                                json: true
                            }, function (error, response, body) {
                                if (!error) {
                                    obj.user = "client";
                                    obj.page = body;
                                    res.send(obj);
                                }
                            });
                        } else {
                            connection.query("SELECT * FROM proj_gestor WHERE token_gestor='" + user_Token + "';", function (err, rows, fields) {
                                if (!err) {
                                    if (rows.length == 1) {
                                        request({
                                            url: 'https://webitcloud.net/PW/1617/ADR/index/html/Admin/Config.html',
                                            json: true
                                        }, function (error, response, body) {
                                            if (!error) {
                                                obj.user = "admin";
                                                obj.page = body;
                                                res.send(obj);
                                            }
                                        });
                                    } else {
                                        request({
                                            url: 'https://webitcloud.net/PW/1617/ADR/index/html/Config.html',
                                            json: true
                                        }, function (error, response, body) {
                                            if (!error) {
                                                obj.user = "none";
                                                obj.page = body;
                                                res.send(obj);
                                            }
                                        });
                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                    } else {
                        console.log(err);
                    }
                });


            }
        });

    });
}