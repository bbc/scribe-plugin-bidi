var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');

var initializeScribe = helpers.initializeScribe.bind(null, '../../bower_components/scribe/src/scribe');

function loadPlugin() {
  return driver.executeAsyncScript(function (done) {
    require(['../../src/scribe-plugin-bidi'], function (plugin) {
      window.scribe.use(plugin());
      done();
    });
  });
}

// for each scenario a new instance is created
// use before hooks to update references to point to the new instance
var driver;
var scribeNode;
before(function () {
  driver = helpers.driver;
});
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});

describe('bidi plugin', function () {
  it('should do something', function() {
    console.log(scribeNode);
    expect(1).to.equal(1);
  });
});
