importScripts(
    'https://cdn.jsdelivr.net/npm/@jcubic/wayne/index.umd.min.js',
    'https://cdn.jsdelivr.net/npm/@isomorphic-git/lightning-fs/dist/lightning-fs.min.js',
    'https://cdn.jsdelivr.net/gh/jcubic/static@master/js/mime.min.js',
    'https://cdn.jsdelivr.net/gh/jcubic/static@master/js/path.js'
);

const { Wayne, FileSystem, force } = wayne;

const { promises: fs } = new LightningFS('__fs__');

const promise = Promise.all(['./process_prefix.js', './process_postfix.js'].map(path => {
  return fetch(path).then(res => res.text());
}));

(readFile => {
    fs.readFile = async function(...args) {
        const [prefix, postfix] = await promise;
        const [ path ] = args;
        const output = await readFile(...args);
        if (path.endsWith('.js')) {
            return `${prefix}\n${output}\n${postfix}`;
        }
        return output;
    };
})(fs.readFile);

const app = new Wayne();

app.use(FileSystem({ path, fs, mime, prefix: '__fs__' }));

force();
