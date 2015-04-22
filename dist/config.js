
/* src/require.config.js */
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
require.config({
    baseUrl: 'resources/toolbar/',
    catchError: true,
    urlArgs: 'cb=' + Math.random(),
    paths: {
        'component': 'src/tb/component/component',

        'BackBone': 'dist/vendor',
        'Core': 'dist/vendor',
        'jquery': 'dist/vendor',
        'jqueryui': 'dist/vendor',
        'jsclass' : 'dist/vendor',
        'underscore': 'dist/vendor',
        'nunjucks': 'dist/vendor',
        'text': 'dist/vendor',
        'moment': 'dist/vendor',
        'URIjs/URI': 'dist/vendor',
        'datetimepicker': 'dist/vendor',
        'jquery-layout' : 'dist/vendor',
        'jqLayout': 'dist/vendor',
        'lib.jqtree': 'dist/vendor',
        'jssimplepagination': 'dist/vendor',
        'bootstrapjs': 'dist/vendor',
        'ckeeditor': 'dist/vendor',
        'dropzone': 'dist/vendor',

        'cryptojs.core': 'dist/vendor',
        'cryptojs.md5': 'dist/vendor'
    },
    'shim': {
        underscore: {
            exports: '_'
        },
        BackBone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        Core: {
            deps: ['BackBone', 'jquery', 'jsclass', 'underscore', 'nunjucks', 'URIjs/URI']
        },
        bootstrapjs: {
            deps: ['jquery']
        },
        'lib.jqtree': {
            deps: ['jquery']
        },
        'jquery-layout': {
            deps: ['jquery']
        },
        'cryptojs.core': {
            exports: 'CryptoJS'
        },
        'cryptojs.md5': {
            deps: ['cryptojs.core'],
            exports: 'CryptoJS'
        }
    },
    deps: ['src/tb/init'],
    callback: function (init) {
        'use strict';
        init.listen();
    }
});