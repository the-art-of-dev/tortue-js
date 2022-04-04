const actions = {
  renderFinished: async (data) => {
    const HTML_DOCTYPE = "<!DOCTYPE html>";

    for (const page of data.pages) {
      page.html = `${HTML_DOCTYPE}\n${page.html}`;
    }

    return Promise.resolve(data);
  },
};

module.exports = actions;
