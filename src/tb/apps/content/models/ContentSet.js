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
        'Core/ApplicationManager',
        'content.models.AbstractContent',
        'jquery',
        'content.manager',
        'component!mask',
        'component!notify',
        'component!translator',
        'jsclass'
    ],
    function (ApplicationManager, AbstractContent, jQuery) {

        'use strict';

        var ContentSet = new JS.Class(AbstractContent, {

            identifierDataAttribute: 'bb-identifier',

            /**
             * Initialize Content
             *
             * @param {Object} config
             */
            initialize: function (config) {
                this.callSuper(config);
            },

            /**
             * Add content html from parent with and position
             * If position is not provided, html will be at the first
             * @param {String} html
             * @param {Number} position
             * @returns {Promise}
             */
            append: function (content, position) {
                var self = this,
                    dfd = jQuery.Deferred(),
                    parentContent = content.getParent(),
                    mask = require('component!mask').createMask();

                mask.mask(this.jQueryObject);

                if (!this.isAllowToAppend(content.uid)) {

                    mask.unmask(self.jQueryObject);

                    require('component!notify').warning(require('component!translator').translate('cant_select_current_content'));

                    dfd.resolve();

                    return dfd.promise();
                }

                if (parentContent !== null && (this.id !== parentContent.id)) {
                    parentContent.jQueryObject.find('[data-bb-id="' + content.id + '"]').remove();

                    parentContent.setUpdated(true);
                }

                this.putContentToPosition(content, position);
                this.setUpdated(true);

                ApplicationManager.invokeService('content.main.save', true).done(function (promise) {
                    promise.done(function () {
                        self.refresh().done(function () {
                            require('content.manager').addDefaultZoneInContentSet(true);

                            dfd.resolve();
                        });
                    });
                });

                return dfd.promise();
            },

            putContentToPosition: function (content, position) {
                var children = this.getChildren(),
                    key,
                    elements = [],
                    include = false,
                    currentPos,
                    i = 0;

                for (key in children) {
                    if (children.hasOwnProperty(key)) {

                        if (children[key].id === content.id) {
                            currentPos = i;
                        }

                        if (parseInt(position, 10) === parseInt(key, 10)) {
                            elements[i] = content;
                            include = true;
                            i = i + 1;
                        }

                        elements[i] = children[key];

                        i = i + 1;
                    }
                }

                if (currentPos !== undefined) {
                    delete elements[currentPos];
                }

                if (!include) {
                    elements.push(content);
                }

                children = [];
                for (key in elements) {
                    if (elements.hasOwnProperty(key)) {
                        children.push({'uid': elements[key].uid, 'type': elements[key].type});
                    }
                }

                this.revision.setElements(children);
            },

            isAllowToAppend: function (uid) {
                var parents = this.getParents(),
                    key,
                    result = true;

                if (this.uid === uid) {
                    return false;
                }

                for (key in parents) {
                    if (parents.hasOwnProperty(key)) {
                        if (parents[key].uid === uid) {
                            result = false;
                            break;
                        }
                    }
                }

                return result;
            },

            updateRevision: function () {
                this.updateRevisionElements();

                return this.revision;
            },

            updateRevisionElements: function () {
                if (this.revision.elements === undefined) {
                    var children = this.getChildren(),
                        child,
                        key,
                        elements = [];

                    for (key in children) {
                        if (children.hasOwnProperty(key)) {
                            child = children[key];
                            elements.push({'type': child.type, 'uid': child.uid});
                        }
                    }

                    this.revision.setElements(elements);
                }
            },

            /**
             * Get children as content
             * @returns {Array}
             */
            getChildren: function () {
                var self = this,
                    nodeChildren = this.jQueryObject.children(),
                    nodeChild,
                    config,
                    ContentManager = require('content.manager'),
                    objectIdentifier,
                    children = [];

                nodeChildren.each(function () {
                    nodeChild = jQuery(this);

                    if (nodeChild.hasClass('bb-drop-wrapper')) {
                        nodeChild = nodeChild.children(self.contentClass);
                    }

                    if (nodeChild.hasClass('bb-content')) {

                        objectIdentifier = nodeChild.data(self.identifierDataAttribute);
                        config = ContentManager.retrievalObjectIdentifier(objectIdentifier);
                        config.jQueryObject = nodeChild;

                        children.push(ContentManager.buildElement(config));
                    }
                });

                return children;
            },

            /**
             * Verify if contentSet accept this element name
             * @param {String} accept
             * @returns {Boolean}
             */
            accept: function (accept) {
                var allAccepts = this.getAccept(),
                    accepts = [],
                    key;

                if (!accept) {
                    return true;
                }

                accept = accept.replace('/', '\\');

                if (allAccepts.length === 0) {
                    return true;
                }

                for (key in allAccepts) {
                    if (allAccepts.hasOwnProperty(key)) {

                        if (allAccepts[key] === '!' + accept) {
                            return false;
                        }

                        if ('!' !== allAccepts[key].substring(0, 1)) {
                            accepts.push(allAccepts[key]);
                        }
                    }
                }

                if (accepts.length === 0) {
                    return true;
                }

                for (key in accepts) {
                    if (accepts.hasOwnProperty(key)) {
                        if (accepts[key] === accept) {
                            return true;
                        }
                    }
                }

                return false;
            },

            /**
             * Verify if contentSet is children of an other contentSet
             * @param {String} contentSetId
             * @returns {Boolean}
             */
            isChildrenOf: function (contentSetId) {

                if (!(this.jQueryObject instanceof jQuery)) {
                    return false;
                }

                var parents = this.jQueryObject.parents('[data-bb-id]'),
                    result = false;

                parents.each(function () {
                    var currentTarget = jQuery(this);

                    if (currentTarget.attr('data-bb-id') === contentSetId) {
                        result = true;

                        return false;
                    }
                });

                return result;
            }
        });

        return ContentSet;
    }
);
