/*
 * This file loads after JQuery and sets up variables and whatnot.
 */


// Constants
/**
 * API base URL
 */
APIURL = "";
//APIURL = "http://snipe-mobile-api/snipeapi/app/";
//APIURL = "http://localhost:8000/";
username = "";

/**
 * Get the full URL to call for API things.
 * @param {String} basename The name of the API file, without .php
 * @returns {String} The fully-qualified URL for that API request
 */
function mkApiUrl(basename) {
    return APIURL + basename + ".php";
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
        $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
        return;
    }
    if ($('#urlBox').val() === "") {
        $('#errormsg').text("Error:  Missing API address.");
        $('#errorbase').css('display', 'block');
        $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
        return;
    }
    APIURL = $('#urlBox').val();
    $.ajax({
        type: "POST",
        url: mkApiUrl("login"),
        data: {user: $('#usernameBox').val(), pass: $('#passwordBox').val()},
        cache: false,
        crossDomain: true,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            if (data.status === 'OK') {
                username = $('#usernameBox').val();
                localStorage.setItem("username", username);
                localStorage.setItem("apiurl", APIURL);
                openscreen("home");
            } else {
                $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
                $('#loginBtn').attr('disabled', false);
                $('#errormsg').text("Error: " + data.message);
                $('#errorbase').css('display', 'block');
            }
        },
        error: function () {
            $('#loginBtn').html('<i class="fa fa-sign-in"></i> Login');
            $('#loginBtn').attr('disabled', false);
            $('#errormsg').text("Error: Network failure.");
            $('#errorbase').css('display', 'block');
        }
    }
    );
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