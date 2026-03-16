const url = 'https://dsviz.app/';
const strategies = ['mobile', 'desktop'];

async function run() {
  for (const strategy of strategies) {
    console.log(`\n=== ${strategy.toUpperCase()} METRICS ===`);
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      
      if (data.lighthouseResult) {
        const categories = data.lighthouseResult.categories;
        console.log(`Performance Score: ${Math.round(categories.performance.score * 100)} / 100`);
        
        const metrics = data.lighthouseResult.audits['metrics'].details.items[0];
        console.log(`First Contentful Paint (FCP): ${metrics.firstContentfulPaint} ms`);
        console.log(`Largest Contentful Paint (LCP): ${metrics.largestContentfulPaint} ms`);
        console.log(`Total Blocking Time (TBT): ${metrics.totalBlockingTime} ms`);
        console.log(`Cumulative Layout Shift (CLS): ${data.lighthouseResult.audits['cumulative-layout-shift'].displayValue}`);
        
        console.log('\nTop Opportunities (Time Savings):');
        const audits = data.lighthouseResult.audits;
        const opportunities = Object.values(audits)
          .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.details.overallSavingsMs > 0)
          .sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs)
          .slice(0, 5);
          
        opportunities.forEach(opp => {
          console.log(`- ${opp.title}: Saves ~${Math.round(opp.details.overallSavingsMs)}ms`);
        });
      } else {
        console.log("Error fetching data", data);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
run();
