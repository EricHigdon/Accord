var myApp;
document.addEventListener("deviceready", function(){
    // write log to console
    //ImgCache.options.debug = true;
    // increase allocated space on Chrome to 50MB, default was 10MB
    ImgCache.options.chromeQuota = 50*1024*1024;
    //load pages
    loadPages();
});

function loadPages() {
    if (localStorage.cacheExpires === undefined || localStorage.pages === undefined || new Date(localStorage.cacheExpires) <= new Date()) {
        $.ajax({
            url: 'http://accord.erichigdon.com/api/bulletin/',
            crossDomain: true,
            dataType: 'json',
            success: function(data) {
                renderPages(data);
                var expires = new Date();
                expires.setDate(expires.getDate() + 1); 
                localStorage.setItem('cacheExpires', expires);
                localStorage.setItem('pages', JSON.stringify(data));
            }
        });
    }
    else {
        renderPages(JSON.parse(localStorage.pages));
    }
}

function renderPages(data) {
    var pageData = data;
    $.each(pageData.pages, function(index){
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
    get_bible();
    loadInsta();
    setup();
}

function loadInsta() {
    if (localStorage.cacheExpires === undefined || localStorage.instaFeed === undefined || new Date(localStorage.cacheExpires) <= new Date()) {
        $.ajax({
            url: 'https://www.instagram.com/loveworks2016/media/',
            success: function(data) {
                renderInsta(data);
                var expires = new Date();
                expires.setDate(expires.getDate() + 1); 
                localStorage.setItem('cacheExpires', expires);
                localStorage.setItem('instaFeed', JSON.stringify(data));
            }
        });   
    }
    else {
        renderInsta(JSON.parse(localStorage.instaFeed));
    }
}

function renderInsta(data) {
    var instaData = data;
    ImgCache.init(function () {
        console.log('ImgCache init: success!');
        $.each(instaData.items, function(index) {
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

    }, function () {
        console.error('ImgCache init: error! Check the log for errors');
    });
}

function setup() {
    try {
        window.plugins.headerColor.tint("#0f1229");
    }
    catch(e) {}
    // Initialize your app
    myApp = new Framework7({
        animatePages: true
    });
    // Export selectors engine
    var $$ = Dom7;
    
    // Add view
    var mainView = myApp.addView('.view-main', {
        domCache: true //enable inline pages
    });
    ga('create', 'UA-85602316-1', {
        'storage': 'none',
        'clientId':device.uuid
    });
    ga('set','checkProtocolTask',null);
    ga('set','checkStorageTask',null);
    myApp.onPageInit('*', function (page) {
        ga('set', 'page', page.name);
        ga('send', 'pageview');
    });
    $$('body').on('beforeSubmit', '.ajax-submit', function(e) {
        myApp.showPreloader('Submitting');
    });
    $$('body').on('submitted', '.ajax-submit', function (e) {
      var xhr = e.detail.xhr; // actual XHR object
      var data = JSON.parse(e.detail.data); // Ajax response from action file
        ga('send', 'event', 'App', 'Form Submit', $(this).find('#id_form').val());
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
    setupNotifications();
}

function setupNotifications() {
    console.log('calling push init');
    var push = PushNotification.init({
        "android": {
            "senderID": "663980513133"
        },
        "browser": {},
        "ios": {
            "sound": true,
            "vibration": true,
            "badge": true
        },
        "windows": {}
    });
    console.log('after init');

    push.on('registration', function(data) {
        var oldRegId = localStorage.getItem('registrationId');
        if (oldRegId !== data.registrationId) {
            var url = 'http://accord.erichigdon.com/device/gcm/';
            // Save new registration ID
            localStorage.setItem('registrationId', data.registrationId);
            // Post registrationId to your app server as the value has changed
            if (device.platform == 'iOS') {
                url = 'http://accord.erichigdon.com/device/apns/';
            }
            $.ajax({
                url: url,
                headers: {"Authorization": 'Basic YXBpX2F1dGg6ZXJpUTI5MzA='},
                method: 'POST',
                dataType: 'json',
                data: {
                    'device_id': device.uuid,
                    'registration_id': data.registrationId,
                    'active': true
                },
                success: function(data) {
                    console.log('registration event: ' + data.registrationId);
                },
                error: function(error) {
                    console.error(error);
                }
            });
        }
    });

    push.on('error', function(e) {
        console.log("push error = " + e.message);
    });

    push.on('notification', function(data) {
        console.log('notification event');
	console.log(data);
	if(data.additionalData.content-available == 1) {
	    localStorage.removeItem('cacheExpires');
            location.reload();
	}
   });
}

function slugify(Text)
{
    return Text
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'')
        ;
} 
