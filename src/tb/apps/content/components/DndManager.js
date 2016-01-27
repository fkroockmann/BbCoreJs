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
        'Core/Renderer',
        'jquery',
        'text!content/tpl/dropzone',
        'component!dnd',
        'content.manager',
        'app.content/components/dnd/CommonDnD',
        'app.content/components/dnd/ContentDrag',
        'app.content/components/dnd/ContentDrop',
        'text!content/tpl/scrollzone',
        'jsclass'
    ],
    function (Renderer,
              jQuery,
              dropZoneTemplate,
              dnd,
              ContentManager,
              CommonDnD,
              ContentDrag,
              ContentDrop,
              scrollzone
            ) {

        'use strict';

        var DndManager = new JS.Class({

            contentClass: 'bb-content',

            identifierDataAttribute: 'bb-identifier',

            idDataAttribute: 'bb-id',

            typeDataAttribute: 'bb-type',

            droppableClass: '.bb-droppable',

            dropZoneClass: 'bb-dropzone',
            validDropZoneClass: 'bb-dropzone-valid',
            forbiddenDropZoneClass: 'bb-dropzone-forbidden',

            dndClass: 'bb-dnd',

            intervalId: 0,

            initialize: function () {
                this.resetDataTransfert();
                this.common = new CommonDnD();
                this.drag = new ContentDrag();
                this.drop = new ContentDrop();
            },

            initDnD: function () {
                dnd('#block-contrib-tab').addListeners('classcontent', '.' + this.dndClass);
                dnd('#bb5-site-wrapper').addListeners('classcontent', '.' + this.dndClass);
                jQuery('body').on('dragenter', jQuery.proxy(this.mediaDragEnter, this));
            },

            attachDnDOnPalette: function () {
                dnd('#backbee-palette-blocks').addListeners('classcontent', '.' + this.dndClass);
            },

            resetDataTransfert: function () {
                this.dataTransfer = {
                    content: {},
                    identifier: null,
                    contentSetDroppable: null,
                    parent: null,
                    isMedia: false
                };
            },

            bindEvents: function () {
                this.common.bindEvents(this);
                this.drag.bindEvents(this);
                this.drop.bindEvents(this);
            },

            unbindEvents: function () {
                this.common.unbindEvents();
                this.drag.unbindEvents();
                this.drop.unbindEvents();
            },

            mediaDragEnter: function () {
                var img = jQuery('[data-bb-identifier^="Element/Image"]'),
                    current;

                img.addClass('bb-dnd');
                img.attr('dropzone', true);
                img.css('opacity', '0.6');

                img.each(function (index) {
                    current = jQuery(img.get(index));
                    if (!current.parent().hasClass('img-wrap-dnd')) {
                        current.wrap('<div class="img-wrap-dnd">');
                    }
                });
            },

            scrollFnc: function () {
                if (this.size) {
                    window.scrollBy(0, this.size);
                }
            },

            attachScrollDragEnter: function (element) {
                var scrollFnc = this;

                element.addEventListener('dragenter', function (event) {
                    var direction,
                        target;

                    if (event.target.classList.contains('scroll-ico')) {
                        target = event.target.parentNode;
                    } else {
                        target = event.target;
                    }

                    direction = target.getAttribute('data-direction');

                    if (direction === 'up') {
                        scrollFnc.size = -7;
                    } else {
                        scrollFnc.size = 7;
                    }
                    target.classList.add('over');
                }, true);
            },

            attachScrollDragLeave: function (element) {
                var scrollFnc = this;

                element.addEventListener('dragleave', function (event) {
                    var target;

                    scrollFnc.size = false;

                    if (event.target.classList.contains('scroll-ico')) {
                        target = event.target.parentNode;
                    } else {
                        target = event.target;
                    }

                    target.classList.remove('over');
                }, true);
            },

            showScrollZones: function () {
                var scrollUp = Renderer.render(scrollzone, {direction: 'up'}),
                    scrollDown = Renderer.render(scrollzone, {direction: 'down'}),
                    scrolls,
                    i;

                this.scrollFnc.size = false;

                this.intervalId = setInterval(this.scrollFnc.bind(this.scrollFnc), 10);

                document.querySelector('#bb5-ui').insertAdjacentHTML('beforeend', scrollUp + scrollDown);

                scrolls = document.querySelectorAll('.scroll');

                for (i = scrolls.length - 1; i >= 0; i = i - 1) {
                    this.attachScrollDragEnter.call(this.scrollFnc, scrolls[i]);
                    this.attachScrollDragLeave.call(this.scrollFnc, scrolls[i]);
                }
            },

            removeScrollZones: function () {
                clearInterval(this.intervalId);
                jQuery('.scroll').remove();
            },

            /**
             * Show the dropzone after and before each children
             * @param {Object} contentSets
             */
            showHTMLZoneForContentSet: function (contentSets, currentContentId, type) {
                var key,
                    contentSet,
                    children,
                    config,
                    dropzoneEl,
                    parent,
                    label;

                ContentManager.addDefaultZoneInContentSet(false);

                for (key in contentSets) {
                    if (contentSets.hasOwnProperty(key)) {

                        contentSet = contentSets[key];
                        contentSet.isChildrenOf(currentContentId);

                        if (contentSet.id !== currentContentId && !contentSet.isChildrenOf(currentContentId)) {

                            children = contentSet.getNodeChildren();
                            parent = contentSet.getParent();
                            label = (parent !== null) ? (parent.getLabel() + ' > ' + contentSet.getLabel()) : contentSet.getLabel();

                            config = {
                                'label': label,
                                'class': children.length === 0 ? 'without-children' : ''
                            };

                            if (contentSet.accept(type)) {
                                config.class = config.class + ' ' + this.dropZoneClass + ' ' + this.validDropZoneClass;
                                config.droppable = "true";
                                dropzoneEl = Renderer.render(dropZoneTemplate, config);
                            } else {
                                config.class = config.class + ' ' + this.dropZoneClass + ' ' + this.forbiddenDropZoneClass;
                                config.droppable = "false";
                                dropzoneEl = Renderer.render(dropZoneTemplate, config);
                            }

                            if (children.length > 0) {
                                this.putDropZoneAroundContentSetChildren(children, dropzoneEl, currentContentId);
                            } else {
                                contentSet.jQueryObject.html(dropzoneEl);
                            }
                        }
                    }
                }
            },

            getAllAttributes: function (element) {
                var attr = {};

                jQuery(element).each(function () {
                    jQuery.each(this.attributes, function () {
                        if (this.specified) {
                            attr[this.name] = this.value;
                        }
                    });
                });

                return attr;
            },

            /**
             * Put HTML dropzone around the contentset's children
             * @param {Object} children
             * @param {String} template
             * @param {String} currentContentId
             */
            putDropZoneAroundContentSetChildren: function (children, template, currentContentId) {
                var self = this;

                children.each(function (index) {
                    var currentTarget = jQuery(this),
                        wrapper = jQuery('<div></div>'),
                        parent,
                        floatCss,
                        firstTemplate,
                        secondTemplate;

                    if (!currentContentId || currentTarget.data(self.idDataAttribute) !== currentContentId) {
                        currentTarget.wrap(wrapper);
                        parent = currentTarget.parent('div');
                        floatCss = currentTarget.css('float');

                        secondTemplate = jQuery(template);
                        firstTemplate = jQuery(template);

                        if (floatCss !== 'none') {
                            secondTemplate.addClass('right');
                            secondTemplate.html('');

                            if (0 === index) {
                                firstTemplate.addClass('left');
                                firstTemplate.html('');
                            }
                        }

                        parent.append(secondTemplate);

                        if (0 === index) {
                            parent.prepend(firstTemplate);
                        }

                        self.changeDndPosition(currentTarget, parent);
                    }
                });
            },

            changeDndPosition: function (element, wrapper) {
                var attributes = this.getAllAttributes(element);

                this.putAttributes(wrapper, attributes);
                this.removeAttributes(element);

                wrapper.addClass('bb-drop-wrapper');
                wrapper.css('position', 'relative');

                element.addClass('clearfix');
                element.addClass('bb-reverted-element');
            },

            putAttributes: function (element, attributes) {
                var key;

                for (key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
                        element.attr(key, attributes[key]);
                    }
                }
            },

            removeAttributes: function (element) {
                var attributes = this.getAllAttributes(element),
                    key;

                for (key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
                        element.removeAttr(key);
                    }
                }
            },

            /**
             * Delete all dropzone
             */
            cleanHTMLZoneForContentset: function () {
                var self = this,
                    wrappers = jQuery('.bb-drop-wrapper');

                jQuery('.' + this.dropZoneClass).not('.without-children').remove();

                wrappers.each(function () {
                    var wrapper = jQuery(this),
                        attributes = self.getAllAttributes(wrapper),
                        element = wrapper.children('.bb-reverted-element');

                    self.putAttributes(element, attributes);

                    element.removeClass('clearfix');
                    element.removeClass('bb-reverted-element');

                    element.unwrap();
                });
            },

            /**
             * Return position of element will be dropped
             * @param {Object} zone
             * @returns {Number}
             */
            getPosition: function (zone, parent) {
                var prevContent = ContentManager.getContentByNode(zone.parent('.' + this.contentClass)),
                    contentSet = ContentManager.getContentByNode(parent),
                    content,
                    pos = 0;

                if (zone.next().length > 0) {
                    return pos;
                }

                if (prevContent !== null) {
                    contentSet.getNodeChildren().each(function () {
                        content = ContentManager.getContentByNode(jQuery(this));

                        pos = pos + 1;

                        if (content.uid === prevContent.uid) {
                            return false;
                        }
                    });
                }

                return pos;
            }
        });

        return new JS.Singleton(DndManager);
    }
);
