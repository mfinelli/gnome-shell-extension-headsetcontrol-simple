CSS := $(wildcard *.css)
JS := $(wildcard *.js)
PO := $(wildcard po/*.po po/*.pot)
XML := $(wildcard schemas/*.xml)

ZIP := headsetcontrol-simple@finelli.dev.shell-extension.zip

all: $(ZIP)

clean:
	rm -rf $(ZIP) schemas/gschemas.compiled

$(ZIP): $(CSS) $(JS) metadata.json $(PO) schemas/gschemas.compiled
	gnome-extensions pack --podir=po .

po/en.pot: $(JS)
	xgettext --from-code=UTF-8 --output=$@ $<

schemas/gschemas.compiled: $(XML)
	glib-compile-schemas schemas/

.PHONY: all clean
