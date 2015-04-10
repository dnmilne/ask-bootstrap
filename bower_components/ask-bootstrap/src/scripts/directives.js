angular.module('ask.bootstrap.directives', ['ngAnimate', 'angular-mood', 'ui.bootstrap', 'ask-logic'])



.directive('askSurvey', ["$log", "SurveyStates", function ($log, SurveyStates) {

	return {
		restrict: 'E',
		scope: {
			survey:'=',
    		response: '='
		},
		templateUrl: "ask.bootstrap.survey.tmpl.html",
		link : function (scope, element, attrs) {

			scope.$watch("survey", function() {

				if (!scope.survey)
					return ;

				$log.debug("handing survey changed") ;

				scope.state = SurveyStates.init(scope.survey, scope.response) ;

			}, true) ;


			scope.continue = function() {

				$log.debug("attempting to continue")
				$log.debug(scope.state) ;

				scope.state.handleContinue() ;
			}

			scope.back = function() {

				$log.debug("attempting to go back")
				$log.debug(scope.state) ;

				scope.state.handleBack() ;
			}

			scope.onFirstPage = function() {
				if (!scope.response)
					return ;

				return scope.response.pageIndex == 0 ;
			}

			scope.onLastPage = function() {
				if (!scope.response || !scope.state)
					return ;

				return scope.response.pageIndex == (scope.state.pages.length - 1) ;
			}


		}
	}
}]) 







.directive('askField', ["$log", "PlaceholderResolver", function($log, PlaceholderResolver) {

	return {
		restrict: 'E',
		scope: {
			field:'=',
			answer: '=',
			state: '=',
			response: '=',
		},
		templateUrl: "ask.bootstrap.field.tmpl.html",
		link : function (scope, element, attrs) {

			scope.$watch('answer', function() {

				$log.debug("answer updated for field " + scope.field.id) ;

				scope.state.handleAnswerChanged(scope.field.id) ;

			}, true) ;

			

			scope.resolvePlaceholders = function(text) {

				if (!text)
					return text ;

				return PlaceholderResolver.resolve(text, scope.state, scope.response) ;
			}
		}
	}

}])


.directive('askFreetext', function() {

	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.freetext.tmpl.html',
		link : function (scope, element, attrs) {

		}
	}
})


.directive('askSinglechoice', function($filter) {

	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.singlechoice.tmpl.html',
		link : function (scope, element, attrs) {

		}
	}
})


.directive('askMultichoice', function() {

	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.multichoice.tmpl.html',
		link : function (scope, element, attrs) {

			if (!scope.answer.choices)
				scope.answer.choices = [] ;

			scope.isChecked = function(choice) {
				if (!scope.answer || scope.answer.choices)
					return false ;

				return scope.answer.choices.indexOf(choice.name) > -1 ;
			}

			scope.toggle = function(choice) {
			    var idx = scope.answer.choices.indexOf(choice.name);

			    if (idx > -1) 
			      scope.answer.choices.splice(idx, 1) ;
			    else 
			      scope.answer.choices.push(choice.name);
	  		} ;
		}
	}
})


.directive('askNumeric', function() {

	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.numeric.tmpl.html',
		link : function (scope, element, attrs) {

		}
	}
})

.directive('askScale', function() {
	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.scale.tmpl.html',
		link : function (scope, element, attrs) {


			scope.$watch('field', function() {

				if (!scope.field)
					return ;

				scope.choices = [] ;
				for (var i=0 ; i<scope.field.length ; i++) {
					var choice = {index:i} ;

					if (scope.field.descriptions)
						choice.description = scope.field.descriptions[i] ;

					scope.choices.push(choice) ;
				}

			}, true ) ;

			scope.setChoice = function(choice) {

				if (choice)
					scope.$parent.answer.index = choice.index ;
				else
					scope.$parent.answer.index = undefined ;

				scope.selectedChoice = choice ;

			} ;

			scope.hoverChoice = function(choice) {

				scope.hoveredChoice = choice ;
			} ;



		}
	}
})



.directive('askMood', ['MoodData', '$modal', function(MoodData, $modal) {

	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.mood.tmpl.html',
		link : function (scope, element, attrs) {

			scope.setMood = function() {

				var modalInstance = $modal.open({
					templateUrl: 'ask.bootstrap.dlg.mood.tmpl.html',
					controller: 'MoodDialogCtrl',
					size: 'sm',
					resolve: {
						 mood: function() {
						 	return scope.answer.mood;
						}
					}
				});

				modalInstance.result.then(function (mood) {
					scope.answer.mood = mood ;
				}) ;
			}

			scope.moodStyle = function(mood) {

				if (!mood)
					return {} ;

				return {
					color: MoodData.getColor(mood.valence, mood.arousal) 
				}
			}
		}
	}
}]) ;