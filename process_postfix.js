function require(module) {
  return modules[module];
}

function exit(code) {
  self.postMessage({exit: code});
  self.close();
}

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    main().then(exit).catch(error => {
        modules.term.error(error);
        exit(100);
    });
    modules.term.resume();
}
