var jscrobbler = {};

jscrobbler = (function() {
    var model = {};
    
    var api_url = 'https://ws.audioscrobbler.com/2.0/';
    var api_key = '';
    var api_secret = '';
    
    function generate_signature(data) {
        var keys = Object.keys(data).sort();
        var len = keys.length;
        var str = '';
        
        for(var i=0; i<len; i++) {
            str += keys[i] + data[keys[i]];
        }
        
        api_signature = hex_md5(str+api_secret);
        return api_signature;
    }
    
    function call(method,data,secure,callback) {
        var default_data = {
            method: method,
            api_key: api_key,
        }
        if(secure) {
            default_data.sk = model.session_key;
        }
        
        var combined_data = $.extend({},default_data,data);
        var signature = generate_signature(combined_data);
        var post_data = $.extend({},combined_data,{api_sig: signature});
        
        $.post(
            api_url,
            post_data,
            function(data) {
                if(typeof(callback) != 'undefined') {
                    callback(data);
                }
            },
            'xml'
        );
    }
    
    model.authenticate = function(username, password) {
        var that = this;
        var data = {
            username: username,
            password: password
        };
        
        call('auth.getMobileSession',data,false,function(data){
            var key = $(data).find('key').text();
            that.authenticated = true;
            that.session_key = key;
        });
    };
    model.scrobble = function(artist, track) {
        var that = this;
        var date = new Date();
        var utc_timestamp = Math.floor((date.getTime() + date.getTimezoneOffset()*60000)/1000);
        var data = {
            artist: artist,
            track: track,
            timestamp: utc_timestamp,
        };
        
        call('track.scrobble',data,true);
    };
    model.authenticated = false;
    model.session_key = '';
    
    return model;
}());