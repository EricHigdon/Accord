var myApp;
var url = 'http://accordapp.com/';

window.addEventListener("load", function () {
    window.loaded = true;
});

$(document).ready(function() {
    // write log to console
    ImgCache.options.debug = true;
    // increase allocated space on Chrome to 50MB, default was 10MB
    ImgCache.options.chromeQuota = 50*1024*1024;
    //load pages
    document.addEventListener("deviceready", checkModified, false);
});
function checkModified() {
    $.ajax({
        url: url+'modified/1/',
        crossDomain: true,
        dataType: 'json',
        success: function(data) {
            var saved = localStorage.cacheModified,
                modified = new Date(data.modified);
            if (localStorage.cacheModified === undefined || localStorage.pages === undefined || saved != modified) {
                loadPages(modified);
            }
            else {
                renderPages(JSON.parse(localStorage.pages));
            }
        }
    });
}

function loadPages(modified) {
    $.ajax({
        url: url+'api/1/',
        crossDomain: true,
        dataType: 'json',
        success: function(data) {
            renderPages(data);
            localStorage.setItem('cacheModified', modified);
            localStorage.setItem('pages', JSON.stringify(data));
        }
    });
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

    }, function () {
        console.error('ImgCache init: error! Check the log for errors');
    });
    setup();
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
    $$(document).on('ajaxStart', function(e){
       var xhr = e.detail.xhr;
       xhr.setRequestHeader('AUTHORIZATION', 'Basic YXBpX2F1dGg6ZXJpUTI5MzA=');
    });
    // Add view
    var mainView = myApp.addView('.view-main', {
        domCache: true //enable inline pages
    });
    //ga('create', 'UA-85602316-1', {
    //    'storage': 'none',
    //    'clientId':device.uuid
    //});
    //ga('set','checkProtocolTask',null);
    //ga('set','checkStorageTask',null);
    myApp.onPageInit('*', function (page) {
        ga('set', 'page', page.name);
        ga('send', 'pageview');
    });
    $$('body').on('beforeSubmit', '.ajax-submit', function(e) {
        myApp.showPreloader('Submitting');
    });
    $$('body').on('submit', '.ajax-submit', function(e) {
        // Required attribute HTML5 info http://stackoverflow.com/a/25010485 
        var missingMessages = [];
        $$('form [required]').each(function(key, value) {
            trimmedVal = $$(this).val().replace(/^\s+|\s+$/g, '');
            if (trimmedVal === '') {
                missingMessages.push($$(this).attr('placeholder') + ' is required.');
            }
        })
        if (missingMessages.length !== 0) {
            myApp.alert(missingMessages.join('<br/>'), '');
            event.preventDefault();
            event.stopPropagation();
        }
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
    $$('body').on('submitError', '.ajax-submit', function (e) {
      var xhr = e.detail.xhr; // actual XHR object
      var data = e.detail.data; // Ajax response from action file
      // do something with response data
        myApp.alert('There was a problem submitting this form.', '');
        myApp.hidePreloader();
    });
    $$('body').on('opened', '*', function() {
        var item = $$(this),
            container = $$('.page-on-center .page-content');
        container.scrollTop(item.offset().top + container.scrollTop(), 300);
    });
	var position = "center";
	var lastPosition = "center";
	var contentCSS = "";
	var body = $(".background-block");
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
    (function listen () {
	    if (window.loaded) {
		navigator.splashscreen.hide();
	    } else {
		window.setTimeout(listen, 50);
	    }
	})();

    function onSuccess(data) {
        console.log('controls success');
        console.log(data);
    }

    function onError(data) {
        console.log('controls error');
        console.log(data);
    }

    function mediaStatus(data) {
        console.log('media status');
        console.log(data);
    }

    function create_media_player(media) {
        media.play();
        MusicControls.create({
            track: 'Time is Running Out',
            artist: 'Muse',
            cover: 'albums/absolution.jpg',
            // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
            //           or a remote url ('http://...', 'https://...', 'ftp://...')
            isPlaying: true,
            dismissable: true,
            // hide previous/next/close buttons:
            hasPrev: false,
            hasNext: false,
            // iOS only, optional
            album: 'Absolution',
            duration: media.getDuration(),
            elapsed: media.getCurrentPosition(),
            // Android only, optional
            // text displayed in the status bar when the notification (and the ticker) are updated
            ticker: 'Now playing "Time is Running Out"'
        }, onSuccess, onError);
    }
    
    $('.playSermon').click(function(e) {
        e.preventDefault();
        var media_url = $(this).attr('href');
        var media = new Media(media_url, onSuccess, [onError], [mediaStatus]);
        create_media_player(media);
    });
    
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
            var url = 'http://accordapp.com/device/gcm/';
            // Save new registration ID
            localStorage.setItem('registrationId', data.registrationId);
            // Post registrationId to your app server as the value has changed
            if (device.platform == 'iOS') {
                url = 'http://accordapp.com/device/apns/';
            }
            $.ajax({
                url: url,
                headers: {
                    "Authorization": 'Basic YXBpX2F1dGg6ZXJpUTI5MzA='
                },
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
        if(data.additionalData['content-available'] == 1) {
            localStorage.removeItem('cacheModified');
            if(data.additionalData.foreground) {
            push.finish(function() {
                console.log("processing of push data is finished");
            });
                myApp.confirm(data.message, 'Update Available', function () {
                    navigator.splashscreen.show();
                location.reload();
                });
            }
            else {
            navigator.splashscreen.show();
                location.reload();
            }
        }
        else {
            myApp.alert(data.message, '');
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
