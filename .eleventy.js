const rssPlugin = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const fs = require('fs');

// Import filters
const dateFilter = require('./src/filters/date-filter');
const markdownFilter = require('./src/filters/markdown-filter');
const w3DateFilter = require('./src/filters/w3-date-filter');

// Import shortcodes
const youtube = require('./src/shortcodes/youtube');

// Import transforms
const htmlMinTransform = require('./src/transforms/html-min-transform');
const parseTransform = require('./src/transforms/parse-transform');
const {purifyCss} = require('./src/transforms/purify-css');

// Import data files
const site = require('./src/_data/site.json');

module.exports = function(eleventyConfig) {
  // Filters
  eleventyConfig.addFilter('dateFilter', dateFilter);
  eleventyConfig.addFilter('markdownFilter', markdownFilter);
  eleventyConfig.addFilter('w3DateFilter', w3DateFilter);

  // Shortcodes
  eleventyConfig.addShortcode('youtube', youtube);

  // Layout aliases
  eleventyConfig.addLayoutAlias('home', 'layouts/home.njk');

  // Transforms
  eleventyConfig.addTransform('parse', parseTransform);
  if (process.env.NODE_ENV === 'production') {
    eleventyConfig.addTransform('purifyCss', purifyCss);
    eleventyConfig.addTransform('htmlmin', htmlMinTransform);
  }

  // Passthrough copy
  eleventyConfig.addPassthroughCopy('src/fonts');
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/admin/config.yml');

  const now = new Date();

  // Custom collections
  eleventyConfig.addCollection('posts', collection => {
    return collection.getFilteredByGlob('./src/posts/*.md').reverse();
  });

  eleventyConfig.addCollection('postFeed', collection => {
    return collection
      .getFilteredByGlob('./src/posts/*.md')
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  // Plugins
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);

  // 404
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('dist/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    passthroughFileCopy: true,
    markdownTemplateEngine: 'njk'
  };
};
