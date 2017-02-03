var myApp,
    url = 'http://accordapp.com/',
    mediaPlayer,
    playTimer;

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
            try {
                navigator.splashscreen.hide();
            }
            catch(e) {
                console.log(e);
            }
	    } else {
		window.setTimeout(listen, 50);
	    }
	})();
    
    function log(item) {
        console.log(item);
    }
    
    function events(action) {
        switch(action) {
            case 'music-controls-next':
                // Do something
                break;
            case 'music-controls-previous':
                // Do something
                break;
            case 'music-controls-pause':
                mediaPlayer.pause();
                $('.playing').addClass('paused').removeClass('playing');
                break;
            case 'music-controls-play':
                mediaPlayer.play();
                $('.paused').addClass('playing').removeClass('paused');
                break;
            case 'music-controls-destroy':
                destroy_media_player();
                break;
            // Headset events (Android only)
            case 'music-controls-media-button' :
                // Do something
                break;
            case 'music-controls-headset-unplugged':
                // Do something
                break;
            case 'music-controls-headset-plugged':
                // Do something
                break;
            default:
                break;
        }
    }

// Register callback
MusicControls.subscribe(events);

// Start listening for events
// The plugin will run the events function each time an event is fired
MusicControls.listen();

    function create_media_player(item) {
        var media_url = item.attr('href');
        mediaPlayer = new Media(media_url);
        mediaPlayer.play();
        item.addClass('playing');

        var artist = "Fairfield West Baptist Church",
            title = item.attr("data-title"),
            album = "Sermons",
            image = item.parent().parent().parent().parent().find('img').attr("src"),
            duration = -1,
            counter = 0,
            elapsedTime = 0;
        mediaPlayer.getCurrentPosition(function(position){
            elapsedTime = position;
        });

        MusicControls.create({
            track: title,
            artist: artist,
            cover: image,
            isPlaying: true,
            dismissable: true,
            // hide previous/next/close buttons:
            hasPrev: false,
            hasNext: false,
            duration: duration,
            elapsed: elapsedTime,
            // Android only, optional
            // text displayed in the status bar when the notification (and the ticker) are updated
            ticker: 'Now playing ' + title
        });
        
        var params = [artist, title, album, image, duration, elapsedTime];
        var timerDur = setInterval(function() {
            counter = counter + 100;
            if (counter > 2000) {
                clearInterval(timerDur);
            }
            var dur = mediaPlayer.getDuration();
            if (dur > 0) {
                clearInterval(timerDur);
                duration = dur;
                params[4] = dur;
            }
        }, 100);
        console.log(params);
        playTimer = setInterval(function() {
            mediaPlayer.getCurrentPosition(function(position){
                elapsedTime = position;
            });
            console.log('elapsed time:', elapsedTime);
            params[5] = elapsedTime;
            window.remoteControls.updateMetas(function(success){
                console.log(success);
            }, function(fail){
                console.log(fail);
            }, params);
        }, 1000);

        document.addEventListener("remote-event", function(event) {
            console.log(event);
            switch (event.remoteEvent.subtype) {
                case 'pause':
                    mediaPlayer.pause();
                    $('.playing').addClass('paused').removeClass('playing');
                    break;
                case 'play':
                    mediaPlayer.play();
                    $('.paused').addClass('playing').removeClass('paused');
                    break;
                default:
                    break;
            }
        })
    }

    function destroy_media_player(){
        console.log('destroying');
        clearInterval(playTimer);
        $('.playing').removeClass('playing');
        $('paused').removeClass('paused');
        MusicControls.destroy();
        mediaPlayer.stop();
        mediaPlayer.release();
    }
    
    $('.playSermon').click(function(e) {
        e.preventDefault();
        item = $(this);
        if (item.hasClass('playing')) {
            mediaPlayer.pause();
            item.addClass('paused').removeClass('playing');
        }
        else if (item.hasClass('paused')) {
            mediaPlayer.play();
            item.addClass('playing').removeClass('paused');
        }
        else if (typeof mediaPlayer !== "undefined") {
            destroy_media_player();
            create_media_player(item);
        }
        else {  
            create_media_player(item);
        }
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
