# scribe-plugin-bidi

A scribe plugin for adding [bidirectional markup](https://www.w3.org/International/articles/inline-bidi-markup/#quick).
Allows users to tightly wrap [opposite-direction phrases](https://www.w3.org/International/articles/inline-bidi-markup/#oppositedirection) to correct the Unicode Bidirectional Algorithm when it goes wrong.

Adds two scribe commands: `ltr-bidi` and `rtr-bidi` which surround a text selection with `<span dir="ltr"></span>` and `<span dir="rtl"></span>` respectively.

See also:
- [Unicode Bidirectional Algorithm Basics](https://www.w3.org/International/articles/inline-bidi-markup/uba-basics)
- [Examples for correct markup of opposite-direction phrases](https://www.w3.org/International/articles/inline-bidi-markup/#staticexamples)

## Installation

```bash
bower install scribe-plugin-bidi
```

scribe-plugin-bidi is an AMD module:
```javascript
require(['scribe', 'scribe-plugin-bidi', 'scribe-plugin-bidi-sanitize'], function (Scribe, plugin, sanitize) {
  var scribeElement = document.querySelector('.scribe');
  var scribe = new Scribe(scribeElement);
  scribe.use(plugin());
  scribe.use(sanitize());
});
```

## Running Tests

To **setup the environment**, [`scribe-test-harness`](https://github.com/guardian/scribe-test-harness) requires:

1. Usage of node v0.12.7 (newer versions will fail because execsync was removed from Node)
2. Adding [`chromedriver` executable](https://sites.google.com/a/chromium.org/chromedriver/downloads) to your `$PATH`.

    ```
    # Download chromedriver executable from website
    # mkdir ~/Documents/Executables
    # cp chromedriver ~/Documents/Executables
  PATH=$PATH:~/Documents/Executables
    ```
3. Downloading dependencies (including selenium webdriver) via `npm run setup`


To **run the tests**:
```
npm run test
```
