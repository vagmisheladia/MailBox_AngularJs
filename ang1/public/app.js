var app = angular.module('myapp', ['ngRoute']);

app.config(function ($routeProvider) {
	$routeProvider.when("/", {
		templateUrl: 'home.html',
	})
		.when("/login", {
			templateUrl: 'login.html',
			controller: 'login'
		})
		.when("/profile", {
			templateUrl: 'profile.html',
			controller: 'profile',
			resolve: ['authService', function (authService) {
				return authService.checkStatus();
			}]
		})
		.when("/reg", {
			templateUrl: "reg.html",
			controller: 'regcon',
		})
		.when("/message", {
			templateUrl: "message.html",
			controller: 'messagecon',
			resolve: ['authService', function (authService) {
				return authService.checkStatus();
			}]

		})
		.when("/email/:id", {
			templateUrl: "msgview.html",
			controller: 'view',
			resolve: ['authService', function (authService) {
				return authService.checkStatus();
			}]

		})
		.when("/logout", {
			controller: 'logout'

		})
		.when("/email", {
			templateUrl: 'email.html',
			controller: 'emailcon',
			resolve: ['authService', function (authService) {
				return authService.checkStatus();
			}]
		});
});

app.controller("appcon", function ($scope, $http, $location, $rootScope) {

	$scope.isLoggedIn = false;
	$scope.$on('isLoggedIn', function(event, args) {
		$scope.isLoggedIn = args;
	});

});
app.controller("logout", function ($scope, $location, $rootScope) {
	console.log("Hello");
	localStorage.removeItem("isLogin");
	$location.path('/login')
});


app.controller("regcon", function ($scope, $http) {
	$scope.save = function () {
		$http.post('http://localhost:3000/postdata', $scope.userForm).then(function (resp) {
			if (resp.data.flg) {
				alert("dataupdate");
				$location.path('/login');
			}
		});
	}
});

app.factory("authService", function ($location, $http, $q) {
	return {
		'checkStatus': function () {
			var defer = $q.defer();
			setTimeout(function () {
				if (localStorage.isLogin) {
					defer.resolve();
				}
				else {
					$location.path('/login');
					defer.reject();
				}
			}, 1000);
			return defer.promise;
		}

	};
});


app.controller("login", function ($scope, $http, $location, $rootScope) {

	$scope.login = function () {

		$http.post('http://localhost:3000/logindata', $scope.user).then(function (resp) {
			if (resp.data.flg.isLogin == true) {
				$scope.flag = resp.data.flg;
				$location.path('/');
				$scope.$emit('isLoggedIn', true);
				localStorage.isLogin = 'true';
				$rootScope.token = $scope.flag;
				$scope.a_user = resp.data.data;
				$rootScope.c_user = $scope.a_user;
			} else {

				alert("login failed")
			}
			// return authService.checkStatus($scope.flag);
		});


	}

});

app.controller("profile", function ($scope, $http, $location, $rootScope) {
	$scope.a_user = $rootScope.c_user;

	$scope.profile = function () {

		$http.post('http://localhost:3000/updateUser', $scope.c_user).then(function (resp) {
			if (resp.data) {
				alert("dataupdate");
				$location.path('/');
			}
		});
	};
});

app.controller("emailcon", function ($scope, $location, $http, $rootScope, $routeParams) {
	$scope.a_user = $rootScope.c_user;
	$http.get('http://localhost:3000/msg/' + $scope.c_user.username).then(function (response) {
		$scope.msg = response.data;
		$rootScope.newMsg = $scope.msg;
	});

	$scope.compose = function () {
		$location.path('/message');
	};

	$http.get('http://localhost:3000/getusers').then(function (resp) {
		$scope.user = resp.data;
	});
});


app.controller("messagecon", function ($scope, $location, $http, $rootScope) {
	$scope.a_user = $rootScope.c_user;
	$http.get('http://localhost:3000/getusers').then(function (resp) {
		if (resp.data) {
			$scope.user = resp.data;
		}

		$scope.back = function () {
			$location.path('/email');
		}

	});

	$scope.send = function () {
		$scope.a_user = $rootScope.c_user;
		$http.post('http://localhost:3000/compmsg', $scope.c_user).then(function (resp) {
		
			if (resp.data) {
				alert("message send");	
				$location.path('/email');
			}
		});
	};

});

app.controller('view', function ($scope, $rootScope, $location, $http, $routeParams) {
	$scope.a_user = $rootScope.c_user;
	$scope.msg = $rootScope.newMsg;
	$scope.details = $rootScope.newMsg[$routeParams.id];
	var temp = $routeParams.id;
	$scope.send = function () {
		$http.post('http://localhost:3000/newMsg/' + $scope.c_user.username, $scope.details).then(function (resp) {

			if (resp.data) {
				alert("message send");	
				$location.path('/email');
			}

		});
	}
	$scope.delete = function () {
		$http.post('/del', $scope.details).then(function (res) {
			if ($routeParams.id) {
				alert("deleted msg")
				$location.path('/email');
			}
		})
	}

	if ($scope.details.isImpo == true) {
		$scope.button = "important";
	}
	else {
		$scope.button = "Mark As important";
	}

	$scope.impo = function () {
		$http.post('/impo', $scope.details).then(function (res) {
			console.log(true);
			alert("important???");
			$location.path('/email');
			$scope.button = "mark as important";
		});
	}

});
