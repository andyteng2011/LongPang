var longpangApp = angular.module('longpangApp', ['ngRoute', 'firebase', 'ngStorage'])
        .config(['$routeProvider', function($routeProvider) {
                $routeProvider
                        .when('/',
                                {
                                    templateUrl: 'partials/inner.html'
                                })
                        .when('/profile',
                                {
                                    templateUrl: 'partials/profile.html'
                                })
                        .when('/createTrip',
                                {
                                    templateUrl: 'partials/createTrip.html'
                                })
                        .when('/searchTrip',
                                {
                                    templateUrl: 'partials/searchTrip.html'
                                })
                        .when('/viewtripdetails',
                                {
                                    templateUrl: 'partials/viewTripDetails.html'
                                })
						.when('/viewtripdetailsUser',
                                {
                                    templateUrl: 'partials/viewTripDetailsUser.html'
                                })
                        .when('/viewPastTransactions',
                                {
                                    templateUrl: 'partials/viewPastTransactions.html'
                                })
                        .when('/viewTrips',
                                {
                                    templateUrl: 'partials/viewTrips.html'
                                })
                        .when('/searchResults',
                                {
                                    templateUrl: 'partials/searchResults.html'
                                })
                        .when('/notifications',
                                {
                                    templateUrl: 'partials/notifications.html'
                                })
                        .when('/help',
                                {
                                    templateUrl: 'partials/help.html'
                                })
                        .otherwise({redirectTo: '/'});
            }]);

longpangApp.controller('longpangCtrl', function($scope, $location, $firebase, $localStorage) {

    // variables for search page simulation
    $scope.icon = "glyphicon glyphicon-ok";
    $scope.iconText = "Join";
    $scope.noOfUsers = 6;
    $scope.imageSize = (($(window).width() - 40) / 6) - 8;
    $scope.userList = ["Jill", "Smith", "John", "Eve", "Jackson"];
    $scope.arrangemnt = 'pickupPointDistance';

	$scope.tempTripId = "";
	$scope.tempDriverEmail = "";

    //Load all users
    var ref = new Firebase('https://longpang.firebaseio.com/users/');
    $scope.users = $firebase(ref);
    $scope.users.$bind($scope, "users");

    //Load all trips
    var ref2 = new Firebase('https://longpang.firebaseio.com/trips/');
    $scope.trips = $firebase(ref2);
    $scope.trips.$bind($scope, "trips");

    //Load all users trips
    var ref3 = new Firebase('https://longpang.firebaseio.com/usersTrips/');
    $scope.usersTrips = $firebase(ref3);
    $scope.usersTrips.$bind($scope, "usersTrips");
	
	//Load all users notifications
    var ref4 = new Firebase('https://longpang.firebaseio.com/usersNotifications/');
    $scope.usersNotifications = $firebase(ref4);
    $scope.usersNotifications.$bind($scope, "usersNotifications");

    $scope.$storage = $localStorage.$default({
        userLoggedIn: {},
        loginStatus: false
    });

	$scope.vehicleChoices = {
        'Honda': {
			'Accord': [1,2,3,4],
            'Civic': [1,2,3,4],
			'Fit': [1,2,3,4],
			'Odyssey': [1,2,3,4,5,6]
        },
        'Toyota': {
			'Camry': [1,2,3,4],
            'Corolla': [1,2,3,4],
			'Estima': [1,2,3,4,5,6],
			'Wish': [1,2,3,4,5,6]
        },
		'Volkswagen': {
			'Golf': [1,2,3,4],
			'Jetta': [1,2,3,4]
		}
    };
	
    //check if user is logged in and has vehicle info before creating a trip
    $scope.checkIfUserIsLoggedInAndHasVehicleInfo = function() {
        if ($scope.$storage.loginStatus === false) {
            $('#loginModal').modal('show');
        };
    };
	
	$scope.loadQRCodeIfDriverHasTrip = function() {
		if($scope.$storage.loginStatus === true) {
			$scope.loadQRCheck = false;
			var check = false;
			var ref = new Firebase('https://longpang.firebaseio.com/usersTrips/' + $scope.$storage.userLoggedIn.emailKey);
			ref.on('value', function(snapshot) {
				snapshot.forEach(function(s) {
					if(s.child('identity').val() === 'driver') {
						check = true;
						$scope.loadQRCheck = true;
					}
				});
			});
			if(check == true) {
				$scope.loadQR = "img/qrcode.png";
			};
		};
	};

    //logout
    $scope.logout = function() {
        $scope.$storage.userLoggedIn = {};
        $scope.$storage.loginStatus = false;
        $('#logoutModal').modal('show');
        setTimeout(function() {
            $('#logoutModal').modal('hide');
        }, 5000);
        $location.path('/');
    };

    //register new user
    $scope.registerUser = function() {
        var selectedPhoto = document.getElementById("textAreaFileContents").innerHTML;
        var profilePhoto = "";
        if (selectedPhoto.length > 0) {
            profilePhoto = selectedPhoto;
        } else {
            profilePhoto = "img/Man_Silhouette.png";
        }
        var email = $scope.newUser.email;
        var email = email.replace(/\./gi, "-");

        $scope.users.$child(email).$set({
			emailKey: email,
            email: $scope.newUser.email,
            password: $scope.newUser.password,
            name: $scope.newUser.fullName,
            contact: $scope.newUser.contactNumber,
            profilePhoto: profilePhoto,
            creditCardInfo: {
                creditCardNo: "",
                cvv2: "",
                expiryDate: "",
                paypalEmail: ""
            },
            vehicleDetails: {
                vehicleNumber: "",
                brand: "",
                model: "",
                seatsToOffer: ""
            },
            preferences: {
                smoke: false,
                pets: false,
                food: false,
                music: true,
                gender: "noPreference"
            }
        });

        $scope.$storage.loggedInEmail = email;
        var u = new Firebase('https://longpang.firebaseio.com/users/' + email);
        u.on('value', function(snapshot) {
            $scope.$storage.userLoggedIn = snapshot.val();
            $scope.$storage.loginStatus = true;
        });

        $scope.newUser.email = "";
        $scope.newUser.password = "";
        $scope.newUser.fullname = "";
        $scope.newUser.contactNumber = "";

        alert("Registered!"); //can change to better UI
        $('#signupModal').modal('hide');
        $location.path('/profile');
    };

    //login user
    $scope.login = function() {
		
        var email = $scope.login.email;
        var password = $scope.login.password;
        var temp = email.replace(/\./g, "-");

        if ($scope.users[temp] == null) {
            alert('Please sign up as LongPang user!');
        } else {
            if ($scope.users[temp].password === password) {
                $scope.$storage.userLoggedIn = $scope.users[temp];
                $scope.$storage.loginStatus = true;
                $scope.login.email = "";
                $scope.login.password = "";
				alert("Welcome to LongPang!");
				$scope.loadQRCodeIfDriverHasTrip();
                $('#loginModal').modal('hide');
                //$location.path('/profile');
            } else {
                alert('Incorrect password');
            }
        }
    };
	
	$scope.login_createTrip = function() {
        var email = $scope.login.email;
        var password = $scope.login.password;
        var temp = email.replace(/\./g, "-");

        if ($scope.users[temp] == null) {
            alert('Please sign up as LongPang user!');
        } else {
            if ($scope.users[temp].password === password) {
                $scope.$storage.userLoggedIn = $scope.users[temp];
                $scope.$storage.loginStatus = true;
                $scope.login.email = "";
                $scope.login.password = "";
				alert("Welcome to LongPang!");
                $('#loginModal_createTrip').modal('hide');
                $scope.createTrip();
            } else {
                alert('Incorrect password');
            }
        }
    };
	
	$scope.login_searchTrip = function() {
        var email = $scope.login.email;
        var password = $scope.login.password;
        var temp = email.replace(/\./g, "-");

        if ($scope.users[temp] == null) {
            alert('Please sign up as LongPang user!');
        } else {
            if ($scope.users[temp].password === password) {
                $scope.$storage.userLoggedIn = $scope.users[temp];
                $scope.$storage.loginStatus = true;
                $scope.login.email = "";
                $scope.login.password = "";
				alert("Welcome to LongPang!");
                $('#loginModal_searchTrip').modal('hide');
                $scope.quickJoin($scope.tempTripId, $scope.tempDriverEmail);
            } else {
                alert('Incorrect password');
            }
        }
    };
	
	$scope.login_TripDetails = function() {
        var email = $scope.login.email;
        var password = $scope.login.password;
        var temp = email.replace(/\./g, "-");

        if ($scope.users[temp] == null) {
            alert('Please sign up as LongPang user!');
        } else {
            if ($scope.users[temp].password === password) {
                $scope.$storage.userLoggedIn = $scope.users[temp];
                $scope.$storage.loginStatus = true;
                $scope.login.email = "";
                $scope.login.password = "";
				alert("Welcome to LongPang!");
                $('#loginModal_TripDetails').modal('hide');
                $scope.normalJoin($scope.tempTripId, $scope.tempDriverEmail);
            } else {
                alert('Incorrect password');
            }
        }
    };

    //update personal info
    $scope.updatePersonalInfo = function() {
        var selectedPhoto = document.getElementById("textAreaFileContents").innerHTML;
        var profilePhoto = "";
        if (selectedPhoto.length > 0) {
            profilePhoto = selectedPhoto;
        } else {
            profilePhoto = "img/Man_Silhouette.png";
        }

        var name = document.getElementById("updatePersonalInfoName").value;
        var contact = document.getElementById("updatePersonalInfoContact").value;
        var password = document.getElementById("updatePersonalInfoPassword").value;

		$scope.users.$child($scope.$storage.userLoggedIn.emailKey).$update({
			name: name,
			contact: contact,
            password: password
		});

        $scope.$storage.userLoggedIn.name = name;
        $scope.$storage.userLoggedIn.contact = contact;
        $scope.$storage.userLoggedIn.password = password;

        alert("Personal Info Updated!"); //can change to better UI
        $('#personalInfoModal').modal('hide');
    };

    //update payment info
    $scope.updatePaymentInfo = function() {

        var creditCardNo = document.getElementById("updatePaymentInfoCreditCardNo").value;
        var cvv2 = document.getElementById("updatePaymentInfoCVV2").value;
        var expiryDate = document.getElementById("updatePaymentInfoExpiryDate").value;
        var paypalEmail = document.getElementById("updatePaymentInfoPayPalEmail").value;

		$scope.users.$child($scope.$storage.userLoggedIn.emailKey).$update({
			creditCardInfo: {
                creditCardNo: creditCardNo,
                cvv2: cvv2,
                expiryDate: expiryDate,
                paypalEmail: paypalEmail
            }
		});

        $scope.$storage.userLoggedIn.creditCardInfo.creditCardNo = creditCardNo;
        $scope.$storage.userLoggedIn.creditCardInfo.cvv2 = cvv2;
        $scope.$storage.userLoggedIn.creditCardInfo.expiryDate = expiryDate;
        $scope.$storage.userLoggedIn.creditCardInfo.paypalEmail = paypalEmail;

        alert("Payment Info Updated!"); //can change to better UI
        $('#paymentInfoModal').modal('hide');
    };
	
	$scope.updatePaymentInfo_createTrip = function() {

        var creditCardNo = document.getElementById("updatePaymentInfoCreditCardNo").value;
        var cvv2 = document.getElementById("updatePaymentInfoCVV2").value;
        var expiryDate = document.getElementById("updatePaymentInfoExpiryDate").value;
        var paypalEmail = document.getElementById("updatePaymentInfoPayPalEmail").value;

        $scope.users.$child($scope.$storage.userLoggedIn.emailKey).$update({
			creditCardInfo: {
                creditCardNo: creditCardNo,
                cvv2: cvv2,
                expiryDate: expiryDate,
                paypalEmail: paypalEmail
            }
		});

        $scope.$storage.userLoggedIn.creditCardInfo.creditCardNo = creditCardNo;
        $scope.$storage.userLoggedIn.creditCardInfo.cvv2 = cvv2;
        $scope.$storage.userLoggedIn.creditCardInfo.expiryDate = expiryDate;
        $scope.$storage.userLoggedIn.creditCardInfo.paypalEmail = paypalEmail;

        alert("Payment Info Updated!"); //can change to better UI
        $('#paymentInfoModal_createTrip').modal('hide');
		$scope.createTrip();
    };
	
	$scope.updatePaymentInfo_searchTrip = function() {

        var creditCardNo = document.getElementById("updatePaymentInfoCreditCardNo").value;
        var cvv2 = document.getElementById("updatePaymentInfoCVV2").value;
        var expiryDate = document.getElementById("updatePaymentInfoExpiryDate").value;
        var paypalEmail = document.getElementById("updatePaymentInfoPayPalEmail").value;

        $scope.users.$child($scope.$storage.userLoggedIn.emailKey).$update({
			creditCardInfo: {
                creditCardNo: creditCardNo,
                cvv2: cvv2,
                expiryDate: expiryDate,
                paypalEmail: paypalEmail
            }
		});

        $scope.$storage.userLoggedIn.creditCardInfo.creditCardNo = creditCardNo;
        $scope.$storage.userLoggedIn.creditCardInfo.cvv2 = cvv2;
        $scope.$storage.userLoggedIn.creditCardInfo.expiryDate = expiryDate;
        $scope.$storage.userLoggedIn.creditCardInfo.paypalEmail = paypalEmail;

        alert("Payment Info Updated!"); //can change to better UI
        $('#paymentInfoModal_searchTrip').modal('hide');
		$scope.quickJoin($scope.tempTripId, $scope.tempDriverEmail);
    };
	
	$scope.updatePaymentInfo_TripDetails = function() {

        var creditCardNo = document.getElementById("updatePaymentInfoCreditCardNo").value;
        var cvv2 = document.getElementById("updatePaymentInfoCVV2").value;
        var expiryDate = document.getElementById("updatePaymentInfoExpiryDate").value;
        var paypalEmail = document.getElementById("updatePaymentInfoPayPalEmail").value;

        $scope.users.$child($scope.$storage.userLoggedIn.emailKey).$update({
			creditCardInfo: {
                creditCardNo: creditCardNo,
                cvv2: cvv2,
                expiryDate: expiryDate,
                paypalEmail: paypalEmail
            }
		});

        $scope.$storage.userLoggedIn.creditCardInfo.creditCardNo = creditCardNo;
        $scope.$storage.userLoggedIn.creditCardInfo.cvv2 = cvv2;
        $scope.$storage.userLoggedIn.creditCardInfo.expiryDate = expiryDate;
        $scope.$storage.userLoggedIn.creditCardInfo.paypalEmail = paypalEmail;

        alert("Payment Info Updated!"); //can change to better UI
        $('#paymentInfoModal_TripDetails').modal('hide');
		$scope.normalJoin($scope.tempTripId, $scope.tempDriverEmail);
    };

    //update vehicle info
    $scope.updateVehicleInfo = function() {
        var vBrand = document.getElementById("vBrand");
		var brand = vBrand.options[vBrand.selectedIndex].text;
        var vModel = document.getElementById("vModel");
		var model = vModel.options[vModel.selectedIndex].text;
        var vehicleNumber = document.getElementById("vCarplate").value;
        var vSeatsToOffer = document.getElementById("vSeats");
		var seatsToOffer = parseInt(vSeatsToOffer.options[vSeatsToOffer.selectedIndex].text);

		$scope.users.$child($scope.$storage.userLoggedIn.emailKey).$update({
			vehicleDetails: {
                brand: brand,
                model: model,
                seatsToOffer: seatsToOffer,
                vehicleNumber: vehicleNumber
            }
		});

        $scope.$storage.userLoggedIn.vehicleDetails.brand = brand;
        $scope.$storage.userLoggedIn.vehicleDetails.model = model;
        $scope.$storage.userLoggedIn.vehicleDetails.seatsToOffer = seatsToOffer;
        $scope.$storage.userLoggedIn.vehicleDetails.vehicleNumber = vehicleNumber;

        alert("Vehicle Info Updated!"); //can change to better UI
        $('#vehicleInfoModal').modal('hide');
    };
	
	$scope.updateVehicleInfo_createTrip = function() {
        var vBrand = document.getElementById("vBrand");
		var brand = vBrand.options[vBrand.selectedIndex].text;
        var vModel = document.getElementById("vModel");
		var model = vModel.options[vModel.selectedIndex].text;
        var vehicleNumber = document.getElementById("vCarplate").value;
        var vSeatsToOffer = document.getElementById("vSeats");
		var seatsToOffer = parseInt(vSeatsToOffer.options[vSeatsToOffer.selectedIndex].text);

        $scope.users.$child($scope.$storage.userLoggedIn.emailKey).$update({
			vehicleDetails: {
                brand: brand,
                model: model,
                seatsToOffer: seatsToOffer,
                vehicleNumber: vehicleNumber
            }
		});

        $scope.$storage.userLoggedIn.vehicleDetails.brand = brand;
        $scope.$storage.userLoggedIn.vehicleDetails.model = model;
        $scope.$storage.userLoggedIn.vehicleDetails.seatsToOffer = seatsToOffer;
        $scope.$storage.userLoggedIn.vehicleDetails.vehicleNumber = vehicleNumber;

        alert("Vehicle Info Updated!"); //can change to better UI
        $('#vehicleInfoModal_createTrip').modal('hide');
		$scope.createTrip();
    };

    //update preferences
    $scope.updatePreferencesInfo = function() {
		if($scope.$storage.loginStatus === false) {
			alert("Preferences Updated!"); //can change to better UI
			$('#preferencesInfoModal').modal('hide');
		} else {
			var gender = $('input[name=gender]:checked').val();
			var smoke = document.getElementById('preferenceSmoke').checked;
			var pets = document.getElementById('preferencePets').checked;
			var food = document.getElementById('preferenceFood').checked;
			var music = document.getElementById('preferenceMusic').checked;

			$scope.users.$child($scope.$storage.userLoggedIn.emailKey).$update({
				preferences: {
					smoke: smoke,
					pets: pets,
					food: food,
					music: music,
					gender: gender
				}
			});

			$scope.$storage.userLoggedIn.preferences.smoke = smoke;
			$scope.$storage.userLoggedIn.preferences.pets = pets;
			$scope.$storage.userLoggedIn.preferences.food = food;
			$scope.$storage.userLoggedIn.preferences.music = music;
			$scope.$storage.userLoggedIn.preferences.gender = gender;
			
			alert("Preferences Updated!"); //can change to better UI
			$('#preferencesInfoModal').modal('hide');
		}
    };

    //create a trip
    $scope.createTrip = function() {
		if ($scope.$storage.loginStatus === false) {
            $('#loginModal_createTrip').modal('show');
        } else if ($scope.$storage.userLoggedIn.vehicleDetails.vehicleNumber == "") {
            $('#vehicleInfoModal_createTrip').modal('show');
        } else if ($scope.$storage.userLoggedIn.creditCardInfo.creditCardNo == "" && $scope.$storage.userLoggedIn.creditCardInfo.paypalEmail == "") {
			$('#paymentInfoModal_createTrip').modal('show');
		} else {
			var email = $scope.$storage.userLoggedIn.email;
			var email = email.replace(/\./gi, "-");

			var mon = document.getElementById('createTrip.mon').checked;
			var tue = document.getElementById('createTrip.tue').checked;
			var wed = document.getElementById('createTrip.wed').checked;
			var thur = document.getElementById('createTrip.thur').checked;
			var fri = document.getElementById('createTrip.fri').checked;
			var sat = document.getElementById('createTrip.sat').checked;
			var sun = document.getElementById('createTrip.sun').checked;

			var id = generateID();
			var pickupPointDistance = Math.floor((Math.random() * 100) + 1);
			var dropoffPointDistance = Math.floor((Math.random() * 100) + 1);
			var travelingTime = Math.floor((Math.random() * 100) + 1);
			
			$scope.trips.$child(id).$set({
				id: id,
				pickupPoint: document.getElementById("createtrip_pickupTextBox").value,
				pickupPointDistance: pickupPointDistance,
				dropoffPoint: document.getElementById("createtrip_dropoffTextBox").value,
				dropoffPointDistance: dropoffPointDistance,
				startDate: $scope.createTrip.startDate,
				startTime: $scope.createTrip.startTime,
				price: parseInt(document.getElementById("createTrip.price").value),
				recurringDays: {
					mon: mon,
					tue: tue,
					wed: wed,
					thur: thur,
					fri: fri,
					sat: sat,
					sun: sun
				},
				driver: {
					email: email,
					name: $scope.$storage.userLoggedIn.name,
					contact: $scope.$storage.userLoggedIn.contact
				},
				vehicleDetails: {
					brand: $scope.$storage.userLoggedIn.vehicleDetails.brand,
					model: $scope.$storage.userLoggedIn.vehicleDetails.model,
					vehicleNo: $scope.$storage.userLoggedIn.vehicleDetails.vehicleNumber,
					seatsLeft: $scope.$storage.userLoggedIn.vehicleDetails.seatsToOffer
				},
				carpoolers: [],
				qrCode: "img/qrcode.png",
				travelingTime: travelingTime
			});
			
			$scope.usersTrips.$child($scope.$storage.userLoggedIn.emailKey).$child(id).$update({
				id: id,
				identity: "driver"
			});

			$scope.createTrip.startDate = "";
			$scope.createTrip.startTime = "";
			
			$('#loginModal_createTrip').modal('hide');
			$('#vehicleInfoModal_createTrip').modal('hide');
			$('#paymentInfoModal_createTrip').modal('hide');
			
			alert("You have offered a ride!"); //better UI
			$scope.viewTripDetailsId = id;
			$location.path('/viewtripdetails');
		};
    };

    //search a trip
    $scope.searchTrip = function() {
        $location.path('/searchResults');
    };

    //quick join
    $scope.quickJoin = function(id,driverEmail) {
		$scope.tempTripId = id;
		$scope.tempDriverEmail = driverEmail;
		
        if ($scope.$storage.loginStatus == false) {
            $('#loginModal_searchTrip').modal('show');
        } else if($scope.$storage.userLoggedIn.creditCardInfo.creditCardNo == "" && $scope.$storage.userLoggedIn.creditCardInfo.paypalEmail == "") {
			$('#paymentInfoModal_searchTrip').modal('show');
		} else {
            $scope.trips.$child(id).$child('carpoolers').$child($scope.$storage.userLoggedIn.emailKey).$update({
				email: $scope.$storage.userLoggedIn.emailKey
			});

			$scope.usersTrips.$child($scope.$storage.userLoggedIn.emailKey).$child(id).$update({
				id: id,
				identity: "carpooler"
			});
			
			var id = generateID();
			var now = getDateTime();
			
			$scope.usersNotifications.$child(driverEmail).$child(id).$update({
				id: id,
				From: $scope.$storage.userLoggedIn.name,
				DateTime: now,
				Message: "You have a new carpooler! ;)",
				Read: false
			});
			
			var count = 0;
			var ref4 = new Firebase('https://longpang.firebaseio.com/usersNotifications/' + $scope.tempDriverEmail);
			ref4.on('value', function(snapshot) {
				snapshot.forEach(function(s) {
					if(s.child('Read').val() === false) {
						count++;
					}
				});
			});
			ref4.update({
				count: count
			});
			$('#loginModal_searchTrip').modal('hide');
			$('#paymentInfoModal_searchTrip').modal('hide');
			
            alert("Join successful!");
			
			$scope.viewTripDetailsId = $scope.tempTripId;
			$location.path('/viewtripdetails');
        }
    };
	
	//normal join
    $scope.normalJoin = function(id,driverEmail) {
		$scope.tempTripId = id;
		$scope.tempDriverEmail = driverEmail;
		
        if ($scope.$storage.loginStatus == false) {
            $('#loginModal_TripDetails').modal('show');
        } else if($scope.$storage.userLoggedIn.creditCardInfo.creditCardNo == "" && $scope.$storage.userLoggedIn.creditCardInfo.paypalEmail == "") {
			$('#paymentInfoModal_TripDetails').modal('show');
		} else {			
			$scope.trips.$child(id).$child('carpoolers').$child($scope.$storage.userLoggedIn.emailKey).$update({
				email: $scope.$storage.userLoggedIn.emailKey
			});
			
			$scope.usersTrips.$child($scope.$storage.userLoggedIn.emailKey).$child(id).$update({
				id: id,
				identity: "carpooler"
			});
			
			var id = generateID();
			var now = getDateTime();
			
			$scope.usersNotifications.$child(driverEmail).$child(id).$update({
				id: id,
				From: $scope.$storage.userLoggedIn.name,
				DateTime: now,
				Message: "You have a new carpooler! ;)",
				Read: false
			});
			
			var count = 0;
			var ref4 = new Firebase('https://longpang.firebaseio.com/usersNotifications/' + $scope.tempDriverEmail);
			ref4.on('value', function(snapshot) {
				snapshot.forEach(function(s) {
					if(s.child('Read').val() === false) {
						count++;
					}
				});
			});
			ref4.update({
				count: count
			});
			$('#loginModal_TripDetails').modal('hide');
			$('#paymentInfoModal_TripDetails').modal('hide');
            alert("Join successful!");
			
			$scope.viewTripDetailsId = $scope.tempTripId;
			$location.path('/viewtripdetails');
        }
    };
	
	$scope.carpoolerTerminateTrip = function(id,driverEmail) {		
		$scope.trips.$child(id).$child('carpoolers').$child($scope.$storage.userLoggedIn.emailKey).$remove();
		$scope.usersTrips.$child($scope.$storage.userLoggedIn.emailKey).$child(id).$remove();
		
		var id = generateID();
		var now = getDateTime();
		
		$scope.usersNotifications.$child(driverEmail).$child(id).$update({
			id: id,
			From: $scope.$storage.userLoggedIn.name,
			DateTime: now,
			Message: "I have quit your carpool.",
			Read: false
		});
		
		var count = 0;
		var ref4 = new Firebase('https://longpang.firebaseio.com/usersNotifications/' + driverEmail);
		ref4.on('value', function(snapshot) {
			snapshot.forEach(function(s) {
				if(s.child('Read').val() === false) {
					count++;
				}
			});
		});
		ref4.update({
			count: count
		});
		
		alert("Trip terminated!");
	};
	
	$scope.driverTerminateTrip = function(id) {
		
		var ref2 = new Firebase('https://longpang.firebaseio.com/trips/' + id + '/carpoolers');
		var carpoolers = [];
		ref2.on('value', function(snapshot) {
			snapshot.forEach(function(s) {
				var e = s.child('email').val();
				carpoolers.push(e);
			});
		});
		var now = getDateTime();
		for(var i=0; i <carpoolers.length; i++) {
			$scope.usersNotifications.$child(carpoolers[i]).$child(id).$update({
				id: id,
				From: $scope.$storage.userLoggedIn.name,
				DateTime: now,
				Message: "Sorry, I have terminated the carpool.",
				Read: false
			});
			
			var count = 0;
			var ref5 = new Firebase('https://longpang.firebaseio.com/usersNotifications/' + carpoolers[i]);
			ref5.on('value', function(snapshot) {
				snapshot.forEach(function(s) {
					if(s.child('Read').val() === false) {
						count++;
					}
				});
			});
			ref5.update({
				count: count
			});
			
			$scope.usersTrips.$child(carpoolers[i]).$child(id).$remove();
		};
		
		$scope.usersTrips.$child($scope.$storage.userLoggedIn.emailKey).$child(id).$remove();
		$scope.trips.$child(id).$remove();
		
		alert("Trip terminated.");
		$location.path('/');
	};

    $scope.viewTrip = function(trip) {
        $scope.viewTripDetailsId = trip.id;
        $location.path('/viewtripdetails');
    };
	
	$scope.viewTripUser = function(trip) {
        $scope.viewTripDetailsId = trip.id;
        $location.path('/viewtripdetailsUser');
    };

    $scope.getValues = function(obj) {
        var accumulator = [];
        for (var trip in obj) {
            accumulator.push(obj[trip]);
        }
        console.log(accumulator)
        return accumulator;
    };

    // Random ID generator
    function generateID() {
        var chars, x, length = 10;
        chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-=";
        var name = [];
        for (x = 0; x < length; x++) {
            name.push(chars[Math.floor(Math.random() * chars.length)]);
        }
        var id = name.join('');
        if ($scope.trips.$getIndex().indexOf(id) === -1) {
            return id;
        } else {
            generateId();
        }
    };
	
	function getDateTime() {
		var now     = new Date(); 
		var year    = now.getFullYear();
		var month   = now.getMonth()+1; 
		var day     = now.getDate();
		var hour    = now.getHours();
		var minute  = now.getMinutes();
		var second  = now.getSeconds(); 
		if(month.toString().length == 1) {
		var month = '0'+month;
		}
		if(day.toString().length == 1) {
		var day = '0'+day;
		}   
		if(hour.toString().length == 1) {
		var hour = '0'+hour;
		}
		if(minute.toString().length == 1) {
		var minute = '0'+minute;
		}
		if(second.toString().length == 1) {
		var second = '0'+second;
		}   
		var dateTime = day+'/'+month+'/'+year+' '+hour+':'+minute+':'+second;   
		return dateTime;
	};
	
	$scope.updateNotifications = function() {
		
		var ref = new Firebase('https://longpang.firebaseio.com/usersNotifications/' + $scope.$storage.userLoggedIn.emailKey);
		ref.on('value', function(snapshot) {
			snapshot.forEach(function(s) {
				if(s.child('Read').val() === false) {
					var ref2 = new Firebase('https://longpang.firebaseio.com/usersNotifications/' + $scope.$storage.userLoggedIn.emailKey + '/' + s.child('id').val());
					ref2.update({
						Read: true
					});
				};
			});
		});
		ref.update({
			count: 0
		});
	};
	
	$scope.notifyUser = function(userEmail) {
		$scope.notifyUserEmail = userEmail;
		$('#notificationModal').modal('show');
	};
	
	$scope.sendNotification = function() {
		var ref = new Firebase('https://longpang.firebaseio.com/usersNotifications/' + $scope.notifyUserEmail);
		$scope.sendNotification = $firebase(ref);
		$scope.sendNotification.$bind($scope, "sendNotification");
		
		var id = generateID();
		var now = getDateTime();
		$scope.sendNotification.$child(id).$set({
			id: id,
			From: $scope.$storage.userLoggedIn.name,
			DateTime: now,
			Message: document.getElementById('message').value,
			Read: false
		});
		
		var count = 0;
		var ref2 = new Firebase('https://longpang.firebaseio.com/usersNotifications/' + $scope.notifyUserEmail);
		ref2.on('value', function(snapshot) {
			snapshot.forEach(function(s) {
				if(s.child('Read').val() === false) {
					count++;
				}
			});
		});
		alert(count);
		ref2.update({
			count: count
		});
		
		alert("Notification sent!");
		$scope.notifyUserEmail = "";
		$('#notificationModal').modal('hide');
	}

    //Added 2 methods here & new variables!!!
    $scope.sortOrder = "+";
    $scope.sortVar = "pickupPointDistance"

    $scope.toArray = function(obj) {

        var result = [];

        angular.forEach(obj, function(val, key) {
            result.push(val);
        });

        $scope.toArrayObj = obj;
        return result;

    };

    $scope.objLength = function(obj) {
        var result = [];

        angular.forEach(obj, function(val, key) {
            if (typeof val === 'object') {
                result.push(val);
            }
        });

        console.log(result.length)
        return result.length;

    };

});

longpangApp.filter("toArray", function(obj) {
    //console.log(obj);

    console.log(new Date());
    console.log(obj);
    var result = [];

    angular.forEach(obj, function(val, key) {
        if (typeof obj === 'object') {
            //console.log(obj);
            result.push(val);
        }
    });
    return result;
});