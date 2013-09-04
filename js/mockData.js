var USERS = [];
var PLACES = [];

USERS[0] = {
	id:0,
	name:'matt',
	email:'matt@appx.com',
	password:'appx123',
	visits:[
		{userId:0,placeId:0,start:'Wed Sep 04 2013 11:47:40',bump:true,end:'Wed Sep 04 2013 12:50:0',review:'good sushi!'},
		{userId:0,placeId:1,start:'Thu Sep 05 2013 5:40:10',bump:false,end:'Thu Sep 05 2013 6:40:10',review:'dont go!'},
		{userId:0,placeId:0,start:'Fri Sep 06 2013 18:28:50',bump:true,end:'Fri Sep 06 2013 19:28:50',review:false},
		{userId:0,placeId:2,start:'Sat Sep 07 2013 19:37:70',bump:true,end:'Sat Sep 07 2013 20:37:70',review:'go here!'},
		{userId:0,placeId:0,start:'Sun Sep 08 2013 18:30:80',bump:false,end:'Sun Sep 08 2013 19:30:80',review:false},
		{userId:0,placeId:3,start:'Mon Sep 09 2013 9:20:20',bump:false,end:'Mon Sep 09 2013 9:40:20',review:'sucks!'}],
	wantTo:[
		{placeId:4},
		{placeId:5}]
}

PLACES[0] = {
	id:0,
	name:'Union Sushi + Barbeque Bar',
	location:'230 West Erie Street, Chicago, IL',
	googleRef:'CoQBeQAAAKLmUGQiNiXbRA_5gNd-IW35QJlVajbG4sI3DjBEskkJranlKbL3CIqjB6iIlTb0Dq9gOA-sQJqrmJgtNevvJSuuPVxj2cbcJYy7nqkgQD1vSlVN3Tur-06WVwq_G7oaH0t_kcJFIc7wMbJIMe8Blbg3EZ7rLjz9HEntXrf2vj4MEhBGrF84CmvfnHA7PrwLnp3fGhQhrEZ_y1YzF_DonhmDjGiqLcOlug',
	totalVisits:612,
	totalBumps:231,
	totalVisitTime:864,
	periods:[
	{day:'sun',hours:[{h:0,tot:0},{h:1,tot:0},{h:2,tot:0},{h:3,tot:0},{h:4,tot:0},{h:5,tot:0},
										{h:6,tot:0},{h:7,tot:0},{h:8,tot:0},{h:9,tot:0},{h:10,tot:0},{h:11,tot:0},
										{h:12,tot:0},{h:13,tot:0},{h:14,tot:0},{h:15,tot:0},{h:16,tot:0},{h:17,tot:5},
										{h:18,tot:12},{h:19,tot:20},{h:20,tot:16},{h:21,tot:0},{h:22,tot:0},{h:23,tot:0}]},
	{day:'mon',hours:[{h:0,tot:0},{h:1,tot:0},{h:2,tot:0},{h:3,tot:0},{h:4,tot:0},{h:5,tot:0},
										{h:6,tot:0},{h:7,tot:0},{h:8,tot:0},{h:9,tot:0},{h:10,tot:0},{h:11,tot:3},
										{h:12,tot:8},{h:13,tot:7},{h:14,tot:0},{h:15,tot:0},{h:16,tot:0},{h:17,tot:7},
										{h:18,tot:10},{h:19,tot:13},{h:20,tot:14},{h:21,tot:13},{h:22,tot:6},{h:23,tot:0}]},
	{day:'tue',hours:[{h:0,tot:0},{h:1,tot:0},{h:2,tot:0},{h:3,tot:0},{h:4,tot:0},{h:5,tot:0},
										{h:6,tot:0},{h:7,tot:0},{h:8,tot:0},{h:9,tot:0},{h:10,tot:0},{h:11,tot:1},
										{h:12,tot:5},{h:13,tot:4},{h:14,tot:0},{h:15,tot:0},{h:16,tot:0},{h:17,tot:3},
										{h:18,tot:7},{h:19,tot:6},{h:20,tot:7},{h:21,tot:8},{h:22,tot:2},{h:23,tot:0}]},
	{day:'wed',hours:[{h:0,tot:0},{h:1,tot:0},{h:2,tot:0},{h:3,tot:0},{h:4,tot:0},{h:5,tot:0},
										{h:6,tot:0},{h:7,tot:0},{h:8,tot:0},{h:9,tot:0},{h:10,tot:0},{h:11,tot:2},
										{h:12,tot:5},{h:13,tot:6},{h:14,tot:0},{h:15,tot:0},{h:16,tot:0},{h:17,tot:4},
										{h:18,tot:6},{h:19,tot:8},{h:20,tot:9},{h:21,tot:6},{h:22,tot:4},{h:23,tot:0}]},
	{day:'thu',hours:[{h:0,tot:0},{h:1,tot:0},{h:2,tot:0},{h:3,tot:0},{h:4,tot:0},{h:5,tot:0},
										{h:6,tot:0},{h:7,tot:0},{h:8,tot:0},{h:9,tot:0},{h:10,tot:0},{h:11,tot:4},
										{h:12,tot:9},{h:13,tot:8},{h:14,tot:0},{h:15,tot:0},{h:16,tot:0},{h:17,tot:4},
										{h:18,tot:9},{h:19,tot:13},{h:20,tot:15},{h:21,tot:12},{h:22,tot:10},{h:23,tot:0}]},
	{day:'fri',hours:[{h:0,tot:0},{h:1,tot:0},{h:2,tot:0},{h:3,tot:0},{h:4,tot:0},{h:5,tot:0},
										{h:6,tot:0},{h:7,tot:0},{h:8,tot:0},{h:9,tot:0},{h:10,tot:0},{h:11,tot:6},
										{h:12,tot:13},{h:13,tot:10},{h:14,tot:0},{h:15,tot:0},{h:16,tot:0},{h:17,tot:8},
										{h:18,tot:14},{h:19,tot:26},{h:20,tot:29},{h:21,tot:27},{h:22,tot:16},{h:23,tot:12}]},
	{day:'sat',hours:[{h:0,tot:0},{h:1,tot:0},{h:2,tot:0},{h:3,tot:0},{h:4,tot:0},{h:5,tot:0},
										{h:6,tot:0},{h:7,tot:0},{h:8,tot:0},{h:9,tot:0},{h:10,tot:0},{h:11,tot:0},
										{h:12,tot:0},{h:13,tot:0},{h:14,tot:0},{h:15,tot:0},{h:16,tot:0},{h:17,tot:6},
										{h:18,tot:12},{h:19,tot:20},{h:20,tot:24},{h:21,tot:25},{h:22,tot:25},{h:23,tot:15}]}]
};

PLACES[1] = {
	id:1,
	name:'bad burger place',
	location:'333 West Erie Street, Chicago, IL'
};

PLACES[2] = {
	id:2,
	name:'good burger place',
	location:'444 West Erie Street, Chicago, IL'
};

PLACES[3] = {
	id:3,
	name:'terrible coffee place',
	location:'555 West Erie Street, Chicago, IL'
};

PLACES[4] = {
	id:4,
	name:'Decent looking place',
	location:'666 West Erie Street, Chicago, IL'
};

PLACES[5] = {
	id:5,
	name:'Another Decent Looking Place',
	location:'222 West Erie Street, Chicago, IL'
};