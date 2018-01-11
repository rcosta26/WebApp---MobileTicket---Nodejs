var serviceTimerE;

function runScriptEmployeeHomePage() {

    $(document).ready(function () {

        serviceTimerE = setInterval(fServices, 2000);

        $("#cSNUp").click(function () {
            changeSNumberE("+");

        });

        $("#cSNDown").click(function () {
            changeSNumberE("-");
        });



        fServices();

    });

}

function stopTimerE() {
    clearInterval(serviceTimerE);
}

function startTimerE() {
    setTimeout(function () {
        serviceTimerE = setInterval(fServices, 2000);
    }, 1000);

}

function fServices() {

    var user_Token = getCookie("user_Token");

    var obj = {};
    obj.user_Token = user_Token;


    $.ajax({
        type: 'POST',
        url: '/getEmployeeServices',
        data: obj

    }).done(function (data) {
        if (data.status == "success") {
            $("#currentServiceNumber").html(data.current_Line + data.current_Num);
            $("#totalServiceNumber").html(data.total_Line + data.total_Num);
            $("#serviceName").html(data.serviceName);

            $("#divPedidos").html(data.requests);
        } else if (data.status == "error") {
            $("#divPagina").html("<h2>Serviço Indisponível</h2><h5 style='margin-top:50px;'>Contacte o administrador!</h5>");
        }

    });
}

function changeSNumberE(method) {

    var user_Token = getCookie("user_Token");

    var obj = {};
    obj.user_Token = user_Token;
    obj.method = method;
    stopTimerE();
    $.ajax({
        type: 'POST',
        url: '/updateServiceNumber',
        data: obj

    }).done(function (data) {


        $("#currentServiceNumber").html(data);
        startTimerE();
    });
}