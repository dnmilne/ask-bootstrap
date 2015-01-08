angular.module('angular-ask', ['ngAnimate', 'angular-mood', 'ui.bootstrap', 'ask-logic'])

.filter('markdown', function() {

    var converter = new Showdown.converter();

    return function(markdown) {

        if (!markdown)
            return ;

        return converter.makeHtml(markdown) ;
    }
})

.directive('askSurvey', ["SurveyStates", function (SurveyStates) {

	return {
		restrict: 'E',
		scope: {
			survey:'=',
    		response: '='
		},
		template: 

			"<div class='ask-survey'> \n" +

			"	<h2>{{survey.title}}</h2> \n" +

			"	<br/> \n" +

			"	<div ng-show='response.completed'> \n" +
			"		<div ng-show='survey.completionMessage' ng-bind-html='survey.completionMessage | markdown'> \n" +
			"		</div> \n" +

			"		<div ng-hide='survey.completionMessage'> \n" +
			"			Thank you! \n" +
			"		</div> \n" +
			"	</div> \n" +

			"	<div ng-hide='response.completed'> \n" +

			"		<ul class='page-header' ng-show='state.pages.length > 1'> \n" +
			"			<li ng-repeat='page in state.pages' ng-class='{current: page.current}'> \n" +
			"				<span class='fa-stack fa-lg' ng-hide='page.current'> \n" +
			"				  <i class='fa fa-circle-thin fa-stack-2x'></i> \n" +
			"				  <i class='fa fa-stack-1x'><strong>{{page.pageIndex+1}}</strong></i> \n" +
			"				</span> \n" +
			"				<span class='fa-stack fa-lg' ng-show='page.current'> \n" +
			"				  <i class='fa fa-circle fa-stack-2x'></i> \n" +
			"				  <i class='fa fa-inverse fa-stack-1x'><strong>{{page.pageIndex+1}}</strong></i> \n" +
			"				</span> \n" +

			"				{{page.title}} \n" +
			"			</li> \n" +
			"		</ul> \n" +

			"		<ask-field ng-repeat='field in state.fields' field='field' answer='response.answers[field.id]' state='state' ng-if='field.visible'></ask-field> \n" +

			"		<div class='text-center'> \n" +

			"			<hr/> \n" +

			"			<p class='pull-right' ng-show='state.pages.length > 1'> \n" +
			"				<span class='text-muted'>page</span> \n" +
			"				{{response.pageIndex+1}} \n" +
			"				<span class='text-muted'>of</span> \n" +
			"				{{state.pages.length}} \n" +
			"			</p> \n" +

			"			<a class='btn btn-default' ng-click='back()' ng-hide='onFirstPage()'> \n" +
			"				<span class='glyphicon glyphicon-circle-arrow-left' aria-hidden='true'></span> \n" +
			"				&nbsp; \n" +
			"				Go Back \n" +
			"			</a> \n" +

			"			<a class='btn btn-default' ng-click='continue()' ng-show='onLastPage()'>Finish</a> \n" +
						
			"			<a class='btn btn-default' ng-click='continue()' ng-hide='onLastPage()'> \n" +
			"				Continue \n" +
			"				&nbsp; \n" +
			"				<span class='glyphicon glyphicon-circle-arrow-right' aria-hidden='true'></span> \n" +
			"			</a> \n" +
			"		</div> \n" +
			"	</div> \n" +
			"</div> \n"
		,
		link : function (scope, element, attrs) {

			scope.$watch("survey", function() {

				if (!scope.survey)
					return ;

				scope.state = SurveyStates.init(scope.survey, scope.response) ;

			}, true) ;


			scope.continue = function() {
				scope.state.handleContinue() ;
			}

			scope.back = function() {
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







.directive('askField', function() {

	return {
		restrict: 'E',
		scope: {
			field:'=',
			answer: '=',
			state: '='
		},
		template: 
			"<div class='field form-group'> \n" + 

			"  <div ng-if='!field.isQuestion'> \n" + 

			"    <div ng-if='field.type == 'sectionBreak''> \n" + 
			"      <hr/> \n" + 
			"      <h3>{{field.title}}</h3> \n" + 
			"    </div> \n" + 

			"    <p ng-show='field.text' class='text' ng-bind-html='field.text | markdown'></p> \n" + 

			"    <p ng-show='field.notes' class='notes text-muted' ng-bind-html='field.notes | markdown'></p> \n" + 

			"  </div> \n" + 

			"  <div ng-if='field.isQuestion'> \n" + 

			"      <div class='pull-left'> \n" + 
			"        <i class='fa fa-exclamation-circle fa-lg text-danger' ng-show='field.missing'></i> \n" + 
			"        <i class='fa fa-circle' ng-show='!field.missing && !field.optional'></i> \n" + 
			"        <i class='fa fa-circle-o' ng-show='!field.missing && field.optional'></i> \n" + 
			"        &nbsp; \n" + 
			"      </div> \n" + 

			"     <p class='question indent' ng-class='(field.missing) ? 'text-danger' : ''' ng-bind-html='field.question | markdown'></p> \n" + 

			"  	  <p ng-show='field.notes' class='notes text-muted indent' ng-bind-html='field.notes | markdown'></p> \n" + 

			"     <p ng-switch='field.type' class='indent'> \n" + 
			"          <ask-instruction ng-switch-when='instruction'></ask-instruction> \n" + 
			"          <ask-freetext ng-switch-when='freetext'></ask-freetext> \n" + 
			"          <ask-numeric ng-switch-when='numeric'></ask-numeric> \n" + 
			"          <ask-singlechoice ng-switch-when='singlechoice'></ask-singlechoice> \n" + 
			"          <ask-multichoice ng-switch-when='multichoice'></ask-multichoice> \n" + 
			"          <ask-mood ng-switch-when='mood'></ask-mood> \n" + 
			"       </p> \n" + 
			"  	</div> \n" + 
			"</div>"
		,
		link : function (scope, element, attrs) {
			scope.$watch('answer', function() {
				scope.state.handleAnswerChanged(scope.field.id) ;
			}, true) ;
		}
	}

})


.directive('askFreetext', function() {

	return {
		restrict: 'E',
		template: 
			"<div ng-switch='field.length'> \n" + 
			"	<textarea ng-switch-when='LONG' ng-model='answer.text' class='form-control' rows='3'></textarea> \n" + 
			"	<input ng-switch-when='SHORT' ng-model='answer.text' type='text' class='form-control'> \n" +
			"</div>"
		,
		link : function (scope, element, attrs) {

		}
	}
})


.directive('askSinglechoice', function($filter) {

	return {
		restrict: 'E',
		template: 
			"<div> \n" + 
			"	<div ng-repeat='choice in field.choices' class='radio'> \n" + 
			"		<label> \n" + 
			"			<input type='radio' ng-model='$parent.answer.choice' ng-value='choice.name'/> \n" + 
			"			{{choice.name}}  \n" + 
			"			<span ng-show='choice.description' class='small'> \n" + 
			"				{{choice.description}} \n" + 
			"			</span> \n" + 
			"		</label> \n" + 
			"	</div> \n" + 
			"</div>"
		,
		link : function (scope, element, attrs) {

		}
	}
})


.directive('askMultichoice', function() {

	return {
		restrict: 'E',
		template: 
			"<div> \n" + 
			"	<div ng-repeat='choice in field.choices' class='checkbox'> \n" + 
			"		<label> \n" + 
			"			<input type='checkbox' ng-checked='isChecked(choice)' ng-click='toggle(choice)'> \n" + 
			"			{{choice.name}}  \n" + 
			"			<span ng-show='choice.description' class='text-muted small'> \n" + 
			"				({{choice.description}}) \n" + 
			"			</span> \n" + 
			"		</label> \n" + 
			"	</div> \n" + 
			"</div>"
		,
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
		template: 
			"<div> \n" + 
			"	<input type='number' ng-model='answer.number' class='form-control' > \n" + 
			"</div>"
		,
		link : function (scope, element, attrs) {

		}
	}
})



.directive('askMood', ['MoodData', '$modal', function(MoodData, $modal) {

	return {
		restrict: 'E',
		template: 
			"<div class='form-control clickable' ng-click='setMood()'> \n" + 
		    "  	<strong ng-show='answer.mood' ng-style='moodStyle(answer.mood)'> \n" + 
		    "  		{{answer.mood.name}} \n" + 
		    "  	</strong> \n" + 
	      	"</div>" 
      	,
		link : function (scope, element, attrs) {

			scope.setMood = function() {

				var modalInstance = $modal.open({
					template: 
						"<div class='modal-body'> \n" + 
						"	<div> \n" + 
						"		<mood-canvas selected='mood' hovered='hoveredMood'/> \n" + 
						"	</div> \n" + 
						"	<div> \n" + 
						"		<mood-matrix selected='mood' hovered-in-canvas='hoveredMood'/> \n" + 
						"	</div> \n" + 
						"</div> \n" + 
						"<div class='modal-footer'> \n" + 
						"    <button class='btn btn-primary' ng-click='ok()'>Ok</button> \n" + 
						"    <button class='btn btn-default' ng-click='cancel()'>Cancel</button> \n" + 
						"</div>",
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
}])



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

})


