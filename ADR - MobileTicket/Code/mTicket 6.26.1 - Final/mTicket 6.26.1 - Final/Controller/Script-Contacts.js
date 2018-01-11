function runScriptContacts() {


    $(document).ready(function () {



        $("#dFB").click(function () {
            window.open("https://www.facebook.com/daniel.carneiro.378");
        });

        $("#fFB").click(function () {
            window.open("https://www.facebook.com/filipa.nora.9");
        });

        $("#rFB").click(function () {
            window.open("https://www.facebook.com/renato.costa.399");
        });

        $("#formSendEmail").click(function (e) {
            e.preventDefault();
            if ($("#formEmail")[0].checkValidity() == true) {
                if ($("#formNome")[0].checkValidity() == true) {
                    if ($("#formAssunto")[0].checkValidity() == true) {
                        if ($("#formMensagem").val() != "") {
                            var obj = {};
                            obj.email = $("#formEmail").val();
                            obj.name = $("#formNome").val();
                            obj.subject = $("#formAssunto").val();
                            obj.message = $("#formMensagem").val();

                            $.ajax({
                                type: 'POST',
                                url: '/sendEmail',
                                data: obj

                            }).done(function (data) {
                                if (data == "success") {
                                    $("#formEmail").val("");
                                    $("#formNome").val("");
                                    $("#formAssunto").val("");
                                    $("#formMensagem").val("");
                                    $("#pSendEmailSuccess").html(
                                        "Email enviado com sucesso! Obterá a sua resposta assim que possível."
                                    );
                                }
                            });

                        } else {
                            $("#pSendEmailError").html("Coloque a sua mensagem!");
                        }
                    } else {
                        $("#pSendEmailError").html("Preencha o campo de assunto!");
                    }
                } else {
                    $("#pSendEmailError").html("Preencha o campo do nome!");
                }
            } else {
                $("#pSendEmailError").html("Preencha o campo de email corretamente!");
            }
        });


    });

}