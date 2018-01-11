$.ajax({
    type: "POST",
    url: "/configFireBase",
    success: function (data) {
        firebase.initializeApp(data);
    }
});

$(document).ready(function () {
    $("#sbLoginGPlus").click(function () {
        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider).then(function (result) {
            var obj = {};
            obj.name = result.additionalUserInfo.profile.name;
            obj.email = result.additionalUserInfo.profile.email;
            obj.google_id = result.additionalUserInfo.profile.id;

            $.ajax({
                type: "POST",
                url: "/googleAuth",
                data: obj,
                success: function (data) {
                    if (data.message == "login-true") {
                        location.reload();
                    }
                }
            });




        }).catch(function (error) {
            console.log(error)
        });
        return false;
    });
});