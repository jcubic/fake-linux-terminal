importScripts(
    'https://cdn.jsdelivr.net/npm/@jcubic/wayne/index.umd.min.js',
    'https://cdn.jsdelivr.net/npm/@isomorphic-git/lightning-fs/dist/lightning-fs.min.js',
    'https://cdn.jsdelivr.net/gh/jcubic/static@master/js/mime.min.js',
    'https://cdn.jsdelivr.net/gh/jcubic/static@master/js/path.js'
);

const { Wayne, FileSystem } = wayne;

const { promises: fs } = new LightningFS('__fs__');

Promise.all(['./process_prefix.js', './process_postfix.js'].map(path => {
  return fetch(path).then(res => res.text());
})).then(([prefix, postfix]) => {
    const readFile = fs.readFile;
    fs.readFile = async function(...args) {
        const [ path ] = args;
        const output = await readFile(...args);
        if (path.endsWith('.js')) {
            return `${prefix}\n${output}\n${postfix}`;
        }
        return output;
    };
  });

const app = new Wayne();

app.use(FileSystem({ path, fs, mime, prefix: '__fs__' }));
