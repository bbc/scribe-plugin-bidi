define(function () {

  'use strict';

  return function () {
    return function (scribe) {

      function bidiExecute(dir) {
        var spanElement = document.createElement('span');
        spanElement.setAttribute('dir', dir);

        var selection = new scribe.api.Selection();
        var range = selection.range;

        var selectedHtmlDocumentFragment = range.extractContents();
        spanElement.appendChild(selectedHtmlDocumentFragment);
        range.insertNode(spanElement);
        range.selectNode(spanElement);

        selection.selection.removeAllRanges();
        selection.selection.addRange(range);
      }

      function queryState(dir) {
        return function() {
          // active iff there exists span with a dir attribute that matches `dir`
          var selection = new scribe.api.Selection();
          var ancestorDirSpan = selection.getContaining(function (node) {
            return node.nodeName === 'SPAN' && node.hasAttribute('dir');
          });
          return ancestorDirSpan && (ancestorDirSpan.getAttribute('dir') === dir);
        }
      }

      function queryEnabled() {
        var selection = new scribe.api.Selection();
        var range = selection.range;

        // disable bidi if the selection intersects more than one paragraph
        var paragraph = selection.getContaining(function (element) {
          return element.nodeName === 'P' || element.nodeName === 'LI'
        });
        return range && (range.collapsed === false) && paragraph;
      }

      var ltrCommand = new scribe.api.SimpleCommand('bidi-ltr', 'BIDI-LTR');
      var rtlCommand = new scribe.api.SimpleCommand('bidi-rtl', 'BIDI-RTL');
      ltrCommand.execute = function () { scribe.transactionManager.run(bidiExecute('ltr')); };
      rtlCommand.execute = function () { scribe.transactionManager.run(bidiExecute('rtl')); };

      ltrCommand.queryState = queryState('ltr');
      rtlCommand.queryState = queryState('rtl');

      ltrCommand.queryEnabled = queryEnabled;
      rtlCommand.queryEnabled = queryEnabled;

      scribe.commands['bidi-ltr'] = ltrCommand;
      scribe.commands['bidi-rtl'] = rtlCommand;
    };
  };
});
