document.addEventListener("deviceready", function(){
    // write log to console
    ImgCache.options.debug = true;
    // increase allocated space on Chrome to 50MB, default was 10MB
    ImgCache.options.chromeQuota = 50*1024*1024;
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
                success: function(data) {
                    ImgCache.init(function () {
                    console.log('ImgCache init: success!');
                        $.each(data.items, function(index) {
                        var item = this,
                        image = $('<img src="'+item.images.low_resolution.url+'" />');
                        ImgCache.isCached(image.attr('src'), function(path, success) {
                          if (success) {
                            // already cached
                            ImgCache.useCachedFile(image);
                          } else {
                            // not there, need to cache the image
                            ImgCache.cacheFile(image.attr('src'), function () {
                              ImgCache.useCachedFile(image);
                            });
                          }
                        });
                        $('.instafeed').append(image);
                        });
                        navigator.splashscreen.hide();
                        // from within this function you're now able to call other ImgCache methods
                        // or you can wait for the ImgCacheReady event

                    }, function () {
                        console.error('ImgCache init: error! Check the log for errors');
                    });
                }
            });
            setup();
            //window.FirebasePlugin.grantPermission();
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
    myApp.onPageInit('*', function (page) {
      window.FirebasePlugin.logEvent("page_view", {'page': page.name});
    });
    $$('body').on('beforeSubmit', '.ajax-submit', function(e) {
       myApp.showPreloader('Submitting');
    });
    $$('body').on('submitted', '.ajax-submit', function (e) {
      var xhr = e.detail.xhr; // actual XHR object
      var data = JSON.parse(e.detail.data); // Ajax response from action file
      window.FirebasePlugin.logEvent("submit_form", {'form': $(this).find('#id_form').val()});
      if(data.success) {
          $(this).html('<p>Thanks for contacting us!</p>')
      }
      else {
          console.log(data);
      }
      myApp.hidePreloader();
    });
	var position = "center";
	var lastPosition = "center";
	var contentCSS = "";
	var body = $(".instafeed");
	var content = $(".foreground-block");
	window.suspendAnimation = false;
	 
	var xMovement = 15;
	var yMovement = 40;
	var halfX = xMovement/2;
	var halfY = yMovement/2;
	 
	window.ondeviceorientation = function(event) {
	 var gamma = event.gamma/90;
	 var beta = event.beta/180;
	 
	 var temp = 0;
	 
	 //fix for holding the device upside down
	 if ( gamma >= 1 ) {
	  gamma = 2- gamma;
	 } else if ( gamma <= -1) {
	  gamma = -2 - gamma;
	 }
	 
	 // shift values/motion based upon device orientation
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
	 
	 // update positions to be used for CSS
	 var yPosition = -yMovement - (beta * yMovement);
	 var xPosition = -xMovement - (gamma * xMovement);
	 var contentX = (-xMovement - xPosition)/2;
	 var contentY = (-yMovement - yPosition)/2;
	 
	 // generate css styles
	 position = "translate3d( " + (contentX.toFixed(1) * -1) + "px, " + (contentY.toFixed(1) * -1) + "px, " + " 0px)";
	 contentCSS = "translate3d( " + (contentX.toFixed(1)) + "px, " + (contentY.toFixed(1)) + "px, " + " 0px)";
	}
	 
	function updateBackground() {
	 
	 if (!window.suspendAnimation) {
	  if ( position.valueOf() != lastPosition.valueOf() ) {	 
	   body.css( "-webkit-transform", position);
	   content.css( "-webkit-transform", contentCSS);
	   lastPosition = position;
	  }
	 } else {
	  lastPosition = "translate3d(0px, 0px, 0px)";;
	 }
	 
	 window.requestAnimationFrame(updateBackground);
	}
	 
	window.requestAnimationFrame(updateBackground);
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
