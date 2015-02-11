var app = angular.module('app', ["ngSanitize","ask-bootstrap"])


  .controller('Ctrl', function($scope, $http) {


    
    $scope.response = {
        answers: {
          qStreak: {number:5},
          qDaysTired: {number:3},
          qSickStreak: {number:2},
          qDaysBusy: {number:3},
          qGender: {choice:'Female'},
          qStepsYesterday: {number:9845},
          qDifficulty: {choice:'Hard'}
        }
    }

    
    var surveyFile = "surveys/fitness-coach.json" ;

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


