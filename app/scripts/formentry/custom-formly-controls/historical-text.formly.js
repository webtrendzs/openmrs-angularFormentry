/*
jshint -W106, -W098, -W109, -W003, -W068, -W004, -W033, -W030, -W117, -W116, -W069, -W026
*/
/*
jscs:disable disallowMixedSpacesAndTabs, requireDotNotation, requirePaddingNewLinesBeforeLineComments, requireTrailingComma
*/
(function () {

    'use strict';

    var mod =
        angular
            .module('openmrs.angularFormentry');

    mod.run(function (formlyConfig) {
        // Configure custom types
        formlyConfig.setType({
            name: 'historical-text',
            wrapper: [],
            template: '<div style="margin-top:-14px;" ng-if="historicalValue">' +
            '<div class="panel panel-default" ng-if="!to.prepopulate">' +
            '<div class="container-fluid">' +
            '<div style="padding: 1px;" class="row">' +
            '<div style="padding-left: 4px; padding-top: 4px;" class="col-xs-9" >' +
            '<span style="font-wieght:bold;" class="text-warning">Previous Value: </span>' +
            '<span style="font-weight: bold;" >{{historicalDisplay}}<span/></div>' +
            '<button type="button" class="btn btn-default btn-small col-xs-3" ng-click="setValue()">Use Value</button>' +
            '</div>' +
            '</div>' + 
            '</div></div>',
            link: function (scope, el, attrs, vm) {
                //incase we need link function
            },

            controller: function ($scope, $log, HistoricalDataService) {
                //functions
                $scope.setValue = setValue;
                $scope.getDisplayValue = getDisplayValue;

                //variables 
                $scope.historicalDisplay = '';
                $scope.historicalValue = null;

                //bring historical data alias into scope
                var HD = HistoricalDataService;

                //used in one of the schema historical expressions
                var sampleRepeatingGroupValue =
                    [{
                        'a8a07a48x1350x11dfxa1f1-0026b9348838': 'reason for hospital',
                        'made-up-concept-4': [{
                            'made-up-concept-5': '2016-01-20',
                            'made-up-concept-6': '2016-01-21'
                        }]
                    },
                        {
                            'a8a07a48x1350x11dfxa1f1-0026b9348838': 'reason for hospital 2',
                            'made-up-concept-4': [{
                                'made-up-concept-5': '2016-01-22',
                                'made-up-concept-6': '2016-01-23'
                            }]
                        }];

                init();

                function init() {
                    $scope.getDisplayValue();
                }

                function setValue() {
                    var field = $scope.to.parentField;
                    field.templateOptions.setFieldValue(field, $scope.historicalValue);
                }

                function getDisplayValue() {
                    var field = $scope.to.parentField;

                    var historicalExpression = field.templateOptions.historicalExpression;

                    //evaluate expression and set historicalValue with the result
                    if (historicalExpression) {
                        try {
                            $scope.historicalValue = eval(historicalExpression);
                        } catch (error) {
                            $log.debug('Could not evaluate historical expression "' + historicalExpression + '". Error: ', error);
                        }
                    }

                    //get display version of the value by calling the getdisplay function
                    //of the field
                    if ($scope.to.prepopulate !== true)
                        if (field.templateOptions.getDisplayValue && $scope.historicalValue !== undefined) {
                            field.templateOptions.getDisplayValue($scope.historicalValue,
                                function (displayValue) {
                                    $scope.historicalDisplay = displayValue;
                                });
                        }

                    if ($scope.to.prepopulate)
                        setValue();

                }

                function arrayContains(array, members) {
                    if (Array.isArray(members)) {
                        if (members.length === 0) {
                            return true;
                        }
                        var contains = true;
                        _.each(members, function (val) {
                            if (array.indexOf(val) === -1) {
                                contains = false;
                            }
                        });
                        return contains;
                    }
                    else {
                        return array.indexOf(members) !== -1;
                    }
                }

                function arrayContainsAny(array, members) {
                    if (Array.isArray(members)) {
                        if (members.length === 0) {
                            return true;
                        }
                        var contains = false;
                        _.each(members, function (val) {
                            if (array.indexOf(val) !== -1) {
                                contains = true;
                            }
                        });
                        return contains;
                    }
                    else {
                        return array.indexOf(members) !== -1;
                    }
                }
            }


        });

    });

})();