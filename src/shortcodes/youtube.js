module.exports = function(args) {
  const {id, title, time} = args;
  if (!id || !title) {
    throw new Error(`${this.page.inputPath} youtube embed is missing required attributes. id: ${id}, title: ${title}`);
  }

  return `<lite-youtube videoid="${id}" videotitle="${title}" ${time ? `videoStartAt="${time}"` : ``}></lite-youtube>`;
};