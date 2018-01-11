function runScriptAbout() {

    $(document).ready(function () {

        $(window).on('resize', function () {
            var new_height = (720 / 1280) * $("#iFrameDIV").width();
            $("#promoVideo").css("width", $("#iFrameDIV").width());
            $("#promoVideo").css("height", new_height);
        });


        $("#dFB").click(function () {
            window.open("https://www.facebook.com/daniel.carneiro.378");
        });

        $("#dGH").click(function () {
            window.open("https://github.com/DanielC14");
        });

        $("#fFB").click(function () {
            window.open("https://www.facebook.com/filipa.nora.9");
        });

        $("#rFB").click(function () {
            window.open("https://www.facebook.com/renato.costa.399");
        });
        
        var new_height = (720 / 1280) * $("#iFrameDIV").width();
        $("#promoVideo").css("width", $("#iFrameDIV").width());
        $("#promoVideo").css("height", new_height);


    });

}