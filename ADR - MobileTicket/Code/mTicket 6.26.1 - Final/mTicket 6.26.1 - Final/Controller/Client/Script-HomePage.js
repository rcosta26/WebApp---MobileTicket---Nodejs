function runScriptClientHomePage() {

    firstEntryLocation = true;
    inRange = false;
    tempinRange = true;
    firstEntryServices = true;
    notify_Turn = false;
    notify_Tolerance = false;
    drawing_Ticket = false;



    $(document).ready(function () {

        $(document).on('click', '.servico', function () {
            var user_Token = getCookie("user_Token");

            if ($(this).attr('pedido') == 'false' && user_Token != "") {
                drawing_Ticket = true;
                $(this).attr('pedido', 'true');



                var id_service = $(this).attr('value');
                var obj = {};
                obj.user_Token = user_Token
                obj.id_service = id_service;

                $.ajax({
                    type: 'POST',
                    context: this,
                    url: '/drawTicket',
                    data: obj

                }).done(function (data) {

                    $(this).children().find(".minhaVez").html(data.ticket);
                    var lastClass = $(this).attr('class').split(' ').pop();
                    $(this).children(".spanGlyph").addClass("hide");

                    $(this).removeClass(lastClass);
                    $(this).addClass(data.color);
                    drawing_Ticket = false;
                });
            }
        });
        detectLocation();


    });






}

var serviceTimer;
var inRange = false;
var tempinRange = true;
var firstEntryLocation = true;
var firstEntryServices = true;
var notify_Turn = false;
var notify_Tolerance = false;
var drawing_Ticket = false;
var sound_notify = new Audio('https://webitcloud.net/PW/1617/ADR/index/resources/sound_notify.wav');

var locationTimer;

function Notification(id_servico, notify_Turn, notify_Tolerance) {
    this.id_servico = id_servico;
    this.notify_Turn = notify_Turn;
    this.notify_Tolerance = notify_Tolerance;
}
var notifications = [];

function getServices() {

    $.ajax({
        type: 'POST',
        url: '/getServicesCostumer'
    }).done(function (data) {
        if (drawing_Ticket == false) {
            var text = "";
            var notifications = false;
            for (var i = 0; i < data.service.length; i++) {
                if (data.status[i] == "notifyTurn") {
                    notifications = true;
                    text +=
                        "<img src='https://webitcloud.net/PW/1617/ADR/index/resources/mark.png' alt='' style='width:20px;margin-top:-10px;'> " +
                        data.service[i] + "<hr>";

                } else if (data.status[i] == "notifyTolerance") {
                    notifications = true;
                    text +=
                        "<img src='https://webitcloud.net/PW/1617/ADR/index/resources/circle.png' alt='' style='width:20px;margin-top:-8px;'> " +
                        data.service[i] + "<hr>";
                }
            }

            if (notifications == true) {
                window.navigator.vibrate(1000);
                sound_notify.play();
                if ($("#notifyModal").css("display") != "block") {
                    $("#notifyModal").css("display", "block");
                    $("#divNotifications").html(text);
                } else if ($("#notifyModal").css("display") == "block") {
                    $("#divNotifications").append(text);

                }
            }
            $("#divPagina").html(data.page);
        }


    });
}

function stopTimer() {
    clearInterval(serviceTimer);
}

function startTimer() {
    serviceTimer = setInterval(getServices, 2000);
}

function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log("SUCCESS");
            var currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            $.ajax({
                type: "POST",
                url: "/giveCompanyGPS",
                success: function (data) {
                    var companyPosition = new google.maps.LatLng(parseFloat(data.latitude),
                        parseFloat(data.longitude));

                    var distance = google.maps.geometry.spherical.computeDistanceBetween(
                        companyPosition,
                        currentPosition);

                    if (distance <= data.distancia) {
                        inRange = true;

                        if (firstEntryLocation == true) {
                            tempinRange = false;
                            firstEntryLocation = false;
                        }

                        if (inRange == true && tempinRange == false) {
                            tempinRange = true;
                            try {
                                stopLocationTimer();
                            } catch (error) {

                            }
                            startLocationTimer(60000);
                            getServices();
                            startTimer();
                        }

                    } else {

                        inRange = false;

                        if (firstEntryLocation == true) {
                            tempinRange = true;
                            firstEntryLocation = false;
                        }

                        if (inRange == false && tempinRange == true) {
                            tempinRange = false;
                            stopTimer();
                            notInRangeHomePage();
                            try {
                                stopLocationTimer();
                            } catch (error) {

                            }
                            startLocationTimer(10000);
                        }
                    }
                }
            });
        }, function (error) {
            console.log("ERROR");
            firstEntryServices = true;
            $("#divPagina").html(
                "<div class='col-md-12' style='padding-bottom: 15px;'><h2>Página Principal</h2></div><div><h3>Localização não se encontra ativa ou foi negada!</h3></div>"
            )
            try {
                stopLocationTimer();
            } catch (error) {

            }
            startLocationTimer(2000);
        });
    } else {
        firstEntryServices = true;
        $("#divPagina").html(
            "<div class='col-md-12' style='padding-bottom: 15px;'><h2>Página Principal</h2></div><div><h3>O seu navegador não permite o uso de GeoLocalização!</h3></div>"
        )
    }


}

function startLocationTimer(time) {
    locationTimer = setInterval(detectLocation, time);
}

function stopLocationTimer() {
    clearInterval(locationTimer);
}

function notInRangeHomePage() {
    firstEntryServices = true;
    $("#divPagina").html(
        "<div class='col-md-12' style='padding-bottom: 15px;'><h2>Página Principal</h2></div><div><h3>Página principal indisponível na localização atual!</h3></div>"
    )
}