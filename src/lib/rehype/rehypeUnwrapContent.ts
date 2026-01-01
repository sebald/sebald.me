import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

const WHITESPACE_ONLY = /^\s*$/;
const UNWRAPPABLE_TAGS = ['img', 'figure'];
const UNWRAPPABLE_MDX_COMPONENTS = ['img', 'figure'];

const isWhitespaceOnly = (child: Element['children'][0]): boolean =>
  child.type === 'text' && WHITESPACE_ONLY.test(child.value);

const isUnwrappableElement = (child: Element['children'][0]): boolean =>
  child.type === 'element' && UNWRAPPABLE_TAGS.includes(child.tagName);

const isUnwrappableMdxElement = (child: Element['children'][0]): boolean =>
  'name' in child &&
  typeof child.name === 'string' &&
  UNWRAPPABLE_MDX_COMPONENTS.includes(child.name);

/**
 * Rehype plugin to remove the wrapping paragraph (`<p>`)
 * for images (`<img>`) and figures (`<figure>`).
 *
 * Also removes empty paragraphs and supports MDX JSX elements.
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
        (child) =>
          isWhitespaceOnly(child) ||
          isUnwrappableElement(child) ||
          isUnwrappableMdxElement(child),
      );

      if (!isUnwrappable || children.length === 0) {
        return;
      }

      // Keep whitespace only for multiple element children
      const elementChildren = children.filter(
        (child) =>
          isUnwrappableElement(child) || isUnwrappableMdxElement(child),
      );
      const childrenToInsert =
        elementChildren.length > 1 ? children : elementChildren;

      parent.children.splice(index, 1, ...childrenToInsert);
      return [SKIP, index];
    });
  };
};

export default rehypeUnwrapContent;
