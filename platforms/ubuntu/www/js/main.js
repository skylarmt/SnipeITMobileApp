/*
 * This file loads after JQuery and sets up variables and whatnot.
 */


// Constants
/**
 * API base URL
 */
APIURL = "";
username = "";
password = "";

/**
 * Get the full URL to call for API things.
 * @param {String} basename The name of the API file, without .php
 * @returns {String} The fully-qualified URL for that API request
 */
function mkApiUrl(basename) {
    return APIURL + basename + ".php" + URLAPPEND;
}

/*
 * Runs when the app opens
 */
$(document).ready(function () {
    openscreen('login');
});


function dologin() {
    $('#errorbase').hide();
    $('#loginBtn').html('<i class="fa fa-cog fa-spin"></i> Logging in...');
    $('#loginBtn').attr('disabled', true);
    if ($('#usernameBox').val() === "") {
        $('#errormsg').text("Error:  Missing username.");
        $('#errorbase').css('display', 'block');
    }
    $.post(mkApiUrl("authuser"),
            {username: $('#usernameBox').val(), password: $('#passwordBox').val(), merchant: MERCHANTID},
            function (data) {
                if (data.status === 'OK') {
                    username = $('#usernameBox').val();
                    password = $('#passwordBox').val();
                    localStorage.setItem("username", username);
                    openscreen("home");
                } else {
                    $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
                    $('#loginBtn').attr('disabled', false);
                    $('#errormsg').text("Error: " + data.message);
                    $('#errorbase').css('display', 'block');
                }
            }, "json").fail(function () {
        $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
        $('#loginBtn').attr('disabled', false);
        $('#errormsg').text("Error: Network failure.");
        $('#errorbase').css('display', 'block');
    });
}

/**
 * Switches the app to the given screen.
 * @param {String} screenname The name of the screen to show.
 * @param {String} effect FADE, SLIDE, or nothing
 * @returns {undefined}
 */
function openscreen(screenname, effect) {
    if (effect === 'FADE') {
        $('#content-zone').fadeOut('slow', function () {
            $('#content-zone').load("screens/" + screenname + ".html", function () {
                $('#content-zone').fadeIn('slow');
            });
        });
    } else if (effect === 'SLIDE') {
        $('#content-zone').slideToggle('400', function () {
            $('#content-zone').load("screens/" + screenname + ".html", function () {
                $('#content-zone').slideToggle('400');
            });
        });
    } else {
        $('#content-zone').load("screens/" + screenname + ".html");
    }
}

function scanCode() {
    try {
        cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (!result.cancelled) {
                        if (result.format.toString().toUpperCase() === "QR_CODE") {
                            startTransaction(result.text);
                        } else {
                            navigator.notification.alert("Please scan a valid QR code.", null, "Error", 'Dismiss');
                        }
                    }
                },
                function (error) {
                    navigator.notification.alert("Scanning failed: " + error, null, "Error", 'Dismiss');
                }
        );
        /*cordova.plugins.barcodeScanner.scan(
         function (result) {
         alert("We got a barcode\n" +
         "Result: " + result.text + "\n" +
         "Format: " + result.format + "\n" +
         "Cancelled: " + result.cancelled);
         },
         function (error) {
         alert("Scanning failed: " + error);
         }
         );*/
    } catch (ex) {
        alert(ex.message);
    }
}

function startTransaction(qrcodestring) {
    if (/^http:\/\/noidpay\.net\/#[0-9\.]+\|[0-9]+$/.test(qrcodestring)) {
        transdata = qrcodestring.replace("http://noidpay.net/#", "").split("|");
        transactionamt = transdata[0];
        transactionid = transdata[1];
        openscreen("pay");
    } else {
        navigator.notification.alert("This isn't a valid payment code!", null, "Error", 'Dismiss');
    }
}

function cancelTransaction() {
    transactionamt = 0;
    transactionid = 0;
    openscreen("home");
}

function finishTransaction() {
    $.post(mkApiUrl("transaction"),
            {username: username, password: password, type: BALANCETYPE, transid: transactionid},
            function (data) {
                if (data.status === 'OK') {
                    transactionamt = 0;
                    transactionid = 0;
                    openscreen("paymentsent", "FADE");
                } else {
                    navigator.notification.alert("Error: " + data.message, function () {
                        transactionamt = 0;
                        transactionid = 0;
                        openscreen("home");
                    }, "Failed", 'Dismiss');
                }
            }, "json").fail(function () {
        navigator.notification.alert("Error: Network failure.", function () {
            cancelTransaction();
        }, "Error", 'Dismiss');
    });
}

function sendMoneyToPeer() {
    if (/^[0-9\.]+$/.test($('#payAmt').val())) {
        $.post(mkApiUrl("peertransfer"),
                {username: username, password: password, type: BALANCETYPE, merchant: MERCHANTID, amt: $('#payAmt').val(), sendto: $('#recuser').val()},
                function (data) {
                    if (data.status === 'OK') {
                        openscreen("peersent", "FADE");
                    } else {
                        navigator.notification.alert("Error: " + data.message, function () {
                            openscreen("peerpay");
                        }, "Failed", 'Dismiss');
                    }
                }, "json").fail(function () {
            navigator.notification.alert("Error: Network failure.", null, "Error", 'Dismiss');
        });
    } else {
        navigator.notification.alert("Error: Please enter a number.", function () {
            $('#payAmt').val("");
        }, "Error", 'Dismiss');
    }
}