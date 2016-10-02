$(document).ready(function() {
    //load pages
    $.ajax({
        url: 'http://accord.erichigdon.com/api/bulletin/',
        crossDomain: true,
        dataType: 'json',
        success: function(data) {
            $.each(data.pages, function(index){
                $('div.pages').append(this.content);
                var link = $('<a href="#'+slugify(this.title)+'" class="no-animation">'+this.title+'</a>')
                $('.toolbar-inner').append(link)
                link.click(function(){
                    $('.active').removeClass('active');
                    $(this).addClass('active');
                });
                if (index == 0) {
                    link.addClass('active');
                }
            });
            setup();
            $.ajax({
                url: 'https://www.instagram.com/loveworks2016/media/',
                dataType: 'json',
                success: function(data) {
                    $.each(data.items, function(index) {
                        var item = this,
                            image = $('<img src="'+item.images.low_resolution.url+'" />');
                        $('.instafeed').append(image);
                        if(index == 7) {
                            return false;
                        }
                    });
                }
            });
        }
    });
});

function setup() {
    // Initialize your app
    var myApp = new Framework7({
        animatePages: true
    });

    // Export selectors engine
    var $$ = Dom7;
    
    // Add view
    var mainView = myApp.addView('.view-main', {
        domCache: true //enable inline pages
    });
    /*$("body").touchwipe({
         wipeLeft: function() { 
            var next_page = $('.active').next('a');
            next_page.click();
            mainView.router.load({pageName: next_page.attr('href').replace('#', '')});
         },
         wipeRight: function() { 
            var prev_page = $('.active').prev('a');
            prev_page.click();
            mainView.router.load({pageName: prev_page.attr('href').replace('#', '')});
         },
         wipeUp: false,
         wipeDown: false,
         min_move_x: 20,
         min_move_y: 20,
         preventDefaultEvents: false
    });*/
    $$('form.ajax-submit').on('submitted', function (e) {
      var xhr = e.detail.xhr; // actual XHR object
      var data = JSON.parse(e.detail.data); // Ajax response from action file
      if(data.success) {
          $$(this).html('<p>Thanks for contacting us!</p>')
      }
    });
    //Parallax home screen
    var bodyCSS = "0px 0px";
    var backgroundCSS = "0px 0px";
    var contentCSS = "translate3d( 0,0,0 );";

    window.ondeviceorientation = function(event) {
        gamma = event.gamma/90;
        beta = event.beta/180;
        var temp = 0;

        //handle actual device orientation relative to the user interface
        switch (window.orientation) {
            case 90: 
                temp = gamma;
                gamma = beta;
                beta = temp;
                break;
            case -90: 
                temp = -gamma;
                gamma = beta;
                beta = temp;
                break;
        }

        var increment = 15;
        var xPosition = (gamma * increment);
        var yPosition = (beta * increment)*2;

        bodyCSS = xPosition + "px " + yPosition + "px";
        backgroundCSS = "translate3d( " + (-xPosition) + "px, " + (-yPosition) + "px, " + " 0px)";

        var xPosition = -(gamma * increment);
        var yPosition = -(beta * increment)*2;
        contentCSS = "translate3d( " + (-xPosition) + "px, " + (-yPosition) + "px, " + " 0px)";

        //for debugging only
        //$(".content").html( "A:" + event.alpha + " B:" + event.beta + " G:" + event.gamma+ " _:" + event.absolute );
    }

    function render() {
        window.requestAnimationFrame( render );
        $(".instafeed").css( "-webkit-transform", backgroundCSS);
        $(".foreground-block").css( "-webkit-transform", contentCSS);
    }

    render();
}

function slugify(Text)
{
    return Text
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'')
        ;
} 