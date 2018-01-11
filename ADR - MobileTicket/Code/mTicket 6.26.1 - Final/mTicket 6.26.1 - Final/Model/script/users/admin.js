var func = require("../functions.js");

module.exports = function (app, cookieParser, connection, request) {
    //GETS ALL SERVICES FOR ADMIN
    app.post("/getAdminServices", function (req, res) {

        var cookies = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookies.user_Token;


        connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 1) {
                    var text = "";
                    for (var i = 0; i < func.services.length; i++) {

                        var temp = func.services[i].nome_servico.split(" ");
                        var margin_top = 20 / temp.length;

                        text += "<div class='col-sm-12 w3-container w3-padding-16 w3-blue' style='margin-bottom: 15px; border: 1px solid gray'><div class='col-sm-2' style='margin-top:" + margin_top + "px; text-align:center'><span id='serviceName'>" + func.services[i].nome_servico + "</span></div><div class='col-sm-3'><center><div class='col-xs-12' style='width: 100%;'><span>Atual: </span></div><div class='col-xs-12'><span id='currentServiceNumber' class='numero'>" + func.services[i].fila_atual + func.services[i].senha_atual + "</span></div></center></div><div class='col-sm-3'><center><div class='col-xs-12' style='width: 100%;'><span>Total: </span></div><div class='col-xs-12'><span id='totalServiceNumber' class='numero'>" + func.services[i].fila_tirada + func.services[i].senhas_tiradas + "</span></div></center></div><div class='col-sm-4'><div class='col-xs-12'><button id='cSNUp' class='w3-button w3-border' service='" + func.services[i].id_servico + "' style='width: 100%;'><i class='fa fa-chevron-up fa-lg'></i></button></div><div class='col-xs-12'><button id='cSNDown' service='" + func.services[i].id_servico + "' class='w3-button w3-border' style='width: 100%;'><i class='fa fa-chevron-down fa-lg'></i></button></div></div></div>"
                    }

                    res.send(text);


                }
            } else {
                console.log(err)
            }

        });



    });

    // GET ADMIN CONFIG
    app.post("/adminConfig", function (req, res) {
        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        var obj = {};

        connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 1) {
                    obj.services = func.services;

                    connection.query("SELECT token_funcionario, nome_funcionario, email, id_servico FROM proj_funcionario;", function (err, rows, fields) {
                        if (!err) {
                            obj.employees = rows;

                            connection.query("SELECT latitude, longitude from proj_empresa WHERE id_empresa = 1;", function (err, rows, fields) {
                                if (!err) {
                                    obj.gps = rows[0];
                                    res.send(obj);
                                } else {
                                    console.log(err);
                                }
                            });

                        } else {
                            console.log(err);
                        }
                    });

                }
            } else {
                console.log(err)
            }
        });
    });

    // RESET TICKETS
    app.post("/adminResetTickets", function (req, res) {
        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 1) {
                    for (var i = 0; i < func.services.length; i++) {
                        func.services[i].fila_atual = "A";
                        func.services[i].senha_atual = 0;
                        func.services[i].fila_tirada = "A";
                        func.services[i].senhas_tiradas = 0;
                    }
                    func.updateDataBase();
                    connection.query("DELETE FROM proj_pedido");
                    connection.query("DELETE FROM proj_historico_func");
                    res.send("success");
                }
            } else {
                console.log(err)
            }
        });
    });

    // ADD SERVICE
    app.post("/adminAddService", function (req, res) {

        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        var new_Service = req.body.new_Service;
        func.updateDataBase(function () {
            connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
                if (!err) {
                    if (rows.length == 1) {
                        connection.query("SELECT * FROM proj_servico WHERE nome_servico = '" + new_Service + "';", function (err, rows, fields) {
                            if (!err) {
                                if (rows.length >= 1) {
                                    res.send("exists");
                                } else {
                                    connection.query("INSERT INTO proj_servico (nome_servico) VALUES ('" + new_Service + "');", function () {
                                        func.fillServico();
                                        res.send("success");
                                    });

                                }
                            }
                        });
                    }
                } else {
                    console.log(err)
                }
            });
        });
    });

    // REMOVE SERVICE
    app.post("/adminRemoveService", function (req, res) {

        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        var id_service = req.body.id_service;

        func.updateDataBase(function () {
            connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
                if (!err) {
                    if (rows.length == 1) {
                        connection.query("DELETE FROM proj_servico WHERE id_servico = " + id_service + ";", function () {
                            connection.query("DELETE FROM proj_pedido WHERE id_servico = " + id_service + ";", function () {
                                func.fillServico();
                                res.send("success");
                            });

                        });

                    }
                } else {
                    console.log(err)
                }
            });
        });



    });

    // ADD EMPLOYEE
    app.post("/adminAddEmployee", function (req, res) {

        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        var id_service = req.body.id_service;
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;

        func.generateToken(function (token) {
            connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
                if (!err) {
                    if (rows.length == 1) {
                        connection.query("SELECT proj_funcionario.email, proj_cliente.email, proj_clienteGoogle.email, proj_gestor.email FROM proj_funcionario, proj_cliente, proj_clienteGoogle, proj_gestor WHERE (proj_cliente.email = '" + email + "' OR proj_funcionario.email = '" + email + "' OR proj_clienteGoogle.email = '" + email + "' OR proj_gestor.email = '" + email + "');", function (err, rows, fields) {
                            if (!err) {
                                if (rows.length == 0) {
                                    connection.query("INSERT INTO proj_funcionario (token_funcionario, nome_funcionario, email, password, id_servico) VALUES ('" + token + "', '" + name + "', '" + email + "', '" + password + "', " + id_service + ");", function (err) {
                                        if (!err) {
                                            res.send("success");
                                        } else {
                                            console.log(err)
                                        }
                                    });
                                } else {
                                    res.send("exists");
                                }

                            } else {
                                console.log(err);
                            }

                        });
                    }
                } else {
                    console.log(err)
                }
            });
        });




    });

    //EDIT EMPLOYEE
    app.post("/adminEditEmployee", function (req, res) {

        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        var token_Employee = req.body.token_Employee;
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var id_service = req.body.id_service;

        connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 1) {
                    connection.query("SELECT * FROM proj_funcionario WHERE token_funcionario = '" + token_Employee + "';", function (err, rows, fields) {
                        if (name == "") {
                            name = rows[0].nome_funcionario;
                        }
                        if (email == "") {
                            email = rows[0].email;
                            if (password == "") {
                                password = rows[0].password;
                            }
                            if (id_service == "null") {
                                id_service = rows[0].id_servico;
                            }
                            connection.query("UPDATE proj_funcionario SET nome_funcionario = '" + name + "', email = '" + email + "', password = '" + password + "', id_servico = " + parseInt(id_service) + " WHERE token_funcionario = '" + token_Employee + "';", function (err, rows, fields) {
                                if (!err) {
                                    res.send("success");
                                }
                            });
                        } else {
                            connection.query("SELECT proj_funcionario.email, proj_cliente.email, proj_clienteGoogle.email, proj_gestor.email FROM proj_funcionario, proj_cliente, proj_clienteGoogle, proj_gestor WHERE (proj_cliente.email = '" + email + "' OR proj_funcionario.email = '" + email + "' OR proj_clienteGoogle.email = '" + email + "' OR proj_gestor.email = '" + email + "');", function (err, rows, fields) {
                                if (!err) {
                                    if (rows.length == 0) {
                                        if (password == "") {
                                            password = rows[0].password;
                                        }
                                        if (id_service == "null") {
                                            id_service = rows[0].id_servico;
                                        }
                                        connection.query("UPDATE proj_funcionario SET nome_funcionario = '" + name + "', email = '" + email + "', password = '" + password + "', id_servico = " + parseInt(id_service) + " WHERE token_funcionario = '" + token_Employee + "';", function (err, rows, fields) {
                                            if (!err) {
                                                res.send("success");
                                            }
                                        });
                                    } else {
                                        res.send("exists");
                                    }

                                } else {
                                    console.log(err);
                                }

                            });
                        }

                    });
                }
            } else {
                console.log(err)
            }
        });

    });

    // REMOVE EMPLOYEE
    app.post("/adminRemoveEmployee", function (req, res) {

        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        var token_Employee = req.body.token_Employee;

        connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 1) {
                    connection.query("DELETE FROM proj_funcionario WHERE token_funcionario = '" + token_Employee + "';", function () {
                        if (!err) {
                            res.send("success");
                        } else {
                            console.log(err);
                        }
                    });
                }
            } else {
                console.log(err)
            }
        });

    });

    //modifies the average waiting time of a service, it also deletes from proj_historico_media for a fresh average calculation
    app.post("/adminModifyAvg", function (req, res) {
        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        var id_service = req.body.id_service;
        var new_avg = req.body.new_avg;

        connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 1) {
                    connection.query("UPDATE proj_servico SET media_espera = " + parseInt(new_avg) + " WHERE id_servico = " + id_service + ";", function (err, rows, fields) {
                        if (!err) {
                            connection.query("DELETE FROM proj_historico_media WHERE id_servico = " + id_service + ";", function (err) {
                                if (!err) {
                                    res.send("success");
                                } else {
                                    console.log("DELETE " + err);
                                }
                            });

                        } else {
                            console.log(err);
                        }
                    });
                }
            } else {
                console.log(err)
            }
        });
    });

    //allows the admin to modify the max range witch a user is allowed to be from the company
    app.post("/adminModifyRange", function (req, res) {
        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;

        var new_range = req.body.new_range;

        connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 1) {
                    connection.query("UPDATE proj_empresa SET distancia = " + parseInt(new_range) + ";", function (err, rows, fields) {
                        if (!err) {
                            res.send("success");

                        } else {
                            console.log(err);
                        }
                    });
                }
            } else {
                console.log(err)
            }
        });
    });

    //EDIT COMPANY GPS COORDINATES
    app.post("/adminCompanyGPS", function (req, res) {

        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;

        connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 1) {
                    connection.query("UPDATE proj_empresa SET latitude ='" + latitude + "', longitude = '" + longitude + "' WHERE id_empresa = 1;", function (err, rows, fields) {
                        if (!err) {
                            res.send("success");
                        } else {
                            console.log(err);
                        }
                    });
                }
            } else {
                console.log(err)
            }
        });

    });
}