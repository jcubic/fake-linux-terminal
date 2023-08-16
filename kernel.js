const bs = new BroadcastChannel('rpc');

let rprc_id = 0;

const modules = new Proxy({}, {
    get(target, namespace) {
        return new Proxy({}, {
            get(target, name) {
                return (...args) => {
                    return new Promise((resolve, reject) => {
                        const id = ++rprc_id;
                        const method = name;
                        bs.addEventListener('message', function handler({data}) {
                            if (data.id === id) {
                                if (data.error) {
                                    reject(data.error);
                                } else {
                                    resolve(data.result);
                                }
                                bs.removeEventListener('message', handler);
                            }
                        });
                        bs.postMessage({
                            id,
                            namespace,
                            method,
                            args
                        });
                    });
                };
            }
        });
    }
});

let handler_id = 0;
const handlers = {};

function open(filename) {
    return new Promise((resolve, reject) => {
        fs.stat(filename).then(() => {
            const id = ++handler_id;
            handlers[id] = filename;
            resolve(id);
        }).catch(err => {
            reject(err);
        });
    });
}

const kernel_bs = new BroadcastChannel('rpc');

const kernel = {
    exec(program) {
        return fs.readFile(program).then(code => {
            eval(code);
        });
    }
};
