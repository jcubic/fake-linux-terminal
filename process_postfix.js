importScripts(location.href.replace(/__fs__.*/, 'kernel.js'));

modules.term.resume().then(() => {
  return main();
}).then(code => {
  self.postMessage({exit: code});
  self.close();
});