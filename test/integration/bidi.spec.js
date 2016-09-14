var chai = require('chai');
var expect = chai.expect;
var webdriver = require('selenium-webdriver');

var helpers = require('scribe-test-harness/helpers');
var when = helpers.when;
var givenContentOf = helpers.givenContentOf;
var whenInsertingHTMLOf = helpers.whenInsertingHTMLOf;
var executeCommand = helpers.executeCommand;
var initializeScribe = helpers.initializeScribe.bind(null, '../../bower_components/scribe/scribe');

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
afterEach(function() {
  return driver.manage().logs().get( "browser" ).then(function( logsEntries ) {
    logsEntries.forEach(function(item){
      console.log( "LOG LEVEL:", item.level.name, item.message );
    });
  });
});


function queryState(name) {
  return driver.executeScript(function(name) {
    var command = window.scribe.getCommand(name)
    return command.queryState();
  }, name);
}

function queryEnabled(name) {
  return driver.executeScript(function(name) {
    var command = window.scribe.getCommand('bold')
    return command.queryEnabled();
  }, name);
}

function getInnerHTML() {
  return driver.executeScript(function () {
    return window.scribe.getHTML();
  });
};

function click() {
  return driver.executeScript(function () {
    window.document.querySelector('.scribe').click();
  });
};

// function getContent() {
//   return driver.executeScript(function () {
//     return window.scribe.getContent();
//   });
// };

describe('enabled', function () {

  // givenContentOf('<p>1|</p>', function() {
  //   it('should be that the command is disabled', function () {
  //     return queryEnabled('bidi-ltr')
  //       .then(function(isEnabled) {
  //         expect(isEnabled).to.equal(false);
  //       });
  //   });
  // });

  // givenContentOf('<p>|1</p><p>2</p><p>3|</p>', function () {
  //   it('should be that the command is disabled when selection intersects > 1 paragraph', function () {
  //     return queryEnabled('bidi-ltr')
  //       .then(function(isEnabled) {
  //         expect(isEnabled).to.equal(false);
  //       });
  //   });
  // });
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

describe('sanitization', function () {

  beforeEach(function () {
    return driver.executeAsyncScript(function (done) {
      require(['../../src/scribe-plugin-bidi-sanitize.js'], function (sanitize) {
        window.scribe.use(sanitize());
        done();
      });
    });
  });

  beforeEach(function() {
    return scribeNode.sendKeys(2);
  });

  givenContentOf('<p><span dir="ltr"></span></p>', function () {
    it('should delete the empty span', function () {
      return click()
        .then(getInnerHTML)
        .then(function(html) {
          expect(html).not.to.contain('<span>');
        });
    });
  });

  givenContentOf('<p><span dir="ltr"><em class="scribe-marker"><br></span></p>', function () {
    it('should delete new line span', function () {
      return click()
        .then(getInnerHTML)
        .then(function(html) {
          expect(html).not.to.contain('<span>');
        });
    });
  });

  givenContentOf('<p><b><span dir="ltr"></span></b></p>', function () {
    it('should delete span nested in a <b> tag', function () {
      return click()
        .then(getInnerHTML)
        .then(function(html) {
          expect(html).not.to.contain('<span>');
        });
    });
  });

  givenContentOf('<p><span dir="rtl"><span dir="ltr"></span></span></p>', function () {
    it('should delete span nested in a span', function () {
      return click()
        .then(getInnerHTML)
        .then(function(html) {
          expect(html).not.to.contain('<span>');
        });
    });
  });

});
