//------------------------------------------------------------------------//
// View trip details
//------------------------------------------------------------------------//
Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}
				
$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();
});
		
var userList = ["Jill","Smith","John","Eve"];
var currentUser = "bitch";
var totalSeats = 5 ;

function loadUsers(){
	var userDiv = document.getElementById('userDiv');
	//console.log(userDiv);
	
	for(var i=0; i<userList.length; i++){;
		var div = document.createElement("div");
		imageUrl = "img/mel.jpg";
		div.setAttribute("id",userList[i]);
		div.setAttribute("class","btn-group");
		//div.setAttribute("style",'');
		div.innerHTML = '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" style="padding-left: 4px; padding-right: 4px;">' +
						'<img src="' + imageUrl + '" class="img-thumbnail">' +
						//'style="height:40%; width:40%;">' +
						'<span class="caret"></span>'+
						'</button>' +
						'<ul class="dropdown-menu">' +
						'	<li><a href="#">Call</a></li>'+
						'	<li><a href="#">Notify</a></li>'+
						'</ul>';
		userDiv.appendChild(div);
	}
}

function addUser(){
	console.log("add or remove");

	if((totalSeats-userList.length)> 0){
		var userDiv = document.getElementById('userDiv');
		var div = document.createElement("div");
		imageUrl = "img/mel.jpg";
		div.setAttribute("id",currentUser);
		div.setAttribute("class","btn-group");
		//div.setAttribute("style",'');
		div.innerHTML = '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" style="padding-left: 4px; padding-right: 4px;">' +
						'<img src="' + imageUrl + '" class="img-thumbnail img-responsive">' +
						//'style="height:40%; width:40%;">' +
						'<span class="caret"></span>'+
						'</button>' +
						'<ul class="dropdown-menu">' +
						'	<li><a href="#">Call</a></li>'+
						'	<li><a href="#">Notify</a></li>'+
						'</ul>';
		userList.push(currentUser);
		userDiv.appendChild(div);	
		
		var join = document.getElementById('join');
		join.innerHTML = '<span class="glyphicon glyphicon-remove"></span>Termintate';
		
	}else if (userList.contains(currentUser)){
		userQuit();
	}
}

function userQuit(){
	var userDiv = document.getElementById(currentUser);
	userDiv.parentNode.removeChild(userDiv);
	
	var index = userList.indexOf(currentUser);
	if (index > -1) {
		userList.splice(index, 1);
	}
	
	var join = document.getElementById('join');
	join.innerHTML = '<span class="glyphicon glyphicon-ok"></span>Join';
}

function cancelTrip(){

}

//------------------------------------------------------------------------//
// create trip
//------------------------------------------------------------------------//


	  
	