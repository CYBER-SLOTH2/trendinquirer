module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addCollection("posts", c =>
    c.getFilteredByGlob("blog/*.md").reverse()
  );
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };
};