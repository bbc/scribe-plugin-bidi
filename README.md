# scribe-plugin-bibi





### Running Tests

For **setting up the environment**, [`scribe-test-harness`](https://github.com/guardian/scribe-test-harness) requires:

1. Usage of node v0.12.7 (newer versions will fail because execsync was removed from Node)
2. Adding [`chromedriver` executable](https://sites.google.com/a/chromium.org/chromedriver/downloads) to your `$PATH$`.

    ```
    # Download chromedriver executable from website
    # mkdir ~/Documents/Executables
    # cp chromedriver ~/Documents/Executables
  PATH=$PATH:~/Documents/Executables
    ```

3. A saucelabs account with `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` env variables set

To **run the tests**.
```
npm run test
```
