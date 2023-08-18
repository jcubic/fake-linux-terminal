function require(module) {
  return modules[module];
}

function exit(code) {
  self.postMessage({exit: code});
  self.close();
}

main().then(exit).catch(error => {
  modules.term.error(error);
  exit(100);
});

modules.term.resume();
