/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of BackBee.
 *
 * BackBee is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BackBee is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with BackBee. If not, see <http://www.gnu.org/licenses/>.
 */

define(
    [
        'Core',
        'jquery',
        'content.manager',
        'component!popin',
        'component!contentformbuilder',
        'component!formbuilder',
        'component!formsubmitter',
        'component!translator'
    ],
    function (Core, jQuery, ContentManager, PopinManager, ContentFormBuilder, FormBuilder, FormSubmitter, translator) {

        'use strict';

        var Edition = {

            contentSetClass: '.contentset',
            config: {
                onSave: null,
                onValidate: null
            },

            show: function (content, config) {
                this.config = config || {};
                if (content !== undefined) {
                    this.content = content;
                    this.createPopin();
                    this.edit();
                }
            },

            createPopin: function () {
                if (this.popin) {
                    this.popin.destroy();
                }
                this.popin = PopinManager.createPopIn({
                    close: function () {
                        Core.ApplicationManager.invokeService('content.main.removePopin', 'contentEdit');
                    },
                    position: { my: "center top", at: "center top+" + jQuery('#' + Core.get('menu.id')).height()}
                });

                this.popin.setTitle(translator.translate('edit'));
                this.popin.addOption('width', '500px');

                Core.ApplicationManager.invokeService('content.main.registerPopin', 'contentEdit', this.popin);
            },

            getDialog: function () {
                var dialog = this.popin || null;
                return dialog;
            },

            getFormConfig: function () {

                var self = this,
                    dfd = new jQuery.Deferred();

                this.content.getData('elements').done(function (elements) {
                    var key,
                        object,
                        element,
                        elementArray = [];

                    for (key in elements) {
                        if (elements.hasOwnProperty(key)) {

                            element = elements[key];

                            object = {
                                'type': (element.type === undefined) ? 'scalar' : element.type,
                                'uid': element.uid,
                                'name': key
                            };

                            if (object.type === 'scalar') {
                                object.parent = self.content;
                            }

                            elementArray.push(object);
                        }
                    }

<<<<<<< Updated upstream
                    self.getElementsConfig(elementArray).done(function () {
                        dfd.resolve(self.buildConfig(arguments));
                    });
                });
=======
                return dfd.promise();
            },

            preLoadElements: function (elementsArray) {
                var key,
                    dfd = jQuery.Deferred(),
                    object,
                    uids = [];

                for (key in elementsArray) {
                    if (elementsArray.hasOwnProperty(key)) {
                        object = elementsArray[key];
                        uids.push(object.uid);
                    }
                }

                if (uids.length > 0) {
                    require('content.repository').findByUids(uids).done(function (elements) {
                        var element,
                            key2;

                        for (key2 in elements) {
                            if (elements.hasOwnProperty(key2)) {
                                element = elements[key2];
                                ContentManager.buildElement({'type': element.type, 'uid': element.uid, 'elementData': element});
                            }
                        }

                        dfd.resolve();
                    });
                } else {
                    dfd.resolve();
                }
>>>>>>> Stashed changes

                return dfd.promise();
            },

            buildConfig: function (parameters) {
                var key,
                    param,
                    config = {
                        'elements': {},
                        'onSubmit': jQuery.proxy(this.onSubmit, this)
                    };

                if (this.config && this.config.hasOwnProperty("onValidate")) {
                    config.onValidate = this.config.onValidate;
                }

                for (key in parameters) {
                    if (parameters.hasOwnProperty(key)) {
                        param = parameters[key];

                        if (param !== null) {
                            param.popinInstance = this.popin;
                            config.elements[param.object_name] = param;
                        }
                    }
                }

                return config;
            },

            getElementsConfig: function (elementsArray) {

                var key,
                    promises = [],
                    object;

                for (key in elementsArray) {
                    if (elementsArray.hasOwnProperty(key)) {

                        object = elementsArray[key];

                        promises.push(ContentFormBuilder.getConfig(object.type, object));
                    }
                }

                return jQuery.when.apply(undefined, promises).promise();
            },

            /**
             * Edit the content
             */
            edit: function () {
                var self = this;

                this.popin.display();
                this.popin.mask();

                this.getFormConfig().done(function (config) {
                    FormBuilder.renderForm(config).done(function (html) {
                        self.popin.setContent(html);
                        self.popin.unmask();
                    });
                });
            },

            onSubmit: function (data, form) {
                var self = this;
                self.popin.mask();
                FormSubmitter.process(data, form).done(function (res) {

                    self.computeData(res);

                    Core.ApplicationManager.invokeService('content.main.save').done(function (promise) {
                        promise.done(function () {
                            self.content.refresh().done(function () {

                                self.popin.unmask();
                                self.popin.hide();

                                if (typeof self.config.onSave === "function") {
                                    self.config.onSave(data);
                                }
                                self.config.onSave = null;
                                self.config.onValidate = null;
                            });
                        });
                    });
                });
            },

            computeData: function (data) {
                var element,
                    contentElements = this.content.data.elements,
                    key,
                    item,
                    value;

                for (key in data) {

                    if (data.hasOwnProperty(key)) {
                        value = data[key];
                        item = contentElements[key];

                        if (value !== null) {
                            if (typeof item === 'string') {
                                if (item !== value) {
                                    this.content.addElement(key, value);
                                }
                            } else {
                                element = ContentManager.buildElement(item);

                                if (element.type === 'Element/Text') {
                                    if (element.get('value') !== value) {
                                        element.set('value', value);
                                    }
                                } else {
                                    element.setElements(value);
                                }
                            }
                        }
                    }
                }
            }
        };

        return {
            show: jQuery.proxy(Edition.show, Edition),
            getDialog: jQuery.proxy(Edition.getDialog, Edition)
        };
    }
);
