var func = require("../functions.js");

module.exports = function (app, cookieParser, connection, request) {
    //GET SERVICE ASSOCIATED WITH EMPLOYEE
    app.post("/getEmployeeServices", function (req, res) {

        var user_Token = req.body.user_Token;

        var page = {};

        var id_service;

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

        connection.query("SELECT id_servico FROM proj_funcionario WHERE token_funcionario = '" + user_Token + "';", function (err, rows, fields) {

            if (rows.length > 0) {
                id_service = parseInt(rows[0].id_servico);
                var exists = false;
                for (var i = 0; i < func.services.length; i++) {

                    if (parseInt(func.services[i].id_servico) == parseInt(id_service)) {
                        exists = true;
                        page.serviceName = func.services[i].nome_servico;
                        page.current_Num = func.services[i].senha_atual;
                        page.total_Num = func.services[i].senhas_tiradas;
                        page.current_Line = func.services[i].fila_atual;
                        page.total_Line = func.services[i].fila_tirada;

                        var parameters = "";
                        var index = func.letters.indexOf(page.current_Line);
                        index++;
                        for (var i = index; i < func.letters.length; i++) {
                            if (i == index) {
                                parameters += "('" + func.letters[i] + "',";
                            } else if (i == func.letters.length - 1) {
                                parameters += " '" + func.letters[i] + "')";
                            } else {
                                parameters += " '" + func.letters[i] + "',";
                            }

                        }

                        var text = '<tbody><tr><th>ID</th><th>Senha</th><th>Hora</th><th>Dia</th></tr>';
                        connection.query("SELECT id_pedido, num_senha, fila, hora, dia FROM proj_historico_func WHERE id_servico = " + id_service + " AND num_senha >= " + page.current_Num + " AND fila = '" + page.current_Line + "' AND dia = '" + date + "';", function (err, rows1, fields) {
                            if (!err) {
                                if (rows.length > 0) {
                                    for (var i = 0; i < rows1.length; i++) {
                                        text += "<tr><td>" + rows1[i].id_pedido + "</td><td>" +
                                            (rows1[i].fila + rows1[i].num_senha) + "</td><td>" + rows1[i].hora + "</td><td>" + rows1[i].dia +
                                            "</td></tr>"
                                    }

                                    connection.query("SELECT id_pedido, num_senha, fila, hora, dia FROM proj_historico WHERE id_servico = " + id_service + " AND fila IN" + parameters + " AND dia = '" + date + "';", function (err, rows2, fields) {

                                        if (rows2 != undefined) {
                                            for (var i = 0; i < rows2.length; i++) {
                                                text += "<tr><td>" + rows2[i].id_pedido + "</td><td>" +
                                                    (rows2[i].fila + rows2[i].num_senha) + "</td><td>" + rows2[i].hora + "</td><td>" + rows2[i].dia +
                                                    "</td></tr>"
                                            }
                                        }





                                        text += "</tbody>";

                                        page.requests = text;
                                        page.status = "success";
                                        res.send(page);

                                    });
                                } else {
                                    page.status = "error";
                                    res.send(page)
                                }

                            } else {
                                console.log(err);
                            }


                        });
                    }
                    if (i == func.services.length - 1 && exists == false) {
                        page.status = "error";
                        res.send(page)
                    }
                }
            }



        });

    });
}