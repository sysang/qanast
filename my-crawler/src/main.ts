import { Dataset, CheerioCrawler, log, LogLevel } from 'crawlee';

import Extractor from './site_extractors/leteemartdalat-vn'

// Crawlers come with various utilities, e.g. for logging.
// Here we use debug level of logging to improve the debugging experience.
// This functionality is optional!
log.setLevel(LogLevel.DEBUG);

async function main(){
  // Create an instance of the CheerioCrawler class - a crawler
  // that automatically loads the URLs and parses their HTML using the cheerio library.
  const crawler = new CheerioCrawler({
      // The crawler downloads and processes the web pages in parallel, with a concurrency
      // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
      // Here we define some hard limits for the concurrency.
      minConcurrency: 10,
      maxConcurrency: 50,

      // On error, retry each page at most once.
      maxRequestRetries: 1,

      // Increase the timeout for processing of each page.
      requestHandlerTimeoutSecs: 30,

      // Limit to 10 requests per one crawl
      // maxRequestsPerCrawl: 10,

      // This function will be called for each URL to crawl.
      // It accepts a single parameter, which is an object with options as:
      // https://crawlee.dev/api/cheerio-crawler/interface/CheerioCrawlerOptions#requestHandler
      // We use for demonstration only 2 of them:
      // - request: an instance of the Request class with information such as the URL that is being crawled and HTTP method
      // - $: the cheerio object containing parsed HTML
      async requestHandler({ request, $, enqueueLinks }) {
          log.debug(`Processing ${request.url}...`);

          const extractor = new Extractor(request, $);
          const data = await extractor.getData()

          // Store the results to the dataset. In local configuration,
          // the data will be stored as JSON files in ./storage/datasets/default
          if (data) {
              await Dataset.pushData(data);
          }

          // Extract links from the current page
          // and add them to the crawling queue.
          await enqueueLinks();
      },

      // This function is called if the page processing failed more than maxRequestRetries + 1 times.
      failedRequestHandler({ request }) {
          log.debug(`Request ${request.url} failed twice.`);
      },
  });

  // Run the crawler and wait for it to finish.
  await crawler.run([
      'https://leteemartdalat.vn',
  ]);

  log.debug('Crawler finished.');
}

main();
