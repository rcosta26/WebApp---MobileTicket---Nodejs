var func = require("../functions.js");

module.exports = function (app, cookieParser, connection, request, transporter) {

    //sends the ticket history
    app.post("/ticketHistory", function (req, res) {



        var body = req.body;
        var user_Token = body.user_Token;



        connection.query("SELECT id_servico FROM proj_funcionario WHERE token_funcionario = '" + user_Token + "'", function (err, rows, fields) {

            if (rows.length >= 1) {
                var id_service = rows[0].id_servico;

                connection.query("SELECT proj_historico.id_pedido, id_servico, proj_historico.num_senha, proj_historico.fila, proj_historico.hora, proj_historico.dia, proj_historico.tempo_espera FROM proj_historico WHERE proj_historico.id_servico = " + id_service + ";", function (err, rows, fields) {
                    var obj = {};
                    obj.type_User = "employee";
                    obj.services = func.services;
                    obj.history = rows;
                    res.send(obj);

                });

            } else {

                connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
                    if (!err) {
                        if (rows.length >= 1) {
                            connection.query("SELECT proj_historico.id_pedido, id_servico, proj_historico.num_senha, proj_historico.fila, proj_historico.hora, proj_historico.dia, proj_historico.tempo_espera FROM proj_historico ORDER BY proj_historico.id_pedido DESC", function (err, rows, fields) {
                                if (!err) {
                                    var obj = {};
                                    obj.type_User = "admin";
                                    obj.services = func.services;
                                    obj.history = rows;
                                    res.send(obj);
                                } else {
                                    console.log(err);
                                }

                            });
                        } else {
                            connection.query("SELECT proj_historico.id_pedido, proj_historico.id_servico, proj_historico.num_senha, proj_historico.fila, proj_historico.hora, proj_historico.dia, proj_historico.tempo_espera FROM proj_historico WHERE proj_historico.token_cliente = '" + user_Token + "' ORDER BY proj_historico.id_pedido DESC", function (err, rows, fields) {
                                if (!err) {
                                    var obj = {};
                                    obj.type_User = "client";
                                    obj.services = func.services;
                                    obj.history = rows;
                                    res.send(obj);
                                } else {
                                    console.log(err);
                                }

                            });
                        }
                    }
                });


            }

        });



    });

    //EMPLOYEE AND ADMIN UPDATE SERVICE NUMBER
    app.post("/updateServiceNumber", function (req, res) {

        var user_Token = req.body.user_Token;
        var method = req.body.method;
        var id_service = req.body.id_service;

        connection.query("SELECT id_servico FROM proj_funcionario WHERE token_funcionario = '" + user_Token + "';", function (err, rows, fields) {
            if (!err) {


                if (rows.length == 0) {
                    connection.query("SELECT * FROM proj_gestor WHERE token_gestor = '" + user_Token + "';", function (err, rows, fields) {
                        if (!err) {
                            if (rows.length == 1) {

                                for (var i = 0; i < func.services.length; i++) {

                                    if (parseInt(func.services[i].id_servico) == parseInt(id_service)) {
                                        var current_Line = func.services[i].fila_atual;
                                        var current_Ticket = func.services[i].senha_atual;
                                        var total_Line = func.services[i].fila_tirada;
                                        var total_Ticket = func.services[i].senhas_tiradas;
                                        var current_Order = func.services[i].senha_atual;

                                        if (method == "-") {
                                            current_Ticket--;
                                            if (current_Ticket <= 0) {
                                                current_Ticket = 99;
                                                var index = func.letters.indexOf(current_Line);
                                                index--;
                                                if (index < 0) {
                                                    index = func.letters.length - 1;
                                                }
                                                current_Line = func.letters[index];
                                            }
                                        } else if (method == "+") {

                                            current_Ticket++;
                                            if (current_Ticket >= 100) {
                                                current_Ticket = 1;
                                                var index = func.letters.indexOf(current_Line);
                                                index++
                                                if (index > func.letters.length - 1) {
                                                    index = 0;
                                                }
                                                current_Line = func.letters[index];
                                            }
                                        }


                                        if ((current_Line == total_Line && current_Ticket <= total_Ticket) || (func.letters.indexOf(current_Line) < func.letters.indexOf(total_Line) && current_Ticket < total_Ticket + 99)) {
                                            func.services[i].senha_atual = current_Ticket;
                                            func.services[i].fila_atual = current_Line;
                                            if (method == "+") {
                                                connection.query("DELETE FROM proj_pedido WHERE id_servico = " + id_service + " AND fila = '" + current_Line + "' AND num_senha = " + current_Order + ";");
                                            }

                                            var obj = current_Line + current_Ticket;

                                            func.updateDataBase();
                                            res.send(obj);
                                        }
                                    }

                                }

                            }
                        } else {
                            console.log(err);
                        }

                    });
                } else {
                    id_service = rows[0].id_servico;
                    for (var i = 0; i < func.services.length; i++) {
                        if (parseInt(func.services[i].id_servico) == parseInt(id_service)) {
                            var current_Line = func.services[i].fila_atual;
                            var current_Ticket = func.services[i].senha_atual;
                            var total_Line = func.services[i].fila_tirada;
                            var total_Ticket = func.services[i].senhas_tiradas;
                            var current_Order = func.services[i].senha_atual;

                            if (method == "-") {
                                current_Ticket--;
                                if (current_Ticket <= 0) {
                                    current_Ticket = 99;
                                    var index = func.letters.indexOf(current_Line);
                                    index--;
                                    if (index < 0) {
                                        index = func.letters.length - 1;
                                    }
                                    current_Line = func.letters[index];
                                }
                            } else if (method == "+") {

                                current_Ticket++;
                                if (current_Ticket >= 100) {
                                    current_Ticket = 1;
                                    var index = func.letters.indexOf(current_Line);
                                    index++
                                    if (index > func.letters.length - 1) {
                                        index = 0;
                                    }
                                    current_Line = func.letters[index];
                                }
                            }



                            if ((current_Line == total_Line && current_Ticket <= total_Ticket) || (func.letters.indexOf(current_Line) < func.letters.indexOf(total_Line) && current_Ticket < total_Ticket + 99)) {
                                func.services[i].senha_atual = current_Ticket;
                                func.services[i].fila_atual = current_Line;
                                if (method == "+") {
                                    connection.query("DELETE FROM proj_pedido WHERE id_servico = " + id_service + " AND fila = '" + current_Line + "' AND num_senha = " + current_Order + ";");
                                }

                                var obj = current_Line + current_Ticket;
                                func.updateDataBase();
                                res.send(obj);
                            }
                        }
                    }



                }

            } else {
                console.log(err);
            }




        });

    });

    //sends the company GPS to the client
    app.post("/giveCompanyGPS", function (req, res) {
        connection.query("SELECT latitude, longitude, distancia from proj_empresa WHERE id_empresa = 1;", function (err, rows, fields) {
            if (!err) {
                res.send(rows[0]);
            } else {
                console.log(err);
            }
        });
    });

    //resets the users password and sends an email with a new one
    app.post("/resetPassword", function (req, res) {
        var email = req.body.email;

        connection.query("SELECT * FROM proj_cliente WHERE email = '" + email + "'", function (err, rows, fields) {
            if (!err) {
                if (rows.length != 0) {
                    func.sendEmail("resetPsw", email, function (result) {
                        if (result == "success") {
                            var obj = {};
                            obj.message = "Password redifinida, consulte o seu email para mais informações!";
                            obj.status = "success";
                            res.send(obj);
                        } else {
                            var obj = {};
                            obj.message = "Erro!";
                            obj.status = "error";
                            res.send(obj);
                        }

                    });

                } else {
                    var obj = {};
                    obj.message = "Email não encontrado! Nota: Não é possível recuperar a password de contas com sessão iniciada através da Google!";
                    obj.status = "error";
                    res.send(obj);
                }
            } else {
                console.log(err);
            }
        });
    });

    //sends an email from the "Contactos" form to our email adress : mobileticket2017@gmail.com
    app.post("/sendEmail", function (req, res) {
        var email = req.body.email;
        var name = req.body.name;
        var subject = req.body.subject;
        var message = req.body.message;

        var emailUrl1 = 'https://webitcloud.net/PW/1617/ADR/index/html/Email/email_pt1.html';
        var emailUrl2 = 'https://webitcloud.net/PW/1617/ADR/index/html/Email/email_pt2.html';

        var text = "";

        request({
            url: emailUrl1,
            json: true
        }, function (error, response, body) {
            if (!error) {
                text += body;


                text += "<p><b>Mensagem enviada por:</b></p><p>" + name + "</p><p><b>Email:</b></p><p>" + email + "</p><p><b>Assunto:</b></p><p>" + subject + "</p><p><b>Mensagem:</b></p><p>" + message + "</p>";

                request({
                    url: emailUrl2,
                    json: true
                }, function (error, response, body) {
                    if (!error) {

                        text += body;

                        var mailOptions = {
                            from: 'adr@webitcloud.net', // sender address
                            to: 'mobileticket2017@gmail.com', // list of receivers
                            subject: subject, // Subject line
                            html: text // html body
                        };
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            } else {
                                res.send("success");
                            }
                        });

                    }
                });
            }
        });


    });

    //sends firebase configurations to client
    app.post("/configFireBase", function (req, res) {
        var config = {
            apiKey: "AIzaSyC8c4JLtv80UtLEdO9-uTe1TfXTLC-VldM",
            authDomain: "mobileticket-163513.firebaseapp.com",
            databaseURL: "https://mobileticket-163513.firebaseio.com",
            projectId: "mobileticket-163513",
            storageBucket: "mobileticket-163513.appspot.com",
            messagingSenderId: "771728806005"
        };
        res.send(config);
    });

    // sends manifest to client
    app.get("/manifest", function (req, res) {
        var manifest = {
            "name": "MobileTicket",
            "short_name": "MobileTicket",
            "start_url": "https://mticket.herokuapp.com",
            "display": "standalone",
            "background_color": "#fff",
            "description": "Aplicação de gestão de senhas online",
            "icons": [{ 
                    "src": "https://webitcloud.net/PW/1617/ADR/index/resources/logoMT.png",
                    "sizes": "48x48",
                    "type": "image/png"
                },
                {
                    "src": "https://webitcloud.net/PW/1617/ADR/index/resources/logoMT.png",
                    "sizes": "72x72",
                    "type": "image/png"
                },
                {
                    "src": "https://webitcloud.net/PW/1617/ADR/index/resources/logoMT.png",
                    "sizes": "96x96",
                    "type": "image/png"
                },
                {
                    "src": "https://webitcloud.net/PW/1617/ADR/index/resources/logoMT.png",
                    "sizes": "144x144",
                    "type": "image/png"
                },
                {
                    "src": "https://webitcloud.net/PW/1617/ADR/index/resources/logoMT.png",
                    "sizes": "168x168",
                    "type": "image/png"
                },
                {
                    "src": "https://webitcloud.net/PW/1617/ADR/index/resources/logoMT.png",
                    "sizes": "192x192",
                    "type": "image/png"
                }
            ]
        };

        res.send(manifest);
    });
}