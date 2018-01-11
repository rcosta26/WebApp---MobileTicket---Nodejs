var serviceTimerA;
var updatingTicket = false;

function runScriptAdminHomePage() {

    $(document).ready(function () {

        serviceTimerA = setInterval(aServices, 2000);

        $(document).on('click', '#cSNUp', function () {
            updatingTicket = true;
            var id_service = $(this).attr('service');
            var user_Token = getCookie("user_Token");
            var obj = {};
            obj.user_Token = user_Token;
            obj.id_service = id_service;
            obj.method = "+";

            $.ajax({
                type: 'POST',
                context: this,
                url: '/updateServiceNumber',
                data: obj

            }).done(function (data) {

                $(this).parent().parent().parent().find("#currentServiceNumber").html(
                    data);
                updatingTicket = false;
            });


        });

        $(document).on('click', '#cSNDown', function () {
            updatingTicket = true;
            var id_service = $(this).attr('service');
            var user_Token = getCookie("user_Token");
            var obj = {};
            obj.user_Token = user_Token;
            obj.id_service = id_service;
            obj.method = "-";

            $.ajax({
                type: 'POST',
                context: this,
                url: '/updateServiceNumber',
                data: obj

            }).done(function (data) {
                $(this).parent().parent().parent().find("#currentServiceNumber").html(
                    data);
                updatingTicket = false;
            });
        });



        aServices();

    });

}

function stopTimerA() {
    clearInterval(serviceTimerA);
}

function startTimerA() {
    setTimeout(function () {
        serviceTimerA = setInterval(aServices, 2000);
    }, 1000);

}

function aServices() {

    $.ajax({
        type: 'POST',
        url: '/getAdminServices'

    }).done(function (data) {
        if (updatingTicket == false)
            $("#divServicos").html(data);
    });
}