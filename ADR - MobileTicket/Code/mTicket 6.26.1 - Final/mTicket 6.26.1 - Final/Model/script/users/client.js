var func = require("../functions.js");

module.exports = function (app, cookieParser, connection, request) {

    //gets the services and orders from a client
    app.post("/getServicesCostumer", function (req, res) {

        var cookie = cookieParser.JSONCookies(req.cookies)
        var user_Token = cookie.user_Token;
        var ticket_Tolerance = cookie.ticket_Tolerance;

        var today = new Date();
        var hh = today.getHours() + 1;
        var min = today.getMinutes();

        if (hh < 10) {
            hh = '0' + hh;
        }
        if (min < 10) {
            min = '0' + min;
        }

        var current_time = hh + ":" + min;

        var obj = {};
        obj.service = [];
        obj.status = [];

        var rService = [];
        var rOrder = [];
        rService.length = 0;
        rOrder.length = 0;
        rService = func.services;

        connection.query("SELECT id_pedido, id_servico, num_senha, fila, notify_Turn, notify_Tolerance, hora, dia, hora_vez FROM proj_pedido WHERE token_cliente = '" + user_Token + "'", function (err, rows, fields) {
            if (!err) {
                rOrder = rows;

                var text = "";
                text += "<div class='col-sm-12' style='padding-bottom: 15px;'><h2>Escolha um serviço</h2></div>";

                var color = "";

                for (var i = 0; i < rService.length; i++) {
                    var exists = false;

                    for (var k = 0; k < rOrder.length; k++) {
                        if (rService[i].id_servico == rOrder[k].id_servico) {

                            exists = true;
                            var hide = "";
                            var closePadding = "close-padding-bottom ";

                            var ticket_num = rOrder[k].num_senha;

                            var service_num = rService[i].fila + rService[i].senha_atual;


                            if (rService[i].fila_atual != rOrder[k].fila) {
                                ticket_num = ticket_num + 99;
                            }

                            if (ticket_num - rService[i].senha_atual >= 10) {
                                color = "w3-red";
                            } else if (ticket_num - rService[i].senha_atual >= 5) {
                                color = "w3-orange";
                            } else if (ticket_num - rService[i].senha_atual >= 1) {
                                color = "w3-yellow";
                            } else if (ticket_num - rService[i].senha_atual == 0) {
                                color = "w3-green";
                                hide = "hide";



                                closePadding = "";
                                if (parseInt(rOrder[k].notify_Turn) == 0) {
                                    obj.status.push("notifyTurn");
                                    obj.service.push("Chegou a sua vez em: " + rService[i].nome_servico);
                                    connection.query("UPDATE proj_pedido SET notify_Turn = 1, hora_vez = '" + current_time + "' WHERE token_cliente = '" + user_Token + "' AND id_pedido = " + rOrder[k].id_pedido + ";", function () {
                                        console.log("DONE")
                                    });
                                    var tempArray = rOrder[k].dia.split("/");
                                    var dateT1 = func.months[tempArray[1] - 1] + " " + tempArray[0] + ", " + tempArray[2];
                                    var T1 = new Date(dateT1 + " " + rOrder[k].hora);
                                    var dateT2 = func.months[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear();
                                    var T2 = new Date(dateT2 + " " + current_time);
                                    var diff = new Date();
                                    diff.setTime(T2 - T1);
                                    var wait_time = diff.getHours() * 60 + diff.getMinutes();

                                    connection.query("INSERT INTO proj_historico (id_servico, fila, token_cliente, num_senha, hora, dia, tempo_espera) VALUES(" + parseInt(rOrder[k].id_servico) + ", '" + rOrder[k].fila +
                                        "', '" + user_Token + "'," + rOrder[k].num_senha + ",'" + rOrder[k].hora + "', '" + rOrder[k].dia + "', " + wait_time + ");");

                                    connection.query("INSERT INTO proj_historico_media (id_servico, fila, token_cliente, num_senha, hora, dia, tempo_espera) VALUES(" + parseInt(rOrder[k].id_servico) + ", '" + rOrder[k].fila +
                                        "', '" + user_Token + "'," + rOrder[k].num_senha + ",'" + rOrder[k].hora + "', '" + rOrder[k].dia + "', " + wait_time + ");");
                                } else {
                                    var tempArray = rOrder[k].dia.split("/");
                                    var dateT1 = func.months[tempArray[1] - 1] + " " + tempArray[0] + ", " + tempArray[2];
                                    var T1 = new Date(dateT1 + " " + rOrder[k].hora_vez);
                                    var dateT2 = func.months[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear();
                                    var T2 = new Date(dateT2 + " " + current_time);
                                    var diff = new Date();
                                    diff.setTime(T2 - T1);

                                    if (diff.getHours() * 60 + diff.getMinutes() >= 10) {
                                        connection.query("DELETE FROM proj_pedido WHERE id_pedido = " + rOrder[k].id_pedido + ";");
                                    }
                                }



                            } else {
                                color = "w3-blue";
                            }

                            if (ticket_num - rService[i].senha_atual == ticket_Tolerance && parseInt(rOrder[k].notify_Tolerance) == 0) {
                                obj.status.push("notifyTolerance");
                                obj.service.push("Faltam " + ticket_Tolerance + " senhas para " + rService[i].nome_servico);
                                connection.query("UPDATE proj_pedido SET notify_Tolerance = 1 WHERE token_cliente = '" + user_Token + "' AND id_pedido = " + rOrder[k].id_pedido + ";");
                            }


                            var service_num = rService[i].fila_atual + rService[i].senha_atual;
                            var order_num = rOrder[k].fila + rOrder[k].num_senha;
                            var wait_time = rService[i].media_espera * (ticket_num - rService[i].senha_atual);

                            var temp = rService[i].nome_servico.split(" ");
                            var margin_top = 20 / temp.length;

                            text += "<div pedido='true' class='col-sm-12 servico w3-container w3-padding-16 " + closePadding + color +
                                "' style='margin-bottom: 15px; border: 1px solid gray;' value = '" +
                                rService[i].id_servico +
                                "'> <div class='col-xs-4 w3-left' style='margin-top:" + margin_top + "px; text-align:center'><span>" +
                                rService[i].nome_servico +
                                "</span></div><div class='col-xs-3 w3-middle'><div class='col-xs-6' style='width: 100%;'><span>Vez: </span></div><div class='col-xs-6'><span class='numero minhaVez'>" +
                                order_num +
                                "</span></div></div><div class='col-xs-3'><div class='col-xs-6' style='width: 100%;'><span>Atual: </span></div><div class='col-xs-6'><span class='numero numAtual'>" +
                                service_num + "</span></div></div><div class='col-xs-2 spanGlyph hide'><span class='plusG glyphicon glyphicon-plus'></span></div><div class='col-xs-12 " + hide + "'><center><p style='font-size:12px;'>Tempo médio de espera: " + wait_time + " min.</p></center></div></div>";

                        }
                    }

                    if (exists == false) {
                        color = "w3-blue";

                        var service_num = rService[i].fila_atual + rService[i].senha_atual;
                        var temp = rService[i].nome_servico.split(" ");
                        var margin_top = 20 / temp.length;

                        text += "<div pedido='false' class='col-sm-12 servico w3-container w3-padding-16 " + color +
                            "' style='margin-bottom: 15px; border: 1px solid gray; padding-bottom:16px;' value = '" + rService[i]
                            .id_servico + "'> <div class='col-xs-4 w3-left' style='margin-top:" + margin_top + "px; text-align:center'><span>" +
                            rService[i].nome_servico +
                            "</span></div><div class='col-xs-3 w3-middle'><div class='col-xs-6' style='width: 100%;'><span>Vez: </span></div><div class='col-xs-6'><span class='numero minhaVez'>...</span></div></div><div class='col-xs-3'><div class='col-xs-6' style='width: 100%;'><span>Atual: </span></div><div class='col-xs-6'><span class='numero numAtual'>" +
                            service_num + "</span></div></div><div class='col-xs-2 spanGlyph'><span class='plusG glyphicon glyphicon-plus'></span></div></div>";
                    }
                }

                obj.page = text;
                res.send(obj);

            } else {
                console.log(err);
            }
        });
    });

    //draw a ticket for the client
    app.post("/drawTicket", function (req, res) {
        var body = req.body;

        var user_Token = body.user_Token;
        var id_service = body.id_service;

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        var date = dd + '/' + mm + '/' + yyyy;

        var hh = today.getHours() + 1;

        if (hh < 10) {
            hh = '0' + hh;
        }

        var min = today.getMinutes();

        if (min < 10) {
            min = '0' + min;
        }

        var hour = hh + ":" + min;

        for (var i = 0; i < func.services.length; i++) {
            // console.log(parseInt(func.services[i].id_servico) == parseInt(id_service))
            if (parseInt(func.services[i].id_servico) == parseInt(id_service)) {

                var tickets_Drawn = parseInt(func.services[i].senhas_tiradas) + 1;

                var current_ticket = parseInt(func.services[i].senha_atual);
                var line = func.services[i].fila_tirada;
                var current_Line = func.services[i].fila_atual;

                if (tickets_Drawn == 100) {
                    tickets_Drawn = 1;
                    var index = letters.indexOf(line);
                    console.log(index, line, letters[index++]);
                    line = letters[index++];
                }

                func.services[i].senhas_tiradas = tickets_Drawn;
                func.services[i].fila_tirada = line;

                connection.query("INSERT INTO proj_pedido (id_servico, fila, token_cliente, num_senha, hora, dia) VALUES(" + parseInt(id_service) + ", '" + line +
                    "','" + user_Token + "'," + tickets_Drawn + ",'" + hour + "', '" + date + "');",
                    function (err2, rows, fields) {

                        if (!err2) {




                            var obj = {};
                            obj.ticket = line + tickets_Drawn;

                            if (line != current_Line) {
                                tickets_Drawn = tickets_Drawn + 99;
                            }

                            if (tickets_Drawn - current_ticket >= 10) {
                                obj.color = "w3-red";
                            } else if (tickets_Drawn - current_ticket >= 5) {
                                obj.color = "w3-orange";
                            } else if (tickets_Drawn - current_ticket >= 1) {
                                obj.color = "w3-yellow";
                            } else if (tickets_Drawn - current_ticket == 0) {
                                obj.color = "w3-green";
                            } else {
                                obj.color = "w3-blue";
                            }

                            connection.query("INSERT INTO proj_historico_func (id_servico, fila, token_cliente, num_senha, hora, dia) VALUES(" + parseInt(id_service) + ", '" + line +
                                "', '" + user_Token + "'," + tickets_Drawn + ",'" + hour + "', '" + date + "');");
                            func.updateDataBase();
                            res.send(obj);
                        } else {
                            console.log(err2);
                        }
                    });
            }
        }

    });

    //GET TICKET TOLERANCE FOR CLIENT
    app.post("/getTicketTolerance", function (req, res) {
        var user_Token = req.body.user_Token;

        connection.query("SELECT tolerancia_senhas FROM proj_cliente WHERE token_user = '" + user_Token + "';", function (err, rows, fields) {

            if (rows.length == 1) {
                var obj = {};
                obj.ticket_tolerance = rows[0].tolerancia_senhas;
                res.cookie("ticket_Tolerance", obj.ticket_tolerance).send(obj);
            } else {
                connection.query("SELECT tolerancia_senhas FROM proj_clienteGoogle WHERE token_user='" + user_Token + "';", function (err, rows, fields) {
                    if (rows.length == 1) {
                        var obj = {};
                        obj.ticket_tolerance = rows[0].tolerancia_senhas;
                        res.cookie("ticket_Tolerance", obj.ticket_tolerance).send(obj);
                    }
                });
            }



        });
    });

    //SET TICKET TOLERANCE FOR CLIENT
    app.post("/setTicketTolerance", function (req, res) {
        var user_Token = req.body.user_Token;
        var ticket_tolerance = req.body.ticket_tolerance;

        connection.query("UPDATE proj_cliente SET tolerancia_senhas = " + parseInt(ticket_tolerance) + " WHERE token_user = '" + user_Token + "';", function (err, rows, fields) {

            if (!err) {
                if (rows.affectedRows == 0) {
                    connection.query("UPDATE proj_clienteGoogle SET tolerancia_senhas = " + parseInt(ticket_tolerance) + " WHERE token_user = '" + user_Token + "';", function (err, rows, fields) {
                        if (!err) {
                            res.send("DONE");
                        }
                    });
                } else {
                    res.send("DONE");
                }

            } else {
                console.log(err)
            }



        });
    });

    //SET CLIENT USERNAME
    app.post("/setClientName", function (req, res) {
        var user_Token = req.body.user_Token;
        var new_Name = req.body.new_Name;

        connection.query("UPDATE proj_cliente SET nome_cliente = '" + new_Name + "' WHERE token_user = '" + user_Token + "';", function (err, rows, fields) {

            if (!err) {
                var names = new_Name.split(" ");
                res.send(names[0]);
            } else {
                console.log(err)
            }



        });
    });

    // SET CLIENT EMAIL
    app.post("/setClientEmail", function (req, res) {
        var user_Token = req.body.user_Token;
        var new_Email = req.body.new_Email;
        var old_Email = req.body.old_Email;

        var obj = {};

        connection.query("SELECT * FROM proj_cliente WHERE token_user = '" + user_Token + "' AND email = '" + old_Email + "';", function (err, rows, fields) {
            if (rows.length == 0) {
                obj.type = "error";
                obj.message = "Email atual não encontrado!"
                res.send(obj);
            } else {
                connection.query("SELECT proj_funcionario.email, proj_cliente.email, proj_clienteGoogle.email, proj_gestor.email FROM proj_funcionario, proj_cliente, proj_clienteGoogle, proj_gestor WHERE (proj_cliente.email = '" + new_Email + "' OR proj_funcionario.email = '" + new_Email + "' OR proj_clienteGoogle.email = '" + new_Email + "' OR proj_gestor.email = '" + new_Email + "');", function (err, rows, fields) {

                    if (rows.length == 0) {
                        connection.query("UPDATE proj_cliente SET email = '" + new_Email + "' WHERE token_user = '" + user_Token + "' AND email = '" + old_Email + "';", function (err, rows, fields) {
                            obj.type = "success";
                            obj.message = "Email atualizado com sucesso!"
                            res.send(obj);
                        });
                    } else {
                        obj.type = "error";
                        obj.message = "Email novo já se encontra em uso!"
                        res.send(obj);
                    }
                });
            }
        });

    });

    //SET CLIENT PASSWORD
    app.post("/setClientPassword", function (req, res) {
        var user_Token = req.body.user_Token;
        var new_Password = req.body.new_Password;
        var old_Password = req.body.old_Password;

        var obj = {};

        connection.query("SELECT * FROM proj_cliente WHERE token_user = '" + user_Token + "' AND password = '" + old_Password + "';", function (err, rows, fields) {
            if (rows.length == 0) {
                obj.type = "error";
                obj.message = "Password atual incorreta!"
                res.send(obj);
            } else {
                connection.query("UPDATE proj_cliente SET password = '" + new_Password + "' WHERE token_user = '" + user_Token + "' AND password = '" + old_Password + "';", function (err, rows, fields) {
                    obj.type = "success";
                    obj.message = "Password atualizada com sucesso!"
                    res.send(obj);
                });
            }
        });

    });
}