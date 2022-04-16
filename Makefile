SHELL=/bin/bash
CP=cp
TEST=test

all: build

image.z:
	./make-image.js -d ./root -f image.z

build: image.z
	$(TEST) -d dist || mkdir ./dist
	$(CP) ./index.{html,js} ./dist
	$(CP) ./MemoryDB.js ./dist
	$(CP) ./image.z ./dist
