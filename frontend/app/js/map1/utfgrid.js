var map1 = map1 || {}
map1.utfgrid = map1.utfgrid || {}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$(document).ready(function() {
    $.get( "/featureinfo/_header.html", function(template) {
        ich.addTemplate('fi__header',template)
    });
    
    $.get( "/featureinfo/_footer.html", function(template) {
        ich.addTemplate('fi__footer',template)
    });
    
    $.get( "/featureinfo/default.html", function(template) {
        ich.addTemplate('fi_default',template)
    });
    
    $.get( "/featureinfo/highway.html", function(template) {
        ich.addTemplate('fi_highway',template)
    });
    
    $.get( "/featureinfo/landuse.html", function(template) {
        ich.addTemplate('fi_landuse',template)
    });
    
    $.get( "/featureinfo/natural.html", function(template) {
        ich.addTemplate('fi_natural',template)
    });
    
    $.get( "/featureinfo/waterway.html", function(template) {
        ich.addTemplate('fi_waterway',template)
    });
    
    $.get( "/featureinfo/railway.html", function(template) {
        ich.addTemplate('fi_railway',template)
    });
    
    $.get( "/featureinfo/tourism.html", function(template) {
        ich.addTemplate('fi_tourism',template)
    });
    
    $.get( "/featureinfo/history.html", function(template) {
        ich.addTemplate('fi_history',template)
    });
    
    $.get( "/featureinfo/amenity.html", function(template) {
        ich.addTemplate('fi_history',template)
    });
    
    $.get( "/featureinfo/sport.html", function(template) {
        ich.addTemplate('fi_sport',template)
    });
    
    $.get( "/featureinfo/building.html", function(template) {
        ich.addTemplate('fi_building',template)
    });
    
    $.get( "/featureinfo/shop.html", function(template) {
        ich.addTemplate('fi_shop',template)
    });
    
    $.get( "/featureinfo/man_made.html", function(template) {
        ich.addTemplate('fi_man_made',template)
    });
    
    $.get( "/featureinfo/barrier.html", function(template) {
        ich.addTemplate('fi_barrier',template)
    });
    
    $.get( "/featureinfo/history.html", function(template) {
        ich.addTemplate('fi_history',template)
    });
      
})

map1.utfgrid.Layer = OpenLayers.Class(OpenLayers.Layer.UTFGrid,{
    initialize: function(options) {
        options = options || {}
        options = OpenLayers.Util.extend({           
            utfgridResolution: 4,
            displayInLayerSwitcher: false,
            sphericalMercator: true,
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: new OpenLayers.Projection("EPSG:4326"), 
        }, options); 
        OpenLayers.Layer.UTFGrid.prototype.initialize.apply(this, [options]); 
        this.infoPopup = false       
    }
});

map1.utfgrid.ControlMouseMove =  OpenLayers.Class(OpenLayers.Control.UTFGrid,{
    initialize: function(map,options) {
        var self = this        
        this.infoPopup = false
        this.map = map        
        options = options || {}
        options = OpenLayers.Util.extend({            
            handlerMode: 'move',
            callback: function(infoLookup) { self.onMouseMove(infoLookup) }
        }, options); 
        OpenLayers.Control.UTFGrid.prototype.initialize.apply(this, [options]);                             
    },
    
    onMouseMove: function(infoLookup) { 
        
        var self = this
        
       
                
        if ( this.infoPopup !== false && this.infoPopup.timeOut ) {             
            clearTimeout(this.infoPopup.timeOut)
            this.infoPopup.timeOut = setTimeout(function() {  
                $('#gridinfo .current').hide()
                $('#gridinfo .current').html('')
                this.infoPopup = false
            },100);            
        }
        
        
        if ( this.map.isLocked() ) return
                
        var info = infoLookup != undefined ? infoLookup[Object.keys(infoLookup)[0]] : undefined
            
        //var data = {features: []}        
        if ( info !== undefined && info.data !== undefined && info.data.length > 0 ) {  
            this.infoPopup = {}                  
            this.infoPopup.timeOut = setTimeout(function() {                        
                $('#gridinfo .current').html('')            
                for ( i in info.data ) {
                    var data = jQuery.extend(true, {}, info.data[i]);
                   

                    data.tags = Object.keys(data).map(function(key) { return {key:key,value:data[key]} });                
                    
                    origin = false
                    originValue = false
                    
                    var accessTags = ['access','agricultural','bicycle','bus','caravan','carriage',
                        'foot','goods','hgv','horse','ice_skates','inline_skates','mofa','motor_vehicle','motorcar',
                        'motorcycle','motorhome','psv','ski','snowmobile','trailer','vehicle'];
                    
                    data.accesses = []
                    for ( j in accessTags ) {
                        if ( accessTags[j] in data ) {
                            
                            if ( -1 != $.inArray(data[accessTags[j]],['agricultural','customers','delivery','destination','forestry','no','permissive']) ) {
                                data.accesses.push({k: accessTags[j],v: data[accessTags[j]]})
                            }
                            else if ( -1 != $.inArray(data[accessTags[j]],['designated','yes']) ) {                           
                                data.accesses.push({k: accessTags[j]+'_i',v: data[accessTags[j]]})
                            }
                        }
                    }
                    
                    if ( 'highway' in data ) {
                        origin = 'highway'
                        if ( 'name' in data ) {
                            data.title = data.name
                            data.subtitle = 'Highway ' + data['highway']
                        }
                        else {
                            data.title = 'Highway ' + data['highway']
                        }                   
                        data.image = '/featureinfo/image/highway_' + data['highway']
                        if ( data['highway'] == 'track' && 'surface' in data && ['asphalt','gravel','ground','dirt','grass','concrete','paving_stones','cobblestone','compacted','wood','pebblestone','fine_gravel','earth','mud','concrete:plates','grass_paver','concrete:lanes'].indexOf(data['surface']) != -1 ) {
                            data.title += ' ' + data['surface']
                            data.image += '_' + data['surface']
                        }
                        else if ( data['highway'] == 'track' && 'tracktype' in data && ['grade1','grade2','grade3','grade4','grade5'].indexOf(data['tracktype']) != -1 ) {
                            data.title += ' ' + data['tracktype']
                            data.image += '_' + data['tracktype'] 
                        }
                        else if ( data['highway'] == 'service' && 'service' in data && ['parking_aisle','driveway','alley','drive-through'].indexOf(data['service']) != -1 ) {
                            data.title += ' ' + data['service']
                            data.image += '_' + data['service'] 
                        }
                        data.image += '.jpg'                   
                        template = ich.fi_highway 
                    }
                    else if ( 'landuse' in data ) {
                        origin = 'landuse'
                        template = ich.fi_landuse
                    }
                    else if ( 'natural' in data ) {
                        origin = 'natural'
                        template = ich.fi_natural
                    }
                    else if ( 'waterway' in data ) {
                        origin = 'waterway'
                        template = ich.fi_waterway
                    }
                    else if ( 'railway' in data ) {
                        origin = 'railway'
                        template = ich.fi_railway
                    }
                    else if ( 'tourism' in data && data['tourism'] != 'attraction' ) {
                        origin = 'tourism'
                        template = ich.fi_tourism
                    }
                    else if ( 'history' in data ) {
                        origin = 'history'
                        template = ich.fi_history
                    }
                    else if ( 'amenity' in data ) {
                        origin = 'amenity'
                        template = ich.fi_amenity
                    }
                    else if ( 'man_made' in data ) {
                        origin = 'man_made'
                        template = ich.fi_building
                    }
                    else if ( 'barrier' in data ) {
                        origin = 'barrier'
                        template = ich.fi_shop
                    }
                    else if ( 'sport' in data ) {
                        origin = 'sport'
                        template = ich.fi_sport
                    }
                    else if ( 'building' in data ) {
                        origin = 'building'
                        template = ich.fi_building
                    }
                    else if ( 'shop' in data ) {
                        origin = 'shop'
                        template = ich.fi_shop
                    }
                    else {
                        template = ich.fi_default
                    }

                    if ( origin !== false && originValue == false ) {
                        originValue = data[origin]
                    }

                    if (!('title' in data)) {
                        if ( 'name' in data ) {
                            data.title = data.name
                            if ( origin !== false ) {
                                data.subtitle = origin.capitalize() + ' ' + originValue
                            }
                        }                    
                        else if ( origin !== false ) {
                            data.title = origin.capitalize() + ' ' + originValue                        
                        }
                        else {
                            data.title = 'Map feature'
                            data.subtitle = data.osm_id
                        }                    
                    }
                    
                    if ( 'wikipedia' in data ) {
                        data.wikipedia = data.wikipedia.replace(':','.wikipedia.org/wiki/')      
                    }
                    if (!('image' in data && origin !== false )) {
                        data.image = '/featureinfo/image/'+origin + '_' + originValue + '.jpg'
                    }
                    
                    data.header = ich.fi__header(data).wrapAll('<div></div>').parent().html()
                    data.footer = ich.fi__footer(data).wrapAll('<div></div>').parent().html()                                
                    
                    content = template(data).wrapAll('<div></div>').parent()
                    self.map.i18n.translate(content)                
                    $('#gridinfo .current').append(content)
                    $('#gridinfo .current').show()
                    this.infoPopup.timeOut = false
                }
            },100);
        }
                         
                              
         
    }
});

map1.utfgrid.ControlClick =  OpenLayers.Class(OpenLayers.Control.UTFGrid,{
    initialize: function(map,options) {
        var self = this
        this.map = map
        options = options || {}
        options = OpenLayers.Util.extend({            
            handlerMode: 'click',
            callback: function(infoLookup) { self.onClick(infoLookup) }
        }, options); 
        OpenLayers.Control.UTFGrid.prototype.initialize.apply(this, [options]);                
    },
    onClick: function(infoLookup) {
        infoDialog = new map1.gui.Dialog(            
            '#dialog-info',
            null,
            '#dialog-info > .header > .close,#dialog-info > .footer > .close',
            null,
            null,
            null
        );        
        infoDialog.open()
        $('#dialog-info > .content').html($('#gridinfo .current').html())
        $('#gridinfo .current').html('')
        //if ( undefined != infoLookup[1] && undefined != infoLookup[1]['data'] && null != infoLookup[1]['data']['wiki'] ) {
        //    window.open('http://cs.wikipedia.org/wiki/'+infoLookup[1]['data']['wiki'], 'Wikipedie', '')
        //}    
    }
    
});










