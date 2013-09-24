var APPX = {
	here:undefined,                            // user current location
	listedLocations:undefined,                 // list of locations that google returns
	selectedLocation:undefined,                // selected location with more detailed info
	mapMarkers:[],											 			 // marked Locations on the Google Map
	pages:undefined,                      		 // info associated with the collective pages
	currentVisit:{isActive:false},             // the current Visit taking place
	services:{ 
		placeService:undefined, 
		geocoder:undefined, 
		map:undefined 
	},  																			 // various services (eg. Google Place Service, Geocoder, and Google Map)
	drag: { 																	 
		posi: {x:0,y:0},
	  timei: 0,
	  posf: {x:0,y:0},
	  timef: 0 
	},																				// later will use for momentum sensitive drags (or some variation of this)
	
}

var showLoading, endLoading;

$(function(){
	
	// start services first thing when document is ready
	APPX.services.placeService = new google.maps.places.PlacesService(document.getElementById('targetSearchResults'));
	APPX.services.geocoder = new google.maps.Geocoder();
	
	// object to keep track of page information
	APPX.pages = { 
		page:'r',                                 //intitially on red page
		diffH:window.innerWidth * 0.03,
		diffV:window.innerHeight * 0.03,
		thresholdH:$('#rblock').width() * -0.5,
		thresholdV:$('#rblock').height() * -0.5 
	};
	
	// disable an element by placing partly translucent shield over it
	var disableElement = function(elementId){
		try{
			console.log('entering: disableElement');
			
			var e, ePosType, shieldStyle;
			
			e = $('#' + elementId);
			ePosType = e.css('position');
			shieldStyle = {
				position:'absolute',
				height: e.height(),
				width: e.width(),
				top: e.parent().offset().top - e.offset().top,
				left: e.parent().offset().left - e.offset().left,
				'background-color':'#888',
				opacity:.7,
				'z-index':98
			};
			
			e.after('<div style="position:absolute" id="shield_' + elementId + '"></div>');
			$('#shield_' + elementId).css(shieldStyle);
			
		}catch(er){
			console.error(er + ': disableElement');
		}
	};
	
	//enable an element removing shield
	var enableElement = function(elementId){
		try{
			console.log('entering: enableElement');
			
			$('#shield_' + elementId).remove();
			
		}catch(er){
			console.error(er + ': enableElement');
		}
	};
	
	// show the loading animation
	var showLoading = function(){
		try{
			console.log('entering: showLoading');
			
			var squareWidth, setWrapperWidth;
			
			squareLoadingTemplate = _.template($('#squareLoadingTemplate').html());
			$('#set').after(squareLoadingTemplate({}));
			
			squareWidth = $('#squareLoading').width();
			setWrapperWidth = $('.setWrapper').width();
			$('#squareLoading').css('left', (setWrapperWidth-squareWidth)/2);
			
		}catch(er){
			console.error(er + ': showLoading');
		}
	};
	
	// remove the loading animation
	var endLoading = function(){
		try{
			console.log('entering: endLoading');
			
			$('#squareLoading').remove();
			
		}catch(er){
			console.error(er + ': endLoading');
		}
	};
	
	// center vertically an element e within its parent, returns nothing
	var vCenter = function(e){
		try{
			console.log('entering: vCenter');
			
			var eH, parH, eTop
			
			eH = e.outerHeight();
			parH = e.parent().outerHeight();
			eTop = (parH - eH)/2;
			eTop = eTop > 0 ? eTop : 0;
			e.css('top',eTop);
		
		}catch(er){
			console.error(er + ': vCenter');
		}
	};
	
	// calls vCenter and recenters element if the window size is changed
	var vCenterInit = function(e){
		try{
			console.log('entering: vCenterInit');
			
			vCenter(e);
			$(window).resize(function(){
				vCenter(e);
			});
			
		}catch(er){
			console.error(er + ': vCenterInit');
		}
	};
	
	$('.vCentered').each(function(i,obj){
		vCenterInit($(this));
	});
	
  //Navigation between pages
  //  -able: drag and revert back, change page with clicks, drag between pages
  //  -later: momentum sensitive swipes
 
	// the handler for when the dragging the set starts (later use for momentum sensitivity)
	var dragSetStartHandler = function(){
		try{
			console.log('entering: dragSetStartHandler')
			
			var pos = $('#set').offset();
			APPX.pages.isDrag = true;
			APPX.drag.posi.x = pos.left;
			APPX.drag.posi.y = pos.top;
			
		}catch(er){
			console.error(er + ': dragSetStartHandler');
		}
	};
	
	// the handler used when set is dragged (later use for momentum sensitivity)
	var dragSetDragHandler = function(){
		try{
			console.log('entering: dragSetDragHandler');
		}catch(er){
			console.error(er + ': dragSetDragHandler');
		}
	};
	
	// the handler used when dragging set stops
	var dragSetStopHandler = function(){
		try{
			console.log('entering: dragSetStopHandler')
			
			var pos = $('#set').offset();
			
			APPX.pages.page = '';
			APPX.drag.posf.x = pos.left;
			APPX.drag.posf.y = pos.top;
		
			if(APPX.drag.posf.x < APPX.pages.thresholdH){
				if(APPX.drag.posf.y < APPX.pages.thresholdV){
					toPage('b');
				}else{
					toPage('y');
				};
			}else{
		  	if(APPX.drag.posf.y < APPX.pages.thresholdV){
		  		toPage('g');
		 	 	}else{
		  		toPage('r');
		  	};
			}
		
		}catch(er){
			console.error(er + ': dragSetStopHandler')
		}
	};
	
  $('#set').draggable({ 
		revert:false, 
		scroll:false,
		cancel:"#map",
		start:dragSetStartHandler,
		drag:dragSetDragHandler,
		stop:dragSetStopHandler 
	});
	
	// animate to the page specified by the prefix (later fix offsetV and H when page objects are made)
  var toPage = function(prefix) {
		try{
			console.log('entering: toPage');
			
			var bpos, spos, diffV, diffH;
			
			if(APPX.pages.page !== prefix){
				
				switch(prefix){
				case 'r':
					diffV = 0;
					diffH = 0;
					break;
				case 'g':
					diffV = APPX.pages.diffV;
					diffH = 0;
					break;
				case 'b':
					diffV = APPX.pages.diffV;
					diffH = APPX.pages.diffH;
					break;
				case 'y':
					diffV = 0;
					diffH = APPX.pages.diffH;
					break;
				}
				
				bpos = $('#' + prefix + 'block').offset();
				spos = $('#set').offset();
				
				$('#set').animate(
					{top:spos.top - bpos.top + diffV, left:spos.left - bpos.left + diffH}, 
					300, 
					function(){
						$('#set').stop(true,false);
					}
				);
      	APPX.pages.page = prefix;
   	 	}
			
		}catch(er){
			console.error(er + ': toPage');
		}
  };
			
  $('#rblock').click(function() {
    toPage('r');
  });
  $('#gblock').click(function() {
    toPage('g');
  });
  $('#bblock').click(function() {
    toPage('b');
  });
  $('#yblock').click(function() {
    toPage('y');
  });
	
	//set up a vertical scroll on an element with id 'id', wrapper height wrapH, and height scrolled h
	var verticalScrollInit = function(id,h,wrapH){
		try{
			console.log('entering: verticalScrollInit');
		
			var offs = $('#' + id).offset();
			
			if(h > wrapH){
				$('#' + id).draggable({
		  		axis:'y',
		  		scroll:false,
      		containment:[offs.left, offs.top - h + wrapH, offs.left, offs.top]
				});
			}
			
		}catch(er){
			console.error(er + 'verticalScrollInit');
		}
	};
	
	//this is necessary because touch-punch prevented input from being accessed
	$('input').bind('click', function(){
	    $(this).focus();
	});
	
	function userNewLocation(position) {
		try{
			console.log('entering: userNewLocation');
		
			var userLat, userLng, thresholdRadius, diffLat, diffLng, distance;
  		
			userLat = position.coords.latitude;
 	 		userLng = position.coords.longitude;
			APPX.here = new google.maps.LatLng(userLat, userLng);
		
			//check if new location is within bounds of visit location
			if(APPX.currentVisit.isActive){
				thresholdRadius = 0.001;
				diffLat = userLat - APPX.currentVisit.place.lat;
				diffLng = userLng - APPX.currentVisit.place.lng
				distance = Math.sqrt(diffLat*diffLat + diffLng*diffLng);
				if(distance > thresholdRadius){
					endVisit();
				}
			}
			
		}catch(er){
			console.error(er + ': userNewLocation');
		}
	};
	
  // watchLocation watches current location using html5 geolocation
  var watchLocation = function(){
		try{
			console.log('entering: watchLocation');
			
			var watchID;
			
			if(navigator.geolocation) {
        watchID = navigator.geolocation.watchPosition(userNewLocation);
      } else {
	      //some popup or flash that the browser does not support this
      }
			
		}catch(er){
			console.error(er + ': watchLocation');
		}
  }; 
  watchLocation();
	
	//initialize google map, will start centered on current location until search is made
	var initializeMap = function(){
		try{
			console.log('entering: initializeMap');
			
			var userLocation, mapOptions; 
		
			if(APPX.here){
				userLocation = APPX.here; //use user location for the initial center of map
			}else{
				userLocation = new google.maps.LatLng(41.88,-87.627); //for testing chrome locally, APPX.here will not be defined
			}
		
			mapOptions = {
				center:userLocation,
				zoom:17,
				mapTypeId:google.maps.MapTypeId.ROADMAP
			};
			APPX.services.map = new google.maps.Map(document.getElementById("map"),mapOptions);
			
		}catch(er){
			console.error(er + ': initializeMap');
		}
	};
	initializeMap();
	
	//adds missing fields to search results (APPX.listedLocations) to prevent errors
	var fixResults = function(){
		try{
			console.log('entering: fixResults');
			
			var len = APPX.listedLocations.length;
			
			for(var index = 0; index < len; index++){
				if(APPX.listedLocations[index].vicinity === undefined){
					APPX.listedLocations[index].vicinity = APPX.listedLocations[index].formatted_address;
				}
				if(APPX.listedLocations[index].opening_hours === undefined){
					APPX.listedLocations[index].opening_hours = {open_now:'?'};
				}
				if(APPX.listedLocations[index].price_level === undefined){
					APPX.listedLocations[index].price_level = '?';
				}
				if(APPX.listedLocations[index].rating === undefined){
					APPX.listedLocations[index].rating = '?';
				}
			}
		}catch(er){
			console.error(er + ': fixResults');
		}	
	};
	
	//removes any any present search results and replaces with new results 
	var showResults = function(locations,searchType) {
		try{
			console.log('entering: showResults');
		
			var listLocationTemplate = _.template($('#listLocationTemplate').html());
			var displayed = $('#searchResults').attr('displayed');
			var locationsToInsert = '';
			var len = locations.length;
		
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
		
			for(var index = 0; index < len; index++){
				templatedLocation = listLocationTemplate(locations[index]);
				templatedLocation= templatedLocation.replace('listedLocation_i','listedLocation_' + index);
				locationsToInsert += templatedLocation;	
			}
		
			if(displayed == 'none'){
				pullDownResults();
			} else {
				$('#searchResults').animate({height:'0%'},300,function(){pullDownResults();});
			}
		}catch(er){
			console.error(er + ': showResults');
		}
	};
	
	var getIndexById = function(selectedId){
		try{
			console.log('entering: getIndexById');
			
			var PatternId = /\d+/;
			return selectedId.match(PatternId);
			
		}catch(er){
			console.error(er + ': getIndexById');
		}
	}
	
	var addMapMarkers = function(){
		try{
			console.log('entering: addMapMarkers');
			
			//First clear any existing markers and remove reference to them
			if(APPX.mapMarkers){
				for(i in APPX.mapMarkers){
					APPX.mapMarkers[i].setMap(null);
				}
				APPX.mapMarkers = [];
			}
			//now add new markers
			for(i in APPX.listedLocations){
				APPX.mapMarkers[i] = new google.maps.Marker({
					position:APPX.listedLocations[i].geometry.location,
					map:APPX.services.map
				});
				if(i == 0){
					APPX.services.map.panTo(APPX.listedLocations[i].geometry.location);
				}
			}
		}catch(er){
			console.error(er + ': addMapMarkers');
		}
	};
	
	//callback function for google nearby search and TextSearch
	var searchSuccessCallback = function(data,status){
		try{
			console.log('entering: searchSuccessCallback');
			
			endLoading();
			enableElement('set');
			APPX.listedLocations = data;
			fixResults();
			showResults(APPX.listedLocations,'nearby');
			
		}catch(er){
			console.error(er + ': searchSuccessCallback')
		}
	};
	
  //Get Google places info: locations nearby user location
  $('#nearbySearch').click(function() {
		var searchOptions = {	
			location: APPX.here,
			rankBy:google.maps.places.RankBy.DISTANCE,
			types:['bakery','bar','cafe','restaurant']
		};
			
		disableElement('set');
		showLoading();
    
		APPX.services.placeService.nearbySearch(searchOptions, searchSuccessCallback);
  });
	
	var initClickables = function(){
		try{
			console.log('entering: initClickables')
			
			$('.clickable').off('mousedown');
			$('.clickable').mousedown(function(){
				$(this).attr({
					natColor:$(this).css('color'),
					natBColor:$(this).css('background-color')
				});
				$(this).css('background-color','#ccc');
				$(this).css('color','#222');
			});
	  
			$('.clickable').off('mouseup');
			$('.clickable').mouseup(function(){
				$(this).css('background-color',$(this).attr('natBColor'));
				$(this).css('color',$(this).attr('natColor'));
			});
			
		}catch(er){
			console.error(er + ': initClickables');
		}
	};
	initClickables();
	
	// check the given string for words that are in the keyWords Library, returns true if any words match a keyword
	// (this should probbably be an call to an API, but for now this works)
	var checkKeyWords = function(searchString){
		try{
			console.log('entering: checkKeyWords');
			
			var wordsArray, waLen, kwLen, isTextSearch, currentLower;
			 
			wordsArray = searchString.split(' ');
			waLen = wordsArray.length;
			kwLen = TEXTSEARCH.length;
			isTextSearch = false;
			
			for(var waI = 0; waI < waLen; waI++){
				currentWordLower = wordsArray[waI].toLowerCase();
				for(var kwI = 0; kwI < kwLen; kwI++){
					if(currentWordLower === TEXTSEARCH[kwI].word){
						isTextSearch = true;
					} 
				}	
			}
			
			return isTextSearch;
			
		}catch(er){
			console.log(er + ': checkKeyWords');
		}
	};
	
	//Get Google places info: specified location
	$('#otherSearch input').change(function() {
		
		disableElement('set');
		showLoading();
		
		$("html, body").animate({ scrollTop: $('#set').offset().top,
		 													scrollLeft: $('#set').offset().left }, 100);

		var address = $(this).val();
		
		if(checkKeyWords(address)){
			
			var searchOptions = {
				query:address,
			}
			APPX.services.placeService.textSearch(searchOptions, searchSuccessCallback);
			
		}else{
		
			APPX.services.geocoder.geocode(
				{'address':address}, 
				function(data,status){
				
					var there, searchOptions;
			
					there = data[0].geometry.location;
				
					searchOptions = {
						location: there,
						rankBy:google.maps.places.RankBy.DISTANCE,
						types:['bakery','bar','cafe','restaurant']
					};
				
					APPX.services.placeService.nearbySearch(searchOptions, searchSuccessCallback);
				}
			);
		}
	});
	
	//adds events for selecting a location from the search results
	var addSelectListedLocationEvents = function(){
		try{
			console.log('entering: addSelectListedLocationEvents');
		
			$('.listedLocation').on('click',function(){
				if(!$(this).hasClass('selectedLocation')){			
					var selectedId = $(this).attr('id');
					var placeIndex = getIndexById(selectedId);
					APPX.selectedLocation = APPX.listedLocations[placeIndex];
			
					if($('.selectedLocation')[0]){
						var formerSelect = $('.selectedLocation');
						var formerIndex = getIndexById(formerSelect.attr('id'));
						APPX.mapMarkers[formerIndex].setAnimation(null);
						formerSelect.removeClass('selectedLocation')
					}

					$(this).addClass('selectedLocation');
					APPX.mapMarkers[placeIndex].setAnimation(google.maps.Animation.BOUNCE);
			
					//var service = new google.maps.places.PlacesService(document.getElementById('locationInfoContainer'));
					APPX.services.placeService.getDetails(
						{reference:APPX.selectedLocation.reference},
			      function(data,status){
							APPX.selectedLocation = data; //assign to more detailed version
							fixLocation();
							showLocationInfo(APPX.selectedLocation);
						}
					);		
				}
			});
		}catch(er){
			console.error(er + ': addSelectListedLocationEvents');
		}
	};
	
	// used to format some fields and fill in missing fields 
	var fixLocation = function(){
		try{
			console.log('entering: fixLocation');
		
			//for appx format specific input
			APPX.selectedLocation.appxForm = {};
		
			//location should have a name, probably not necessary
			if(!APPX.selectedLocation.name){
				APPX.selectedLocation.name = "name unavailable";
			}
		
			if(!APPX.selectedLocation.formatted_address){
				APPX.selectedLocation.formatted_address = APPX.selectedLocation.vicinity + " (approximately)";
			}
		
			if(!APPX.selectedLocation.formatted_phone_number){
				APPX.selectedLocation.formatted_phone_number = "(phone number unknown)";
			}
		
			if(!APPX.selectedLocation.website){
				APPX.selectedLocation.website = "(website unknown)";
			}
		
			if(!APPX.selectedLocation.rating){
				APPX.selectedLocation.rating = "(rating unknown)";
			}
		
			if(!APPX.selectedLocation.reviews){
				APPX.selectedLocation.reviews = [{author_name:"(no reviews for this location)",text:""}];
			}
		
			if(!APPX.selectedLocation.price_level){
				APPX.selectedLocation.appxForm.price = "(price level unknown)";
			}else{
				var p = APPX.selectedLocation.price_level;
				switch(p){
				case 1:
					APPX.selectedLocation.appxForm.price = "$";
					break;
				case 2:
					APPX.selectedLocation.appxForm.price = "$$";
					break;
				case 3:
					APPX.selectedLocation.appxForm.price = "$$$";
					break;
				case 4:
					APPX.selectedLocation.appxForm.price = "$$$$";
					break;
				}
			}
		
			if(!APPX.selectedLocation.opening_hours){
				APPX.selectedLocation.appxForm.isOpen = "(open status unknown)";
				APPX.selectedLocation.appxForm.regularHours = "(hours of operation unknown)";
			}else{
				APPX.selectedLocation.appxForm.isOpen = (APPX.selectedLocation.opening_hours.open_now ? "open now" : "not open now");
				APPX.selectedLocation.appxForm.regularHours = formatRegularHours(APPX.selectedLocation.opening_hours.periods);
			}
	
		}catch(er){
			console.error(er + ': fixLocation');
		}
	};
	
	var formatRegularHours = function(periods){
		try{
			console.log('entering: formatRegularHours');
		
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
		
		}catch(er){
			console.error(er + ': formatRegularHours');
		}
	};
	
	var showLocationInfo = function(location) {
		try{
			console.log('entering: showLocationInfo');
			
			var locationInfoTemplate, reviewTemplate, locationPlotTemplate, 
				templatedLocationInfo, templatedLocationPlot, selectedPhotoURL;
			
			locationInfoTemplate = _.template($('#locationInfoTemplate').html());
			reviewTemplate = _.template($('#reviewTemplate').html());
			locationPlotTemplate = _.template($('#locationPlotTemplate').html());
			templatedLocationInfo = locationInfoTemplate(location);
			templatedLocationPlot = locationPlotTemplate(PLACES[0].periods[5]);
			selectedPhotoURL;
		
			if(APPX.selectedLocation.photos){
				selectedPhotoURL = APPX.selectedLocation.photos[0].getUrl({maxWidth:400});
			} else {
				selectedPhotoURL = APPX.selectedLocation.icon;
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
			initClickables();
			toPage('y');
		
		}catch(er){
			console.error(er + ': showLocationInfo');
		}
	};
	
	// start a visit to the selected location
	var startVisit = function(){
		try{
			console.log('entering: startVisit');
			
			var liveVisitTemplate, templatedLiveVisit;
			
			disableElement('startVisitButton');
			
			APPX.currentVisit = {
				isActive:true,
				place:APPX.selectedLocation,
				startTime:new Date(),
				endTime:false,
				bump:false,
				review:false
			};
		
			liveVisitTemplate = _.template($('#liveVisitTemplate').html());
			templatedLiveVisit = liveVisitTemplate(APPX.currentVisit);
			$('.setWrapper').append(templatedLiveVisit);
			
			$('#visitHeader').on('click',function(){
				collapseVisit();
			});
			$('#visitEndButton').on('click',function(){
				endVisit();
			});
			initClickables();
		
		}catch(er){
			console.error(er + ': startVisit');
		}
	};
	
	var collapseVisit = function(){
		try{
			console.log('entering: collapseVisit');
			
			var collapseHeight, collapseWidth, collapseTop, collapseLeft;
		
			collapseHeight = 1.75; //in em
			collapseWidth = 10;    //in em
			collapseTop = $('.setWrapper').height() - collapseHeight*14 - 2 ; //in px
			collapseLeft = $('.setWrapper').width() - collapseWidth*14 - 2 ; //in px
		
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
		
		}catch(er){
			console.error(er + ': collapseVisit');
		}
	};
	
	var expandVisit = function(){
		try{
			console.log('entering: expandVisit');
			
			$('#liveVisit').animate(
				{height:'90%', width:'90%', top:'5%', left:'5%'},
				500,
				function(){
					$('#liveVisit *:not(#visitTitle,#visitShowHide,#visitHeader)').css('font','12px courier,monospace');
				}
			);
			
			$('#visitHeader').removeClass('visitCollapsed');
			$('#visitHeader').addClass('visitExpanded');
			$('#liveVisit').attr('opened','true');
			$('#visitHeader').off();
			$('#visitHeader').on('click',function(){
				collapseVisit();
			});
		
		}catch(er){
			console.error(er + ': expandVisit');
		}
	};
	
	var endVisit = function(){
		try{
			console.log('entering: endVisit');
			
			$('#liveVisit').remove();
			APPX.currentVisit = {isActive:false};
			enableElement('startVisitButton');
	
		}catch(er){
			console.error(er + ': endVisit');
		}
	};
	
	// for now: this is using fake data until api's are made
	var drawPlot = function(){
		try{
			console.log('entering: drawPlot');
			
			var cWidth, cHeight, day, HinD, peak, current, next, mid, canvas, ctx;
			
			cWidth = $('#dataPlot').attr('width');
			cHeight = $('#dataPlot').attr('height');
			day = PLACES[0].periods[5].hours;
			HinD = day.length; //should be 24
			peak = 0;
			current = {};
			next = {};
			mid = {};
		
			for(var h = 0; h < HinD; h++){
				peak = day[h].tot > peak ? day[h].tot : peak;
			}
		
			canvas = document.getElementById('dataPlot');
			ctx = canvas.getContext('2d');
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
		
		}catch(er){
			console.error(er + ': drawPlot');
		}
	};
	
	var locationInfoScrollStopHandler = function(){
		try{
			console.log('entering: locationInfoScrollHandler');
			
			var w, posX, posXNew;
			
			w = $('.locationInfoSet').width();
			posX = $('.locationInfoSet').offset().left;
			posXNew;
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
		
		}catch(er){
			console.error(er + ': locationInfoScrollHandler');
		}
	};
	
});
