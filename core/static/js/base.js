function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

var exists_timeout;
var exists = function() {
    if (typeof exists_timeout === "undefined") {
        clearTimeout(exists_timeout)
    }
    var username = $('input#id_username').val();
    var statuscheck = $('#status-check')
    var form_group = $('.form-group#fg_username');

    exists_timeout = setTimeout(function() {
        var username = $('input#id_username').val();
        var domain = $('select#id_domain option:selected').text();
        console.log('Check existence for ' + username + '@' + domain);
        console.log('Calling ' + exists_url);
        $.post(exists_url, {
            username: username,
            domain: domain
        }).done(function(data) {
            console.log('remove class!');
            form_group.removeClass('has-error');
            statuscheck.find('span').hide();
            statuscheck.find('#username-ok').show();
        }).fail(function(data) {
            form_group.addClass('has-error');
            statuscheck.find('span').hide();
            if (data.status == 404) {
                statuscheck.find('#username-taken').show();
            } else {
                statuscheck.find('#username-error').show();
            }
        });
    }, 100);
}

$(document).ready(function() {
    $('label[for="id_value"]').parent().hide();

    $('#id_username').keyup(function() {
        var input = $(this);
        var form_group = input.parents('div.form-group');
        var status_check = $('#status-check')
        var val = $(this).val();

        if (val.length < MIN_USERNAME_LENGTH) {
            status_check.find('span').hide();
            status_check.find('#default').show();
            form_group.addClass('has-error');
        } else if (/[@\s]/.test(val) || val.length > MAX_USERNAME_LENGTH) {
            status_check.find('span').hide();
            status_check.find('#username-error').show();
            form_group.addClass('has-error');
        } else {
            exists();
        }
    });

    $('#id_email').keyup(function() {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var input = $(this);
        var form_group = input.parents('div.form-group');
        if (re.test($(this).val())) {
            form_group.removeClass('has-error');
        } else {
            form_group.addClass('has-error');
        }
    });

    $('.fblike').on('click', function(event) {
        // Generate a string containing the HTML to place in the element (for readability)
        var html = "<div id=\"fb-root\">\n";
        html += "<div class=\"fb-follow\" data-href=\"https://www.facebook.com/" + FACEBOOK_PAGE + "\" data-colorscheme=\"light\" data-layout=\"button\" data-show-faces=\"true\"></div>\n";
        html += "<div class=\"fb-like\" data-href=\"https://facebook.com/" + FACEBOOK_PAGE + "\" data-send=\"true\" data-layout=\"button_count\" data-width=\"100\" data-show-faces=\"false\" data-font=\"arial\">\n";
        html += "</div>\n";

        // Replace the specified element's contents with the HTML necessary to display the
        // Like/+1 Buttons, *before* loading the SDKs below
        $('.fblike').html(html);

        // This is the code provided by facebook to asynchronously load their SDK
        var e = document.createElement('script'); e.async = true;
        e.src = document.location.protocol +
          '//connect.facebook.net/en_US/all.js#xfbml=1';
        document.getElementById('fb-root').appendChild(e);
    });

    $('.twitter-follow').on('click', function(event) {
        var html = '<iframe src="//platform.twitter.com/widgets/follow_button.html?screen_name=' + TWITTER_PAGE + '&show_count=false&dnt=true" style="width: 300px; height: 20px;" allowtransparency="true" frameborder="0" scrolling="no"></iframe>';
        $('.twitter-follow').html(html);
    });
});
