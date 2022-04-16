let idb;
const idb_ready = import('https://cdn.jsdelivr.net/npm/@isomorphic-git/idb-keyval@3.3.2/dist/idb-keyval.mjs').then(module => {
    idb = module;
});

// copied from lighting-fs
class IdbBackend {
    constructor(dbname, storename) {
        this._database = dbname;
        this._storename = storename;
        this._ready = idb_ready.then(() => {
            this._store = new idb.Store(this._database, this._storename);
        });
    }
    async saveSuperblock(superblock) {
        await this._ready;
        return idb.set("!root", superblock, this._store);
    }
    async loadSuperblock() {
        await this._ready;
        return idb.get("!root", this._store);
    }
    readFile(inode) {
        return idb.get(inode, this._store)
    }
    writeFile(inode, data) {
        return idb.set(inode, data, this._store)
    }
    unlink(inode) {
        return idb.del(inode, this._store)
    }
    wipe() {
        return idb.clear(this._store)
    }
    close() {
        return idb.close(this._store)
    }
}

class BackendDB {
    constructor(data) {
        if (typeof data === 'string') {
            this._idb = new IdbBackend(data, data + '_files');
        } else if (data) {
            this.load(data);
        } else {
            this._store = new Map();
        }
    }
    saveSuperblock(superblock) {
        if (this._idb) {
            return this._idb.saveSuperblock(superblock);
        }
        this._store.set('!root', superblock);
    }
    loadSuperblock() {
        if (this._idb) {
            return this._idb.loadSuperblock();
        }
        return this._store.get('!root');
    }
    readFile(inode) {
        if (this._idb) {
            return this._idb.readFile(inode);
        }
        return this._store.get(inode);
    }
    writeFile(inode, data) {
        if (this._idb) {
            return this._idb.writeFile(inode, data);
        }
        this._store.set(inode, data);
    }
    unlink(inode) {
        if (this._idb) {
            return this._idb.unlink(inode);
        }
        this._store.delete(inode);
    }
    wipe() {
        if (this._idb) {
            return this._idb.wipe();
        }
        this._store = new Map();
    }
    close() {
        if (this._idb) {
            return this._idb.close();
        }
    }
    dump() {
        const sb = this._store.get('!root');
        const result = {
            superBlock: seralizeSuperBlock(sb),
            inodes: Array.from(this._store.entries()).filter(([key, value]) => {
                return key !== '!root';
            }).map(([key, value]) => {
                return [key, Array.from(value)];
            })
        };
        return result;
    }
    async load(data) {
        await this.wipe();
        await this.saveSuperblock(unserializeSuperBlock(data.superBlock));
        await Promise.all(data.inodes.map(([inode, data]) => {
            return this.writeFile(inode, Uint8Array.from(data));
        }));
    }
    persistent(name) {
        const dump = this.dump();
        this._idb = new IdbBackend(name, name + '_files');
        this.load(dump);
    }
}

function seralizeSuperBlock(sb) {
    const arr = Array.from(sb.entries());

    return arr.map(([key, value]) => {
        if (value instanceof Map) {
            return [key, seralizeSuperBlock(value)];
        }
        return [key, value];
    });
}

function unserializeSuperBlock(arr) {
    return new Map(arr.map(([key, value]) => {
        if (value instanceof Array) {
            return [key, unserializeSuperBlock(value)];
        }
        return [key, value];
    }));
}

export default BackendDB;
