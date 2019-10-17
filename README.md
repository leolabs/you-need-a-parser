# You Need A Parser

[![codecov](https://codecov.io/gh/leolabs/you-need-a-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/leolabs/you-need-a-parser)

[Web App](https://ynap.leolabs.org) | [Supported Formats](https://ynap.leolabs.org/supported-formats/) | [Suggest a Format](https://github.com/leolabs/you-need-a-parser/issues/new?template=format_request.md)

YNAP is a web app that converts CSV files from a variety of sources into a format
that can easily be imported into [You Need A Budget](https://youneedabudget.com).
Just drag the files you want to convert into this window. As the conversion happens
entirely in JS, your files will never leave your browser.

This repository consists of three packages:

### [ynap-parsers](https://github.com/leolabs/you-need-a-parser/tree/master/packages/ynap-parsers)

This package contains all parsers for different formats. If you want to implement a
new parser, this is the way to go. This package is also available on NPM if you want
to use it in your own projects.

### [ynap-web-app](https://github.com/leolabs/you-need-a-parser/tree/master/packages/ynap-web-app)

This is the web frontend you see at [ynap.leolabs.org](https://ynap.leolabs.org).

### [ynap-bank2ynab-converter](https://github.com/leolabs/you-need-a-parser/tree/master/packages/ynap-bank2ynab-converter)

This tool fetches the current configuration file from [bank2ynab](https://github.com/bank2ynab/bank2ynab)
and converts it to a JSON file that can be read by ynap-parsers. This allows
ynap-parsers to support most of the banks supported by bank2ynab.

## Contributing

If you want to improve YNAP, feel free to submit an issue or open a pull request.

## License

This repo and all included packages are licensed under the
[MIT License](https://choosealicense.com/licenses/mit/).

If you use any of the packages in this repo in your project, a mention or link
to this repo would be nice but is not required.
