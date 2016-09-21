var chai = require('chai');
var expect = chai.expect;
var webdriver = require('selenium-webdriver');

var helpers = require('scribe-test-harness/helpers');
var when = helpers.when;
var givenContentOf = helpers.givenContentOf;
var executeCommand = helpers.executeCommand;

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
    var command = window.scribe.getCommand(name);
    return command.queryState();
  }, name);
}

function queryEnabled(name) {
  return driver.executeScript(function(name) {
    var command = window.scribe.getCommand(name);
    return command.queryEnabled();
  }, name);
}

function getInnerHTML() {
  return driver.executeScript(function () {
    return window.scribe.getHTML();
  });
}

function click() {
  return driver.executeScript(function () {
    window.document.querySelector('.scribe').click();
  });
}

 describe('enabled', function () {

   givenContentOf('<p>1|</p>', function() {
     it('should be that the command is disabled', function () {
       return queryEnabled('bidi-ltr')
         .then(function(isEnabled) {
           expect(isEnabled).to.equal(false);
         });
     });
   });

   givenContentOf('<p>|1|</p>', function() {
     it('should be that the command is enabled', function () {
       return queryEnabled('bidi-ltr')
           .then(function(isEnabled) {
             expect(isEnabled).to.equal(true);
           });
     });
   });

   givenContentOf('<p><span dir="ltr" lang="eb-gb">|1|</span></p>', function() {
     it('should be that the command is enabled', function () {
       return queryEnabled('bidi-ltr')
           .then(function(isEnabled) {
             expect(isEnabled).to.equal(true);
           });
     });
   });

   givenContentOf('<p>|<span dir="ltr" lang="eb-gb">1</span>|</p>', function() {
     it('should be that the command is enabled', function () {
       return queryEnabled('bidi-ltr')
           .then(function(isEnabled) {
             expect(isEnabled).to.equal(true);
           });
     });
   });

   givenContentOf('<p>|1</p><p>2</p><p>3|</p>', function () {
     it('should be that the command is disabled when selection intersects > 1 paragraph', function () {
       return queryEnabled('bidi-ltr')
         .then(function(isEnabled) {
           expect(isEnabled).to.equal(false);
         });
     });
   });
 });


describe('active', function () {

  givenContentOf('<p><span dir="ltr">1|</span></p>', function () {
    it('should be active when there is an ancestor span', function () {
      return queryState('bidi-ltr')
        .then(function(isActive) {
          expect(isActive).to.equal(true);
        });
    });
  });

  givenContentOf('<p>foo|</p>', function () {
    it('should be inactive when there not an ancestor span', function () {
      return queryState('bidi-ltr')
          .then(function(isActive) {
            expect(isActive).to.equal(false);
          });
    });
  });

});

describe('wrapping', function () {

  givenContentOf('<p>|foo|</p>', function () {
    it('should wrap plain-text selection with span', function () {
      return executeCommand('bidi-ltr')
        .then(function() { return getInnerHTML(); })
        .then(function(html) {
          expect(html).to.equal('<p><span dir="ltr" lang="en-gb">foo</span></p>');
        });
    });
  });

  givenContentOf('<p><span dir="ltr" lang="en-gb">f|oo</span></p>', function () {
    it('should delete the ancestor span', function () {
      return executeCommand('bidi-ltr')
          .then(function() { return getInnerHTML(); })
          .then(function(html) {
            expect(html).to.equal('<p>foo</p>');
          });
    });
  });

  givenContentOf('<p><span dir="ltr" lang="en-gb">f|o|o</span></p>', function () {
    it('should delete the ancestor span', function () {
      return executeCommand('bidi-ltr')
          .then(function() { return getInnerHTML(); })
          .then(function(html) {
            expect(html).to.equal('<p>foo</p>');
          });
    });
  });

  givenContentOf('<p><span dir="ltr" lang="en-gb">f|oo</span>bar|</p>', function () {
    it('should delete the ancestor span', function () {
      return executeCommand('bidi-ltr')
          .then(function() { return getInnerHTML(); })
          .then(function(html) {
            expect(html).to.equal('<p><span dir="ltr" lang="en-gb">f</span><span dir="ltr" lang="en-gb">oobar</span></p>');
          });
    });
  });

  givenContentOf('<p>hello |<span dir="ltr" lang="en-gb">A</span>B<span dir="ltr" lang="en-gb">C</span>| world</p>', function () {
    it('should delete the ancestor span', function () {
      return executeCommand('bidi-ltr')
          .then(function() { return getInnerHTML(); })
          .then(function(html) {
            expect(html).to.equal('<p>hello <span dir="ltr" lang="en-gb"></span><span dir="ltr" lang="en-gb">ABC</span><span dir="ltr" lang="en-gb"></span> world</p>');
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

  givenContentOf('<p><span dir="ltr">foo</span><span dir="ltr">bar</span></p>', function () {
    it('should merge two adjacent spans', function () {
      return click()
          .then(getInnerHTML)
          .then(function (html) {
            expect(html).to.contain('<span dir="ltr">foobar</span>');
          });
    });
  });

  givenContentOf('<p><span dir="ltr">foo</span> <span dir="ltr">bar</span></p>', function () {
    it('should not merge two spans separated by a space', function () {
      return click()
          .then(getInnerHTML)
          .then(function(html) {
            expect(html).not.to.contain('foobar');
          });
    });
  });

  givenContentOf('<p><span dir="ltr">foo</span><span dir="ltr">bar</span><span dir="ltr">baz</span></p>', function () {
    it('should merge three adjacent spans', function () {
      return click()
          .then(getInnerHTML)
          .then(function (html) {
            expect(html).to.contain('<span dir="ltr">foobarbaz</span>');
          });
    });
  });

  givenContentOf('<p><span dir="ltr">foo</span><span dir="ltr"><b>bar</b></span></p>', function () {
    it('should merge a span with a span containing bold text', function () {
      return click()
          .then(getInnerHTML)
          .then(function (html) {
            expect(html).to.contain('<span dir="ltr">foo<b>bar</b></span>');
          });
    });
  });

});
