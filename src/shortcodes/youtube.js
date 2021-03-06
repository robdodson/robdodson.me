module.exports = function(args) {
  const {id, title} = args;
  return `<lite-youtube videoid="${id}" videotitle="${title}"></lite-youtube>`;
};