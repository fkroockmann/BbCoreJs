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

/*global Dropzone */
define(['Core', 'Core/Renderer', 'BackBone', 'jquery', 'tb.component/mask/main'], function (Core, Renderer, Backbone, jQuery) {
    'use strict';

    var FileView = Backbone.View.extend({

        mainSelector: Core.get('wrapper_toolbar_selector'),
        dropzoneSelector: '.dropzone-file',

        defaultDropzoneConfig: {
            url: Core.get('api_base_url') + '/resource/upload',
            dictDefaultMessage: 'Drop files here or click to upload.',
            addRemoveLinks: true,
            maxFiles: 1,
            thumbnailWidth: 200
        },

        initialize: function (template, formTag, element) {
            this.form = formTag;
            this.template = template;
            this.element = element;
            this.maskManager = require('tb.component/mask/main').createMask({'message': 'Uploading...'});

            this.uploadEvent();
        },

        uploadEvent: function () {
            var self = this,
                config = {};

            jQuery.extend(config, this.defaultDropzoneConfig, this.element.config.dropzone);

            Core.Mediator.subscribeOnce('on:form:render', function (form) {

                var element = form.find('.element_' + self.element.getKey()),
                    dropzoneElement = element.find(self.dropzoneSelector),
                    dropzone = new Dropzone(dropzoneElement.eq(0).get(0), config),
                    input = form.find('input[name=' + self.element.getKey() + ']'),
                    inputPath = form.find('span.' + self.element.getKey() + '_path'),
                    inputSrc = form.find('span.' + self.element.getKey() + '_src'),
                    inputOriginalName = form.find('span.' + self.element.getKey() + '_originalname');

                self.buildValue(dropzone, self.element.value, input);

                dropzone.on('sending', function () {

                    self.maskManager.mask(form);

                    var items = dropzoneElement.find('.dz-preview');

                    if (items.length > 1) {
                        if (typeof self.element.value === 'object') {
                            items.first().remove();
                        }
                    }
                });

                dropzone.on('complete', function () {
                    self.maskManager.unmask(form);
                });

                dropzone.on('success', function (file, response) {
                    inputPath.text(response.path);
                    inputOriginalName.text(response.originalname);

                    if (response.src !== undefined) {
                        inputSrc.text(response.src);
                    }

                    input.val('updated');

                    return file;
                });

                dropzone.on('removedfile', function () {
                    if (this.files.length === 0) {
                        inputPath.text('');
                        inputSrc.text('');
                        inputOriginalName.text('');
                        input.val('updated');
                    }
                });

                dropzone.on('maxfilesexceeded', function (file) {
                    this.removeFile(file);
                });
            });
        },

        buildValue: function (dropzone, value, element) {
            if (typeof value === 'object') {

                var file = {'name': value.name};

                dropzone.options.addedfile.call(dropzone, file);
                dropzone.createThumbnailFromUrl(file, value.thumbnail + '?' + new Date().getTime());

                element.val(value.path);
            }
        },

        /**
         * Render the template into the DOM with the Renderer
         * @returns {String} html
         */
        render: function () {
            return Renderer.render(this.template, {element: this.element, id: this.id});
        }
    });

    return FileView;
});