module.exports = (req, res) => {
  return res.render('create/index', {
    page: 'create/index',
    title: 'New Chain',
    includes: {
      external: {
        css: ['form', 'general', 'page', 'text'],
        js: []
      }
    }
  });
};