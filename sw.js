importScripts(
    'https://cdn.jsdelivr.net/npm/@jcubic/wayne/index.umd.min.js',
    'https://cdn.jsdelivr.net/npm/@isomorphic-git/lightning-fs/dist/lightning-fs.min.js',
    'https://cdn.jsdelivr.net/gh/jcubic/static@master/js/mime.min.js',
    'https://cdn.jsdelivr.net/gh/jcubic/static@master/js/path.js'
);

const { Wayne, FileSystem } = wayne;

const { promises: fs } = new LightningFS('__fs__');

fetch('./process_postfix.js')
  .then(res => res.text())
  .then(postfix => {
    const readFile = fs.readFile;
    fs.readFile = async function(...args) {
      const output = await readFile(...args);
      return `${output}\n${postfix}`;
    };
  });

const app = new Wayne();

app.use(FileSystem({ path, fs, mime, prefix: '__fs__' }));