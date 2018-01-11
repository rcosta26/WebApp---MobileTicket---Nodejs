function runScriptConfig() {

    $(document).ready(function () {

        $("#pConfigError").html("");
        $("#pConfigSuccess").html("");

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

        $("#formTicketTolerance").change(function () {

            var obj = {};
            obj.user_Token = getCookie("user_Token");
            obj.ticket_tolerance = $("#formTicketTolerance").val();

            $.ajax({
                type: 'POST',
                url: '/setTicketTolerance',
                data: obj
            });
        });

        $("#formConfigNome").click(function (e) {

            e.preventDefault();
            var new_Name = $("#formNovoNome").val();

            var char = new_Name.split("");
            var count = 0;
            for (var i = 0; i < char.length; i++) {
                if (char[i] == " ")
                    count++;
            }

            if (new_Name != "" && char.length != count) {
                var obj = {};
                obj.user_Token = getCookie("user_Token");
                obj.new_Name = new_Name;

                $.ajax({
                    type: 'POST',
                    url: '/setClientName',
                    data: obj,
                    success: function (data) {
                        $(".pStatus").html("");
                        $("#sbClientName").html(data);
                        setCookie("user_Name", data);
                        $("#pConfigError").html("");
                        $("#pConfigSuccess").html("Nome atualizado com sucesso!");
                        $("#formNovoNome").val("");
                        $("#openCName").click();
                    }
                });

            } else {
                $(".pStatus").html("");
                $("#pConfigError").html("Nome inválido!");
            }

        });

        $("#formConfigEmail").click(function (e) {
            e.preventDefault();

            var new_Email = $("#formEmailNovo").val();
            var old_Email = $("#formEmailAtual").val();
            if (validateEmail(new_Email) == false || validateEmail(old_Email) == false) {
                $(".pStatus").html("");
                $("#pConfigError").html("Email com estrutura inválida! ex: nome@email.com");
            } else {

                var obj = {};
                obj.user_Token = getCookie("user_Token");
                obj.new_Email = new_Email;
                obj.old_Email = old_Email;

                $.ajax({
                    type: 'POST',
                    url: '/setClientEmail',
                    data: obj,
                    success: function (data) {
                        $(".pStatus").html("");
                        if (data.type == "error") {
                            $("#pConfigError").html(data.message);
                            $("#pConfigSuccess").html("");
                        } else {
                            $("#pConfigError").html("");
                            $("#pConfigSuccess").html(data.message);
                            $("#formEmailAtual").val("");
                            $("#formEmailNovo").val("");
                            $("#openCEmail").click();
                        }

                    }
                });
            }

        });

        $("#formConfigPassword").click(function (e) {
            e.preventDefault();
            $(".pStatus").html("");
            var old_Password = $("#formPassAtual").val();
            var new_Password = $("#formPassNova").val();
            var new_R_Password = $("#formRepetirPassNova").val();
            if (new_Password == "" || new_R_Password == "") {
                $("#pConfigError").html("Preencha todos os campos!");
            } else {
                if (new_Password != new_R_Password) {
                    $("#pConfigError").html("A password nova e a sua repetição não coincidem!");
                    $("#pConfigSuccess").html("");
                } else {

                    var obj = {};
                    obj.user_Token = getCookie("user_Token");
                    obj.new_Password = new_Password;
                    obj.old_Password = old_Password;

                    $.ajax({
                        type: 'POST',
                        url: '/setClientPassword',
                        data: obj,
                        success: function (data) {
                            if (data.type == "error") {
                                $("#pConfigError").html(data.message);
                                $("#pConfigSuccess").html("");
                            } else {
                                $("#pConfigError").html("");
                                $("#pConfigSuccess").html(data.message);
                                $("#formPassAtual").val("");
                                $("#formPassNova").val("");
                                $("#formRepetirPassNova").val("");
                                $("#openCPsw").click();
                            }

                        }
                    });
                }
            }


        });

        if (getCookie("user_Token") != "") {

            var obj = {};
            obj.user_Token = getCookie("user_Token");

            $.ajax({
                type: 'POST',
                url: '/getTicketTolerance',
                data: obj,
                success: function (data) {
                    $("#formTicketTolerance").val(parseInt(data.ticket_tolerance));
                }
            });
        }



    });

}