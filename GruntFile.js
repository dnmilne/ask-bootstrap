'use strict';

    module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        concat: {
            js: {
                options: {
                    banner:
                        'angular.module(\'ask.bootstrap\', [\'ask.bootstrap.controllers\',' +
                                                                  '\'ask.bootstrap.directives\',' +
                                                                  '\'ask.bootstrap.filters\',' +
                                                                  '\'ask.bootstrap.templates\']);\n'
                },
                src: ['./src/scripts/*.js'],
                dest: './dist/ask-bootstrap.js'
            },
            css: {
                src: ['./src/styles/*.css'],
                dest: './dist/ask-bootstrap.css'
            }
        },
        htmlangular: {
            options: {
                customtags: [
                    'ask-field',
                    'ask-instruction',
                    'ask-freetext',
                    'ask-multitext',
                    'ask-numeric',
                    'ask-singlechoice',
                    'ask-multichoice',
                    'ask-rating',
                    'ask-mood',
                    'mood-matrix',
                    'mood-canvas'
                ],

            },
            files: {
                src: ['src/views/templates/*.html'],
            }
        },
        html2js: {
            app: {
                options: {
                    base: './src/views/templates/',
                    useStrict: true,
                    quoteChar: '\'',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                },
                src: ['./src/views/{,*/}*.html'],
                dest: './src/scripts/templates.js',
                module: 'ask.bootstrap.templates'
            }
        },
        uglify: {
            js: {
                src: ['./dist/ask-bootstrap.js'],
                dest: './dist/ask-bootstrap.min.js'
            }
        },
        cssmin: {
            target: {
                files: {
                './dist/ask-bootstrap.min.css': ['./dist/ask-bootstrap.css']
                }
            }
        }
    });

    grunt.registerTask('default', [
        'htmlangular',
        'html2js',
        'concat',
        'uglify',
        'cssmin'
    ]);

    grunt.registerTask('quick', [
        'html2js',
        'concat',
        'uglify',
        'cssmin'
    ]) ;

};