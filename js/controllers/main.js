var here;// variable for current location
var listedLocations; //variable for list of locations that google returns
var selectedLocation;
var geocoder; //variable for geocoder
var pages;
var drag = { 	posi:  {x:0,y:0},
             	timei: 0,
       			 	posf:  {x:0,y:0},
             	timef: 0  };

$(function(){
	
	pages = { page:'r',
						diffH:window.innerWidth * 0.03,
						diffV:window.innerHeight * 0.03,
					  thresholdH:$('#rblock').width() * -0.5,
						thresholdV:$('#rblock').height() * -0.5};
	
  //Navigation between pages
  //  -able: drag and revert back, change page with clicks
  //  -later: swipe between pages (momentum sensitive)
 
	var dragStartHandler = function(){
		var pos = $('#set').offset();
		pages.isDrag = true;
		drag.posi.x = pos.left;
		drag.posi.y = pos.top;
	};
	
	var dragDragHandler = function(){
		
	};
	
	var dragStopHandler = function(){
		var pos = $('#set').offset();
		pages.page = '';
		drag.posf.x = pos.left;
		drag.posf.y = pos.top;
		
		if(drag.posf.x < pages.thresholdH){
			if(drag.posf.y < pages.thresholdV){
				toPageB();
			}else{
				toPageY();
			};
		}else{
		  if(drag.posf.y < pages.thresholdV){
		  	toPageG();
		  }else{
		  	toPageR();
		  };
		}
	};
	
  $('#set').draggable({ revert:false, 
												scroll:false,
												start:dragStartHandler,
											  drag:dragDragHandler,
											  stop:dragStopHandler });
	
  var toPageR = function() {
    if(pages.page !== 'r'){
			var bpos = $('#rblock').offset();
			var spos = $('#set').offset();
      $('#set').animate({ top: spos.top - bpos.top,
													left: spos.left - bpos.left}, {duration:300,
																												 complete:function(){$('#set').stop(true,false);}});
      pages.page = 'r';
    }
  };
	
  var toPageG = function() {
    if(pages.page !== 'g'){
			var bpos = $('#gblock').offset();
			var spos = $('#set').offset();
      $('#set').animate({	top: spos.top - bpos.top + pages.diffV,
													left: spos.left - bpos.left }, {duration:300,
																													complete:function(){$('#set').stop(true,false);}});
      pages.page = 'g';
    }
  };
	
  var toPageB = function() {
    if(pages.page !== 'b'){
			var bpos = $('#bblock').offset();
			var spos = $('#set').offset();
      $('#set').animate({	top: spos.top - bpos.top + pages.diffV,
													left: spos.left - bpos.left + pages.diffH }, {duration:300,
																																				complete:function(){$('#set').stop(true,false);}});
      pages.page = 'b';
    }
  };
	
  var toPageY = function() {
    if(pages.page !== 'y'){
			var bpos = $('#yblock').offset();
			var spos = $('#set').offset();
      $('#set').animate({ top: spos.top - bpos.top,
													left: spos.left - bpos.left + pages.diffH }, {duration:300,
																																				complete:function(){$('#set').stop(true,false);}});
      pages.page = 'y';
    }
  };
			
  $('#rblock').click(function() {
    toPageR()
  });
  $('#gblock').click(function() {
    toPageG()
  });
  $('#bblock').click(function() {
    toPageB()
  });
  $('#yblock').click(function() {
    toPageY()
  });	
	
  // getLocation: void -> {lat,lng,bool}
  // Gets current location using html5 geolocation
  var getLocation = function(){
  	var currentLocation;
    function findlocation(){
			if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setCoords);
      } else {
	      //some popup or flash that the browser does not support this
      }
		};
		function setCoords(position) {
    	var userLat = position.coords.latitude;
   	 	var userLng = position.coords.longitude;
			here = new google.maps.LatLng(userLat, userLng);
  	};
		findlocation();
		return currentLocation;
  }; 
  getLocation();
	
	var fixResults = function(){
		var len = listedLocations.length;
		
		for(var index = 0; index < len; index++){
			if(listedLocations[index].opening_hours === undefined){
				listedLocations[index].opening_hours = {open_now:'?'};
			}
			if(listedLocations[index].price_level === undefined){
				listedLocations[index].price_level = '?';
			}
			if(listedLocations[index].rating === undefined){
				listedLocations[index].rating = '?';
			}
		}
	}
	
	//removes any any present search results and replaces with new results 
	var showResults = function(locations,searchType) {
		
		var listLocationTemplate = _.template($('#listLocationTemplate').html());
		var locationsToInsert = '';
		var len = locations.length;
		
		for(var index = 0; index < len; index++){
			templatedLocation = listLocationTemplate(locations[index]);
			templatedLocation= templatedLocation.replace('listedLocation_i','listedLocation_' + index);
			locationsToInsert += templatedLocation;	
		}
		$('#searchResults').empty();
		$('#searchResults').append(locationsToInsert);
		
		var pullDownResults = function(){
			$('#' + searchType + 'Search').animate({height:'8%'},
		                                         {duration:100,
				                                      complete:function(){$('#searchResults').animate({height:'72%'},200)}});
			$('#searchResults').attr('displayed',searchType);
		}
		
		if(displayed == 'none'){
			pullDownResults();
		} else {
			var displayed = $('#searchResults').attr('displayed');
			$('#searchResults').animate({height:'0%'},
																	 {duration:200,
																	  complete:function(){$('#' + displayed + 'Search').animate({height:'5%'},
																																									           {duration:100,
																																									            complete:pullDownResults()})}});
		}
		
		addSelectListedLocationEvents();
	};
	
	var getIndexById = function(selectedId){
		var PatternId = /\d+/;
		return selectedId.match(PatternId);
	}
	
  //Get Google places info: locations nearby
  //
  //
  $('#nearbySearch').click(function() {
		var fake = new google.maps.LatLng(41.869727,-87.80585889999999);
    var service = new google.maps.places.PlacesService(document.getElementById('gblock'));
    service.nearbySearch({location: here,
													rankBy:google.maps.places.RankBy.DISTANCE,
												  types:['bakery','bar','cafe','restaurant']}, 
                         function(data,status) {
                           listedLocations = data;
													 fixResults();
													 showResults(listedLocations,'nearby');
                         });
  });
	
	//Get Google places info: specified location
	$('#otherSearch input').change(function() {
		geocoder = new google.maps.Geocoder();
		var address = $(this).val();
		geocoder.geocode({'address':address}, function(data,status){
			var there = data[0].geometry.location;
	    var service = new google.maps.places.PlacesService(document.getElementById('gblock'));
	    service.nearbySearch({location: there,
														rankBy:google.maps.places.RankBy.DISTANCE,
													  types:['bakery','bar','cafe','restaurant']}, 
	                         function(data,status) {
	                           listedLocations = data;
														 fixResults();
														 showResults(listedLocations,'other');
	                         });
		});
	});
	
	//adds events for selecting a location from the search results
	var addSelectListedLocationEvents = function(){
		$('.listedLocation').on('click',function(){
			if(!$(this).hasClass('selectedLocation')){			
				var selectedId = $(this).attr('id');
				var placeIndex = getIndexById(selectedId);
				selectedLocation = listedLocations[placeIndex];
			
				$('.listedLocation').removeClass('selectedLocation');
				$(this).addClass('selectedLocation');
			
				var service = new google.maps.places.PlacesService(document.getElementById('gblock'));
				service.getDetails({reference:selectedLocation.reference},
			                   	function(data,status){
														selectedLocation = data; //assign to more detailed version
														showLocationInfo(selectedLocation);
			                   	});
					
			}
		});
	};
	
	var showLocationInfo = function(location) {
		var locationInfoTemplate = _.template($('#locationInfoTemplate').html());	
		var templatedLocationInfo = locationInfoTemplate(location);
		var selectedPhotoURL;
		
		if(selectedLocation.photos){
			selectedPhotoURL = selectedLocation.photos[0].getUrl({maxWidth:400});
		} else {
			selectedPhotoURL = selectedLocation.icon;
		}

		$('.locationInfoContainer').empty();
		$('.locationPhoto').attr('src',selectedPhotoURL)
		$('.locationInfoContainer').append(templatedLocationInfo);
		toPageY();
	};
		
});
