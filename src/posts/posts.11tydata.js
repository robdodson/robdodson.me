module.exports = {
  eleventyComputed: {
    /**
     * Adds support for drafts.
     * If a page has `draft: true` in its YAML frontmatter then this snippet
     * will set its permalink to false and exclude it from collections.
     *
     * For dev builds we will always render the page.
     */
     permalink: data => {
      if (process.env.NODE_ENV === 'production' && data.draft) {
        return false;
      }

      return data.permalink;
    },
    eleventyExcludeFromCollections: data => {
      if (process.env.NODE_ENV === 'production' && data.draft) {
        return true;
      }

      return false;
    }
  }
}