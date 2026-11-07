import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

if (!match) {
  console.error('❌ No application/ld+json script found in index.html');
  process.exit(1);
}

try {
  const data = JSON.parse(match[1]);
  console.log('✅ JSON-LD parses successfully as valid JSON.');

  if (data['@context'] !== 'https://schema.org') {
    throw new Error(`Invalid @context: ${data['@context']}`);
  }
  console.log('✅ @context is https://schema.org');

  const graph = data['@graph'];
  if (!Array.isArray(graph)) {
    throw new Error('@graph is not an array');
  }
  console.log(`✅ @graph contains ${graph.length} entities`);

  const types = graph.map((e) => e['@type']);
  console.log('  Entities in graph:', types.join(', '));

  // 1. Check ProfessionalService
  const prof = graph.find((e) => e['@type'] === 'ProfessionalService');
  if (!prof) throw new Error('Missing ProfessionalService entity');
  if (!prof.name || !prof.url || !prof.telephone || !prof.email || !prof.logo) {
    throw new Error('ProfessionalService missing required fields');
  }
  console.log('✅ ProfessionalService entity verified:');
  console.log('   - Name:', prof.name);
  console.log('   - Phone:', prof.telephone);
  console.log('   - AreaServed:', prof.areaServed.map((a) => a.name).join(', '));
  console.log('   - SameAs:', prof.sameAs.join(', '));

  // 2. Check WebSite
  const site = graph.find((e) => e['@type'] === 'WebSite');
  if (!site) throw new Error('Missing WebSite entity');
  console.log('✅ WebSite entity verified (Name: ' + site.name + ', URL: ' + site.url + ')');

  // 3. Check FAQPage
  const faq = graph.find((e) => e['@type'] === 'FAQPage');
  if (!faq) throw new Error('Missing FAQPage entity');
  if (!Array.isArray(faq.mainEntity) || faq.mainEntity.length === 0) {
    throw new Error('FAQPage missing questions in mainEntity');
  }
  console.log(`✅ FAQPage entity verified with ${faq.mainEntity.length} questions:`);
  faq.mainEntity.forEach((q, idx) => {
    console.log(`   ${idx + 1}. Q: ${q.name.substring(0, 35)}...`);
    if (!q.acceptedAnswer || !q.acceptedAnswer.text) {
      throw new Error(`FAQ item ${idx} missing acceptedAnswer`);
    }
  });

  // 4. Verify no Reviews / AggregateRating
  const hasReview = graph.some((e) => e['@type'] === 'Review' || e['@type'] === 'AggregateRating' || e.aggregateRating || e.review);
  if (hasReview) {
    throw new Error('Forbidden Review or AggregateRating found in schema');
  }
  console.log('✅ Verified: No fake Review or AggregateRating in schema.');

  console.log('🎉 Schema Markup validation PASSED with 0 errors!');
} catch (err) {
  console.error('❌ Validation failed:', err.message);
  process.exit(1);
}
