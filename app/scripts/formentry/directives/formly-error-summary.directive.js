/*
jshint -W098, -W003, -W068, -W004, -W033, -W030, -W117, -W069
*/
/*jscs:disable safeContextKeyword, requireDotNotation, requirePaddingNewLinesBeforeLineComments, requireTrailingComma*/
(function () {
    'use strict';

    angular
        .module('openmrs.angularFormentry')
        .directive('formlyErrorSummary', formlyErrorSummary);

    function formlyErrorSummary() {
        var directive = {
            template:
            '<style type="text/css">' +
            '    body {' +
            '        margin: 20px' +
            '    }' +
            '    .formly-field {' +
            '        margin-bottom: 16px;' +
            '    }' +
            '    .formly-error-summary {' +
            '        margin-bottom: 20px;' +
            '    }' +
            '    .color-error {' +
            '        color: red;' +
            '    }' +
            '    .color-success {' +
            '        color: green' +
            '    }' +
            '</style>' +
            '<!-- The field here are the fields passed within the directives scope -->' +
            '<div class="formly-error-summary">' +
            '    <!--' +
            '    Allow all validations to be run on form submit only and when its rendered' +
            '    Other custom validations will still run  when the field is touched anyway' +
            '     -->' +
            '    <div style="margin-left:4px; margin-bottom: 4px;" data-ng-repeat="field in vm.pageFields" class="color-error">' +
            '        <div ng-click="vm.navigateToQuestion(vm.tabTitle, field.key, field)" data-ng-show="field.formControl.$invalid">' +
            '            <span class="text-primary"><i class="glyphicon glyphicon-zoom-in"></i> {{field.templateOptions.label}} </span>' +
            '            <br/>' +
            '            <i style="margin-left:10px;" class="glyphicon glyphicon-{{field.formControl.$invalid ? "remove" : "ok"}}"></i>'+
            '            <span data-ng-if="field.formControl.$invalid">' +
            '              {{vm.getErrorAsList(field)}} ' +
            '          </span>' +
            '        </div>' +
            '    </div>' +
            '</div>',
            scope: {},
            bindToController: {
                form: '=',
                fields: '=',
                pageFields: '=',
                tabTitle: '='
            },
            controllerAs: 'vm',
            controller: Controller

        };
        return directive;
    }
    Controller.$inject = ['$scope', '$rootScope'];
    function Controller($scope, $rootScope) {
        var vm = this;
        // console.log('directive Scope', vm);
        vm.pageFields = [];
        // console.log('fields in error directive ', vm.fields)
        updateFields();
        // console.log('Total fields loaded: ', vm.page_fields.length)
        vm.getErrorAsList = getErrorAsList;

        vm.navigateToQuestion = navigateToQuestion;

        function updateFields() {
            //create field list acceptable to the error summary directive
            if (vm.pageFields.length === 0) {
                // console.log('+++++Loading Error summary Controller');
                _.each(vm.fields, function (_section) {
                    if (_section.type === 'section') {
                        _.each(_section.data.fields, function (_field) {
                            if (_field.type !== 'section' && _field.type !== 'group' &&
                                _field.type !== 'repeatSection' && _field.type !== undefined) {
                                vm.pageFields.push(_field);
                                // console.log('added field',_field);
                                // console.log('added field label ', _field.templateOptions.label)
                            } else if (_field.type === 'repeatSection') {
                                _.each(_field.templateOptions.fields[0].fieldGroup,
                                    function (_field_) {
                                        vm.pageFields.push(_field_);
                                        // console.log('added field',_field_);
                                        // console.log('added field label ', _field_.templateOptions.label)
                                    });
                            } else {
                                _.each(_field.fieldGroup, function (__field_) {
                                    vm.pageFields.push(__field_);
                                    // console.log('added field',__field_);
                                    // console.log('added field label ', __field_.templateOptions.label)
                                });
                            }
                        });
                    }
                });
            }
            $scope.pageFields = vm.pageFields;
        }

        function getErrorAsList(field) {
            /*
            this method will always be called when any field is touched
            It idealy triggers all the validations on the form
            It may be have have some Negative performance of the form especially on the tablet
            */
            if (field.formControl !== undefined) {
                return Object.keys(field.formControl.$error).map(function (error) {
                    // note, this only works because the all the field types have been explicityly defined.
                    //console.log('Erroorr', field);
                    //console.log('selected field label ', field.templateOptions.label);
                    var msg;
                    if (error === 'max') {
                        msg = 'The maximum value allowed is ' + field.templateOptions.max;
                    } else if (error === 'min') {
                        msg = 'The minimum value allowed is ' + field.templateOptions.min;
                    } else {
                        msg = typeof field.validation.messages[error] === 'function'? 
                        field.validation.messages[error](): 'Unknown error';
                    }

                    return msg;
                }).join(', ');
            }
        }

        function navigateToQuestion(tabTitle, questionKey, field) {
            if (field && field.formControl &&
                field.formControl.$setTouched &&
                typeof field.formControl.$setTouched === 'function') {
                field.formControl.$setTouched();
            }

            $rootScope.$broadcast("navigateToQuestion", { tabTitle: tabTitle, questionKey: questionKey });
        }
    }
})();
