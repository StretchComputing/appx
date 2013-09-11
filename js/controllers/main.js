var here;// variable for current location
var listedLocations; //variable for list of locations that google returns
var selectedLocation;
var geocoder; //variable for geocoder
var pages;
var drag = { 	posi:  {x:0,y:0},
             	timei: 0,
       			 	posf:  {x:0,y:0},
             	timef: 0  };
var map; //for the google map display
var mapMarkers = [];
var currentVisit = {isActive:false};

$(function(){
	
	var service = new google.maps.places.PlacesService(document.getElementById('targetSearchResults'));
	
	//center vertically an element within its parent
	var vCenter = function(e){
		var h = e.outerHeight();
		var parH = e.parent().outerHeight();
		var etop = (parH - h)/2;
		etop = etop > 0 ? etop : 0;
		e.css('top',etop);
	};
	
	var vCenterInit = function(e){
		vCenter(e);
		$(window).resize(function(){
			vCenter(e);
		});
	};
	
	$('.vCentered').each(function(i,obj){
		vCenterInit($(this));
	});
	
	pages = { page:'r',
						diffH:window.innerWidth * 0.03,
						diffV:window.innerHeight * 0.03,
					  thresholdH:$('#rblock').width() * -0.5,
						thresholdV:$('#rblock').height() * -0.5};
	
  //Navigation between pages
  //  -able: drag and revert back, change page with clicks, drag between pages
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
												cancel:"#map",
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
	
	//set up a vertical scroll on an element with id 'id', wrapper height wrapH, and height scrolled h
	var verticalScrollInit = function(id,h,wrapH){
		var offs = $('#' + id).offset();
		if(h > wrapH){
			$('#' + id).draggable({
		  	axis:'y',
		  	scroll:false,
      	containment:[offs.left, offs.top - h + wrapH, offs.left, offs.top]
			});
		}
	};
	
	//this is necessary because touch-punch prevented input from being accessed
	$('input').bind('click', function(){
	    $(this).focus();
	});
	
  // watchLocation watches current location using html5 geolocation
  var watchLocation = function(){
    function findlocation(){
			if(navigator.geolocation) {
        var watchID = navigator.geolocation.watchPosition(userNewLocation);
      } else {
	      //some popup or flash that the browser does not support this
      }
		};
		function userNewLocation(position) {
    	var userLat = position.coords.latitude;
   	 	var userLng = position.coords.longitude;
			here = new google.maps.LatLng(userLat, userLng);
			
			//check if new location is within bounds of visit location
			if(currentVisit.isActive){
				var thresholdRadius = 0.001;
				var diffLat = userLat - currentVisit.place.lat;
				var diffLng = userLng - currentVisit.place.lng
				var distance = Math.sqrt(diffLat*diffLat + diffLng*diffLng);
				if(distance > thresholdRadius){
					endVisit();
				}
			}
  	};
		findlocation();
  }; 
  watchLocation();
	
	//initialize google map, will start centered on current location until search is made
	var initializeMap = function(){
		var fake = new google.maps.LatLng(41.869727,-87.80585889999999);
		var mapOptions = {
			center:fake,
			zoom:17,
			mapTypeId:google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map"),mapOptions);
	};
	initializeMap();
	
	//adds missing fields to search results to prevent errors
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
		
		var pullDownResults = function(){
			$('#searchResults').empty();
			$('#searchResults').append(locationsToInsert);
			
			var h = 0;
			for(var i = 0; i < len; i++){
				h += $('#listedLocation_' + i).outerHeight();
			}
			
			var wrapH = $('#searchResultsWrapper').height();
			var adjustedH = h > wrapH ? h : wrapH;
			
			$('#searchResults').animate({height:adjustedH},500);
			$('#searchResults').attr('displayed',searchType);
			verticalScrollInit('searchResults',h,wrapH);
			addSelectListedLocationEvents();
			addMapMarkers();
		}
		
		var displayed = $('#searchResults').attr('displayed');
		
		if(displayed == 'none'){
			pullDownResults();
		} else {
			$('#searchResults').animate({height:'0%'},300,function(){pullDownResults();});
		}
	};
	
	var getIndexById = function(selectedId){
		var PatternId = /\d+/;
		return selectedId.match(PatternId);
	}
	
	var addMapMarkers = function(){
		//First clear any existing markers and remove reference to them
		if(mapMarkers){
			for(i in mapMarkers){
				mapMarkers[i].setMap(null);
			}
			mapMarkers = [];
		}
		//now add new markers
		for(i in listedLocations){
			mapMarkers[i] = new google.maps.Marker({
				position:listedLocations[i].geometry.location,
				map:map
			});
			if(i == 0){
				map.panTo(listedLocations[i].geometry.location);
			}
		}
	};
	
  //Get Google places info: locations nearby
  //
  //
  $('#nearbySearch').click(function() {
		var fake = new google.maps.LatLng(41.869727,-87.80585889999999);
    service.nearbySearch({location: here,
													rankBy:google.maps.places.RankBy.DISTANCE,
												  types:['bakery','bar','cafe','restaurant']}, 
                         function(data,status) {
                           listedLocations = data;
													 fixResults();
													 showResults(listedLocations,'nearby');
                         });
  });
	
	$('#nearbySearch').mousedown(function(){
		$(this).css('background-color','#ccc');
		$(this).css('color','#222');
	});
	$('#nearbySearch').mouseup(function(){
		$(this).css('background-color','#222');
		$(this).css('color','#fff');
	});
	
	//Get Google places info: specified location
	$('#otherSearch input').change(function() {
		
		$("html, body").animate({ scrollTop: $('#set').offset().top,
		 													scrollLeft: $('#set').offset().left }, 100);

		geocoder = new google.maps.Geocoder();
		var address = $(this).val();
		geocoder.geocode({'address':address}, function(data,status){
			var there = data[0].geometry.location;
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
			
				var service = new google.maps.places.PlacesService(document.getElementById('locationInfoContainer'));
				service.getDetails({reference:selectedLocation.reference},
			                   	function(data,status){
														selectedLocation = data; //assign to more detailed version
														fixLocation();
														showLocationInfo(selectedLocation);
			                   	});
					
			}
		});
	};
	
	// used to format some fields and fill in missing fields 
	var fixLocation = function(){
		
		//for appx format specific input
		selectedLocation.appxForm = {};
		
		//location should have a name, probably not necessary
		if(!selectedLocation.name){
			selectedLocation.name = "name unavailable";
		}
		
		if(!selectedLocation.formatted_address){
			selectedLocation.formatted_address = selectedLocation.vicinity + " (approximately)";
		}
		
		if(!selectedLocation.formatted_phone_number){
			selectedLocation.formatted_phone_number = "(phone number unknown)";
		}
		
		if(!selectedLocation.website){
			selectedLocation.website = "(website unknown)";
		}
		
		if(!selectedLocation.rating){
			selectedLocation.rating = "(rating unknown)";
		}
		
		if(!selectedLocation.reviews){
			selectedLocation.reviews = [{author_name:"(no reviews for this location)",text:""}];
		}
		
		if(!selectedLocation.price_level){
			selectedLocation.appxForm.price = "(price level unknown)";
		}else{
			var p = selectedLocation.price_level;
			switch(p){
			case 1:
				selectedLocation.appxForm.price = "$";
				break;
			case 2:
				selectedLocation.appxForm.price = "$$";
				break;
			case 3:
				selectedLocation.appxForm.price = "$$$";
				break;
			case 4:
				selectedLocation.appxForm.price = "$$$$";
				break;
			}
		}
		
		if(!selectedLocation.opening_hours){
			selectedLocation.appxForm.isOpen = "(open status unknown)";
			selectedLocation.appxForm.regularHours = "(hours of operation unknown)";
		}else{
			selectedLocation.appxForm.isOpen = (selectedLocation.opening_hours.open_now ? "open now" : "not open now");
			selectedLocation.appxForm.regularHours = formatRegularHours(selectedLocation.opening_hours.periods);
		}
	};
	
	var formatRegularHours = function(periods){
		var times = "";
		var previousDay = "";
		
		for(var pIndex = 0; pIndex < periods.length; pIndex++){
			var d = periods[pIndex].open.day;
			var s = periods[pIndex].open.time;
			var f = periods[pIndex].close.time;
			
			var day;
			var startHour;
			var startMin;
			var startAmpm;
			var endHour;
			var endMin;
			var endAmpm;
			
			switch(d){
			case 0:
				day = "sun: ";
				break;
			case 1:
				day = "mon: ";
				break;
			case 2:
				day = "tue: ";
				break;
			case 3:
				day = "wed: ";
				break;
			case 4:
				day = "thu: ";
				break;
			case 5:
				day = "fri: ";
				break;
			case 6:
				day = "sat: ";
				break;
			}
			
			startHour = Math.floor(s%1200/100);
			startHour = startHour == 0 ? 12 : startHour;
			
			startMin = s%100;
			startMin = startMin == 0 ? '00' : startMin;
			
			startAmpm = (Math.floor(s/1200) % 2) < 1 ? 'am' : 'pm';
			
			endHour = Math.floor(f%1200/100);
			endHour = endHour == 0 ? 12 : endHour;
			
			endMin = f%100;
			endMin = endMin == 0 ? '00' : endMin;
			
			endAmpm = (Math.floor(f/1200) % 2) < 1 ? 'am' : 'pm';
			
			if(previousDay){
				times += previousDay == day ? ', ' : '</br>' + day;
			}else{
				times += day;
			} 
			
			times += startHour + ':' + startMin + startAmpm + ' - ' + endHour + ':' + endMin + endAmpm;
			previousDay = day;
		}
		
		return times;
	};
	
	var showLocationInfo = function(location) {
		var locationInfoTemplate = _.template($('#locationInfoTemplate').html());
		var reviewTemplate = _.template($('#reviewTemplate').html());
		var locationPlotTemplate = _.template($('#locationPlotTemplate').html());
		var templatedLocationInfo = locationInfoTemplate(location);
		var templatedLocationPlot = locationPlotTemplate(PLACES[0].periods[5]);
		var selectedPhotoURL;
		
		if(selectedLocation.photos){
			selectedPhotoURL = selectedLocation.photos[0].getUrl({maxWidth:400});
		} else {
			selectedPhotoURL = selectedLocation.icon;
		}

		$('#locationInfoContainer').empty();
		$('.locationPhoto').attr('src',selectedPhotoURL)
		$('#locationInfoContainer').append(templatedLocationInfo);
		for(var rIndex = 0; rIndex < location.reviews.length; rIndex++){
			$('#locationInfoContainer .locationInfoSet .locationReviewInfo').append(reviewTemplate(location.reviews[rIndex]));
		}
		$('#locationInfoContainer .locationInfoSet').append(templatedLocationPlot);
		$('.locationInfoSet').draggable({
			axis:'x',
			scroll:false,
			stop:locationInfoScrollStopHandler
		});
		
		$('.nowVisiting').off();
		$('.nowVisiting').on('click',function(){startVisit();});
		
		drawPlot();
		toPageY();
	};
	
	// start a visit to the selected location
	var startVisit = function(){
		currentVisit.isActive = true;
		currentVisit.place = selectedLocation;
		currentVisit.startTime = new Date();
		currentVisit.endTime = false;
		currentVisit.bump = false;
		currentVisit.review = false;
		
		var liveVisitTemplate = _.template($('#liveVisitTemplate').html());
		var templatedLiveVisit = liveVisitTemplate(currentVisit);
		
		$('.setWrapper').append(templatedLiveVisit);
		$('#visitHeader').on('click',function(){
			collapseVisit();
		});
		$('#visitEndButton').on('click',function(){
			endVisit();
		})
	};
	
	var collapseVisit = function(){
		var collapseHeight = 1.75; //in em
		var collapseWidth = 10;    //in em
		var collapseTop = $('.setWrapper').height() - collapseHeight*14 - 2 ; //in px
		var collapseLeft = $('.setWrapper').width() - collapseWidth*14 - 2 ; //in px
		
		$('#liveVisit').animate({
			height: collapseHeight + 'em',
			width:collapseWidth + 'em',
			top: collapseTop + 'px',
			left: collapseLeft + 'px'
		},500);
		
		$('#visitHeader').removeClass('visitExpanded');
		$('#visitHeader').addClass('visitCollapsed');
		$('#liveVisit').attr('opened','false');
		$('#visitHeader').off();
		$('#visitHeader').on('click',function(){
			expandVisit();
		});
	};
	
	var expandVisit = function(){
		$('#liveVisit').animate({
			height:'90%',
			width:'90%',
			top:'5%',
			left:'5%',
		},500,function(){
			$('#liveVisit *:not(#visitTitle,#visitShowHide,#visitHeader)').css('font','12px courier,monospace');
		});
		$('#visitHeader').removeClass('visitCollapsed');
		$('#visitHeader').addClass('visitExpanded');
		$('#liveVisit').attr('opened','true');
		$('#visitHeader').off();
		$('#visitHeader').on('click',function(){
			collapseVisit();
		});
	};
	
	var endVisit = function(){
		$('#liveVisit').remove();
		currentVisit = {isActive:false};
	};
	
	// for now: this is using fake data until api's are made
	var drawPlot = function(){
		var cWidth = $('#dataPlot').attr('width');
		var cHeight = $('#dataPlot').attr('height');
		var day = PLACES[0].periods[5].hours;
		var HinD = day.length; //should be 24
		var peak = 0;
		var current = {};
		var next = {};
		var mid = {};
		
		for(var h = 0; h < HinD; h++){
			peak = day[h].tot > peak ? day[h].tot : peak;
		}
		
		var canvas = document.getElementById('dataPlot');
		var ctx = canvas.getContext('2d');
		ctx.lineWidth = 8;
		ctx.beginPath();
		ctx.moveTo(0,cHeight);
	
		for(var h = 0; h < HinD; h++){
			
			if(h == 0){
				current.y = cHeight*(1 - (day[h].tot / peak));
				current.x = cWidth * ((h%12) / 12);
			}else if(h == 12){
				current.y = next.y;
				current.x = 0;
				
				ctx.strokeStyle = 'rgba(255,0,0,0.7)';
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(0,current.y);
			}else{
				current.y = next.y;
				current.x = next.x;
			}
			
			if(h == 23){
				next.y = cHeight*(1 - (day[0].tot / peak));
				next.x = cWidth * ((h%12 + 1) / 12);
			}else{
				next.y = cHeight*(1 - (day[h+1].tot / peak));
				next.x = cWidth * ((h%12 + 1) / 12);
			}			
			mid.y = (next.y + current.y)/2;
			mid.x = (next.x + current.x)/2;

			ctx.bezierCurveTo(current.x,current.y,mid.x,current.y,mid.x,mid.y);
			ctx.bezierCurveTo(mid.x,mid.y,mid.x,next.y,next.x,next.y);
		}
		
		ctx.strokeStyle = 'rgba(0,0,255,0.7)';
		ctx.stroke();
	};
	
	var locationInfoScrollStopHandler = function(){
		var w = $('.locationInfoSet').width();
		var posX = $('.locationInfoSet').offset().left;
		var posXNew;
		if(posX > -w/8){
			posXNew = 0;
		}else if(posX > (-3*w)/8){
			posXNew = -w/4;
		}else if(posX > (-5*w)/8){
			posXNew = -w/2;
		}else{
			posXNew = (-3*w)/4;
		}
		$('.locationInfoSet').animate({left:posXNew},300);
	};
	
});
