function runScriptAdminConfig() {
    $(document).ready(function () {
        if (localStorage.getItem("darkmode")) {

            if (localStorage.getItem("darkmode") == "true") {
                $("#btnDarkMode").html("<i class='fa fa-sun-o fa-fw'></i>&nbsp; Desligar Modo Noturno");
                var lastClass = $("#btnDarkMode").attr('class').split(' ').pop();
                $("#btnDarkMode").removeClass(lastClass);
                $("#btnDarkMode").addClass("w3-blue");
            } else {
                $("#btnDarkMode").html("<i class='fa fa-moon-o fa-fw'></i>&nbsp; Ligar Modo Noturno");
                var lastClass = $("#btnDarkMode").attr('class').split(' ').pop();
                $("#btnDarkMode").removeClass(lastClass);
                $("#btnDarkMode").addClass("w3-grey");
            }
        }

        $(".configButtonCollapse").click(function () {
            var lastClass = $(this).find("span").attr('class').split(' ').pop();
            if (lastClass == "glyphicon-menu-down") {
                $(this).find("span").removeClass(lastClass);
                $(this).find("span").addClass("glyphicon-menu-up");
            } else {
                $(this).find("span").removeClass(lastClass);
                $(this).find("span").addClass("glyphicon-menu-down");
            }
        });

        $("#btnResetTickets").click(function () {
            $.ajax({
                type: "POST",
                url: '/adminResetTickets',
                success: function (data) {
                    if (data == "success") {
                        $(".pStatus").html("");
                        $("#btnCollapseResetTickets").click();
                        $("#pAConfigResetTicketsSuccess").html(
                            "Senhas restabelecidas com sucesso!");
                    }

                }
            });
        });

        $("#openARemoveEmployee").click(function () {
            setTimeout(function () {
                makeTableScrollAdmin("configEmployeeTable");
            }, 500);
        });

        $("#formAddService").click(function (e) {
            e.preventDefault();
            var newService = $("#inputAddService").val();

            var char = newService.split("");
            var count = 0;
            for (var i = 0; i < char.length; i++) {
                if (char[i] == " ")
                    count++;
            }

            if (newService != "" && char.length != count) {

                var obj = {};
                obj.new_Service = newService;
                $.ajax({
                    type: "POST",
                    url: '/adminAddService',
                    data: obj,
                    success: function (data) {
                        $(".pStatus").html("");
                        if (data == "exists") {
                            $("#pAConfigServiceError").html(
                                "Este serviço já existe!");
                        } else {
                            $("#pAConfigServiceSuccess").html(
                                "Serviço adicionado com sucesso!");
                            $("#inputAddService").val("");
                            getAdminConfig();
                        }
                    }
                });
            } else {
                $("#pAConfigServiceError").html("Nome de serviço inválido!");
            }
        });

        $("#formRemoveService").click(function (e) {
            e.preventDefault();
            var id_service = $("#adminConfigComboBoxRemoveService").find(":selected").val();

            var obj = {};
            obj.id_service = id_service;

            $.ajax({
                type: "POST",
                url: '/adminRemoveService',
                data: obj,
                success: function (data) {
                    if (data == "success") {
                        $(".pStatus").html("");
                        $("#pAConfigServiceSuccess").html(
                            "Serviço removido com sucesso!");
                        getAdminConfig();
                    }

                }
            });
        });

        $("#formAddEmployee").click(function (e) {
            e.preventDefault();

            var obj = {};
            obj.id_service = $("#adminConfigComboBoxAddEmployee").find(":selected").val();
            obj.name = $("#inputAddEmployeeName").val();
            obj.email = $("#inputAddEmployeeEmail").val();
            obj.password = $("#inputAddEmployeePassword").val();

            var char = obj.name.split("");
            var countN = 0;
            for (var i = 0; i < char.length; i++) {
                if (char[i] == " ")
                    countN++;
            }
            var char = obj.email.split("");
            var countE = 0;
            for (var i = 0; i < char.length; i++) {
                if (char[i] == " ")
                    countE++;
            }
            var char = obj.password.split("");
            var countP = 0;
            for (var i = 0; i < char.length; i++) {
                if (char[i] == " ")
                    countP++;
            }

            if (obj.name != "" && obj.email != "" && obj.password != "" && obj.name.length !=
                countN && obj.email.length != countE && obj.password.length != countP) {
                if (validateEmail(obj.email) == true) {
                    $.ajax({
                        type: "POST",
                        url: '/adminAddEmployee',
                        data: obj,
                        success: function (data) {
                            if (data == "success") {
                                $(".pStatus").html("");
                                $("#openAAddEmployee").click();
                                $("#inputAddEmployeeName").val("");
                                $("#inputAddEmployeeEmail").val("");
                                $("#inputAddEmployeePassword").val("");
                                $("#pAConfigEmployeeSuccess").html(
                                    "Funcionário adicionado com sucesso!");
                                getAdminConfig();
                            } else {
                                $(".pStatus").html("");
                                $("#pAConfigEmployeeError").html(
                                    "Email já existente!");
                            }

                        }
                    });
                } else {
                    $(".pStatus").html("");
                    $("#pAConfigEmployeeError").html(
                        "Email inválido!");
                }

            } else {
                $(".pStatus").html("");
                $("#pAConfigEmployeeError").html(
                    "Um ou mais campos inválidos!");
            }

        });

        $(document).delegate("#configEmployeeTable tr", "click", function (e) {
            if ($(this)[0].children[0].localName != "th") {
                var lastRow = $("#configEmployeeTable").find(".w3-blue");
                lastRow.removeClass("w3-blue");
                $(this).addClass("w3-blue");
                $("#formRemoveEmployee").attr("disabled", false);
                $("#buttonCollapseEditEmployee").attr("disabled", false);
            }

        });

        $("#formRemoveEmployee").click(function () {
            var obj = {};
            obj.token_Employee = $("#configEmployeeTable").find(".w3-blue").attr("value");

            $.ajax({
                type: "POST",
                url: "/adminRemoveEmployee",
                data: obj,
                success: function (data) {
                    if (data == "success") {
                        $(".pStatus").html("");
                        $("#pAConfigEmployeeSuccess").html(
                            "Funcionário removido com sucesso!");
                        getAdminConfig();
                    }
                }
            })

        });

        $("#formEditEmployee").click(function () {
            var obj = {};
            obj.token_Employee = $("#configEmployeeTable").find(".w3-blue").attr("value");
            obj.name = $("#inputEditEmployeeName").val();
            obj.email = $("#inputEditEmployeeEmail").val();
            obj.password = $("#inputEditEmployeePassword").val();
            obj.id_service = $("#adminConfigComboBoxEditEmployee").find(":selected").val();

            if (obj.name == "" && obj.email == "" && obj.password == "" && obj.id_service ==
                "null") {
                $(".pStatus").html("");
                $("#pAConfigEmployeeError").html(
                    "Tem de preencher pelo menos um dos campos!");
            } else {
                $.ajax({
                    type: "POST",
                    url: "/adminEditEmployee",
                    data: obj,
                    success: function (data) {
                        if (data == "success") {
                            $("#buttonCollapseEditEmployee").click();
                            $(".pStatus").html("");
                            $("#inputEditEmployeeName").val("");
                            $("#inputEditEmployeeEmail").val("");
                            $("#inputEditEmployeePassword").val("");
                            $("#adminConfigComboBoxEditEmployee").val("null");
                            $("#pAConfigEmployeeSuccess").html(
                                "Funcionário editado com sucesso!");
                            getAdminConfig();
                        } else {
                            $(".pStatus").html("");
                            $("#pAEditEmployeeError").html(
                                "Email já existente!");
                        }
                    }
                })
            }



        });

        $("#openACompanyGPS").click(function () {
            setTimeout(function () {
                showMap();
            }, 500);
        });

        $("#formCompanyCenterGPS").click(function () {
            myLocation();
        });

        $("#formCompanyGPS").click(function () {
            var obj = {};
            obj.latitude = $("#inputCompanyGPSLat").val();
            obj.longitude = $("#inputCompanyGPSLon").val();

            var latLng = obj.latitude + ", " + obj.longitude;

            if (validateGPS(latLng) == true) {
                $.ajax({
                    type: "POST",
                    url: "/adminCompanyGPS",
                    data: obj,
                    success: function (data) {
                        if (data == "success") {
                            $("#openACompanyGPS").click();
                            $(".pStatus").html("");
                            $("#pAConfigCompanySuccess").html(
                                "Coordenadas atualizadas com sucesso!");
                            getAdminConfig();
                        }
                    }
                })
            } else {
                $(".pStatus").html("");
                $("#pAConfigCompanyError").html(
                    "Coordenadas inválidas!");
            }


        });

        $("#formModifyRange").click(function (e) {
            e.preventDefault();
            
            var obj = {};
            obj.new_range = $("#inputNewRange").val();
            if (obj.new_range == "") {
                $(".pStatus").html("");
                $("#pAConfigCompanyError").html(
                    "Distância inválida!");
            } else {
                $.ajax({
                    type: "POST",
                    url: '/adminModifyRange',
                    data: obj,
                    success: function (data) {
                        if (data == "success") {
                            $(".pStatus").html("");
                            $("#inputNewRange").val("");
                            $("#openModifyRange").click();
                            $("#pAConfigCompanySuccess").html(
                                "Distância modificada com sucesso!");
                        }

                    }
                });
            }

        });

        $("#formModifyAvg").click(function (e) {
            e.preventDefault();

            var obj = {};
            obj.id_service = $("#adminConfigComboBoxModifyAvg").find(":selected").val();
            obj.new_avg = $("#inputNewAvg").val();
            if (obj.new_avg == "") {
                $(".pStatus").html("");
                $("#pAConfigCompanyError").html(
                    "Média inválida!");
            } else {
                $.ajax({
                    type: "POST",
                    url: '/adminModifyAvg',
                    data: obj,
                    success: function (data) {
                        if (data == "success") {
                            $(".pStatus").html("");
                            $("#openAModifyAvg").click();
                            $("#inputNewAvg").val("");
                            $("#pAConfigServiceSuccess").html(
                                "Média alterada com sucesso!");
                        }

                    }
                });
            }



        });

    });

    getAdminConfig();

    darkMode();



}

var posGPS, map, markerAddPoint;
var latitude, longitude;


function showMap() {
    var coordinates = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
    };
    map = new google.maps.Map(document.getElementById('inputMap'), {
        center: coordinates,
        zoom: 15
    });
    markerAddPoint = new google.maps.Marker({
        position: coordinates,
        draggable: true,
        map: map
    });

    google.maps.event.addListener(markerAddPoint, "dragend", function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        $("#inputCompanyGPSLat").val(lat);
        $("#inputCompanyGPSLon").val(lng);
    });
    google.maps.event.addListener(map, 'click', function (event) {
        markerAddPoint.setPosition(event.latLng);
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        $("#inputCompanyGPSLat").val(lat);
        $("#inputCompanyGPSLon").val(lng);
    });

}

function myLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            posGPS = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            $("#inputCompanyGPSLat").val(position.coords.latitude);
            $("#inputCompanyGPSLon").val(position.coords.longitude);

            map.setCenter(posGPS);
            markerAddPoint.setPosition(posGPS);
        });



    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, posGPS) {
    infoWindow.setPosition(posGPS);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function getAdminConfig() {
    $.ajax({
        type: "POST",
        url: '/adminConfig',
        success: function (data) {
            var text = "";

            for (var i = 0; i < data.services.length; i++) {
                text += "<option value='" + data.services[i].id_servico + "'>" + data
                    .services[i]
                    .nome_servico + "</option>";
            }

            $(".comboBoxConfig").html(text);

            text += "<option value='null' selected> </option>";
            $("#adminConfigComboBoxEditEmployee").html(text);

            var trows = "<tr><th>Nome</th><th>Email</th><th>Serviço</th></tr>";

            for (var i = 0; i < data.employees.length; i++) {
                var serviceExists = false;
                for (var k = 0; k < data.services.length; k++) {
                    if (data.employees[i].id_servico == data.services[k].id_servico) {
                        serviceExists = true;
                        trows += "<tr value='" + data.employees[i].token_funcionario + "'><td>" +
                            data.employees[
                                i].nome_funcionario + "</td><td>" + data.employees[i].email +
                            "</td><td>" +
                            data.services[k].nome_servico + "</td></tr>";
                    }
                }
                if (serviceExists == false) {
                    trows += "<tr value='" + data.employees[i].token_funcionario + "'><td>" +
                        data.employees[
                            i].nome_funcionario + "</td><td>" + data.employees[i].email +
                        "</td><td>Serviço não encontrado</td></tr>";
                }

            }
            $("#configEmployeeTable").html(trows);
            $("#formRemoveEmployee").attr("disabled", true);
            $("#buttonCollapseEditEmployee").attr("disabled", true);

            latitude = data.gps.latitude;
            longitude = data.gps.longitude;
            $("#inputCompanyGPSLat").val(latitude);
            $("#inputCompanyGPSLon").val(longitude);
        }
    });
}