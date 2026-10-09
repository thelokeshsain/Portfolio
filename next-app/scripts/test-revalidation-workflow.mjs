import fs from 'fs';
import mongoose from 'mongoose';
import connectDB from '../src/lib/db.js';
import Article from '../src/models/Article.js';

if (!process.env.MONGODB_URI && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function runTest() {
  console.log('--- TESTING ARTICLE LIFECYCLE & ISOLATION ---');
  await connectDB();

  const TEST_SLUG = `test-verify-propagation-${Date.now()}`;
  let createdArticleId = null;

  try {
    // 1. Create a DRAFT article
    console.log(`1. Creating Draft article with slug: ${TEST_SLUG}...`);
    const draft = await Article.create({
      title: 'Automated Lifecycle Verification Test Article',
      slug: TEST_SLUG,
      dek: 'Draft verification dek for automated test gate.',
      category: 'Technology',
      content: '## Draft Content\nThis should never appear publicly.',
      status: 'draft',
      readingTime: '1 min read',
    });
    createdArticleId = draft._id;

    // Verify draft DOES NOT appear in published queries
    const publishedFound = await Article.findOne({ slug: TEST_SLUG, status: 'published' }).lean();
    if (publishedFound) {
      throw new Error('FAIL: Draft article found in published query!');
    }
    console.log('✓ Draft correctly excluded from public published query.');

    // 2. Publish the article
    console.log('2. Publishing article...');
    draft.status = 'published';
    draft.publishedAt = new Date();
    await draft.save();

    const nowPublished = await Article.findOne({ slug: TEST_SLUG, status: 'published' }).lean();
    if (!nowPublished) {
      throw new Error('FAIL: Published article not found!');
    }
    console.log('✓ Published article is queryable for SSG/public delivery.');

    // 3. Unpublish / Archive the article
    console.log('3. Archiving article...');
    draft.status = 'archived';
    await draft.save();

    const archivedFound = await Article.findOne({ slug: TEST_SLUG, status: 'published' }).lean();
    if (archivedFound) {
      throw new Error('FAIL: Archived article still returned as published!');
    }
    console.log('✓ Archived article immediately excluded from public queries.');

    // 4. Clean up / Delete test article
    console.log('4. Permanently deleting test article...');
    await Article.findByIdAndDelete(createdArticleId);
    const deletedCheck = await Article.findById(createdArticleId);
    if (deletedCheck) {
      throw new Error('FAIL: Test article not deleted!');
    }
    console.log('✓ Test article completely cleaned up from database.');

    console.log('\n✓ ALL LIFECYCLE & ISOLATION GATES PASSED.');
  } catch (err) {
    console.error('Lifecycle test error:', err);
    if (createdArticleId) {
      await Article.findByIdAndDelete(createdArticleId).catch(() => {});
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTest();
