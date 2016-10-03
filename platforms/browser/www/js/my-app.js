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
            $.ajax({
                url: 'https://www.instagram.com/loveworks2016/media/',
                dataType: 'json',
                success: function(data) {
                    $.each(data.items, function(index) {
                        var item = this,
                            image = $('<img src="'+item.images.low_resolution.url+'" />');
                        $('.instafeed').append(image);
                    });
                    navigator.splashscreen.hide();
                }
            });
            setup();
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
    $$('body').on('beforeSubmit', '.ajax-submit', function(e) {
       myApp.showPreloader('Submitting');
    });
    $$('body').on('submitted', '.ajax-submit', function (e) {
      var xhr = e.detail.xhr; // actual XHR object
      var data = JSON.parse(e.detail.data); // Ajax response from action file
      if(data.success) {
          $(this).html('<p>Thanks for contacting us!</p>')
      }
      else {
          console.log(data);
      }
      myApp.hidePreloader();
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
    get_bible();
}

function slugify(Text)
{
    return Text
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'')
        ;
} 