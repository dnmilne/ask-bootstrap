var app = angular.module('app', ["ngSanitize","ask.bootstrap"])


  .controller('Ctrl', function($scope, $http) {


    /*
    $scope.response = {
        answers: {
          qStreak: {number:4},
          qDaysTired: {number:0},
          qSickStreak: {number:0},
          qDaysBusy: {number:0},
          qGender: {choice:'Female'},
          qStepsYesterday: {number:9845},
          qDifficulty: {choice:'Easy'}
        }
    }
    var surveyFile = "surveys/fitness-coach.json" ;
    */


    
    $scope.response = {} ;
    var surveyFile = "surveys/junk.json" ;
    /*
    var surveyFile = "surveys/chat-feedback.json" ;
    */
    
    
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


