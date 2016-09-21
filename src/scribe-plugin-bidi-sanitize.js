define(function () {
  'use strict';

  return function () {
    return function (scribe) {

      // Traverse the tree
      function traverse(root) {

        if (!root) return;

        var isSpan = root.nodeName === 'SPAN';
        var hasNextSpan = root.nextSibling !== null && root.nextSibling.nodeName === 'SPAN';

        if (isSpan && hasNextSpan) {
            var current = root;
            var next = current.nextSibling;

            while (next.childNodes.length > 0) {
                current.appendChild(next.childNodes[0]);
            }
            next.parentNode.removeChild(next);
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

});
