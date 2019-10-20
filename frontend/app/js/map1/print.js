var map1 = map1 || {}

map1.PrintDialog = $class({
    Extends: map1.gui.Dialog,    
    
    PAPER_FORMATS: {        
        "A5": [0.148,0.210],
        "A4": [0.210,0.297],
        "A3": [0.297,0.420]        
    },
    
    constructor: function(map, id,id_handle,id_close,id_next,id_prev,id_finish) {         
        this.map = map
        map1.gui.Dialog.call(this, id,id_handle,id_close,id_next,id_prev,id_finish);
        var self = this;
        $('#print-measure,#print-paper-orientation,#print-paper-format').change(function() {            
            self.calculatePages();
        })
    },
    
    calculatePages: function(visible) {
        
        if ( visible === undefined ) {
            visible = true;
        }
        
        var bounds = this.printBoundingBox.toArray();                
        
        var measure = $('#print-measure').val();
        var format = $('#print-paper-format').val();
        var orientation = $('#print-paper-orientation').val();
        
                
        var x = 1000.*OpenLayers.Util.distVincenty (new OpenLayers.LonLat(bounds[0],bounds[1]),new OpenLayers.LonLat(bounds[2],bounds[1])) / measure
        var y = 1000.*OpenLayers.Util.distVincenty (new OpenLayers.LonLat(bounds[0],bounds[1]),new OpenLayers.LonLat(bounds[0],bounds[3])) / measure
        
        if ( orientation == 'landscape' ) {
            var xpages = Math.ceil(x / this.PAPER_FORMATS[format][1])
            var ypages = Math.ceil(y / this.PAPER_FORMATS[format][0])
            var xc = xpages * this.PAPER_FORMATS[format][1]
            var yc = ypages * this.PAPER_FORMATS[format][0]
        }
        else {
            var xpages = Math.ceil(x / this.PAPER_FORMATS[format][0])
            var ypages = Math.ceil(y / this.PAPER_FORMATS[format][1])
            var xc = xpages * this.PAPER_FORMATS[format][0]
            var yc = ypages * this.PAPER_FORMATS[format][1]
        }
        
        if ( visible ) {
        
            $('#pages > div.overview').html('')
           
            if ( xc > 2*yc ) {
                var xsize = (400/xpages-2);
                var ysize = orientation == 'landscape' ? xsize * 0.707070707 : xsize * 1.4142857
            }
            else {
                var ysize = (200/ypages-2);
                var xsize = orientation != 'landscape' ? ysize * 0.707070707 : ysize * 1.4142857
            }                
            
            $('#pages > div.overview').css('height',ysize*ypages);
            $('#pages > div.overview').css('width',xsize*xpages);
            $('#pages > div.overview').css('font-size',ysize*0.5+'px');
            
            var pax = x*xsize*xpages/xc
            var pay = y*ysize*ypages/yc
            
            $('#pages > div.count span.val').html(xpages*ypages)
            
            for ( j = 0 ; j < ypages; ++j ) {
                for ( i = 0 ; i < xpages; ++i ) {
                    $('#pages > div.overview').append('<div style="top: '+j*ysize+'px; left: '+i*xsize+'px; width: '+xsize+'px; height: ' + ysize + 'px;">'+(j*xpages +i+1)+'</div>');                
                }
            }
            
            $('#pages > div.overview > div').css('line-height',ysize+'px');
            $('#pages > div.overview').append('<div class="print-area" style="top: '+(ysize*ypages-pay)/2+'px; left: '+(xsize*xpages-pax)/2+'px; width: '+pax+'px; height: ' + pay + 'px;"></div>');                
            
            if ( xc*yc > 3 ) {
                $('#pages > div.warning').show();
            }
            else {
                $('#pages > div.warning').hide();
            }
        }
        
        return xpages*ypages;
    },
    
    onOpen: function() {
        var self = this
        this.printAreaLayer = new OpenLayers.Layer.Vector("Box layer");
        this.map.addLayer(this.printAreaLayer)
        this.printAreaCtrl = new OpenLayers.Control.DrawFeature(
            this.printAreaLayer,                    
            OpenLayers.Handler.RegularPolygon,{
                handlerOptions: {
                    sides: 4,
                    irregular: true,  
                    keyMask: OpenLayers.Handler.MOD_CTRL,                                                       
                }, 
                featureAdded: function(f) {
                    remove = []   
                    for ( var i in self.printAreaLayer.features ) {
                        if ( self.printAreaLayer.features[i] != f ) {
                            remove.push(self.printAreaLayer.features[i])                                        
                        }
                    }
                    if ( remove.length > 0 ) 
                        self.printAreaLayer.removeFeatures(remove);
                        
                    self.printBoundingBox = f.geometry.getBounds().clone()
                    self.printBoundingBox.transform(
                        self.map.getProjectionObject(),
                        new OpenLayers.Projection("EPSG:4326")
                    )
                },                       
            }
        );
                
        if ( undefined !== this.map.routing ) {
            this.map.routing.lock(false,false)
        }
        
        if ( undefined !== this.map.routing && this.map.routing.wayPoints.length >= 2 ) {
            var bounds = this.map.routing.vector.getDataExtent()
            bounds.top += bounds.getHeight()/10
            bounds.bottom -= bounds.getHeight()/10
            bounds.left -= bounds.getWidth()/10
            bounds.right += bounds.getWidth()/10            
        }
        else {
            var bounds = this.map.getExtent().clone()
            bounds.top -= bounds.getHeight()/12
            bounds.bottom += bounds.getHeight()/12        
            bounds.left += bounds.getWidth()/12
            bounds.right -= bounds.getWidth()/12
        }
        
        self.printBoundingBox = bounds.clone().transform(
            self.map.getProjectionObject(),
            new OpenLayers.Projection("EPSG:4326")
        )
        
        var f = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon(
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(bounds.left, bounds.top),
                new OpenLayers.Geometry.Point(bounds.right, bounds.top),
                new OpenLayers.Geometry.Point(bounds.right, bounds.bottom),
                new OpenLayers.Geometry.Point(bounds.left, bounds.bottom)
            ])
        ))	    
	    this.printAreaLayer.addFeatures([f])
        
        this.map.addControl(this.printAreaCtrl);                                                                
    },
    
    onPageOpen: function(pageNum) {
        if ( 0 == pageNum ) {
            this.printAreaCtrl.activate()
        }
        if ( 1 == pageNum ) {
            var scales = [12500,25000,50000,100000,200000,400000,800000,1600000,3200000,6400000]
            for ( i = 0; i < scales.length; ++i ) {
                $('#print-measure').val(scales[i])
                $('#print-paper-orientation').val('portrait')
                if ( 1 == this.calculatePages(false) ) {
                    break;
                }
                $('#print-paper-orientation').val('landscape')
                if ( 1 == this.calculatePages(false) ) {
                    break;
                }
            }
            this.calculatePages(true)
        }
    },
    
    onPageClose: function(pageNum) {
        if ( 0 == pageNum ) {                
            this.printAreaCtrl.deactivate()
        }
    },
    
    onClose: function() {
        this.map.removeControl(this.printAreaCtrl)
        this.map.removeLayer(this.printAreaLayer)
        
        if ( undefined !== this.map.routing ) {
            this.map.routing.unlock()
        }
    },
    
    onFinish: function() {                                    
        var bounds = this.printBoundingBox.toArray();                                
        var measure = $('#print-measure').val();
        var format = $('#print-paper-format').val();
        var orientation = $('#print-paper-orientation').val();
                     
        window.open('pdfMap.html?scale='+measure+'&x1='+bounds[0]+'&x2='+bounds[2]+'&y1='+bounds[1]+'&y2='+bounds[3]+'&overlapX='+15+'&overlapY='+15+'&minDPI='+150+'&o='+orientation+'&f='+format,'print',"width=300,height=150,menubar=no,resizable=no,location=no,status=no,toolbar=no,directories=no,scrollbars=no")
    }
});
