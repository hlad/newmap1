var map1 = map1 || {}

function getHashParams() {

    var hashParams = {};
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&;=]+)=?([^&;]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.hash.substring(1);

    while (e = r.exec(q))
       hashParams[d(e[1])] = d(e[2]);

    return hashParams;
}

map1.Map = OpenLayers.Class(OpenLayers.Map,{
     initialize: function(options) {                  
         
        var self = this
         
        var MAP_TILE_URLS = [
            "/tiles/${z}/${x}/${y}.jpg"    
        ];

        var DATA_TILE_URLS = 
            "/tiles/${z}/${x}/${y}.js.gz"    
        ; 
        
        var REGIONS = {
            'EU' : [14.41,50.083,5],
            'IT' : [11.49857,43.26958,6],
            'FT' : [1.16044,47.06299,6],
            'England' : [-2.16842,52.7632,7],
            'UK' : [-4.55246,54.69318,6],
            'IR' : [-8.32077,53.66448,7],
            'Scotland' : [-4.45358,57.07685,7],
            'ES' : [-4.67331,40.40552,6],
            'PT' : [-7.55172,39.85111,7],
            'CH' : [8.20267,46.54788,7],
            'DE' : [8.41141,51.27942,6],
            'NL' : [5.75272,52.60002,7],
            'BE' : [4.90677,51.10039,7],
            'DK' : [9.80668,55.94795,7],
            'PL' : [19.23294,52.50818,6],
            'CZ' : [15.60746,49.91442,7],
            'SK' : [19.71634,48.90659,7],
            'HU' : [19.36478,47.19566,7],
            'AT' : [13.70682,47.22551,7],
            'SI' : [14.7725,45.93432,8],
            'HR' : [16.15677,44.63189,7],
            'RO' : [25.15458,45.68544,7],
            'UA' : [31.18607,48.98957,6],
            'BG' : [25.75882,42.40964,7],
            'GR' : [22.243,39.33682,7],
            'Crete' : [24.93485,35.19443,8],
            'CY' : [33.43277,35.09561,8]
        }
           
        self.devicePixelRatio = undefined == window.devicePixelRatio  ? 1 : window.devicePixelRatio;
        
        hashParams = getHashParams()
                
        
        var options = {
            div: "map",
            controls: [],           
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: new OpenLayers.Projection("EPSG:4326"), 
            maxExtent: new OpenLayers.Bounds(-10, 35, 35, 70).transform(
                new OpenLayers.Projection("EPSG:4326"),
                new OpenLayers.Projection("EPSG:900913")
            ),           
            tileSize: new OpenLayers.Size(256/self.devicePixelRatio, 256/self.devicePixelRatio)
        }
        OpenLayers.Map.prototype.initialize.apply(this, [options]);
        
        this.locked = false
        
        this.i18n = new map1.I18n()
                
        this.search = new map1.Search(this)        
        
        this.layerMap = new OpenLayers.Layer.XYZ("map", MAP_TILE_URLS, {
            transitionEffect: "resize", 
            buffer: 0, 
            sphericalMercator: true,            
            isBaseLayer: true      
        });        
        this.addLayer(this.layerMap)
        
        var is_touch_device = 'ontouchstart' in document.documentElement;
        //this.addLayer(this.layerUtfgrid)
        
        if ( $.cookie('gridinfo') == undefined ) {
            self.gridinfoOn = $(window).width() > 1400  && !is_touch_device            
        }
        else {            
            self.gridinfoOn = $.cookie('gridinfo') == 'true' ? true : false
        }        
        
        this.events.register("movestart", self, function() {
            if ( self.utfgridTimer != undefined ) {
                clearTimeout(self.utfgridTimer)
            }
            if ( self.gridinfoOn && self.layerUtfgrid != undefined ) {
                self.removeControl(self.controlUtfgridMouseMove)
                self.controlUtfgridMouseMove.deactivate()
                self.controlUtfgridMouseMove.destroy()
                self.controlUtfgridMouseMove = undefined
                self.removeControl(self.controlUtfgridClick)
                self.controlUtfgridClick.deactivate()
                self.controlUtfgridClick.destroy()
                self.controlUtfgridClick = undefined
                self.removeLayer(self.layerUtfgrid)
                self.layerUtfgrid.destroy()
                self.layerUtfgrid = undefined                 
            }            
        });
        
        this.events.register("moveend", self, function() {
            
            ga('send', 'pageview');
            
            self.utfgridTimer = setTimeout(function() {
                if ( self.gridinfoOn && self.layerUtfgrid == undefined ) {
                    self.layerUtfgrid = new map1.utfgrid.Layer({
                        url: DATA_TILE_URLS
                    });
                    
                    self.addLayer(self.layerUtfgrid); 
                    
                    self.controlUtfgridMouseMove = new map1.utfgrid.ControlMouseMove(self,{layers: [self.layerUtfgrid]})
                    self.addControl(self.controlUtfgridMouseMove)

                    self.controlUtfgridClick = new map1.utfgrid.ControlClick(self,{layers: [self.layerUtfgrid]})
                    self.addControl(self.controlUtfgridClick)
                }
                
                //self.layerUtfgrid.redraw()
                
            },1000)
            //this.removeLayer(this.layerUtfgrid)            
        });
        
        
        
        if ( hashParams.lon == undefined ) {
            if ( !(region in REGIONS) ) {
                region = 'EU';                
            }
            
            this.setCenter(new OpenLayers.LonLat(REGIONS[region][0],REGIONS[region][1]).transform(
                new OpenLayers.Projection("EPSG:4326"),
                new OpenLayers.Projection("EPSG:900913")
            ),REGIONS[region][2]);

        }
        
        
        
        this.controlNavigation = new OpenLayers.Control.Navigation({
            dragPanOptions: {
                enableKinetic: true
            }
        })
        this.addControl(this.controlNavigation)
        
        this.controlAttribution = new OpenLayers.Control.Attribution()
        this.addControl(this.controlAttribution)
        
        this.controlPermalink = new OpenLayers.Control.Permalink({anchor: true})
        this.addControl(this.controlPermalink)
        
        ;
        
        
        
        
        if ( !is_touch_device && self.gridinfoOn ) {                    
            this.controlUtfgridMouseMove = new map1.utfgrid.ControlMouseMove(self,{layers: [self.layerUtfgrid]})           
            this.addControl(this.controlUtfgridMouseMove)
        }
                
        if ( !is_touch_device ) {            
            this.controlUtfgridClick = new map1.utfgrid.ControlClick(self,{layers: [self.layerUtfgrid]})
            this.addControl(this.controlUtfgridClick)
        }
              
        
        this.searchPanel = new map1.gui.SideBar('#panel-search','#button-start')
        this.sideBar = new map1.gui.SideBar('#sidebar','#button-start, #panel-search',true)
        
                
        var is_touch_device = 'ontouchstart' in document.documentElement;
        
        if ( is_touch_device ) {
            $('#button-start').bind('touchstart',function() { self.sideBar.toggleLockShow(); self.searchPanel.toggleLockShow(); });
        }
        else {        
            $('#button-start').click(function() { self.sideBar.toggleLockShow(); self.searchPanel.toggleLockShow(); $('#button-start').toggleClass('locked'); });           
        }
        
        
        var animspeed = 100;
        var HELP_BUTTONS = ['#button-navigation','#button-print','#button-about','#button-donate','#button-navigation','#button-gpx'];
        for ( var i = 0; i < HELP_BUTTONS.length; ++i ) {            
            $(HELP_BUTTONS[i]).hover(
                function() {
                    $('#'+$(this).attr('id')+'-help').show(animspeed);
                },
                function() {
                    $('#'+$(this).attr('id')+'-help').hide(animspeed);
                }
            )
        }
        
        if ( !is_touch_device ) {
            this.printDialog = new map1.PrintDialog(
                this,
                ['#dialog-print','#dialog-print-2','#dialog-print-3'],
                '.button-print',
                '.dialog-print > .header > .close,.dialog-print > .footer > .close',
                '.dialog-print > .footer > .next',
                '.dialog-print > .footer > .prev',
                '.dialog-print > .footer > .finish'
            );
        }
        else {
           $(".button-print").hide()
        }
        
        this.aboutDialog = new map1.AboutDialog(
            '#dialog-about',
            '.button-about',
            '#dialog-about > .header > .close,#dialog-about > .footer > .close',
            null,
            null,
            null
        );
        
        this.directionsDialog = new map1.DirectionsDialog(
            '#dialog-directions',
            '#button-directions',
            '#dialog-directions > .header > .close,#dialog-directions > .footer > .close',
            null,
            null,
            null
        );

        this.gpxDialog = new map1.GpxDialog(
            '#dialog-gpx',
            '.button-gpx',
            '#dialog-gpx > .header > .close,#dialog-gpx > .footer > .close',
            null,
            null,
            null
        );  
        
                        
        this.routing = new map1.routing.Route(this)                
        
        if ( is_touch_device ) {            
        }
        else {        
            $('#button-navigation').click(function() { self.routing.toggleActivate(); $(this).toggleClass('active'); });
        }
               
         
        
        $(document).bind('keydown', 'ctrl+p', function() {
            self.printDialog.open()
            return false;
        });  
        
        $(document).bind('keydown', '+', function() {            
            self.zoomIn()
        });  
        
        $(document).bind('keydown', '-', function() {
            self.zoomOut()
        });  
        
        $(document).bind('keydown', 'left', function() {
            self.pan(-300,0)
        });
        
        $(document).bind('keydown', 'right', function() {
            self.pan(300,0)
        });
        
        $(document).bind('keydown', 'up', function() {
            self.pan(0,-300)
        });
        
        $(document).bind('keydown', 'down', function() {
            self.pan(0,300)
        });
        $(document).bind('keydown', 'esc', function() {            
            if ( self.routing.active ) {
                $("#button-navigation").click()
            }
        });
        
        if (  visits < 5 ) {
                
            var anim1 = function(i) {
                $('#button-start .help').css('left',Math.sin(i*0.55)*9+96)
                
                if ( i % 2 == 0 ) {
                    $('#button-start img#start-icon').css('left',Math.random());
                    $('#button-start img#start-icon').css('top',Math.random());
                }
                
                if ( i*0.55 < 13*3.14 ) {
                    setTimeout(function() {anim1(i+1)},50);
                }
                else {
                   $('#button-start .help').fadeOut(500) 
                   $('#button-start img#start-icon').css('left',0);
                   $('#button-start img#start-icon').css('top',0);
                }
                
            }
            
            setTimeout(function() {  
                $('#button-start .help').fadeIn(100);
                anim1(0)
                
            },1500);
        }
        
        var share = function() {  
            var anim2 = function(i) {
                $('#share p').css('opacity',Math.sin(i*0.9)*0.14+0.86)
                
                if ( i*0.9 < 1000*3.14 ) {
                    setTimeout(function() {anim2(i+1)},Math.sin(i*0.9) < - 0.9 ? 5000 : 50)
                }
                else {
                   $('#share p').css('opacity',1)  
                   $('#share').fadeOut(500)
                   setTimeout(share,120*1000);
                }
                
            }
            $('#share').click(function() {
                $('#share').hide();
                setTimeout(share,360*1000);
            });
            $('#share').fadeIn(100)
            anim2(0)     
            
        }        
        setTimeout(share,180*1000);
        setTimeout(function() {
            $('#share').css('visibility','visible');
            $('#share').hide();
        },7000);
        
        
        if ( self.gridinfoOn == false ) {        
            $('#gridinfo-power img').css('opacity',0.2);
        }
        else {        
            $('#gridinfo-power img').css('opacity',1);
        }
        
        $('#gridinfo-power img').click(function() {
            self.gridinfoOn = ! self.gridinfoOn;
            if ( self.gridinfoOn == false ) {        
                $('#gridinfo-power img').css('opacity',0.2);
                self.removeControl(self.controlUtfgridMouseMove)
                self.controlUtfgridMouseMove.deactivate()
                self.controlUtfgridMouseMove.destroy()
                self.controlUtfgridMouseMove = undefined
                self.removeControl(self.controlUtfgridClick)
                self.controlUtfgridClick.deactivate()
                self.controlUtfgridClick.destroy()
                self.controlUtfgridClick = undefined
                self.removeLayer(self.layerUtfgrid)
                self.layerUtfgrid.destroy()
                self.layerUtfgrid = undefined
                $.cookie('gridinfo',self.gridinfoOn, {expires: 30, path: '/'});
                $('#gridinfo').hide();
            }
            else {        
                $('#gridinfo-power img').css('opacity',1);
                self.layerUtfgrid = new map1.utfgrid.Layer({
                    url: DATA_TILE_URLS
                });
                self.addLayer(self.layerUtfgrid); 
                
                self.controlUtfgridMouseMove = new map1.utfgrid.ControlMouseMove(self,{layers: [self.layerUtfgrid]})
                self.addControl(self.controlUtfgridMouseMove)

                self.controlUtfgridClick = new map1.utfgrid.ControlClick(self,{layers: [self.layerUtfgrid]})
                self.addControl(self.controlUtfgridClick)
                $.cookie('gridinfo',self.gridinfoOn, {expires: 30, path: '/'});
                $('#gridinfo').show();
            }
        });
        
        $('#gridinfo').mouseenter(function() {            
            $('#gridinfo').css('opacity','0');
            $('#gridinfo-power').css('z-index','20001');
        });
        
        $('#gridinfo').mouseleave(function() {
            $('#gridinfo').css('opacity','1');
            $('#gridinfo-power').css('z-index','20000');
        });  
        
        $('#map').mousemove(function() {
            $('#gridinfo .current').html('');
        });
        
    },
    
    isValidZoomLevel: function(zoomLevel) {
       return zoomLevel != null && zoomLevel >= 5 && zoomLevel <= 18;
    },        
    
    setMapCenter: function(boundingbox) {
        var bounds = new OpenLayers.Bounds();       
        
        bounds.extend(new OpenLayers.LonLat(boundingbox[2],boundingbox[0]).transform(
            new OpenLayers.Projection("EPSG:4326"),
            new OpenLayers.Projection("EPSG:900913")
        ));
        bounds.extend(new OpenLayers.LonLat(boundingbox[3],boundingbox[1]).transform(
            new OpenLayers.Projection("EPSG:4326"),
            new OpenLayers.Projection("EPSG:900913")
        ));            
        
        //bounds.extend(new OpenLayers.LonLat(boundingbox[0],boundingbox[1]));
        //bounds.extend(new OpenLayers.LonLat(boundingbox[2],boundingbox[3]));
        this.zoomToExtent(bounds)
        return false;
    },
    
    lock: function() {
        $('#map').css('cursor','wait')
        this._locked = true
    },
    
    unlock: function() {
        $('#map').css('cursor','auto')
        this._locked = false
    },
    
    isLocked: function() {
        return this._locked
    }
    
});



