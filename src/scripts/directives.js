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


.directive('askMultitext', function() {

	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.multitext.tmpl.html',
		link : function (scope, element, attrs) {

			//we want answer to be a simple array of strings,
			//but angular is buggy unless it listens to an array of objects,
			//so we need this complicated setup

			scope.tempEntries = undefined ;

			scope.$watch(
				'answer.entries',
				handleEntriesChanged,
				true
			) ;

			scope.$watch(
				'tempEntries',
				handleTempEntriesChanged,
				true
			) ;
		


			function handleEntriesChanged() {

				console.log("Handling entries changed") ;

				if (!scope.answer.entries)
					return ;

				//check if we need to change 
				if (!isCacheMismatched())
					return ;

				console.log("updating temp entries to match entries") ;

				//update temp entries to match entries

				var t = [] ;
				_.each(scope.answer.entries, function(entry) {
					t.push({text:entry}) ;
				}) ;

				//pad out number of entries to minimum 
				var minEntries = 1 ;
				if (scope.field.minEntries)
					minEntries = scope.field.minEntries ;

				while (t.length < minEntries) 
					t.push({text:""}) ;
				
				scope.tempEntries = t ;
			}



			function handleTempEntriesChanged() {

				console.log("handling temp entries changed") ;

				if (!isCacheMismatched())
					return ;

				console.log("updating entries to match temp entries") ;

				var t = [] ;
				_.each(scope.tempEntries, function(entry) {
					t.push(entry.text) ;
				}) ;

				


				scope.answer.entries = t ;
			}

			function isCacheMismatched() {

				console.log("checking cache")
				console.log(scope.tempEntries) ;
				console.log(scope.answer.entries) ;

				if (!scope.tempEntries)
					return true ;

				if (!scope.answer.entries)
					return true ;

				if (scope.tempEntries.length != scope.answer.entries.length)
					return true ;

				for (var i=0 ; i<scope.tempEntries.length ; i++) {
					if (scope.tempEntries[i].text != scope.answer.entries[i])
						return true ;
				}

				return false ;
			}

			scope.canAdd = function() {

				if (!scope.field.maxEntries)
					return true ;

				return scope.answer.entries.length < scope.field.maxEntries ;
			} 

			scope.add = function() {
				scope.tempEntries.push({text:""}) ;
			} 

			scope.remove = function(index) {
				console.log("removing " + index) ;

				scope.tempEntries.splice(index, 1) ;
			}

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

.directive('askRating', function() {
	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.rating.tmpl.html',
		link : function (scope, element, attrs) {


			scope.$watch('field', function() {

				if (!scope.field)
					return ;

				scope.choices = [] ;
				for (var i=0 ; i<scope.field.length ; i++) {
					var choice = {rating:(i+1)} ;

					if (scope.field.descriptions)
						choice.description = scope.field.descriptions[i] ;

					choice.isFilled = false ;

					scope.choices.push(choice) ;
				}

				scope.cellWidth = Math.floor(100/scope.choices.length) + "%" ;

			}, true ) ;

			scope.setChoice = function(choice) {

				if (choice)
					scope.$parent.answer.rating = choice.rating ;
				else
					scope.$parent.answer.rating = undefined ;

				scope.selectedChoice = choice ;

				updateStarFills() ;
			} ;

			scope.hoverChoice = function(choice) {

				scope.hoveredChoice = choice ;

				//updateStarFills() ;
			} ;

			function updateStarFills() {

				console.log("updating star fills") ;

				_.each(scope.choices, function(choice) {
					choice.isFilled = isStarFilled(choice) ;
				}) ;
			}

			function isStarFilled(choice) {

				/*
				Changing star style on hover is nice, but looks really messed up if browser is slightly slow (which happens in firefox)
				if (scope.hoveredChoice) {
					
					if (scope.hoveredChoice.rating >= choice.rating) 
						return true ;
					else
						return false ;
				}
				*/

				if (!scope.$parent.answer) 
					return false ;
				
				if (scope.$parent.answer.rating >= choice.rating)
					return true ;
				
				return false ;
				
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