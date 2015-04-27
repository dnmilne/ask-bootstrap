angular.module('ask.bootstrap', ['ask.bootstrap.controllers','ask.bootstrap.directives','ask.bootstrap.filters','ask.bootstrap.templates']);
angular.module('ask.bootstrap.controllers', ['angular-mood', 'ui.bootstrap'])



.controller('MoodDialogCtrl', function($scope, $modalInstance, MoodData, mood) {

	$scope.mood = _.clone(mood) ;

	$scope.$watch('mood', function() {

		console.log("Mood changed") ;
		console.log(mood) ;
	}) ;
	
	$scope.getStyle = function(mood) {

		if (!mood) return ;

		return {
			color: MoodGrid.getColor(mood.valence, mood.arousal) 
		}
	}

	$scope.ok = function () {
		$modalInstance.close($scope.mood);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

}) ;
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
angular.module('ask.bootstrap.filters', [])


.filter('markdown', function() {

    var converter = new Showdown.converter();

    return function(markdown) {

        if (!markdown)
            return ;

        return converter.makeHtml(markdown) ;
    }
}) ;
angular.module('ask.bootstrap.templates', ['ask.bootstrap.dlg.mood.tmpl.html', 'ask.bootstrap.field.freetext.tmpl.html', 'ask.bootstrap.field.mood.tmpl.html', 'ask.bootstrap.field.multichoice.tmpl.html', 'ask.bootstrap.field.multitext.tmpl.html', 'ask.bootstrap.field.numeric.tmpl.html', 'ask.bootstrap.field.rating.tmpl.html', 'ask.bootstrap.field.singlechoice.tmpl.html', 'ask.bootstrap.field.tmpl.html', 'ask.bootstrap.survey.tmpl.html']);

angular.module('ask.bootstrap.dlg.mood.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.dlg.mood.tmpl.html',
    '<div class=modal-body><div><mood-canvas selected hovered=hoveredInCanvas></mood-canvas></div><div><mood-matrix selected hovered-in-canvas=hoveredInCanvas hovered-in-matrix=hoveredInMatrix></mood-matrix></div>mood: {{mood}}</div><div class=modal-footer><button class="btn btn-primary" ng-click=ok()>Ok</button> <button class="btn btn-default" ng-click=cancel()>Cancel</button></div>');
}]);

angular.module('ask.bootstrap.field.freetext.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.freetext.tmpl.html',
    '<div ng-switch=field.length><textarea ng-switch-when=LONG ng-model=answer.text class=form-control rows=3>\n' +
    '	</textarea><input ng-switch-when=SHORT ng-model=answer.text class="form-control"></div>');
}]);

angular.module('ask.bootstrap.field.mood.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.mood.tmpl.html',
    '<div class="form-control clickable" ng-click=setMood()><strong ng-show=answer.mood ng-style=moodStyle(answer.mood)>{{answer.mood.name}}</strong></div>');
}]);

angular.module('ask.bootstrap.field.multichoice.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.multichoice.tmpl.html',
    '<div><div ng-repeat="choice in field.choices" class=checkbox><label><input type=checkbox ng-checked=isChecked(choice) ng-click="toggle(choice)"> {{choice.name}} <span ng-show=choice.description class="text-muted small">({{choice.description}})</span></label></div></div>');
}]);

angular.module('ask.bootstrap.field.multitext.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.multitext.tmpl.html',
    '<div><div ng-repeat="entry in tempEntries" style="padding-bottom: 5px"><div style="display: table-cell ; width: 100%" ng-switch=field.length><textarea ng-switch-when=LONG ng-model=entry.text class=form-control rows=3>\n' +
    '			</textarea><input ng-switch-when=SHORT ng-model=entry.text class="form-control"></div><div style="display: table-cell ; vertical-align:middle ; padding-left: 10px"><a ng-click=remove($index)><i class="fa fa-times-circle"></i></a></div></div><p ng-show=canAdd()><a ng-click=add()><i class="fa fa-times-circle"></i> More</a></p></div>');
}]);

angular.module('ask.bootstrap.field.numeric.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.numeric.tmpl.html',
    '<div><input type=number ng-model=answer.number class="form-control"></div>');
}]);

angular.module('ask.bootstrap.field.rating.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.rating.tmpl.html',
    '<div><div ng-if="field.ratingType==&quot;radio&quot;"><div ng-if="field.descriptions.length == field.length" style=display:table><div ng-repeat="choice in choices" style="width:{{cellWidth}} ; display:table-cell ; text-align:center"><input type=radio ng-model=$parent.answer.rating ng-value="choice.rating"><br><span class=text-muted style="padding: 0px 10px">{{choice.description}}</span></div></div><div ng-if="field.descriptions.length != field.length && field.descriptions.length == 2"><span class="radio-inline text-muted" style="cursor: default ; margin-left: 0px ; padding-left: 0px ; padding-right: 20px">{{field.descriptions[0]}} &nbsp;</span><label class=radio-inline style="padding: 0px 5px" ng-repeat="choice in choices"><input type=radio ng-model=$parent.answer.rating ng-value="choice.rating"> &nbsp;</label><span class="radio-inline text-muted" style="cursor: default ; margin-left: 0px ; padding-left: 0px">{{field.descriptions[1]}}</span></div></div><div ng-if="field.ratingType==&quot;star&quot;"><span ng-repeat="choice in choices" ng-click=setChoice(choice) ng-mouseover=hoverChoice(choice) ng-mouseout=hoverChoice() style=cursor:pointer><i class="fa fa-star" ng-show=choice.isFilled></i> <i class="fa fa-star-o" ng-hide=choice.isFilled></i></span> <span ng-show=hoveredChoice>&nbsp; {{hoveredChoice.description}}</span> <span ng-show="!hoveredChoice && selectedChoice">&nbsp; {{selectedChoice.description}}</span></div></div>');
}]);

angular.module('ask.bootstrap.field.singlechoice.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.singlechoice.tmpl.html',
    '<div><div ng-repeat="choice in field.choices" class=radio><label><input type=radio ng-model=$parent.answer.choice ng-value="choice.name"> {{choice.name}} <span ng-show=choice.description class=small>{{choice.description}}</span></label></div></div>');
}]);

angular.module('ask.bootstrap.field.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.tmpl.html',
    '<div class="field form-group"><div ng-if=!field.isQuestion><div ng-if="field.type == &quot;sectionBreak&quot;"><hr><h3>{{field.title}}</h3></div><p ng-show=field.text class=text ng-bind-html="resolvePlaceholders(field.text) | markdown"></p><p ng-show=field.notes class="notes text-muted" ng-bind-html="resolvePlaceholders(field.notes) | markdown"></p></div><div ng-if=field.isQuestion><div class=pull-left><i class="fa fa-exclamation-circle fa-lg text-danger" ng-show=field.missing></i> <i class="fa fa-circle" ng-show="!field.missing && !field.optional"></i> <i class="fa fa-circle-o" ng-show="!field.missing && field.optional"></i> &nbsp;</div><p class="question indent" ng-class="(field.missing) ? &quot;text-danger&quot; : &quot;&quot;" ng-bind-html="resolvePlaceholders(field.question) | markdown"></p><p ng-show=field.notes class="notes text-muted indent" ng-bind-html="resolvePlaceholders(field.notes) | markdown"></p><p ng-switch=field.type class=indent><ask-instruction ng-switch-when=instruction></ask-instruction><ask-freetext ng-switch-when=freetext></ask-freetext><ask-multitext ng-switch-when=multitext></ask-multitext><ask-numeric ng-switch-when=numeric></ask-numeric><ask-singlechoice ng-switch-when=singlechoice></ask-singlechoice><ask-multichoice ng-switch-when=multichoice></ask-multichoice><ask-rating ng-switch-when=rating></ask-rating><ask-mood ng-switch-when=mood></ask-mood></p></div></div>');
}]);

angular.module('ask.bootstrap.survey.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.survey.tmpl.html',
    '<div class=ask-survey><h2>{{survey.title}}</h2><br><div ng-show=response.completed><div ng-show=survey.completionMessage ng-bind-html="survey.completionMessage | markdown"></div><div ng-hide=survey.completionMessage>Thank you!</div></div><div ng-hide=response.completed><ul class=page-header ng-show="state.pages.length > 1"><li ng-repeat="page in state.pages" ng-class="{current: page.current}"><span class="fa-stack fa-lg" ng-hide=page.current><i class="fa fa-circle-thin fa-stack-2x"></i> <i class="fa fa-stack-1x"><strong>{{page.pageIndex+1}}</strong></i></span> <span class="fa-stack fa-lg" ng-show=page.current><i class="fa fa-circle fa-stack-2x"></i> <i class="fa fa-inverse fa-stack-1x"><strong>{{page.pageIndex+1}}</strong></i></span> {{page.title}}</li></ul><div ng-repeat="field in state.fields"><ask-field field=field answer=response.answers[field.id] state=state response=response ng-if=field.visible></ask-field></div><div class=text-center><hr><p class=pull-right ng-show="state.pages.length > 1"><span class=text-muted>page</span> {{response.pageIndex+1}} <span class=text-muted>of</span> {{state.pages.length}}</p><a class="btn btn-default" ng-click=back() ng-hide=onFirstPage()><span class="glyphicon glyphicon-circle-arrow-left" aria-hidden=true></span> &nbsp; Go Back</a> <a class="btn btn-default" ng-click=continue() ng-show=onLastPage()>Finish</a> <a class="btn btn-default" ng-click=continue() ng-hide=onLastPage()>Continue &nbsp; <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden=true></span></a></div></div></div>');
}]);
