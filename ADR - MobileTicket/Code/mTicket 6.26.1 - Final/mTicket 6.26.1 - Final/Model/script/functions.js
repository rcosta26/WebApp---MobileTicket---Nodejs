var sv = require("../server.js");

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
var services = [];
var updatingDB = false;
var timerFill;

// GENERATE TOKEN FOR REGISTER
// NAO FUNCIONA EM TODAS AS VERSOES DO NODEJS
function generateToken(callback) {

    var token = sv.tokenG.generate();

    sv.connection.query("SELECT token_user FROM proj_cliente WHERE token_user = '" + token + "'", function (err, rows, fields) {
        if (!err) {
            if (rows.length >= 1) {
                generateToken();
            } else {
                callback(token);
            }
        }
    });

}

//generates a new password when the user resets it
function generatePassword(callback) {
    var stringLength = 9;

    // list containing characters for the random string
    var stringArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    var rndString = "";

    for (var i = 1; i < stringLength; i++) {
        var rndNum = Math.ceil(Math.random() * stringArray.length) - 1;
        rndString = rndString + stringArray[rndNum];
    };

    callback(rndString);
}

//gets from the db to the object "Servico" to allow more faster changes in services tickets
function fillServico() {
    if (updatingDB == false) {
        services.length = 0;
        sv.connection.query("SELECT * FROM proj_servico ORDER BY nome_servico ASC", function (err, rows, fields) {
            if (rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    services.push(new Servico(rows[i].id_servico, rows[i].nome_servico, rows[i].fila_atual, rows[i].senha_atual, rows[i].senhas_tiradas, rows[i].fila_tirada, rows[i].media_espera));
                }
            }

        });
    }

}

//updates the db with the object "Servico"
function updateDataBase(callback) {

    updatingDB = true;
    var count = 0;
    if (services.length > 0) {
        for (var i = 0; i < services.length; i++) {
            sv.connection.query("UPDATE proj_servico SET fila_atual= '" + services[i].fila_atual + "', senha_atual=" + parseInt(services[i].senha_atual) + ", senhas_tiradas = " + parseInt(services[i].senhas_tiradas) + ", fila_tirada = '" + services[i].fila_tirada + "' WHERE id_servico = " + parseInt(services[i].id_servico) + ";", function (err) {

                if (!err) {
                    count++;
                    if (count == services.length) {
                        if (callback != undefined) {
                            callback();
                        }
                        updatingDB = false;
                    }


                } else {
                    console.log(err);
                }

            });

        }
    } else {
        if (callback != undefined) {
            callback();
        }
        updatingDB = false;
    }


}

//function to send an email
function sendEmail(type, emailTo, callback) {

    if (type == "register") {
        var subject = "Bem-vindo ao MobileTicket";
        var emailUrl = 'https://webitcloud.net/PW/1617/ADR/index/html/Email/register.html';

        sv.request({
            url: emailUrl,
            json: true
        }, function (error, response, body) {
            if (!error) {
                var mailOptions = {
                    from: 'adr@webitcloud.net', // sender address
                    to: emailTo, // list of receivers
                    subject: subject, // Subject line
                    html: body // html body
                };
                sv.transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                });
            }
        });

    } else if (type == "resetPsw") {
        var subject = "Redifinir password";
        var emailUrl1 = 'https://webitcloud.net/PW/1617/ADR/index/html/Email/resetPassword_pt1.html';
        var emailUrl2 = 'https://webitcloud.net/PW/1617/ADR/index/html/Email/resetPassword_pt2.html';

        var text = "";

        sv.request({
            url: emailUrl1,
            json: true
        }, function (error, response, body) {
            if (!error) {
                text += body;

                generatePassword(function (new_psw) {

                    text += new_psw;

                    sv.request({
                        url: emailUrl2,
                        json: true
                    }, function (error, response, body) {
                        if (!error) {

                            text += body;

                            sv.connection.query("UPDATE proj_cliente SET password = '" + new_psw + "' WHERE email = '" + emailTo + "'", function (err) {
                                if (!err) {
                                    var mailOptions = {
                                        from: 'adr@webitcloud.net', // sender address
                                        to: emailTo, // list of receivers
                                        subject: subject, // Subject line
                                        html: text // html body
                                    };
                                    sv.transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            return console.log(error);
                                        } else {
                                            callback("success");
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    }

}

//calculate average wait time of a service
function calculateWaitTime() {
    sv.connection.query("SELECT id_servico, AVG(tempo_espera) as average_wt FROM proj_historico_media GROUP BY id_servico;", function (err, rows, fields) {
        if (!err) {
            for (var i = 0; i < rows.length; i++) {
                sv.connection.query("UPDATE proj_servico SET media_espera = " + rows[i].average_wt + " WHERE id_servico = " + rows[i].id_servico + ";");
            }
        } else {
            console.log(err);
        }


    });
}

//automatically resets tickets at 3am
//poderá não ser executado caso o servidor (heroku) esteja em idle mode
//de resto o codigo encontra-se funcional com o servidor (heroku) ativo ou em localhost
function automaticResetTickets() {
    var today = new Date();
    var hh = today.getHours() + 1;
    if (hh == 3) {
        for (var i = 0; i < services.length; i++) {
            services[i].fila_atual = "A";
            services[i].senha_atual = 0;
            services[i].fila_tirada = "A";
            services[i].senhas_tiradas = 0;
        }
        updateDataBase();
        sv.connection.query("DELETE FROM proj_pedido");
        sv.connection.query("DELETE FROM proj_historico_func");
    }

}

function startFillTimer() {
    timerFill = setInterval(fillServico, 30000);
}

function stopFillTimer() {
    clearInterval(timerFill);
}

function Servico(id_servico, nome_servico, fila_atual, senha_atual, senhas_tiradas, fila_tirada, media_espera) {
    this.id_servico = id_servico;
    this.nome_servico = nome_servico;
    this.fila_atual = fila_atual;
    this.senha_atual = senha_atual;
    this.senhas_tiradas = senhas_tiradas;
    this.fila_tirada = fila_tirada;
    this.media_espera = media_espera;
}

//timers so funcionam se o servidor (heroku) estiver fora de idle mode, 
//EXECUTE EVERY 5 MINUTES
setInterval(calculateWaitTime, 300000);

//EXECUTE EVERY 1 HOUR
setInterval(automaticResetTickets, 3600000);

module.exports = {
    generateToken: generateToken,
    generatePassword: generatePassword,
    fillServico: fillServico,
    updateDataBase: updateDataBase,
    sendEmail: sendEmail,
    calculateWaitTime: calculateWaitTime,
    startFillTimer: startFillTimer,
    stopFillTimer: stopFillTimer,
    Servico: Servico,
    services: services,
    months: months,
    letters: letters,
    updatingDB: updatingDB,
    timerFill: timerFill

}