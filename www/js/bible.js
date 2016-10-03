function get_bible(){
    $('scripture').each(function() {
        var element = $(this),
            start_verse = element.attr('data-book')+element.attr('data-start-chapter')+':'+element.attr('data-start-verse'),
            end_verse = element.attr('data-end-verse');
        $.ajax({
            url:'http://getbible.net/json',
            dataType: 'jsonp',
            data: 'v=kjv&p='+start_verse+'-'+end_verse,
            jsonp: 'getbible',
            success:function(json){
                console.log(json);
                // set text direction
                if (json.direction == 'RTL'){
                    var direction = 'rtl';
                } else {
                    var direction = 'ltr'; 
                }
                // check response type
                if (json.type == 'verse'){
                    var output = '';
                        $.each(json.book, function(index, value) {
                            output += '<center><b>'+value.book_name+' '+value.chapter_nr+'</b></center><br/><p class="'+direction+'">';
                            $.each(value.chapter, function(index, value) {
                                output += '  <sup class="ltr">' +value.verse_nr+ '</sup>  ';
                                output += value.verse;
                                output += '<br/>';
                            });
                            output += '</p>';
                        });
                    element.html(output);  // <---- this is the div id we update
                } else if (json.type == 'chapter'){
                    var output = '<center><b>'+json.book_name+' '+json.chapter_nr+'</b></center><br/><p class="'+direction+'">';
                    $.each(json.chapter, function(index, value) {
                        output += '  <sup class="ltr">' +value.verse_nr+ '</sup>  ';
                        output += value.verse;
                        output += '<br/>';
                    });
                    output += '</p>';
                    element.html(output);  // <---- this is the div id we update
                } else if (json.type == 'book'){
                    var output = '';
                    $.each(json.book, function(index, value) {
                        output += '<center><b>'+json.book_name+' '+value.chapter_nr+'</b></center><br/><p class="'+direction+'">';
                        $.each(value.chapter, function(index, value) {
                            output += '  <sup class="ltr">' +value.verse_nr+ '</sup>  ';
                            output += value.verse;
                            output += '<br/>';
                        });
                        output += '</p>';
                    });
                    if(addTo){
                        element.html(output);  // <---- this is the div id we update
                    }
                }
            },
            error:function(e){
                console.log(e);
                element.html('<h2>No scripture was returned, please try again!</h2>'); // <---- this is the div id we update
             },
        }); 
    });
}