/* 
    Name: epideme
    Description: Epidemiology investigation framework for creating a personal report of where you've been, who you've met and when.
    Author: Alon Carmel
    URI: https://github.com/aloncarmel/epideme
    Year: 2020
*/

var epideme = {
    config: {
    },
    initReport: function() {
        //Create a new hash for url
        var hash = CryptoJS.MD5(new Date().toISOString());
        //$('#sharedurl').html('https://epideme.com/r/'+hash);

        var person = prompt("Please enter your name", "Harry Potter");

        $('#name').html(person);

        $('#creationdate').html(new Date().toLocaleString());
        this.initGeoMapsAutomcomplete();
        this.initMap();
      
        var _self = this;
        $('body').on('click', '.addlocationbutton', function() {
            console.log('click');
            console.log($(this).attr('lat'));
            console.log($(this).attr('lon'));
            console.log($(this).attr('address'));
            _self.addLocation($(this).attr('address'),$(this).attr('lat'),$(this).attr('lon'));
        });
        $('body').on('click', '.addPerson', function() {
            console.log('click');
            _self.addPerson($('#personname').val(),$('#personphonenumber').val());
        });

        $('body').on('click', '.addDateTime', function() {
            console.log('click');
            _self.addDateTime($('#datetime').val(),$('#datetimeunix').val());

        });

        $('body').on('click', '.addReport', function() {
            console.log('click');
            if($('#appendAddress').html() && $('#appendTimeDate').html()) {
                _self.addReport();
                _self.resetReportBox();
            } else {
                alert('Please fill date, time and location.');
            }
         
        });
        

        $('body').on('click', '.printReport', function() {
           
            _self.printReport();
         
        });
        

    },
    printReport: function(){
        //Hide any elements that we dont need

        $('#printreportbutton').remove();
        $('#addeventbox').remove();

        $('#welcometext').remove();

        $('#printtextheader').html($('#name').html()+' Epidemiology report');
        $('#leadprinttext').html('Below listed '+$('#name').html()+' Epidemiology report for date '+$('#creationdate').html());
        $('#printtext').css('display','block');
        window.print();
    },
    addDateTime: function(datetime,unixtime) {

        $('#appendTimeDate').html('<b>Date and time:</b> '+datetime);
        $('#appendTimeDate').attr('unix',unixtime);
        var tmodal = document.getElementById('datetimemodal');
        var timeModal = bootstrap.Modal.getInstance(tmodal) // Returns a Bootstrap modal instance
        $('.addtimelink').hide();
        timeModal.hide();

    },
    addPerson: function(personname,personnumber) {
        if(!personnumber) {
            personnumber = 'None';
        }
        $('#appendPerson').append('<li><b>Person:</b> '+personname+' Phone:('+personnumber+')</li>');
        var pmodal = document.getElementById('personmodal')
        var personModal = bootstrap.Modal.getInstance(pmodal) // Returns a Bootstrap modal instance
        $('#personname').val('');
        $('#personphonenumber').val('');
        personModal.hide();
    },
    addLocation: function(address,lat,lon) {

        //Append static image to location box

        $('#appendLocation').html('<img class="mapimage boximgpeadd img-fluid" src="http://maps.googleapis.com/maps/api/staticmap?&size=600x400&center='+lat+','+lon+'&style=visibility:on&zoom=15&style=feature:water%7Celement:geometry%7Cvisibility:on&style=feature:landscape%7Celement:geometry%7Cvisibility:on&markers=anchor:center|icon:https://protestcounter.s3.us-east-2.amazonaws.com/assets/marker_person.png|'+lat+','+lon+'&key=AIzaSyAwZqEcCFdeOAvDCJLYlUsng5acjj0_Edw">');
        $('#appendAddress').html('<p class="mb-1"><b>Location:</b></p>'+address);
        //<img src="http://maps.googleapis.com/maps/api/staticmap?&size=600x400&style=visibility:on&style=feature:water%7Celement:geometry%7Cvisibility:on&style=feature:landscape%7Celement:geometry%7Cvisibility:on&markers=anchor:center%7Cicon:https://protestcounter.s3.us-east-2.amazonaws.com/assets/marker_person.png|32,24&key=AIzaSyAwZqEcCFdeOAvDCJLYlUsng5acjj0_Edw
        var lmodal = document.getElementById('locationmodal')
        var locationModal = bootstrap.Modal.getInstance(lmodal) // Returns a Bootstrap modal instance

        locationModal.hide();

        $('.addlocationlink').hide();

    },
    addReport: function () {

        //Add a new report item
        var people = $('#appendPerson').html();
        if(!people) {
            people = '<li>None</li>';
        }
        var imgsrc = $('.boximgpeadd').attr('src');
        var address = $('#appendAddress').html();
        var datetime = $('#appendTimeDate').html();
        var dateunix = $('#appendTimeDate').attr('unix');

        $('#events').append('<li id="'+dateunix+'">\
            <div class="card">\
                <div class="card-body">\
                    <div class="row">\
                        <div class="col-7">\
                        <p class="mb-1"><b>People I have encountered:</b></p>\
                        <ul id="persons">'+people+'</ul>\
                        <div>'+address+'</div>\
                        <div>'+datetime+'</div>\
                        </div>\
                        <div class="col-5 text-right">\
                        <img src="'+imgsrc+'" class="mapimage img-fluid" id="locationimg"></img>\
                    </div>\
                    </div>\
                </div>\
            </div>\
        </li>');

        //Resort li elements by unix time stamp

        var elems = $('#events').children('li').remove();
        elems.sort(function(a,b){
            return parseInt(a.id) - parseInt(b.id);
        });
        $('#events').append(elems);

    },
    resetReportBox: function() {
        $('#appendLocation').html('');
        $('#appendPerson').html('');
        $('#appendAddress').html('');
        $('#appendTimeDate').html('');

        $('.addlocationlink').show();
        $('.addtimelink').show();
    },
    extractFromAdress: function(components, type){
        for (var i=0; i<components.length; i++)
            for (var j=0; j<components[i].types.length; j++)
                if (components[i].types[j]==type) return components[i].long_name;
        return "";
    },
    initGeoMapsAutomcomplete: function() {
        var _self = this;
        var input = document.getElementById('location');
        var options = {
            componentRestrictions: {
                country: 'il'
            }
        };
        var autocomplete = new google.maps.places.Autocomplete(input,options);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {

            var place = autocomplete.getPlace();
            console.log(place);
            if(place.geometry) {

                var geosearchLatLng = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());

                var postCode = _self.extractFromAdress(place.address_components, "postal_code");
                var street = _self.extractFromAdress(place.address_components, "route");
                var town = _self.extractFromAdress(place.address_components, "locality");
                var country = _self.extractFromAdress(place.address_components, "country");

                if(town) {
                    $('#town').val(town);
                } else {
                    $('#town').val('none');
                }       
                $('#lat').val(place.geometry.location.lat());
                $('#lon').val(place.geometry.location.lng());

                _self.AddMyPositionMarkerOnMap(place.formatted_address+' '+place.name+' Lat:'+place.geometry.location.lat()+' Lon:'+place.geometry.location.lng(),place.geometry.location.lat(),place.geometry.location.lng());


            }

        });
    },
    AddMyPositionMarkerOnMap: function(address,lat,lon) {

        var myLatLng = new google.maps.LatLng(lat, lon);
       
        var icon = {
            url: "https://protestcounter.s3.us-east-2.amazonaws.com/assets/marker_person.png", // url
            scaledSize: new google.maps.Size(50, 50), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(25, 55) // anchor
            };
    
          var marker = new google.maps.Marker({
              position:myLatLng,
              map:  map,
              draggable:true, 
              icon: icon,
              animation: google.maps.Animation.DROP
            });
    
          if(gmarker){gmarker.setMap(null)};
    
          marker.setPosition(myLatLng);
          gmarker = marker;
          marker.addListener('dragend', this.handleDragEvent);
    
          map.setCenter(myLatLng);
          map.setZoom(15);
    
          const contentString =
          '<div id="content">' +
          '<h5>I was here</h5>' +
          '<div id="bodyContent">' +
          '<p>Drag the little figure to pin point your exact location on map</p>' +
          '<button address="'+address+'" lat="'+lat+'" lon="'+lon+'" class="addlocationbutton btn btn-primary btn-block">Mark my location</button>' +
          '</div>' +
          '</div>';
          infowindow = new google.maps.InfoWindow({
            content: contentString,
           });  
          infowindow.open(map, marker);
    
          //Update the latlon fields
    
          $('#lat').val(lat);
          $('#lon').val(lon);
    },
    initMap: function() {
        // The location 
        var il = {lat:31.0461, lng:34.8516};


        // The map
        map = new google.maps.Map(
            document.getElementById('map'), {zoom: 8, center: il,mapTypeControl: false,streetViewControl:false,rotateControl:false,fullscreenControl:false});
        var LatLng = new google.maps.LatLng(32.0853, 34.7818);
        map.setCenter(LatLng);
        map.setZoom(13);
    },
    handleDragEvent: function(event) {
  
        $('#lat').val(event.latLng.lat());
        $('#lon').val(event.latLng.lng());
        $('.addlocationbutton').attr('lat',event.latLng.lat());
        $('.addlocationbutton').attr('lon',event.latLng.lng());

    }
}

var map=null;
var gmarker =null;
var infowindow = null;
var markers = [];
var markersarray = [];