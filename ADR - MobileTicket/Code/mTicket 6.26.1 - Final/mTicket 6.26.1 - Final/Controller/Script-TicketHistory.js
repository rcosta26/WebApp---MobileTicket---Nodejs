function runScriptTicketHistory() {


    $(document).ready(function () {

        $("#sbHistoricoSenhas").addClass("w3-blue");

        $(window).on('resize', function () {
            try {
                var service_name = $("#comboBoxTHServices").find(":selected").val();
                var initial_date = $("#thInitialDate").val();
                var final_date = $("#thFinalDate").val();
                filterTable(service_name, initial_date, final_date);
            } catch (msg) {

            }

        });

        $("#comboBoxTHResultNumber").change(function () {
            makeTableScroll();
        });

        $("#comboBoxTHServices, #thInitialDate, #thFinalDate").change(function () {
            var service_name = $("#comboBoxTHServices").find(":selected").val();
            var initial_date = $("#thInitialDate").val();
            var final_date = $("#thFinalDate").val();
            filterTable(service_name, initial_date, final_date);
        });

        initTable();
        darkMode();

    });

    var tHistory = [];
    var services = [];
    var tempHistory1 = [];
    var tempHistory2 = [];
    var tempHistory3 = [];
    var show = false;

    function initTable() {

        $("#hsPage").html("");
        $("#hsTable").html("");

        var user_Token = getCookie("user_Token");
        var obj = {};
        obj.user_Token = user_Token;

        if (user_Token != "") {
            $.ajax({
                type: 'POST',
                url: '/ticketHistory',
                data: obj

            }).done(function (data) {
                if (data.type_User == "employee") {
                    $("#divSelectServiceTh").hide();
                } else {
                    $("#divSelectServiceTh").show();
                }
                if (data.history.length == 0) {
                    $("#thConfigDiv").addClass("hide");
                    $("#hsPage").html("O seu histórico de senhas encontra-se vazio!");
                } else {

                    tHistory = data.history;
                    services = data.services;
                    TableSize(tHistory, services);
                    selectValues();
                }
            });
        } else {
            $("#thConfigDiv").addClass("hide");
            $("#hsPage").html("Inicie sessão para aceder ao seu histórico de senhas!");
        }

    }

    function filterTable(service_name, initial_date, final_date) {
        tempHistory1.length = 0;
        tempHistory2.length = 0;
        tempHistory3.length = 0;

        var iDate;
        var fDate;

        if (initial_date != "") {
            var arrayInitDate = initial_date.split("-");
            iDate = new Date(arrayInitDate[0], arrayInitDate[1] - 1, arrayInitDate[2]);

        }

        if (final_date != "") {
            var arrayFinalDate = final_date.split("-");
            fDate = new Date(arrayFinalDate[0], arrayFinalDate[1] - 1, arrayFinalDate[2]);
        }

        for (var i = 0; i < tHistory.length; i++) {

            if (service_name != "null") {
                for (var k = 0; k < services.length; k++) {
                    if (services[k].nome_servico == service_name && services[k].id_servico == tHistory[i].id_servico) {
                        tempHistory1.push(tHistory[i]);
                    }
                }
            } else {
                tempHistory1.push(tHistory[i]);
            }


        }


        for (var i = 0; i < tempHistory1.length; i++) {

            var arrayCheckDate = tempHistory1[i].dia.split("/");
            var cDate = new Date(arrayCheckDate[2], arrayCheckDate[1] - 1, arrayCheckDate[0]);

            if (initial_date != "") {
                if (cDate >= iDate) {
                    tempHistory2.push(tempHistory1[i]);
                }
            } else {
                tempHistory2.push(tempHistory1[i]);
            }
        }
        for (var i = 0; i < tempHistory2.length; i++) {
            var arrayCheckDate = tempHistory2[i].dia.split("/");
            var cDate = new Date(arrayCheckDate[2], arrayCheckDate[1] - 1, arrayCheckDate[0]);
            if (final_date != "") {
                if (cDate <= fDate) {
                    tempHistory3.push(tempHistory2[i]);
                }
            } else {
                tempHistory3.push(tempHistory2[i]);
            }
        }
        show = true;
        TableSize(tempHistory3, services);
    }

    function selectValues() {
        var servicesCB = [];
        var text = "";
        text += "<option value='null'>Escolha um serviço</option>";
        for (var i = 0; i < services.length; i++) {
            if (servicesCB.indexOf(services[i].nome_servico) == -1) {
                servicesCB.push(services[i].nome_servico);
                text += "<option value='" + services[i].nome_servico + "'>" + services[i].nome_servico +
                    "</option>";
            }
        }
        $("#comboBoxTHServices").html(text);
    }


    function TableSize(array, arrayServices) {

        if ($(window).width() <= 992) {
            var text = "";
            for (var i = 0; i < array.length; i++) {
                var exists = false;
                for (var k = 0; k < arrayServices.length; k++) {
                    if (array[i].id_servico == arrayServices[k].id_servico) {
                        exists = true;
                        text += "<tbody class='w3-border'><tr><th>ID</th><td>" + array[i].id_pedido +
                            "</td></tr><tr><th>Servico</th><td>" + arrayServices[k].nome_servico +
                            "</td></tr><tr><th>Ticket</th><td>" + array[i].fila + array[i].num_senha +
                            "</td></tr><tr><th>Hora</th><td>" +
                            array[i].hora + "</td></tr><tr><th>Data</th><td>" + array[i].dia +
                            "</td></tr><tr><th>Tempo espera</th><td>" + array[i].tempo_espera +
                            "</td></tr></tbody>";
                    }

                }
                if (exists == false) {
                    text += "<tbody class='w3-border'><tr><th>ID</th><td>" + array[i].id_pedido +
                        "</td></tr><tr><th>Servico</th><td>Desconhecido</td></tr><tr><th>Ticket</th><td>" +
                        array[i].fila + array[i].num_senha +
                        "</td></tr><tr><th>Hora</th><td>" +
                        array[i].hora + "</td></tr><tr><th>Data</th><td>" + array[i].dia +
                        "</td></tr><tr><th>Tempo espera</th><td>" + array[i].tempo_espera +
                        "</td></tr></tbody>";
                }

            }
            $("#hsTable").html(text);
            makeTableScroll();

        } else {

            if (array.length > 0 || show == true) {
                var text = "";
                text +=
                    "<tbody><tr><th>ID</th><th>Serviço</th><th>Ticket</th><th>Hora</th><th>Data</th><th>Tempo espera</th></tr>";

                for (var i = 0; i < array.length; i++) {
                    var exists = false;
                    for (var k = 0; k < arrayServices.length; k++) {
                        if (array[i].id_servico == arrayServices[k].id_servico) {
                            exists = true;
                            text += "<tr><td>" + array[i].id_pedido + "</td><td>" + arrayServices[k].nome_servico +
                                "</td><td>" + array[i].fila +
                                array[i].num_senha + "</td><td>" + array[i].hora + "</td><td>" + array[i].dia +
                                "</td><td>" + array[i].tempo_espera +
                                "</td></tr>"
                        }
                    }
                    if (exists == false) {
                        text += "<tr><td>" + array[i].id_pedido + "</td><td>Desconhecido</td><td>" + array[i].fila +
                            array[i].num_senha + "</td><td>" + array[i].hora + "</td><td>" + array[i].dia +
                            "</td><td>" + array[i].tempo_espera +
                            "</td></tr>"
                    }

                }
                text += "</tbody>";
                $("#hsTable").html(text);
                makeTableScroll();

            }



        }
        $("#thResultNumber").html(array.length);



    }

    function makeTableScroll() {

        var tempMaxRows = $("#comboBoxTHResultNumber").find(":selected").val();
        var maxRows = parseInt(tempMaxRows);

        var table = document.getElementById('hsTable');
        var wrapper = table.parentNode;
        var rowsInTable = table.rows.length;
        var height = 0;
        if (rowsInTable > maxRows + 1) {
            for (var i = 0; i < maxRows; i++) {
                height += table.rows[i].clientHeight;
            }
            wrapper.style.height = height + "px";
        } else {
            for (var i = 0; i < table.rows.length; i++) {
                height += table.rows[i].clientHeight;
            }
            wrapper.style.height = height + "px";
        }
    }
}