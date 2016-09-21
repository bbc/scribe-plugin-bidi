define(function () {
    'use strict';

    function deleteSpans(elem, scribe) {
        // Traverse the tree
        function traverse(root) {
            if (!root) return;
            if (root.nodeName === 'SPAN') {
                var parent = root.parentNode;
                scribe.element.unwrap(parent, root);
                traverse(parent);
                return;
            }
            for (var i = 0; i < root.children.length; i++) {
                var child = root.children[i];
                traverse(child);
            }
        }
        return traverse(elem);
    }

    return function () {
        return function (scribe) {

            var ltrCommand = new scribe.api.SimpleCommand('bidi-ltr', 'BIDI-LTR');
            scribe.commands['bidi-ltr'] = ltrCommand;

            ltrCommand.execute = function () {
                scribe.transactionManager.run(function() {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    var selectedHtmlDocumentFragment = range.cloneContents();

                    var ancestorSpan = selection.getContaining(function (node) { return node.nodeName === 'SPAN'; });
                    if(ancestorSpan) {
                        var parent = ancestorSpan.parentNode;
                        scribe.element.unwrap(parent, ancestorSpan);
                    } else {
                        var spanElement = document.createElement('span');
                        selectedHtmlDocumentFragment = range.extractContents();
                        deleteSpans(selectedHtmlDocumentFragment, scribe);
                        spanElement.appendChild(selectedHtmlDocumentFragment);
                        spanElement.setAttribute('dir', 'ltr');
                        spanElement.setAttribute('lang', 'en-gb');
                        range.insertNode(spanElement);
                        range.selectNode(spanElement);
                        selection.selection.removeAllRanges();
                        selection.selection.addRange(range);
                    }
                });
            };
            ltrCommand.queryState = function() {
                // active if and only if there is an ancestor span
                // with a dir attribute that matches `dir` and a lang of 'en-gb'
                var selection = new scribe.api.Selection();
                var ancestorDirSpan = selection.getContaining(function (node) {
                    return node.nodeName === 'SPAN' && node.hasAttribute('dir');
                });
                if (ancestorDirSpan === null || ancestorDirSpan === undefined) {
                    return false;
                } else {
                    return ancestorDirSpan.getAttribute('dir') === 'ltr';
                }
            };
            ltrCommand.queryEnabled = function() {
                var selection = new scribe.api.Selection();
                var range = selection.range;
                // disable bidi if the selection intersects more than one paragraph
                var paragraph = selection.getContaining(function (element) {
                    return element.nodeName === 'P' || element.nodeName === 'LI'
                });
                var ancestorSpan = selection.getContaining(function (node) {
                    return node.nodeName === 'SPAN';
                });
                var disabled = range && (range.collapsed && !ancestorSpan) || !paragraph;
                return !disabled;
            };

        };
    };
});
