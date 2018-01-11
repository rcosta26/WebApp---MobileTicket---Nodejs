$(document).ready(function () {

    $(window).on('resize', function () {
        windowSize();
    });

    windowSize();
    initDarkMode();

    $("#forgotPsw").click(function () {
        $("#loginModal").css("display", "none");
        $("#resetPswModal").css("display", "block");
        return false;
    });

    $("#formResetPswEnter").click(function () {
        var obj = {};
        obj.email = $("#resetPswEmail").val();

        $.ajax({
            type: 'POST',
            data: obj,
            url: '/resetPassword',
            success: function (data) {
                if (data.status == "success") {
                    $("#errorResetPsw").css("color", "limegreen");
                    $("#errorResetPsw").html(data.message);
                } else if (data.status == "error") {
                    $("#errorResetPsw").css("color", "red");
                    $("#errorResetPsw").html(data.message);
                }

            }
        });
    });


    $("#sbPaginaPrincipal").click(function () {
        getHomePage();
        return false;
    });

    $("#sbHistoricoSenhas").click(function () {
        getTicketHistory();
        return false;
    });

    $("#sbSobre").click(function () {
        getAbout();
        return false;
    });

    $("#sbContactos").click(function () {
        getContacts();
        return false;
    });

    $("#sbConfiguracoes").click(function () {
        getConfig();
        return false;
    });

    $("#sbAjuda").click(function () {
        $("#initialModal").css("display", "block");
        return false;
    });

    $("#sbLogin").click(function () {
        $(".erro").html("");
        $("#loginModal").css("display", "block");
        $("#emailLogin").focus();
        return false;

    });

    $("#sbRegister").click(function () {
        $(".erro").html("");
        $("#registerModal").css("display", "block");
        $("#nameRegister").focus();
        return false;
    });

    $(".closeModalInitial").click(function () {
        $("#initialModal").css("display", "none");
        setCookie("modal_initial", "closed");
    });



    // LOGOUT
    $("#sbLogout").click(function () {
        $("#sbLogout").addClass("hide");
        $("#sbLogin").removeClass("hide");
        $("#sbRegister").removeClass("hide");
        $("#sbLoginGPlus").removeClass("hide");
        setCookie("user_Token", "");
        setCookie("user_Name", "");
        setCookie("user_Type", "");
        setCookie("ticket_Tolerance", "");
        $("#sbClientName").html("");

        location.reload();
        return false;
    });


    $(document).on('click', '#btnDarkMode', function () {



        if (darkmode == true) {
            $("#btnDarkMode").html(
                "<i class='fa fa-moon-o fa-fw'></i>&nbsp; Ligar Modo Noturno");
            var lastClass = $(this).attr('class').split(' ').pop();
            $(this).removeClass(lastClass);
            $(this).addClass("w3-grey");
            darkmode = false;
        } else {
            $("#btnDarkMode").html(
                "<i class='fa fa-sun-o fa-fw'></i>&nbsp; Desligar Modo Noturno");
            var lastClass = $(this).attr('class').split(' ').pop();
            $(this).removeClass(lastClass);
            $(this).addClass("w3-blue");
            darkmode = true;
        }

        darkMode();

    });



    $("#formLoginEnter").click(function (e) {
        e.preventDefault();

        var data = {};
        data.email = $("#emailLogin").val();
        data.psw = $("#passwordLogin").val();

        $.ajax({
            type: 'POST',
            data: data,
            url: '/login',
            success: function (data) {
                if (data.message == "login-true") {
                    location.reload();
                } else if (data.message == "refresh_page") {

                    location.reload();

                } else {
                    $("#sbLogout").addClass("hide");
                    $("#sbLogin").removeClass("hide");
                    $("#sbRegister").removeClass("hide");
                    $(".erro").html("Email ou password incorretos!");
                }
            }
        });
        return false;
    });

    $("#formRegisterEnter").click(function (e) {
        e.preventDefault();
        if ($("#nameRegister").val() == "" || $("#emailRegister").val() == "" || $(
                "#passwordRegister").val() == "" || $("#passwordRepeatRegister").val() == "") {
            $(".erro").html("Preencha todos os campos!");
        } else {
            if (validateEmail($("#emailRegister").val()) == true) {
                if ($("#passwordRegister").val() != $("#passwordRepeatRegister").val()) {

                    $(".erro").html("As passwords não coincidem!");

                } else {

                    var data = {};
                    data.name = $("#nameRegister").val();
                    data.email = $("#emailRegister").val();
                    data.psw = $("#passwordRegister").val();

                    $.ajax({
                        type: 'POST',
                        data: data,
                        url: '/registerCostumer',
                        success: function (data) {
                            if (data.message == "login-true") {
                                location.reload();
                            } else {
                                $("#sbLogout").addClass("hide");
                                $("#sbLogin").removeClass("hide");
                                $("#sbRegister").removeClass("hide");
                                $(".erro").html(data.message);
                            }
                        }
                    });
                }
            } else {
                $(".erro").html("Email inválido!");
            }

        }

        return false;
    });


    initCheckLogin();


    // END Document.READY
}); // END Document.READY
// END Document.READY


initPage();



function initPage() {
    var url = window.location.pathname;
    if (url == "/PaginaPrincipal" || url == "/") {
        getHomePage();
    } else if (url == "/HistoricoSenhas") {
        getTicketHistory();
    } else if (url == "/Configuracoes") {
        getConfig();
    } else if (url == "/Sobre") {
        getAbout();
    } else if (url == "/Contactos") {
        getContacts();
    }

    enterHTTPS();

}

function initCheckLogin() {
    var user_Token = getCookie("user_Token");
    if (user_Token != "") {
        $("#sbLogout").removeClass("hide");
        $("#sbLogin").addClass("hide");
        $("#sbRegister").addClass("hide");
        $("#sbLoginGPlus").addClass("hide");
        $("#sbClientName").html(getCookie("user_Name"));
    } else {
        if (getCookie("modal_initial") == "") {
            $("#initialModal").css("display", "block");
        }
    }
}


// OPEN AND CLOSE SIDEBAR
function openNav() {

    if ($("#sideBar").css("display") == "block") {
        $("#sideBar").css("display", "none");
    } else {
        $("#sideBar").css("display", "block");
    }

}

// COLLAPSE SIDEBAR AND CHANGE UPBAR
function windowSize() {
    if ($(window).width() <= 992) {

        var src = "https://webitcloud.net/PW/1617/ADR/index/resources/logoMTSideBlack.png"

        if (darkmode == true) {
            src = "https://webitcloud.net/PW/1617/ADR/index/resources/logoMTSideWhite.png"
        }


        document.getElementById("sideBar").style.display = "none";

        $("#upTab").html(

            "<div><button class='w3-bar-item w3-button w3-hover-none w3-hover-text-blue' onclick='openNav()' style='height: 70px; line-height: 50px; text-align: center;'><i class='fa fa-bars fa-fw'></i>&nbsp; Menu</button></div><div class='w3-right'><center><img id='imgTopBar' src='" +
            src + "'></center></div>"

        );

    } else {
        document.getElementById("sideBar").style.display = "block";
        $("#upTab").html(
            "<div class='col-sm-3'><center><img src='https://webitcloud.net/PW/1617/ADR/index/resources/logoMT.png' style='width:50px;'></center></div><div class='col-sm-9'><h4 style='height: 30px; line-height: 30px; text-align: center;'>MobileTicket</h4></div>"
        );
    }
}


// NIGHTMODE
var darkmode;

function initDarkMode() {

    if (localStorage.getItem("darkmode")) {

        if (localStorage.getItem("darkmode") == "true") {
            darkmode = true;
        } else {
            darkmode = false;
        }



        if (darkmode == true) {

            $("body").addClass("w3-theme-d5");
            $("#upTab").addClass("w3-theme-d5");
            $("#sideBar").addClass("w3-theme-d5");
            $("#formModalLogin").addClass("w3-theme-d5");
            $("#formModalRegisto").addClass("w3-theme-d5");
            $("#formInitialModal").addClass("w3-theme-d5");
            $("#formModalResetPsw").addClass("w3-theme-d5");
            $("#middleInitialModal").addClass("w3-theme-d5");
            $("#formNotify").addClass("w3-theme-d5");
            $(".comboBoxConfig").addClass("w3-theme-d5");
            $(".close").addClass("w3-theme-d5");
            $("#imgTopBar").attr("src",
                "https://webitcloud.net/PW/1617/ADR/index/resources/logoMTSideWhite.png");

        }

    }

}

function darkMode() {


    if (darkmode == false) {

        localStorage.setItem("darkmode", "false");
        $("body").removeClass("w3-theme-d5");
        $("#upTab").removeClass("w3-theme-d5");
        $("#sideBar").removeClass("w3-theme-d5");
        $("#formModalLogin").removeClass("w3-theme-d5");
        $("#formModalRegisto").removeClass("w3-theme-d5");
        $("#formInitialModal").removeClass("w3-theme-d5");
        $("#formModalResetPsw").removeClass("w3-theme-d5");
        $("#middleInitialModal").removeClass("w3-theme-d5");
        $("#formNotify").removeClass("w3-theme-d5");
        $(".comboBoxConfig").removeClass("w3-theme-d5");
        $(".close").removeClass("w3-theme-d5");
        $("#imgTopBar").attr("src",
            "https://webitcloud.net/PW/1617/ADR/index/resources/logoMTSideBlack.png");

    } else if (darkmode == true) {

        localStorage.setItem("darkmode", "true");
        $("body").addClass("w3-theme-d5");
        $("#upTab").addClass("w3-theme-d5");
        $("#sideBar").addClass("w3-theme-d5");
        $("#formModalLogin").addClass("w3-theme-d5");
        $("#formModalRegisto").addClass("w3-theme-d5");
        $("#formInitialModal").addClass("w3-theme-d5");
        $("#formModalResetPsw").addClass("w3-theme-d5");
        $("#middleInitialModal").addClass("w3-theme-d5");
        $("#formNotify").addClass("w3-theme-d5");
        $(".comboBoxConfig").addClass("w3-theme-d5");
        $(".close").addClass("w3-theme-d5");
        $("#imgTopBar").attr("src", "https://webitcloud.net/PW/1617/ADR/index/resources/logoMTSideWhite.png");

    }
}

// GET COOKIES VALUES
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// SET COOKIES VALUES
function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}

function validateEmail(email) {
    var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function makeTableScrollAdmin(tableID) {
    var maxRows = 11;

    var table = document.getElementById(tableID);

    var wrapper = table.parentNode;
    var rowsInTable = table.rows.length;
    var height = 0;
    if (rowsInTable > maxRows) {
        for (var i = 0; i < maxRows; i++) {
            height += table.rows[i].clientHeight;
        }
        wrapper.style.height = height + "px";
    }

}

function validateGPS(latLng) {
    var re =
        /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g;
    return re.test(latLng);
}


function getHomePage() {

    if ($(document).find("title").text() != "MobileTicket - Página Principal") {
        history.pushState(null, null, '/PaginaPrincipal');
        $(document).find("title").text("MobileTicket - Página Principal");
        $("#sideBarDiv").find(".w3-blue").removeClass("w3-blue");
        setTimeout(function () {
            $("#sbPaginaPrincipal").addClass("w3-blue");
        }, 500);

        var obj = {};

        obj.user_Token = getCookie("user_Token");

        try {
            stopTimer();
        } catch (msg) {

        }
        try {
            stopTimerE();
        } catch (msg) {

        }
        try {
            stopTimerA();
        } catch (msg) {

        }
        try {
            stopLocationTimer();
        } catch (msg) {

        }

        $.ajax({
            type: 'POST',
            url: '/getHomePage',
            data: obj,
            success: function (data) {
                $("#divPagina").html(data.page);
                if ($(window).width() <= 992)
                    $("#sideBar").css("display", "none");

                if (data.user == "client") {
                    runScriptClientHomePage();
                } else if (data.user == "employee") {
                    runScriptEmployeeHomePage();
                } else if (data.user == "admin") {
                    runScriptAdminHomePage();
                }
            }
        });

    }
}



function getTicketHistory() {


    if ($(document).find("title").text() != "MobileTicket - Histórico Senhas") {

        if ($(document).find("title").text() == "MobileTicket - Página Principal") {
            try {
                stopTimer();
            } catch (msg) {

            }
            try {
                stopTimerE();
            } catch (msg) {

            }
            try {
                stopTimerA();
            } catch (msg) {

            }
            try {
                stopLocationTimer();
            } catch (msg) {

            }
        }

        history.pushState(null, null, '/HistoricoSenhas');
        $(document).find("title").text("MobileTicket - Histórico Senhas");
        $("#sideBarDiv").find(".w3-blue").removeClass("w3-blue");
        setTimeout(function () {
            $("#sbHistoricoSenhas").addClass("w3-blue");
        }, 500);
        $.ajax({
            type: 'POST',
            url: '/getTicketHistory',
            success: function (data) {
                $("#divPagina").html(data);
                if ($(window).width() <= 992)
                    $("#sideBar").css("display", "none");
                runScriptTicketHistory();
            }
        });
    }
}

function getAbout() {
    if ($(document).find("title").text() != "MobileTicket - Sobre") {

        if ($(document).find("title").text() == "MobileTicket - Página Principal") {
            try {
                stopTimer();
            } catch (msg) {

            }
            try {
                stopTimerE();
            } catch (msg) {

            }
            try {
                stopTimerA();
            } catch (msg) {

            }
            try {
                stopLocationTimer();
            } catch (msg) {

            }
        }

        history.pushState(null, null, '/Sobre');
        $(document).find("title").text("MobileTicket - Sobre");

        $("#sideBarDiv").find(".w3-blue").removeClass("w3-blue");

        setTimeout(function () {
            $("#sbSobre").addClass("w3-blue");
        }, 500);


        $.ajax({
            type: 'POST',
            url: '/getAbout',
            success: function (data) {
                $("#divPagina").html(data);
                if ($(window).width() <= 992)
                    $("#sideBar").css("display", "none");
                runScriptAbout();
            }
        });
    }
}

function getContacts() {
    if ($(document).find("title").text() != "MobileTicket - Contactos") {

        if ($(document).find("title").text() == "MobileTicket - Página Principal") {
            try {
                stopTimer();
            } catch (msg) {

            }
            try {
                stopTimerE();
            } catch (msg) {

            }
            try {
                stopTimerA();
            } catch (msg) {

            }
            try {
                stopLocationTimer();
            } catch (msg) {

            }


        }

        history.pushState(null, null, '/Contactos');
        $(document).find("title").text("MobileTicket - Contactos");
        $("#sideBarDiv").find(".w3-blue").removeClass("w3-blue");
        setTimeout(function () {
            $("#sbContactos").addClass("w3-blue");
        }, 500);

        $.ajax({
            type: 'POST',
            url: '/getContacts',
            success: function (data) {
                $("#divPagina").html(data);
                if ($(window).width() <= 992)
                    $("#sideBar").css("display", "none");
                runScriptContacts();
            }
        });
    }
}

function getConfig() {
    if ($(document).find("title").text() != "MobileTicket - Configurações") {

        if ($(document).find("title").text() == "MobileTicket - Página Principal") {
            try {
                stopTimer();
            } catch (msg) {

            }
            try {
                stopTimerE();
            } catch (msg) {

            }
            try {
                stopTimerA();
            } catch (msg) {

            }
            try {
                stopLocationTimer();
            } catch (msg) {

            }
        }

        var obj = {};
        obj.user_Token = getCookie("user_Token");

        history.pushState(null, null, '/Configuracoes');
        $(document).find("title").text("MobileTicket - Configurações");
        $("#sideBarDiv").find(".w3-blue").removeClass("w3-blue");
        setTimeout(function () {
            $("#sbConfiguracoes").addClass("w3-blue");
        }, 500);

        $.ajax({
            type: 'POST',
            url: '/getConfig',
            data: obj,
            success: function (data) {
                $("#divPagina").html(data.page);
                if ($(window).width() <= 992)
                    $("#sideBar").css("display", "none");

                if (data.user == "admin") {
                    runScriptAdminConfig();
                } else {
                    runScriptConfig();
                }

            }
        });
    }
}