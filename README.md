# Fake-Linux

This project is attempt to recreate Unix like Terminal-based environment.

This is not Emulator, you will not be able to compile and run C++ programs. Instead this is
a model of Unix system (GNU/Linux or MacOS), where things in the system are implemented in JavaScript.

This can be nice way to learn how Unix system works if you read the code. But also you will be able
to play with terminal based Linux in browser.

The system will run completely in Browser, no Backend. It will be based on FileSystem Images.

## TODO

- [x] Create Images for directory
- [x] Add a way to load the image in browser and read the file
- [ ] Create Web Terminal based on [Fake Linux Terminal](https://codepen.io/jcubic/pen/bzYQNw) (use [LighntingFS version](https://codepen.io/jcubic/pen/vYmjMNd))
- [ ] Use [SVG Terminal](https://codepen.io/jcubic/pen/rNYybjr)
- [ ] Work on Some text for the website, add Meta tags, Social Cover Images etc.
- [ ] Modify Web Terminal to use LitningFS and FS Images
- [ ] Create DNS record for fake.terminal.jcubic.pl and GitHub pages
- [ ] Add authentication based on /etc/passwd file and /etc/shadow (using `$1$` and MD5 hash)
- [ ] `[SPIKE]` Persistence of FS (consider save/load buttons - copy to indexedDB)
- [ ] Try to add autologin button that will change hash, so you can refresh the page
- [ ] Implement executable files that will be JavaScript scripts that will run in Web Workers
- [ ] Add stdin/stdout/stderr PIPES to Web Worker API
- [ ] Add way to see the source code of the code (to remove AGPL compliance burden)
- [ ] Implement Bash.js interpreter using [bash-parser](https://www.npmjs.com/package/bash-parser)
- [ ] Try to make Bash.js part of the Image
- [ ] Add env variables e.g. `$PATH`
- [ ] `[SPIKE]` ESModules with Service Worker inside Web Worker executable
  - [ ] Shared libraries as ESModules
- [ ] Bash Commands
  - [ ] `cd`
  - [ ] `read`
  - [ ] `echo`
  - [ ] `pwd`
  - [ ] `popd`
  - [ ] `pushd`
  - [ ] `printf`
  - [ ] `logout`
  - [ ] `test`
  - [ ] `source`
  - [ ] `true`
  - [ ] `false`
  - [ ] `alias`
  - [ ] `help`
- [ ] Filestem
  - [ ] `/usr/bin/ls`
  - [ ] `/usr/bin/cat`
  - [ ] `/usr/bin/zip
  - [ ] `/usr/bin/grep`
  - [ ] `/usr/bin/xargs`
  - [ ] `/usr/bin/head`
  - [ ] `/usr/bin/tail`
  - [ ] `/usr/bin/mkdir`
  - [ ] `/usr/bin/rmdir`
  - [ ] `/usr/bin/mv`
  - [ ] `/usr/bin/rm`
  - [ ] `/usr/bin/less`
  - [ ] `/usr/bin/figlet`
  - [ ] `/usr/bin/download`
  - [ ] `/etc/motd`
  - [ ] `~/.bashrc`

## License

```
    Copyright (C) 2022 Jakub T. Jankiewicz <https://jcubic.pl/me>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
```
