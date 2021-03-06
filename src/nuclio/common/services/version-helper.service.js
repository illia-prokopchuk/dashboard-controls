/*eslint complexity: ["error", 12]*/
(function () {
    'use strict';

    angular.module('iguazio.dashboard-controls')
        .factory('VersionHelperService', VersionHelperService);

    function VersionHelperService(lodash) {
        return {
            getServiceType: getServiceType,
            isIngressInvalid: isIngressInvalid,
            isVersionDeployed: isVersionDeployed,
            updateIsVersionChanged: updateIsVersionChanged
        };

        //
        // Public methods
        //

        /**
         * Retrieves the service type of the HTTP trigger of the function version.
         * @param {Object} version - The function version.
         * @returns {string} the service type of the HTTP trigger of the function version (e.g. `'ClusterIP'`,
         *     `'NodePort'`).
         */
        function getServiceType(version) {
            return lodash.chain(version)
                .get('spec.triggers', [])
                .find(['kind', 'http'])
                .get('attributes.serviceType')
                .value();
        }

        /**
         * Check "ClusterIP" and "ingress" attributes
         * @param {Object} httpTrigger
         * @returns {boolean}
         */
        function isIngressInvalid(httpTrigger) {
            var ingress = lodash.get(httpTrigger, 'attributes.ingresses[0]');
            var serviceType = lodash.get(httpTrigger, 'attributes.serviceType');

            return serviceType === 'ClusterIP' && lodash.isEmpty(ingress);
        }

        /**
         * Tests whether the version is deployed.
         * @param {Object} version
         * @returns {boolean} `true` in case version is deployed, or `false` otherwise.
         */
        function isVersionDeployed(version) {
            var state = lodash.get(version, 'status.state', '');
            return !lodash.isEmpty(state);
        }

        /**
         * Updates "version changed" indicator of `version`. Sets it to `true` in case working version differs from
         * deployed one, or `false` otherwise.
         * @param {Object} version - the working function's version.
         * @param {Object} version.ui.deployedVersion - latest deployed function's version.
         */
        function updateIsVersionChanged(version) {
            var working = cloneObject(lodash.omit(version, 'ui'));
            var deployed = cloneObject(lodash.omit(version.ui.deployedVersion, 'ui'));
            version.ui.versionChanged = !lodash.isEqual(working, deployed);
        }

        //
        // Private methods
        //

        /**
         * Creates objects copy
         * Recursively copies all properties which are not empty objects or empty strings
         * as they are not needed for comparison
         * @param {Object} obj - an object which must be copied
         * @returns {Object} newObj - copy of obj without empty objects and strings
         */
        function cloneObject(obj) {

            // omits all empty values
            var newObj = lodash.omitBy(obj, function (value) {
                return lodash.isObject(value) || lodash.isString(value) ? lodash.isEmpty(value) : false;
            });

            lodash.forOwn(newObj, function (value, key) {

                // recursively copies nested objects
                if (lodash.isObject(value)) {
                    newObj[key] = cloneObject(value);
                }
            });

            return newObj;
        }
    }
}());
