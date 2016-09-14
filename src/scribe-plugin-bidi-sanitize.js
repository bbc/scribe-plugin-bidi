define(function () {
  'use strict';

  return function () {
    return function (scribe) {

      // Traverse the tree
      function traverse(root) {

        // remove empty spans
        if (!root) return;

        if (root.nodeName === 'SPAN' && (root.getAttribute('dir') === 'ltr' || root.getAttribute('dir') === 'rtl')) {
          var empty = scribe.element.isEmptyInlineElement(root);
          // detect when a new paragraphs has just been added,
          // html is equivalent to: "<p><em class="scribe-marker"><br></p>"
          // remove span[dir] from this newly added paragraph
          var newEmptyLine = root.firstChild && root.lastChild
            && scribe.element.isSelectionMarkerNode(root.firstChild) && root.lastChild.nodeName === 'BR';

          if (empty || newEmptyLine) {
            var parent = root.parentNode;
            scribe.element.removeNode(root);
            traverse(parent);
            return;
          }
        }

        for (var i = 0; i < root.children.length; i++) {
          var child = root.children[i];
          traverse(child);
        }
      }

      scribe.registerHTMLFormatter('sanitize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;
        traverse(bin);
        return bin.innerHTML;
      });
    };
  };

})
;
