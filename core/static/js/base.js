$(document).ready(function() {
    $('label[for="id_value"]').parent().hide();

    $('#id_username').keyup(function() {
        var input = $(this);
        var form_group = input.parents('div.form-group');
        var val = $(this).val();

        if (/[@\s]/.test(val) || val.length < MIN_USERNAME_LENGTH || val.length > MAX_USERNAME_LENGTH) {
            form_group.addClass('has-error');
        } else {
            form_group.removeClass('has-error');
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
