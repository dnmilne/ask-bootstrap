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