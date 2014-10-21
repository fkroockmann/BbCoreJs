define(['require', 'tb.core', 'tb.core.ApplicationContainer'], function () {
    'use strict';

    var api = require('tb.core'),

        apps = require('tb.core.ApplicationContainer'),

        controller = {
            config: {
                imports: []
            },

            appName: 'SpecApp',

            testAction: function (test) {
                if (test === true) {
                    throw 'Test is working';
                }
                return 'It expected';
            },

            initialize: function () {
                return true;
            }
        },

        errorMessage = function (code, message) {
            return 'Error n°' + code + ' ControllerManagerException: ' + message;
        };

    describe('Controller manager spec', function () {

        it('Try to setup invalidid datas', function () {
            try {
                api.ControllerManager.registerController('SpecCtrl', {});
                expect(false).toBe(true);
            } catch (e) {
                expect(e).toBe(errorMessage(15003, 'Controller should be attached to an App'));
            }

            try {
                api.ControllerManager.getAppControllers('SpecCtrl');
                expect(false).toBe(true);
            } catch (e) {
                expect(e).toBe(errorMessage(15006, 'Controller Not Found'));
            }
        });

        it('Controller contructor generation', function () {
            var SpecCtrlClass,

                SpecCtrl;

            try {
                apps.getInstance().register({name: 'SpecApp', instance: {}});
                api.ControllerManager.registerController('SpecCtrl', controller);
            } catch (e) {
                expect(e).toBe(false);
            }

            expect(controller.initialize).toBe(undefined);

            try {
                SpecCtrlClass = api.ControllerManager.getAppControllers('SpecApp')['SpecCtrl'];
                SpecCtrl = new SpecCtrlClass({});
            } catch (e) {
                expect(e).toBe(false);
            }

            expect(SpecCtrl.getName()).toBe('SpecCtrl');
        });

        it('Test controller action invoke', function () {
            var SpecCtrlClass,

                SpecCtrl;

            try {
                SpecCtrlClass = api.ControllerManager.getAllControllers()['SpecApp']['SpecCtrl'];
                SpecCtrl = new SpecCtrlClass({});
            } catch (e) {
                expect(e).toBe(false);
            }
            try {
                SpecCtrl.invoke('notExistant', {});
            } catch (e) {
                expect(e).toBe(errorMessage(15001, 'notExistantAction' + ' Action Doesnt Exists in ' + 'SpecCtrl' + ' Cotroller'));
            }

            try {
                SpecCtrl.invoke('test', [true]);
            } catch (e) {
                expect(e).toBe(errorMessage(15002, 'Error while executing [' + 'testAction' + '] in ' + 'SpecCtrl' + ' controller with message: ' + 'Test is working'));
            }
        });
    });
});