var chai = require('chai');
var expect = chai.expect;

var webdriver = require('selenium-webdriver');

var helpers = require('scribe-test-harness/helpers');
var givenContentOf = helpers.givenContentOf;
var executeCommand = helpers.executeCommand;
var initializeScribe = helpers.initializeScribe.bind(null, '../../bower_components/scribe/scribe');
var when = helpers.when;

// for each scenario a new instance is created
// use before hooks to update references to point to the new instance
var driver;
var scribeNode;
beforeEach(function() {
  return driver.executeAsyncScript(setupTest);
  function setupTest(done) {
    require({
      paths: {
        'scribe': '../../bower_components/scribe/scribe',
        'scribe-plugin-bidi': '../../src/scribe-plugin-bidi'
      }
    }, ['scribe', 'scribe-plugin-bidi'], function (Scribe, plugin) {
      try {
        window.scribe = new Scribe(window.document.querySelector('.scribe'), {});
        window.scribe.use(plugin());
        done();
      } catch (e) {
        done(e.toString());
      }
    });
  }
});
before(function () { driver = helpers.driver; });
beforeEach(function () { scribeNode = helpers.scribeNode; });

function queryState(name) {
  return driver.executeScript(function(name) {
    var command = window.scribe.getCommand(name)
    return command.queryState();
  }, name);
}

function queryEnabled(name) {
  return driver.executeScript(function(name) {
    var command = window.scribe.getCommand(name)
    return command.queryEnabled();
  }, name);
}

function getInnerHTML() {
  return driver.executeScript(function () {
    return window.scribe.getHTML();
  });
};

// function getContent() {
//   return driver.executeScript(function () {
//     return window.scribe.getContent();
//   });
// };


describe('enabled', function () {
  givenContentOf('<p>1|</p>', function () {
    it('should be that the command is disabled', function () {
      return queryEnabled('bidi-ltr')
        .then(function(isEnabled) {
          expect(isEnabled).to.equal(false);
        });
    });
  });
});


describe('active', function () {

  givenContentOf('<p><span dir="ltr">1|</span></p>', function () {
    it('should be that the state is active when there is an ancestor ltr span', function () {
      return queryState('bidi-ltr')
        .then(function(isActive) {
          expect(isActive).to.equal(true);
        });
    });
  });

});

describe('wrapping', function () {

  givenContentOf('<p><span dir="ltr">|1|</span></p>', function () {
    it('should wrap plain-text selection with SPAN[dir="ltr"]', function () {
      return executeCommand('bidi-ltr')
        .then(function() { return getInnerHTML(); })
        .then(function(html) {
          expect(html).to.equal('<p><span dir="ltr"><span dir="ltr">1</span></span></p>');
        });
    });
  });

  givenContentOf('<p>|1|</p>', function () {
    it('should wrap directed with SPAN[dir="ltr"]', function () {
      return executeCommand('bidi-ltr')
        .then(function() { return getInnerHTML(); })
        .then(function(html) {
          expect(html).to.equal('<p><span dir="ltr">1</span></p>');
        });
    });
  });

});
