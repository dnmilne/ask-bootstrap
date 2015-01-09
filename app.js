var app = angular.module('app', ["ngSanitize","angular-ask"])


  .controller('Ctrl', function($scope, $http) {

    
    $scope.response = {}

    
    var surveyFile = "surveys/mh-lit.json" ;

  	$http.get(surveyFile)
    .then(
      function (response) {

        console.log(response.data) ;
        $scope.survey = response.data ;
      },
      function (error) {
        console.log(error) ;
      }
    ) ;
  }) ;


