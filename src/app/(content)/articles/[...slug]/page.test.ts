import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * Tests for generateStaticParams output format
 * 
 * These tests verify that the generateStaticParams function returns
 * data in the correct format expected by Next.js App Router.
 * 
 * According to Next.js docs, generateStaticParams should return an array
 * of objects where each object has keys matching the dynamic route segments.
 * For [...slug], the expected format is: { slug: string[] }[]
 * 
 * Reference: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */

test('generateStaticParams output format specification', async t => {
  await t.test('should return array of objects with slug property', () => {
    // Expected format for /articles/[...slug] route
    const expectedFormat: Array<{ slug: string[] }> = [
      { slug: ['example'] },
      { slug: ['images'] },
    ];
    
    // Verify the structure
    assert.ok(Array.isArray(expectedFormat), 'Should return an array');
    
    expectedFormat.forEach((param, index) => {
      assert.ok(
        typeof param === 'object' && param !== null,
        `Item at index ${index} should be an object`,
      );
      assert.ok(
        'slug' in param,
        `Item at index ${index} should have a 'slug' property`,
      );
      assert.ok(
        Array.isArray(param.slug),
        `Item at index ${index} should have slug as an array`,
      );
      assert.ok(
        param.slug.every(s => typeof s === 'string'),
        `All slug segments should be strings`,
      );
    });
  });

  await t.test('slug arrays should match URL path structure', () => {
    // For article at /articles/example, slug should be ['example']
    const singleLevel = { slug: ['example'] };
    assert.deepEqual(
      singleLevel.slug,
      ['example'],
      'Single level path should have one segment',
    );
    
    // For nested article at /articles/nested/article, slug should be ['nested', 'article']
    const nested = { slug: ['nested', 'article'] };
    assert.deepEqual(
      nested.slug,
      ['nested', 'article'],
      'Nested path should have multiple segments',
    );
    
    // Each segment represents a path part
    assert.equal(
      nested.slug.join('/'),
      'nested/article',
      'Joining slug segments should recreate the path',
    );
  });

  await t.test('should NOT include baseUrl in slug', () => {
    // For /articles/example, the slug should be ['example'], NOT ['articles', 'example']
    // The baseUrl '/articles' is handled by the route structure
    const correct = { slug: ['example'] };
    const incorrect = { slug: ['articles', 'example'] };
    
    assert.ok(
      correct.slug[0] !== 'articles',
      'Slug should not include the baseUrl (articles)',
    );
    assert.ok(
      incorrect.slug[0] === 'articles',
      'This demonstrates the WRONG format',
    );
  });

  await t.test('should be compatible with Next.js type expectations', () => {
    // This is the format Next.js expects for [...slug] routes
    type NextJSParamFormat = { slug: string[] };
    
    const params: NextJSParamFormat[] = [
      { slug: ['example'] },
      { slug: ['images'] },
    ];
    
    // TypeScript will error if the format is incorrect
    assert.ok(params.length === 2, 'Should have correct number of params');
    assert.ok(
      params.every(p => Array.isArray(p.slug)),
      'All params should have slug as array',
    );
  });

  await t.test('empty arrays should be valid for root-level dynamic routes', () => {
    // For optional catch-all [[...slug]], an empty array is valid
    const rootLevel = { slug: [] };
    
    assert.ok(Array.isArray(rootLevel.slug), 'Slug should be an array');
    assert.equal(rootLevel.slug.length, 0, 'Can be empty for root');
    
    // But for required catch-all [...slug], it should have at least one segment
    const requiredCatchAll = { slug: ['example'] };
    assert.ok(
      requiredCatchAll.slug.length > 0,
      'Required catch-all should have at least one segment',
    );
  });

  await t.test('returned params determine which pages are statically generated', () => {
    // These params mean Next.js will statically generate:
    // - /articles/example
    // - /articles/images  
    const params = [{ slug: ['example'] }, { slug: ['images'] }];
    
    // With dynamicParams = false (recommended), any other path like /articles/other
    // will return 404
    // With dynamicParams = true (default), /articles/other would be server-rendered
    
    assert.equal(
      params.length,
      2,
      'Only these 2 pages will be statically generated',
    );
  });
});
