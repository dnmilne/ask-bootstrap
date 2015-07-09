angular.module('ask.bootstrap.templates', ['ask.bootstrap.dlg.mood.tmpl.html', 'ask.bootstrap.field.datetime.tmpl.html', 'ask.bootstrap.field.freetext.tmpl.html', 'ask.bootstrap.field.mood.tmpl.html', 'ask.bootstrap.field.multichoice.tmpl.html', 'ask.bootstrap.field.multitext.tmpl.html', 'ask.bootstrap.field.numeric.tmpl.html', 'ask.bootstrap.field.rating.tmpl.html', 'ask.bootstrap.field.singlechoice.tmpl.html', 'ask.bootstrap.field.tmpl.html', 'ask.bootstrap.survey.tmpl.html']);

angular.module('ask.bootstrap.dlg.mood.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.dlg.mood.tmpl.html',
    '<div class=modal-body><div><mood-canvas chosen=mood hovered=hoveredInCanvas></mood-canvas></div><div><mood-matrix chosen=mood hovered-in-canvas=hoveredInCanvas hovered-in-matrix=hoveredInMatrix></mood-matrix></div></div><div class=modal-footer><button class="btn btn-primary" ng-click=ok()>Ok</button> <button class="btn btn-default" ng-click=cancel()>Cancel</button></div>');
}]);

angular.module('ask.bootstrap.field.datetime.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.datetime.tmpl.html',
    '<div class="ask-datetime form-inline"><div ng-if=cfg.showDate class=form-group style="margin-right: 5px"><date-input date=values.date config=cfg.date></date-input></div><div ng-if=cfg.showTime class=form-group><time-input time=values.time config=cfg.time></time-input></div><br><code>d{{values.date}}</code> <code>t:{{values.time}}</code> <code>{{answer}}</code></div>');
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
    '<div><div ng-repeat="choice in field.choices" class=checkbox><label><input type=checkbox ng-checked=isChecked(choice) ng-click="toggle(choice)"> {{choice.name}} <span ng-show=choice.description class="text-muted small">({{choice.description}})</span></label></div><div ng-repeat="autochoice in field.autochoices" class=checkbox><label><input type=checkbox ng-checked=isChecked(autochoice) ng-click="toggle(autochoice)"> {{autochoice.name}} <span ng-show=autochoice.description class="text-muted small">({{autochoice.description}})</span></label></div></div>');
}]);

angular.module('ask.bootstrap.field.multitext.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.multitext.tmpl.html',
    '<div><div ng-repeat="entry in tempEntries" style="padding-bottom: 5px"><div style="display: table-cell ; width: 100%" ng-switch=field.length><textarea ng-switch-when=LONG ng-model=entry.text class=form-control rows=3>\n' +
    '			</textarea><input ng-switch-when=SHORT ng-model=entry.text class="form-control"></div><div style="display: table-cell ; vertical-align:middle ; padding-left: 10px"><a ng-click=remove($index)><i class="fa fa-times-circle"></i></a></div></div><p ng-show=canAdd()><a ng-click=add()><i class="fa fa-plus-circle"></i> More</a></p></div>');
}]);

angular.module('ask.bootstrap.field.numeric.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.numeric.tmpl.html',
    '<div><input type=number ng-model=answer.number class="form-control"></div>');
}]);

angular.module('ask.bootstrap.field.rating.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.rating.tmpl.html',
    '<div><div ng-if="field.ratingType==&quot;radio&quot;"><div ng-if="field.descriptions.length == field.length" style=display:table><div ng-repeat="choice in choices" style="width:{{cellWidth}} ; display:table-cell ; text-align:center"><input type=radio ng-model=$parent.answer.rating ng-value="choice.rating"><br><span class=text-muted style="padding: 0px 10px">{{choice.description}}</span></div></div><div ng-if="field.descriptions.length != field.length && field.descriptions.length == 2"><span class="radio-inline text-muted" style="cursor: default ; margin-left: 0px ; padding-left: 0px ; padding-right: 20px">{{field.descriptions[0]}} &nbsp;</span><label class=radio-inline style="padding: 0px 5px" ng-repeat="choice in choices"><input type=radio ng-model=$parent.answer.rating ng-value="choice.rating"> &nbsp;</label><span class="radio-inline text-muted" style="cursor: default ; margin-left: 0px ; padding-left: 0px">{{field.descriptions[1]}}</span></div></div><div ng-if="field.ratingType==&quot;star&quot;"><span ng-repeat="choice in choices" ng-click=setChoice(choice) ng-mouseover=hoverChoice(choice) ng-mouseout=hoverChoice() style="cursor:pointer ; font-size:large ; padding-right: 5px"><i class=fa ng-class="(choice.isFilled) ? &quot;fa-star&quot; : &quot;fa-star-o&quot;"></i></span> <span>&nbsp; <span ng-show=hoveredChoice>{{hoveredChoice.description}}</span> <span ng-show="!hoveredChoice && selectedChoice">{{selectedChoice.description}}</span></span></div></div>');
}]);

angular.module('ask.bootstrap.field.singlechoice.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.singlechoice.tmpl.html',
    '<div><div ng-repeat="choice in field.choices" class=radio><label><input type=radio ng-model=$parent.answer.choice ng-value="choice.name"> {{choice.name}} <span ng-show=choice.description class=small>{{choice.description}}</span></label></div><div ng-repeat="autochoice in field.autochoices" class=radio><label><input type=radio ng-model=$parent.answer.choice ng-value="autochoice.name"> {{autochoice.name}} <span ng-show=autochoice.description class=small>{{autochoice.description}}</span></label></div></div>');
}]);

angular.module('ask.bootstrap.field.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.field.tmpl.html',
    '<div class="field form-group"><div ng-if=!field.isQuestion class={{getToneClasses()}}><div ng-if="field.type == &quot;sectionBreak&quot;"><hr><h3>{{field.title}}</h3></div><p ng-show=field.text class=text ng-bind-html="resolvePlaceholders(field.text) | markdown"></p><p ng-show=field.notes class="notes text-muted" ng-bind-html="resolvePlaceholders(field.notes) | markdown"></p></div><div ng-if=field.isQuestion><div class=pull-left><i class="fa fa-exclamation-circle fa-lg text-danger" ng-show=field.missing></i> <i class="fa fa-circle" ng-show="!field.missing && !field.optional"></i> <i class="fa fa-circle-o" ng-show="!field.missing && field.optional"></i> &nbsp;</div><p class="question indent" ng-class="(field.missing) ? &quot;text-danger&quot; : &quot;&quot;" ng-bind-html="resolvePlaceholders(field.question) | markdown"></p><p ng-show=field.notes class="notes text-muted indent" ng-bind-html="resolvePlaceholders(field.notes) | markdown"></p><p ng-switch=field.type class=indent><ask-instruction ng-switch-when=instruction></ask-instruction><ask-freetext ng-switch-when=freetext></ask-freetext><ask-multitext ng-switch-when=multitext></ask-multitext><ask-numeric ng-switch-when=numeric></ask-numeric><ask-datetime ng-switch-when=datetime></ask-datetime><ask-singlechoice ng-switch-when=singlechoice></ask-singlechoice><ask-multichoice ng-switch-when=multichoice></ask-multichoice><ask-rating ng-switch-when=rating></ask-rating><ask-mood ng-switch-when=mood></ask-mood></p></div></div>');
}]);

angular.module('ask.bootstrap.survey.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('ask.bootstrap.survey.tmpl.html',
    '<div class=ask-survey><div ng-if=survey.title><h3>{{survey.title}}</h3><br></div><div ng-show=response.completed><div ng-show=survey.completionMessage ng-bind-html="survey.completionMessage | markdown"></div><div ng-hide=survey.completionMessage>Thank you!</div></div><div ng-hide=response.completed><div ng-repeat="page in state.pages" ng-if="page.index == response.pageIndex"><div ng-repeat="field in page.relevantFields"><ask-field field=field answer=response.answers[field.id] state=state response=response ng-if=field.visible></ask-field></div></div><div class=text-center><hr><a class="btn btn-default" ng-click=back() ng-hide=onFirstPage()><span class="glyphicon glyphicon-circle-arrow-left" aria-hidden=true></span> &nbsp; Go Back</a> <a class="btn btn-default" ng-click=continue() ng-show=onLastPage()>Finish</a> <a class="btn btn-default" ng-click=continue() ng-hide=onLastPage()>Continue &nbsp; <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden=true></span></a><br><br></div></div></div>');
}]);
