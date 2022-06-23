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
      if (data.eleventyExcludeFromCollections || data.exclude) {
        return true;
      }

      if (process.env.NODE_ENV === 'production' && data.draft) {
        return true;
      }

      return false;
    },
    old: data => {
      // The number of years to wait before marking a post as old.
      const oldYears = 4;

      // Allows the user to set old to either true or false.
      // nb. Because this is a Proxy we can't just check if `old' in data
      // because it will always be true, and we can't check typeof data.old
      // because it throws a Reference error.
      if (data.old === false) {
        return false;
      } else if (data.old === true) {
        return true;
      }

      // If the post is over a certain number of years old,
      // automatically mark it as old.
      if (new Date().getFullYear() - new Date(data.date).getFullYear() > oldYears) {
        return true;
      }

      return false;
    }
  }
};
