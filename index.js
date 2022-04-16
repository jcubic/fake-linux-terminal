var term;
(async function() {
    /* TODO:
     * $PATH
     * process (stdin/stdout/stderr) (worker? ES Module) (allow backgroud jobs)
       Posix API? open/read/write
       Promise API for worker
       main function - default export or API with callback

     * BASH + cd, pwd, echo, history, pushd, popd, wait, source
     * scripts in JavaSript or Bash in FS /bin cat,ls,less,more,mkdir,rmdir,rm,mv,touch,locate,find,grep,xargs,head,tail,diff,wget,zip,unzip
     * Image files in ZIP
     * Memory FS / reset on Init
     */

    const { default: MemoryDB } = await import('./MemoryDB.js');
    let fs;
    let db;
    const db_name = '__fs__';
    function boot(data) {
        db = data ? new MemoryDB(data) : new MemoryDB(db_name);
        fs = new LightningFS(db_name, { db });
    }

    // --------------------------------------------------------------
    function list(path) {
        term.pause();
        return listDir(path).then((list) => (term.resume(), list));
    }
    // --------------------------------------------------------------
    function get_path(string) {
        var path = cwd.replace(/^\//, '').split('/');
        if (path[0] === '') {
            path = path.slice(1);
        }
        var parts = string === '/'
        ? string.split('/')
        : string.replace(/\/?[^\/]*$/, '').split('/');
        if (parts[0] === '') {
            parts = parts.slice(1);
        }
        if (string === '/') {
            return [];
        } else if (string.startsWith('/')) {
            return parts;
        } else if (path.length) {
            return path.concat(parts);
        } else {
            return parts;
        }
    }
    // --------------------------------------------------------------
    function read(cmd, cb) {
        var filename = typeof cmd === 'string' ? cmd : cmd.args.length == 1 ? cwd + '/' + cmd.args[0] : null;
        if (filename) {
            term.pause();
            fs.readFile(filename, 'utf8', function(err, data) {
                if (err) {
                    term.error(err.message);
                } else {
                    cb(data.toString());
                }
                term.resume();
            });
        } else {
            term.error('No filename');
        }
    }
    window.resolve = function resolve(path) {
        if (path[0] === '/') {
            return path;
        } else {
            return window.path.resolve(window.path.join(cwd, path));
        }
    }
    // --------------------------------------------------------------
    function mkdir(path) {
        path = resolve(path);
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stat) => {
                if (err) {
                    fs.mkdir(path, function(err) {
                        if (err) {
                            reject(err.message);
                        } else {
                            resolve();
                        }
                    });
                } else if (stat.isFile()) {
                    reject(`${path} is file`);
                } else {
                    resolve();
                }
            });
        });
    }

    // --------------------------------------------------------------
    window.cwd = '/';
    var commands = {
        help: function(cmd) {
            term.echo(`Available commands: ${Object.keys(commands).join(', ')}`);
        },
        mkdir: function(cmd) {
            term.pause();
            mkdir(cmd.args[0]).then(term.resume);
        },
        cd: function(cmd) {
            if (cmd.args.length === 1) {
                var dirname = path.resolve(cwd + '/' + cmd.args[0]);
                term.pause();
                fs.stat(dirname, (err, stat) => {
                    if (err) {
                        term.error("Directory don't exits").resume();
                    } else if (stat.isFile()) {
                        term.error(`"${dirname}" is not directory`).resume();
                    } else {
                        cwd = dirname == '/' ? dirname : dirname.replace(/\/$/, '');
                        term.resume();
                    }
                });
            }
        },
        store: function(cmd) {
            db.persistent(db_name);
            localStorage.setItem('__fs__persistent', 1);
        },
        cat: function(cmd) {
            read(cmd, (x) => term.echo(x, {newline: false}));
        },
        less: function(cmd) {
            read(cmd, term.less.bind(term));
        },
        ls: function(cmd) {
            var {options, args} = split_args(cmd.args);
            function filter(list) {
                if (options.match(/a/)) {
                    return list;
                } else if (options.match(/A/)) {
                    return list.filter(name => !name.match(/^\.{1,2}$/));
                } else {
                    return list.filter(name => !name.match(/^\./));
                }
            }
            list(cwd + '/' + (args[0] || '')).then((content) => {
                var dirs = filter(['.', '..'].concat(content.dirs)).map((dir) => color('blue', dir));
                var output = dirs.concat(filter(content.files));
                if (output.length) {
                    term.echo(output.join('\n'));
                }
            });
        },
        rm: function(cmd) {
            var {options, args} = split_args(cmd.args);

            var len = args.length;
            if (len) {
                term.pause();
            }
            args.forEach(arg => {
                var path_name = path.resolve(cwd + '/' + arg);
                fs.stat(path_name, (err, stat) => {
                    if (err) {
                        term.error(err);
                    } else if (stat) {
                        if (stat.isDirectory()) {
                            if (options.match(/r/)) {
                                rmDir(path_name);
                            } else {
                                term.error(`${path_name} is directory`);
                            }
                        } else if (stat.isFile()) {
                            fs.unlink(path_name);
                        } else {
                            term.error(`${path_name} is invalid`)
                        }
                        if (!--len) {
                            term.resume();
                        }
                    }
                });
            });
        },
        credits: function() {
            this.echo(`
 [[!;;;;https://github.com/jcubic/jsvi]JSVI]
   Copyright (C) 2006-2008 Internet Connection, Inc.
   Copyright (C) 2013-2018 Jakub Jankiewicz
 [[!;;;;https://terminal.jcubic.pl]jQuery Terminal]
   Copyright (C) 2011-2021 Jakub Jankiewicz
 [[!;;;;https://github.com/timoxley/wcwidth]wcwidth]
   Copyright (c) 2012 by Jun Woong
 [[!;;;;https://prismjs.com/]PrismJS]
   Copyright (c) 2012 Lea Verou
 [[!;;;;https://github.com/inexorabletash/polyfill]Keyboard Polyfill]
   Copyright (c) 2018 Joshua Bell
 [[!;;;;https://github.com/jvilk/BrowserFS]BrowserFS]
   Copyright (c) 2013, 2014, 2015, 2016, 2017 John Vilk and other BrowserFS contributors.
 `)
        },
        vi: function(cmd) {
            var textarea = $('.vi');
            var editor;
            var fname = cmd.args[0];
            term.focus(false);
            if (fname) {
                var path = resolve(fname);
                function open(file) {
                    // we need to replace < and & because jsvi is handling html tags
                    // and don't work properly for raw text
                    textarea.val(file.replace(/</g, '&lt;').replace(/&/g, '&amp;'));
                    editor = window.editor = vi(textarea[0], {
                        color: '#ccc',
                        backgroundColor: '#000',
                        onSave: function() {
                            var file = textarea.val().replace(/&amp;/g, '&').replace(/&lt;/g, '<');
                            fs.writeFile(path, file, function(err, wr) {
                                if (err) {
                                    term.error(err.message);
                                }
                            });
                        },
                        onExit: term.focus
                    });
                }
                fs.stat(path, (err, stat) => {
                    if (stat && stat.isFile()) {
                        read(cmd, open, true);
                    } else {
                        var dir = path.replace(/[^\/]+$/, '');
                        fs.stat(dir, (err, stat) => {
                            if (stat && stat.isDirectory()) {
                                open('')
                            } else if (err) {
                                term.error(err.message);
                            } else {
                                term.error(`${dir} directory don't exists`);
                            }
                        });
                    }
                });
            }
        }
    };

    // --------------------------------------------------------------
    term = $('#term').terminal(command => {
        if (command.trim()) {
            var cmd = $.terminal.parse_command(command);
            if (commands[cmd.name]) {
                commands[cmd.name].call(term, cmd);
            } else {
                term.error('Command not found');
            }
        }
    }, {
        greetings: 'Fake Linux Terminal\n',
        prompt: function() {
            return [
                color('green', 'user&#64;example.com'),
                ':',
                color('blue', cwd),
                '$ '
            ].join('');
        },
        completion: function(string, cb) {
            var cmd = $.terminal.parse_command(this.before_cursor());
            function processAssets(callback) {
                var dir = get_path(string);
                list('/' + dir.join('/')).then(callback);
            }
            function prepend(list) {
                if (string.match(/\//)) {
                    var path = string.replace(/\/[^\/]+$/, '').replace(/\/+$/, '');
                    return list.map((dir) => path + '/' + dir);
                } else {
                    return list;
                }
            }
            function trailing(list) {
                return list.map((dir) => dir + '/');
            }
            if (cmd.name !== string) {
                switch (cmd.name) {
                    // complete file and directories
                    case 'cat':
                    case 'vi':
                    case 'less':
                        return processAssets(content => cb(prepend(trailing(content.dirs).concat(content.files))));
                    // complete directories
                    case 'ls':
                    case 'cd':
                        return processAssets(content => cb(prepend(trailing(content.dirs))));
                }
            }
            cb(Object.keys(commands));
        }
    });
    term.on('dragover', function(e) {
        e.preventDefault();
        term.addClass('hover');
    }).on('dragleave', function(e) {
        e.preventDefault();
        term.removeClass('hover');
    }).on('drop', async function(e) {
        e.preventDefault();
        term.removeClass('hover');
        const files = Array.from(event.dataTransfer.files || event.target.files || []);
        if (files.length) {
            boot(await loadFile(files[0]));
        }
    });
    if (localStorage.getItem('__fs__persistent')) {
        boot();
    } else {
        term.pause();
        fetch('image.z').then(res => {
            return res.arrayBuffer();
        }).then(image => {
            boot(JSON.parse(pako.inflate(image, { to: 'string' })));
            term.resume();
        });
    }
    // -------------------------------------------------------------------
    function color(name, string) {
        var colors = {
            blue:   '#55f',
            green:  '#4d4',
            grey:   '#999',
            red:    '#A00',
            yellow: '#FF5',
            violet: '#a320ce',
            white:  '#fff'
        }
        if (colors[name]) {
            return '[[;' + colors[name] + ';]' + string + ']';
        } else {
            return string;
        }
    }

    // -------------------------------------------------------------------------
    function loadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', async event => {
                const image = new Uint8Array(event.target.result);
                resolve(JSON.parse(pako.inflate(image, { to: 'string' })));
            });
            reader.addEventListener('error', reject);
            reader.readAsArrayBuffer(file);
        });
    }

    // -------------------------------------------------------------------------
    function listDir(path) {
        return new Promise(function(resolve, reject) {
            fs.readdir(path, function(err, dirList) {
                if (err) {
                    return reject(err);
                }
                var result = {
                    files: [],
                    dirs: []
                };
                var len = dirList.length;
                if (!len) {
                    resolve(result);
                }
                dirList.forEach(function(filename) {
                    var file = (path === '/' ? '' : path) + '/' + filename;

                    fs.stat(file, function(err, stat) {
                        if (stat) {
                            result[stat.isFile() ? 'files' : 'dirs'].push(filename);
                        }
                        if (!--len) {
                            resolve(result);
                        }
                    });
                });

            });
        });
    }

    // -------------------------------------------------------------------------
    function split_args(args) {
        return {
            options: args.filter(arg => arg.match(/^-/)).join('').replace(/-/g, ''),
            args: args.filter(arg => !arg.match(/^-/))
        };
    }
})();
