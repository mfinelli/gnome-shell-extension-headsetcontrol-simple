JS := $(wildcard *.js)
XML := $(wildcard schemas/*.xml)

all:
	echo TODO

clean:
	rm -rf schemas/gschemas.compiled

po/en.pot: $(JS)
	xgettext --from-code=UTF-8 --output=$@ $<

schemas/gschemas.compiled: $(XML)
	glib-compile-schemas schemas/

.PHONY: all clean
