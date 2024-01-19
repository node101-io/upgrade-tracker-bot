window.addEventListener('load', () => {
  if (document.getElementById('chains-search-input')) {
    document.getElementById('chains-search-input').focus();
    document.getElementById('chains-search-input').select();

    document.getElementById('chains-search-input').addEventListener('input', event => {
      serverRequest('/filter', 'POST', {
        identifier: event.target.value
      }, res => {
        if (!res.success || res.error) return alert(res.error);

        const allContent = document.querySelector('.all-content');
        allContent.innerHTML = '';

        if (res.chains.length) {
          for (let i = 0; i < res.chains.length; i++) {
            createChains(res.chains[i]);
          };
        };
      });
    });
  };
});