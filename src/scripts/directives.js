angular.module('ask.bootstrap.directives', ['ngAnimate', 'angular-mood', 'ui.bootstrap', 'datetime.bootstrap', 'ask-logic'])



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

			scope.getToneClasses = function() {

				if (!scope.field.tone)
					return "" ;

				return "alert alert-" + scope.field.tone ;
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

.directive('askRating', ['$timeout', function($timeout) {
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

				updateStarFills() ;
			} ;

			function updateStarFills() {

				console.log("updating star fills") ;

				if (scope.promise)
					$timeout.cancel(scope.promise) ;

				scope.promise = $timeout(
					function() {
						for (var i=0 ; i<scope.choices.length ; i++)
							scope.choices[i].isFilled = isStarFilled(scope.choices[i]) ;
					}, 50
				) ;

			}

			function isStarFilled(choice) {


				//Changing star style on hover is nice, but looks really messed up if browser is slightly slow (which happens in firefox)
				if (scope.hoveredChoice) {
					
					if (scope.hoveredChoice.rating >= choice.rating) 
						return true ;
					else
						return false ;
				}

				if (!scope.$parent.answer) 
					return false ;
				
				if (scope.$parent.answer.rating >= choice.rating)
					return true ;
				
				return false ;
				
			}

		}
	}
}])

.directive('askDatetime', ["$log", function($log) {

	var defaultConfig = {
		showDate: true,
		showTime: true
	}

	return {
		restrict: 'E',
		templateUrl: 'ask.bootstrap.field.datetime.tmpl.html',
		link: function (scope, element, attrs) {

		
			scope.values = {date: [], time:[]} ;

			scope.cfg = _.clone(defaultConfig) ;

			scope.$watch('field', function() {

				//merge config and default
				if (!scope.field) {
					scope.cfg = _.clone(defaultConfig) ;
				} else {

					scope.cfg = {
						showDate: scope.field.showDate,
						showTime: scope.field.showTime
					} ;

	          		_.each(defaultConfig, function(value, key) {
			            if (scope.cfg[key] === null || scope.cfg[key] === undefined)
			            	scope.cfg[key] = value ;
			        }) ;
				}

				scope.cfg.date = {within:scope.field.dateWithin} ;
				scope.cfg.time = {} ;
			}) ;

			
			scope.$watch('values.date', function() {

				if (!hasConflict())
					return ;

				handleDateOrTimeUpdated() ;
			}, true);

			scope.$watch('values.time', function() {

				if (!hasConflict())
					return ;

				handleDateOrTimeUpdated() ;
			}, true) ;

			scope.$watch('answer', function() {

				if (!hasConflict())
					return ;

				handleAnswerChanged() ;
			})

			function hasConflict() {

				console.log("checking conflict") ;


				var date = parseDateArray(scope.values.date) ;
				var dateWidgetSet = isDateValid(date) ;
				var dateAnswerSet = isDateValid(scope.answer) ;


				var time = parseTimeArray(scope.values.time) ;
				var timeWidgetSet = isTimeValid(time) ;
				var timeAnswerSet = isTimeValid(scope.answer) ;


				//if required date widget is not set, answer must be blank
				if (scope.cfg.showDate && !dateWidgetSet) {
					if (dateAnswerSet || timeAnswerSet)
						return true ;
					else
						return false ;
				}

				//if required time widget is not set, answer must be blank
				if (scope.cfg.showTime && !timeWidgetSet) {
					if (dateAnswerSet || timeAnswerSet)
						return true ;
					else
						return false ;
				} 

				//if date widget is set, answer must match it
				if (dateWidgetSet || dateAnswerSet) {
					if (date.year != scope.answer.year)
						return true ;

					if (date.month != scope.answer.month)
						return true ;

					if (date.day != scope.answer.month)
						return true ;
				}

				//if time widget is set, answer must match it
				if (timeWidgetSet || timeAnswerSet) {
					if (time.hour != scope.answer.hour)
						return true ;

					if (time.minute != scope.answer.minute)
						return true ;
				}

				return false ;
			}

			function isDateValid(date) {
				if (!date)
					return false ;

				return (date.year && date.month && date.day) ;
			}


			function isTimeValid(time) {
				if (!time)
					return false ;

				return (time.hour && time.minute != null) ;
			}


			function parseDateArray(array) {

				if (!array || !array[0] || !array[1] || !array[2])
					return {} ;

				return {
					year: array[0],
					month: array[0],
					day: array[0]
				} ;
			}

			function parseTimeArray(array) {

				if (!array || !array[0] || array[1] == null)
					return {} ;

				return {
					hour: array[0],
					minute: array[1]
				}
			}



			function handleDateOrTimeUpdated() {

				console.log("handling date or time change") ;

				var date = parseDateArray(scope.values.date) ;
				var time = parseTimeArray(scope.values.time) ;


				if (scope.cfg.showDate && !isDateValid(date)) {
					scope.answer = {} ;
					return ;
				}

				if (scope.cfg.showTime && !isTimeValid(time)) {
					scope.answer = {} ;
					return ;
				}

				if (scope.cfg.showDate) {
					scope.answer.year = date.year ;
					scope.answer.month = date.month ;
					scope.answer.day = date.day ;
				} else {
					scope.answer.year = undefined ;
					scope.answer.month = undefined ;
					scope.answer.day = undefined ;
				}

				if (scope.cfg.showTime) {
					scope.answer.hour = time.hour ;
					scope.answer.minute = time.minute ;
				} else {
					scope.answer.hour = undefined ;
					scope.answer.minute = undefined ;
				}

			}

			function handleAnswerChanged() {

				console.log("handling answer change") ;

				if (scope.cfg.showDate) {
					if (isDateValid(scope.answer))
						scope.values.date = [] ;
					else
						scope.values.date = [scope.answer.year, scope.answer.month, scope.answer.day] ;
				} else {
					scope.values.date = [] ;
				}

				if (scope.cfg.showTime) {
					if (isTimeValid(scope.answer))
						scope.values.time = [] ;
					else
						scope.values.time = [scope.answer.hour, scope.answer.minute, 0] ;
						
				} else {
					scope.values.time = [] ;
				}
			}



		}
	}



}])


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