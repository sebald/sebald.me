import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

const WHITESPACE_ONLY = /^\s*$/;
const UNWRAPPABLE_TAGS = ['img', 'figure'];

const isWhitespaceOnly = (child: Element['children'][0]): boolean =>
  child.type === 'text' && WHITESPACE_ONLY.test(child.value);

const isUnwrappableElement = (child: Element['children'][0]): boolean =>
  child.type === 'element' && UNWRAPPABLE_TAGS.includes(child.tagName);

/**
 * Rehype plugin to remove the wrapping paragraph (`<p>`)
 * for images (`<img>`) and figures (`<figure>`).
 *
 * Also removes empty paragraphs that may be created by the parser.
 */
const rehypeUnwrapContent: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'p' || !parent || typeof index !== 'number') {
        return;
      }

      const { children } = node as Element;

      // Remove empty paragraphs
      if (children.every(isWhitespaceOnly)) {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }

      // Check if paragraph contains only unwrappable elements and whitespace
      const isUnwrappable = children.every(
        (child) => isWhitespaceOnly(child) || isUnwrappableElement(child),
      );

      if (!isUnwrappable || children.length === 0) {
        return;
      }

      // Keep whitespace only for multiple element children
      const elementChildren = children.filter(isUnwrappableElement);
      const childrenToInsert =
        elementChildren.length > 1 ? children : elementChildren;

      parent.children.splice(index, 1, ...childrenToInsert);
      return [SKIP, index];
    });
  };
};

export default rehypeUnwrapContent;
