import assert from 'node:assert/strict';
import test from 'node:test';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

import rehypeUnwrapContent from './rehypeUnwrapContent';

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeUnwrapContent)
  .use(rehypeStringify);

test('rehypeUnwrapContent', async (t) => {
  t.test('should unwrap images', async () => {
    const file = await processor.process(
      '<p><img src="image.jpg" alt="An image" /></p>',
    );
    assert.equal(String(file), '<img src="image.jpg" alt="An image">');
  });

  t.test('should unwrap multiple images, w/ whitespace', async () => {
    const file = await processor.process(
      '<p>  <img src="image1.jpg" alt="Image 1" />\n<img src="image2.jpg" alt="Image 2" />  </p>',
    );
    assert.equal(
      String(file),
      '  <img src="image1.jpg" alt="Image 1">\n<img src="image2.jpg" alt="Image 2">  ',
    );
  });

  t.test('should unwrap figures', async () => {
    const file = await processor.process(
      '<p><figure><img src="figure.jpg" alt="A figure" /></figure></p>',
    );
    assert.equal(
      String(file),
      '<figure><img src="figure.jpg" alt="A figure"></figure>',
    );
  });

  t.test('should not unwrap paragraphs with mixed content', async () => {
    const file = await processor.process(
      '<p>This is a paragraph with an <img src="image.jpg" alt="An image" /></p>',
    );
    assert.equal(
      String(file),
      '<p>This is a paragraph with an <img src="image.jpg" alt="An image"></p>',
    );
  });

  t.test(
    'should not unwrap paragraphs without images, figures, or pictures',
    async () => {
      const file = await processor.process(
        '<p>This is a simple paragraph.</p>',
      );
      assert.equal(String(file), '<p>This is a simple paragraph.</p>');
    },
  );
});
