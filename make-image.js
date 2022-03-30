#!/usr/bin/env node

import { promises as fs } from 'fs';
import process from 'process';
import path from 'path';
import pako from 'pako';
import LightningFS from '@isomorphic-git/lightning-fs';
import lily from '@jcubic/lily';

import MemoryDB from './MemoryDB.js';

// Browser mocks for lightningFS
import 'fake-indexeddb/auto.js';
global.navigator = {};


// ref: https://gist.github.com/lovasoa/8691344
async function* walk(root, dir = '') {
    const current_dir = path.join(root, dir);
    for await (const d of await fs.opendir(current_dir)) {
        const directory = d.isDirectory();
        const entry = path.join(dir, d.name);
        const name = directory ? entry + '/' : entry;
        yield name;
        if (directory) {
            yield* walk(root, entry);
        }
    }
}

const db = new MemoryDB();
const { promises: lfs } = new LightningFS('fs', { db });

const main = async options => {
    const { d: root, f: output, v: verbose } = options;
    for await (let fpath of walk(root)) {
        if (verbose) {
            console.log(fpath);
        }
        const name = '/' + fpath;
        if (name.endsWith('/')) {
            await lfs.mkdir(name.replace(/\/$/, ''));
        } else {
            const file = await fs.readFile(path.join(root, fpath));
            await lfs.writeFile(name, file);
        }
    }
    await lfs.flush();
    const dump = pako.deflate(JSON.stringify(db.dump()));
    await fs.writeFile(output, dump);
}

const options = lily(process.argv.slice(2));
if (!(options.d && options.f)) {
    console.error('make-image.js -d <directory> -f <output file>');
} else {
    main(options);
}
