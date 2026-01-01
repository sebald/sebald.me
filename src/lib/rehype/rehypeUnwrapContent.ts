import type { Element, Parent, Root } from 'hast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

/**
 * Rehype plugin to remove the wrapping paragraph (`<p>`)
 * for images (`<img>`), pictures (`<picture>`), and figures (`<figure>`).
 * Also removes empty paragraphs that may be created by the parser.
 */
const rehypeUnwrapContent: Plugin<[], Root> = () => {
  return (tree) => {
    visit(
      tree,
      'element',
      (
        node: Element,
        index: number | undefined,
        parent: Parent | undefined,
      ) => {
        if (node.tagName !== 'p') {
          return;
        }

        if (!parent || typeof index !== 'number') {
          return;
        }

        // Check if paragraph is empty or only contains whitespace
        const isEmpty = node.children.every((child) => {
          if (child.type === 'text') {
            return /^\s*$/.test(child.value);
          }
          return false;
        });

        if (isEmpty) {
          // Remove empty paragraphs
          parent.children.splice(index, 1);
          return [SKIP, index];
        }

        const isUnwrappable = node.children.every((child) => {
          // Allow whitespace only text nodes
          if (child.type === 'text') {
            return /^\s*$/.test(child.value);
          }

          if (child.type === 'element') {
            return ['img', 'figure'].includes(child.tagName);
          }

          return false;
        });

        // If the paragraph is unwrappable and has children, perform the unwrap
        if (isUnwrappable && node.children.length > 0) {
          // Filter out whitespace-only text nodes unless there are multiple element children
          const elementChildren = node.children.filter(
            (child) => child.type === 'element',
          );
          const hasMultipleElements = elementChildren.length > 1;

          const childrenToInsert = hasMultipleElements
            ? node.children // Keep whitespace when there are multiple elements
            : elementChildren; // Remove whitespace when there's a single element

          parent.children.splice(index, 1, ...childrenToInsert);
          return [SKIP, index];
        }
      },
    );
  };
};

export default rehypeUnwrapContent;
