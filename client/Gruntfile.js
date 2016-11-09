module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    var imgExts = 'png,jpg,jpeg,gif';
    var cfg = {
        protocol: 'http',
        hostname: 'localhost',
        port: '9001',
        version: Date.now(),
        socketServer: 'http://localhost:8080'
    };

    cfg.defaultUrl = `${cfg.protocol}://${cfg.hostname}:${cfg.port}`;
    cfg.releaseUrl = `${cfg.protocol}://${cfg.hostname}:${cfg.port}`; //可修改为发布服务器地址

    // files: [{
    //     expand: true,                  // Enable dynamic expansion 
    //     cwd: 'src/',                   // Src matches are relative to this path 
    //     src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match 
    //     dest: 'dist/'                  // Destination path prefix 
    //   }]

    grunt.initConfig({
        pkg: grunt.file.readJSON('../package.json'),
        config: {
            src: {
                img: 'images/',
                css: 'css/',
                js: 'js/',
                html: './index.html'
            },
            tmp: {
                js: 'tmp/js/'
            },
            dest: {
                img: 'dist/images/',
                css: 'dist/css/',
                js: 'dist/js/',
                html: 'dist/index.html'
            }
        },
        clean: {
            dist: ['./dist'],
            js: ['<%=config.dest.js %>**',
                '<%=config.tmp.js%>/**/*.js',
                '<%=config.tmp.js%>/**/*.map'
            ]
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['babel-preset-es2015'],
                plugins: ['transform-es2015-modules-umd']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%=config.src.js %>',
                    src: ['**/*.js'],
                    dest: '<%=config.tmp.js%>'
                }]
            }
        },
        uglify: {
            options: {
                banner: '/*暗棋游戏*/',
                sourceMap: true,
                sourceMapIncludeSources: true
            },
            files: {
                src: ['<%=config.tmp.js%>/global.js',
                    '<%=config.tmp.js%>/render.js',
                    '<%=config.tmp.js%>/parser.js',
                    '<%=config.tmp.js%>/game.js',
                    '<%=config.tmp.js%>/socket.js',
                    '<%=config.tmp.js%>/main.js'
                ],
                dest: '<%=config.dest.js%>/main.min.js'
            }
        },
        sass: {
            options: {
                style: 'expanded'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%=config.src.css %>',
                    src: '**/*.scss',
                    ext: '.css',
                    dest: '<%=config.dest.css%>'
                }]
            }
        },
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: '<%=config.src.img %>',
                    src: [`**/*.{${imgExts}}`],
                    dest: '<%=config.dest.img %>'
                }]
            }
        },
        cssmin: {
            dist: {
                expand: true,
                cwd: '<%=config.dest.css %>',
                src: '**/*.css',
                dest: '<%=config.dest.css %>'
            }
        },
        copy: {
            html: {
                src: '<%=config.src.html %>',
                dest: '<%=config.dest.html %>'
            }
        },
        replace: {
            options: {
                patterns: [{
                    match: 'version',
                    replacement: cfg.version
                }, {
                    match: 'baseUrl',
                    replacement: cfg.releaseUrl
                }, {
                    match: 'socketServer',
                    replacement: cfg.socketServer
                }]
            },
            html: {
                src: '<%=config.dest.html %>',
                dest: '<%=config.dest.html %>'
            },
            css: {
                expand: true,
                cwd: '<%=config.dest.css %>/',
                src: ['**/*.css'],
                dest: '<%=config.dest.css %>'
            },
            js: {
                expand: true,
                cwd: '<%=config.dest.js %>/',
                src: ['**/*.js'],
                dest: '<%=config.dest.js %>'
            }
        },
        watch: {
            options: {
                livereload: true
            },
            gf: {
                files: './Gruntfile'
            },
            image: {
                files: '<%=config.src.img %>**/*.{' + imgExts + '}',
                tasks: ['imagemin']
            },
            sass: {
                files: '<%=config.src.css %>**/*.scss',
                tasks: ['sass', 'replace:css']
            },
            js: {
                files: '<%=config.src.js%>**/*.js',
                tasks: ['babel', 'uglify']
            },
            html: {
                files: '<%=config.src.html%>',
                tasks: ['copy', 'replace:html']
            }
        },
        connect: {
            server: {
                options: {
                    port: cfg.port,
                    hostname: cfg.hostname,
                    protocol: cfg.protocol,
                    base: {
                        path: 'dist',
                        options: {
                            index: 'index.html',
                            maxAge: 1000 * 60 * 5
                        }
                    },
                    open: true,
                    livereload: true
                }
            }
        }
    });

    grunt.registerTask('dev', '开发环境构建。。。', function() {
        grunt.task.run([
            'clean', 'babel',
            'uglify',
            'sass', 'imagemin', 'cssmin',
            'copy',
            'replace' //,
            // 'watch', 'connect'
        ]);
    });

    grunt.registerTask('server', '启动服务。。。', function() {
        grunt.task.run([
            'connect',
            'watch'
        ]);
    });
};