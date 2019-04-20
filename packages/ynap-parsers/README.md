# YNAP Parsers

This package contains parsers that can convert banking statements from a variety of
formats into a CSV format that can be imported into
[You Need A Budget](https://youneedabudget.com). If you just want to use those
parsers to convert your banking statements, you can do so using our web app,
[You Need A Parser](https://ynap.leolabs.org).

## Supported Formats

A list of all currently supported formats is available on the
[Supported Formats](https://ynap.leolabs.org/supported-formats) page.

## Contributing

If you want ynap-parsers to support a new format, you have two options:

### 1. [Request a Format](https://github.com/leolabs/you-need-a-parser/issues/new?template=format_request.md)

This is the simplest way if you don't want to implement the parser yourself.
Tell me which format you'd like to see supported and attach an example file if you
have one.

### 2. Submit a Pull Request

Adding a new format is fairly straight-forward. Take a look at one of the
implemented parsers (e.g. [Kontist](https://github.com/leolabs/you-need-a-parser/blob/master/packages/ynap-parsers/src/de/kontist/kontist.ts)). Every parser file basically consists of
two functions: A matcher that checks if a given file is supported and a parser
that converts a given file into one or more arrays of YNAB-supported rows.

Every parser module should be accompanied by a [test suite](https://github.com/leolabs/you-need-a-parser/blob/master/packages/ynap-parsers/src/de/kontist/kontist.spec.ts) to make sure that
it operates correctly.
