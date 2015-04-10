angular.module('ask.bootstrap', ['ask.bootstrap.controllers','ask.bootstrap.directives','ask.bootstrap.filters','ask.bootstrap.templates']);
angular.module('ask.bootstrap.controllers', ['angular-mood', 'ui.bootstrap'])



.controller('MoodDialogCtrl', function($scope, $modalInstance, MoodData, mood) {

	$scope.mood = _.clone(mood) ;
	
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
angular.module('ask.bootstrap.filters', [])


.filter('markdown', function() {

    var converter = new Showdown.converter();

    return function(markdown) {

        if (!markdown)
            return ;

        return converter.makeHtml(markdown) ;
    }
}) ;
angular.module('ask.bootstrap.templates', ['ask.bootstrap.dlg.mood.tmpl.html', 'ask.bootstrap.field.freetext.tmpl.html', 'ask.bootstrap.field.mood.tmpl.html', 'ask.bootstrap.field.multichoice.tmpl.html', 'ask.bootstrap.field.numeric.tmpl.html', 'ask.bootstrap.field.scale.tmpl.html', 'ask.bootstrap.field.singlechoice.tmpl.html', 'ask.bootstrap.field.tmpl.html', 'ask.bootstrap.survey.tmpl.html']);

angular.module('ask.bootstrap.dlg.mood.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.dlg.mood.tmpl.html',
    '<div class=modal-body><div><mood-canvas selected hovered=hoveredMood></mood-canvas></div><div><mood-matrix selected hovered-in-canvas=hoveredMood></mood-matrix></div></div><div class=modal-footer><button class="btn btn-primary" ng-click=ok()>Ok</button> <button class="btn btn-default" ng-click=cancel()>Cancel</button></div>');
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

angular.module('ask.bootstrap.field.numeric.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.numeric.tmpl.html',
    '<div><input type=number ng-model=answer.number class="form-control"></div>');
}]);

angular.module('ask.bootstrap.field.scale.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.scale.tmpl.html',
    '<div><div ng-if="field.scaleType==&quot;radio&quot;"><div ng-if="field.descriptions.length == field.length" style=display:table><div ng-repeat="choice in choices" style="width:33% ; display:table-cell ; text-align:center"><input type=radio ng-model=$parent.answer.index ng-value=choice.index class="radio"><br><span class=text-muted style="padding: 0px 10px">{{choice.description}}</span></div></div><div ng-if="field.descriptions.length != field.length && field.descriptions.length == 2"><span class="radio-inline text-muted" style="cursor: default ; margin-left: 0px ; padding-left: 0px ; padding-right: 20px">{{field.descriptions[0]}} &nbsp;</span><label class=radio-inline style="padding: 0px 5px" ng-repeat="choice in choices"><input type=radio ng-model=$parent.answer.index ng-value="choice.index"> &nbsp;</label><span class="radio-inline text-muted" style="cursor: default ; margin-left: 0px ; padding-left: 0px">{{field.descriptions[1]}}</span></div></div><div ng-if="field.scaleType==&quot;star&quot;"><span ng-repeat="choice in choices" ng-click=setChoice(choice) ng-mouseover=hoverChoice(choice) ng-mouseout=hoverChoice() style=cursor:pointer><span ng-show=hoveredChoice><i ng-show="hoveredChoice.index >= choice.index" class="fa fa-star"></i> <i ng-hide="hoveredChoice.index >= choice.index" class="fa fa-star-o"></i></span> <span ng-hide=hoveredChoice><i ng-show="$parent.answer.index >= choice.index" class="fa fa-star"></i> <i ng-hide="$parent.answer.index >= choice.index" class="fa fa-star-o"></i></span></span> <span ng-show=hoveredChoice>&nbsp; {{hoveredChoice.description}}</span> <span ng-show="!hoveredChoice && selectedChoice">&nbsp; {{selectedChoice.description}}</span></div></div>');
}]);

angular.module('ask.bootstrap.field.singlechoice.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.singlechoice.tmpl.html',
    '<div><div ng-repeat="choice in field.choices" class=radio><label><input type=radio ng-model=$parent.answer.choice ng-value="choice.name"> {{choice.name}} <span ng-show=choice.description class=small>{{choice.description}}</span></label></div></div>');
}]);

angular.module('ask.bootstrap.field.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.tmpl.html',
    '<div class="field form-group"><div ng-if=!field.isQuestion><div ng-if="field.type == &quot;sectionBreak&quot;"><hr><h3>{{field.title}}</h3></div><p ng-show=field.text class=text ng-bind-html="resolvePlaceholders(field.text) | markdown"></p><p ng-show=field.notes class="notes text-muted" ng-bind-html="resolvePlaceholders(field.notes) | markdown"></p></div><div ng-if=field.isQuestion><div class=pull-left><i class="fa fa-exclamation-circle fa-lg text-danger" ng-show=field.missing></i> <i class="fa fa-circle" ng-show="!field.missing && !field.optional"></i> <i class="fa fa-circle-o" ng-show="!field.missing && field.optional"></i> &nbsp;</div><p class="question indent" ng-class="(field.missing) ? &quot;text-danger&quot; : &quot;&quot;" ng-bind-html="resolvePlaceholders(field.question) | markdown"></p><p ng-show=field.notes class="notes text-muted indent" ng-bind-html="resolvePlaceholders(field.notes) | markdown"></p><p ng-switch=field.type class=indent><ask-instruction ng-switch-when=instruction></ask-instruction><ask-freetext ng-switch-when=freetext></ask-freetext><ask-numeric ng-switch-when=numeric></ask-numeric><ask-singlechoice ng-switch-when=singlechoice></ask-singlechoice><ask-multichoice ng-switch-when=multichoice></ask-multichoice><ask-scale ng-switch-when=scale></ask-scale><ask-mood ng-switch-when=mood></ask-mood></p></div></div>');
}]);

angular.module('ask.bootstrap.survey.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.survey.tmpl.html',
    '<div class=ask-survey><h2>{{survey.title}}</h2><br><div ng-show=response.completed><div ng-show=survey.completionMessage ng-bind-html="survey.completionMessage | markdown"></div><div ng-hide=survey.completionMessage>Thank you!</div></div><div ng-hide=response.completed><ul class=page-header ng-show="state.pages.length > 1"><li ng-repeat="page in state.pages" ng-class="{current: page.current}"><span class="fa-stack fa-lg" ng-hide=page.current><i class="fa fa-circle-thin fa-stack-2x"></i> <i class="fa fa-stack-1x"><strong>{{page.pageIndex+1}}</strong></i></span> <span class="fa-stack fa-lg" ng-show=page.current><i class="fa fa-circle fa-stack-2x"></i> <i class="fa fa-inverse fa-stack-1x"><strong>{{page.pageIndex+1}}</strong></i></span> {{page.title}}</li></ul><div ng-repeat="field in state.fields"><ask-field field=field answer=response.answers[field.id] state=state response=response ng-if=field.visible></ask-field></div><div class=text-center><hr><p class=pull-right ng-show="state.pages.length > 1"><span class=text-muted>page</span> {{response.pageIndex+1}} <span class=text-muted>of</span> {{state.pages.length}}</p><a class="btn btn-default" ng-click=back() ng-hide=onFirstPage()><span class="glyphicon glyphicon-circle-arrow-left" aria-hidden=true></span> &nbsp; Go Back</a> <a class="btn btn-default" ng-click=continue() ng-show=onLastPage()>Finish</a> <a class="btn btn-default" ng-click=continue() ng-hide=onLastPage()>Continue &nbsp; <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden=true></span></a></div></div></div>');
}]);
