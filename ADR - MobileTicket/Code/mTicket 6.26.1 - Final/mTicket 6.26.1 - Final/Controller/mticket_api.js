function api_getServices(service_name, callback) {
    var obj = {};
    obj.service_name = service_name;
    $.ajax({
        type: 'POST',
        url: 'https://mticket.herokuapp.com/API_getServices',
        data: obj

    }).done(function (data) {

        if (data == "") {
            console.error("Erro 404 : Serviço não encontrado!");
        } else {
            callback(data);
        }
    });
}

function api_getTicketHistory(callback) {
    $.ajax({
        type: 'POST',
        url: 'https://mticket.herokuapp.com/API_getTicketHistory'
    }).done(function (data) {
        callback(data);
    });
}