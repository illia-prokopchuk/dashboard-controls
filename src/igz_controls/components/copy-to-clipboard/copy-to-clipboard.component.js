(function () {
    'use strict';

    angular.module('iguazio.dashboard-controls')
        .component('igzCopyToClipboard', {
            bindings: {
                tooltipPlacement: '@?',
                tooltipText: '@?',
                value: '<'
            },
            templateUrl: 'igz_controls/components/copy-to-clipboard/copy-to-clipboard.tpl.html',
            controller: IgzCopyToClipboard
        });

    function IgzCopyToClipboard($i18next, i18next, lodash, DialogsService) {
        var ctrl = this;
        var lng = i18next.language;

        ctrl.$onInit = onInit;

        ctrl.copyToClipboard = copyToClipboard;

        //
        // Hook methods
        //

        /**
         * Initialization method
         */
        function onInit() {
            lodash.defaults(ctrl, {
                tooltipPlacement: 'top'
            });
        }

        //
        // Public method
        //

        /**
         * Copies a string to the clipboard.
         */
        function copyToClipboard() {
            if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
                const temp = document.createElement('div');
                temp.setAttribute('contentEditable', true);
                temp.innerHTML = ctrl.value;
                temp.setAttribute('onfocus', 'document.execCommand(`selectAll`)');
                document.body.appendChild(temp);
                temp.focus();

                try {
                    document.execCommand('copy'); // Security exception may be thrown by some browsers.
                } catch (ex) {
                    DialogsService.alert($i18next.t('common:COPY_TO_CLIPBOARD_FAILED', {lng: lng}), ex);
                } finally {
                    document.body.removeChild(temp);
                }
            }
        }
    }
}());
