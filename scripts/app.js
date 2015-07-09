var app = angular.module('app', ["ask.bootstrap", "ui.layout",  "ui.ace", "ngRoute", "ngSanitize"])



  .config(['$routeProvider', function($routeProvider) {
      $routeProvider.
          when('/', {
                templateUrl: 'views/main.html',
                controller: "MainCtrl"
            }).
            when('/build', {
                templateUrl: 'views/builder.html', 
                controller: "BuilderCtrl"
            }).
            when('/build/:surveyId', {
                templateUrl: 'views/builder.html', 
                controller: "BuilderCtrl"
            }).
            otherwise({redirectTo: '/'});
  }])





  .controller('MainCtrl', function($scope, $http) {

    $scope.catalog = null ; 

    $scope.loading = true ;

      $http.get('data/catalog.json')
      .then(
        function (result) {

          $scope.catalog = result.data ;
          $scope.loading = false ;
        },
        function (error) {
          console.log(error) ;
          $scope.loading = false ;
        }
      ) ;
  })






  .controller('BuilderCtrl', function($scope, $http, $routeParams) {

    $scope.ace_options = {
      require: ['ace/ext/language_tools'],
      mode:'json',
      advanced: {
          enableSnippets: true,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true
      }
    }

    $scope.response = {} ;

    if (!$routeParams.surveyId) {

      $scope.schema = {
        fields: [],
        fieldRules: [],
        pageRules: []
      } ;
    
    } else {

      $scope.loading = true ;

      $http.get('data/surveys/' + $routeParams.surveyId + ".json")
      .then(
        function (result) {
          $scope.schema = result.data ;
          buildPrimer() ;
          $scope.loading = false ;

          console.log($scope.schema) ;
        },
        function (error) {
          console.log(error) ;
          $scope.loading = false ;
        }
      ) ;

    }



    $scope.$watch("schema", function() {
      $scope.schema_str = JSON.stringify($scope.schema, null, '    ');
    }, true) ;


    $scope.$watch("response", function() {
      console.log("handling response change") ;

      $scope.response_str = JSON.stringify($scope.response, null, '    ');
    }, true) ;

    $scope.$watch("primer.response", function() {

      if (!$scope.primer)
        return ;

      if ($scope.primer.response.completed) {

        console.log("primer completed!") ;

        $scope.response = $scope.primer.response ;
        $scope.response.pageIndex = 0 ;
        $scope.response.completed = false ;
        $scope.schema.dateModified = new Date() ;

        $scope.primer = undefined ;
      }
    }, true) ;


    $scope.buildSurvey = function(){

      $scope.response = {} ;
      $scope.schema = JSON.parse($scope.schema_str) ;
      buildPrimer() ;
    }


    function buildPrimer() {

      $scope.primer = undefined ;

      var hiddenFields = _.filter($scope.schema.fields, function(field) {
        return field.hidden ;
      }) ;  

      if (hiddenFields.length > 0) {

        $scope.primer = {} ;

        $scope.primer.schema = {
          fields : _.map(hiddenFields, function(f) {
            var field = _.cloneDeep(f) ;
            field.hidden = false ;
            return field ;
          }),
          fieldRules: [],
          pageRules: []
        }

        $scope.primer.response = {} ;
        console.log($scope.primer) ;
      }
    }


  }) ;









