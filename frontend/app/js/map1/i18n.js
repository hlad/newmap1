var map1 = map1 || {}

map1.I18n = $class({
	constructor: function() {
		var self = this
		self.dictionary = {}
		$.ajax({ 
		    url: "http://ajaxhttpheaders.appspot.com", 
		    dataType: 'jsonp', 
		    success: function(headers) {
			var languages = headers['Accept-Language'].split(',');
			var language = 'en';
			for ( i in languages ) {
			    var lang = languages[i].split(';')[0].split('-')[0];
			    if ( $.inArray(lang,['en','de','fr','it','cs','es'])!=-1 ) {				
				language = lang
				break;
			    }			
			}
			self.language = language
			$.getJSON("locales/" + language + ".json", function(data) {			    
			    self.dictionary = data
			    self.translate($(document))
			}).fail(function(xhr, ajaxOptions, thrownError) {			    
			    console.log(thrownError);
			    alert(xhr.status);
			});
		    }
		});
		
	},
            
    translate: function(obj) {	
        self = this
        obj.find('*[data-i18n-src]').each(function(i){
            text = $(this).attr('src')            
            if ( text in self.dictionary ) {                
                $(this).attr('src',self.dictionary[text])
                $(this).removeAttr('data-i18n-src')
            }
        });
	obj.find('*[data-i18n-alt]').each(function(i){
            text = $(this).attr('alt')            
            if ( text in self.dictionary ) {                
                $(this).attr('alt',self.dictionary[text])
                $(this).removeAttr('data-i18n-alt')
            }
        });
	obj.find('*[data-i18n-title]').each(function(i){
            text = $(this).attr('title')            
            if ( text in self.dictionary ) {                
                $(this).attr('title',self.dictionary[text])
                $(this).removeAttr('data-i18n-title')
            }
        });
        obj.find('*[data-i18n]').each(function(i){	    
            text = $(this).text().replace(/^\s+|\s+$/g,"")           
            if ( text in self.dictionary ) {
                $(this).text(self.dictionary[text])
                $(this).removeAttr('data-i18n')
            }
        });        
    }	
});
