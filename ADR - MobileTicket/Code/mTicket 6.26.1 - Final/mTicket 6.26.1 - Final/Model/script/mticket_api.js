module.exports = function (app, connection) {
    app.post("/API_getServices", function (req, res) {
        if (req.body.service_name == undefined) {
            connection.query("SELECT * FROM proj_servico", function (err, rows, fields) {
                res.send(rows);
            });
        } else {
            connection.query("SELECT * FROM proj_servico WHERE nome_servico = '" + req.body.service_name + "'", function (err, rows, fields) {
                if (rows.length == 0) {
                    res.send(undefined);
                } else {
                    res.send(rows);
                }
            });
        }
    });

    app.post("/API_getTicketHistory", function (req, res) {
        connection.query("SELECT proj_historico.id_pedido, proj_servico.nome_servico, proj_historico.num_senha, proj_historico.fila, proj_historico.hora, proj_historico.dia FROM proj_servico, proj_historico WHERE proj_servico.id_servico = proj_historico.id_servico && proj_historico.id_servico = proj_servico.id_servico ORDER BY proj_historico.id_pedido DESC", function (err, rows, fields) {
            res.send(rows);
        });

    });
}