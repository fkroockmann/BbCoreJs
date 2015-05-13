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
        'jquery',
        'jsclass'
    ],
    function (jQuery) {

        'use strict';

        var ContentSet = {

            services: {
                'ContentManager': 'content.main.getContentManager',
                'DefinitionManager': 'content.main.getDefinitionManager'
            },

            init: function (definition) {
                this.definition = definition;

                return this;
            },

            getConfig: function (object) {
                var self = this,
                    dfd = jQuery.Deferred(),
                    config,
                    element = this.ContentManager.buildElement({'uid': object.uid, 'type': object.type});

                element.getData().done(function () {

                    config = {
                        'type': 'contentSet',
                        'label': object.name,
                        'object_name': object.name,
                        'object_uid': object.uid,
                        'object_type': object.type,
                        'children': self.getChildren(element)
                    };

                    dfd.resolve(config);
                });

                return dfd.promise();
            },

            getChildren: function (content) {
                var key,
                    contents = [],
                    element,
                    elements = content.data.elements;

                for (key in elements) {
                    if (elements.hasOwnProperty(key)) {
                        element = elements[key];
                        contents.push(this.ContentManager.buildElement({'uid': element.uid, 'type': element.type}));
                    }
                }

                return contents;
            }
        };

        return ContentSet;
    }
);