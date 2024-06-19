JS := $(wildcard *.js)

po/en.pot: $(JS)
	xgettext --from-code=UTF-8 --output=$@ $<
