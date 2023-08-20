if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    importScripts(location.href.replace(/__fs__.*/, 'kernel.js'));
}
