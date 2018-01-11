var func = require("./functions.js");

module.exports = function (app, cookieParser, connection, request) {
    // REGISTER A NEW CLIENT
    app.post("/registerCostumer", function (req, res) {

        var body = req.body;

        var name = body.name;
        var email = body.email;
        var psw = body.psw;

        func.generateToken(function (token) {
            connection.query("SELECT proj_funcionario.email, proj_cliente.email, proj_clienteGoogle.email, proj_gestor.email FROM proj_funcionario, proj_cliente, proj_clienteGoogle, proj_gestor WHERE (proj_cliente.email = '" + email + "' OR proj_funcionario.email = '" + email + "' OR proj_clienteGoogle.email = '" + email + "' OR proj_gestor.email = '" + email + "');", function (err, rows, fields) {
                if (!err) {
                    if (rows.length >= 1) {
                        var obj = {};
                        obj.message = "Este email já se encontra registado!";
                        res.send(obj);
                    } else if (rows.length == 0) {
                        connection.query("INSERT INTO proj_cliente (token_user, nome_cliente, email, password) VALUES ('" + token + "', '" + name + "', '" + email + "', '" + psw + "' );", function (err) {
                            if (!err) {
                                var obj = {};
                                obj.message = "login-true";
                                var fName = name.split(" ");
                                obj.user_Name = fName[0];
                                func.sendEmail("register", email);
                                res.cookie("user_Token", token).cookie("user_Name", fName[0]).cookie("ticket_Tolerance", 3).send(obj);
                            } else {
                                console.log(err);
                            }
                        });
                    }


                } else {
                    console.log(err);
                }
            });

        });

        // var token = gerarToken();




    });

    // LOGIN A CLIENT
    app.post("/login", function (req, res) {

        var body = req.body;

        var email = body.email;
        var psw = body.psw;

        connection.query("SELECT * FROM proj_cliente WHERE email='" + email + "' AND password = '" + psw + "'", function (err, rows, fields) {

            if (!err) {
                if (rows.length == 1) {
                    var obj = {};
                    obj.message = "login-true";
                    var fName = rows[0].nome_cliente.split(" ");
                    obj.user_Name = fName[0];
                    res.cookie("user_Token", rows[0].token_user).cookie("user_Name", fName[0]).cookie("ticket_Tolerance", rows[0].tolerancia_senhas).cookie("user_Type", "client").send(obj);
                } else if (rows.length == 0) {
                    connection.query("SELECT * FROM proj_funcionario WHERE email='" + email + "' AND password = '" + psw + "'", function (err, rows, fields) {
                        if (!err) {

                            if (rows.length == 1) {

                                var obj = {};
                                obj.message = "refresh_page";
                                var fName = rows[0].nome_funcionario.split(" ");
                                obj.user_Name = fName[0];
                                res.cookie("user_Token", rows[0].token_funcionario).cookie("user_Name", fName[0]).cookie("user_Type", "employee").send(obj);

                            } else if (rows.length == 0) {
                                connection.query("SELECT * FROM proj_gestor WHERE email='" + email + "' AND password = '" + psw + "'", function (err, rows, fields) {
                                    if (!err) {
                                        if (rows.length == 1) {

                                            var obj = {};
                                            obj.message = "refresh_page";
                                            var fName = rows[0].nome.split(" ");
                                            obj.user_Name = fName[0];
                                            res.cookie("user_Token", rows[0].token_gestor).cookie("user_Name", fName[0]).cookie("user_Type", "admin").send(obj);

                                        } else if (rows.length == 0) {
                                            res.send("login-false");
                                        }
                                    } else {
                                        console.log(err)
                                    }
                                });
                            }


                        } else {
                            console.log(err)
                        }
                    });

                }
            } else {
                console.log(err)
            }



        });

    });

    //GOOGLE AUTH
    app.post("/googleAuth", function (req, res) {
        var name = req.body.name;
        var email = req.body.email;
        var google_id = req.body.google_id;

        connection.query("SELECT * FROM proj_clienteGoogle WHERE google_id = '" + google_id + "'", function (err, rows, fields) {
            if (!err) {
                if (rows.length == 0) {
                    func.generateToken(function (token) {
                        connection.query("INSERT INTO proj_clienteGoogle (google_id, token_user, nome_cliente, email) VALUES ('" + google_id + "', '" + token + "', '" + name + "', '" + email + "');", function (err, rows, fields) {
                            if (!err) {
                                var obj = {};
                                obj.message = "login-true";
                                var fName = name.split(" ");
                                obj.user_Name = fName[0];
                                func.sendEmail("register", email);
                                res.cookie("user_Token", token).cookie("user_Name", fName[0]).cookie("ticket_Tolerance", 3).send(obj);
                            } else {
                                console.log(err)
                            }
                        });
                    });

                } else {
                    var obj = {};
                    obj.message = "login-true";
                    var fName = rows[0].nome_cliente.split(" ");
                    obj.user_Name = fName[0];
                    res.cookie("user_Token", rows[0].token_user).cookie("user_Name", fName[0]).cookie("ticket_Tolerance", rows[0].tolerancia_senhas).cookie("user_Type", "client").send(obj);
                }
            } else {
                console.log(err);
            }
        });
    });
}