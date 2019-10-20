var map1 = map1 || {}

map1.GpxDialog = $class({
    Extends: map1.gui.Dialog,    

    
    
    constructor: function(id,id_handle,id_close,id_next,id_prev,id_finish) {
        
        map1.gui.Dialog.call(this,id,id_handle,id_close,id_next,id_prev,id_finish);
        var self = this
        

        
        function gpx() {
          
          var fileInput = $('#gpx-files').prop('files');

          var file = fileInput[0];

          var reader = new FileReader();
          reader.onload = function(e) {            
            var gpx = new OpenLayers.Format.GPX({
              'internalProjection': map.baseLayer.projection,
              'externalProjection': new OpenLayers.Projection("EPSG:4326")
            });            
            var text = reader.result;
            var features = gpx.read(text);

            map.routing.vector.removeAllFeatures()
            map.routing.vector.addFeatures(features)

          }
      
          reader.readAsText(file);
          
          
        };

        $('#dialog-gpx #show-gpx').click( function(e) {
          e.preventDefault();
          gpx()
          return false;
        });

        $('#dialog-gpx #print-gpx').click( function(e) {
          e.preventDefault();
          gpx()
          self.close()
          map.printDialog.open()
          return false
        });

        
    },

});
