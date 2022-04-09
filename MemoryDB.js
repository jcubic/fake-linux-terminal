
class MemoryDB {
    constructor(data) {
        if (data) {
            this._store = this.load(data);
        } else {
            this._store = new Map();
        }
    }
    saveSuperblock(superblock) {
        this._store.set('!root', superblock);
    }
    loadSuperblock() {
        return this._store.get('!root');
    }
    readFile(inode) {
        return this._store.get(inode);
    }
    writeFile(inode, data) {
        return this._store.set(inode, data);
    }
    unlink(inode) {
        return this._store.delete(inode);
    }
    wipe() {
        this._store = new Map();
    }
    close() { }
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
    load(data) {
        const result = new Map();
        result.set('!root', unserializeSuperBlock(data.superBlock));
        data.inodes.map(([inode, data]) => {
            result.set(inode, Uint8Array.from(data));
        });
        return result;
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

export default MemoryDB;
