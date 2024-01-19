function createChains(chain) {
  const allContent = document.querySelector('.all-content');

  const eachChainWrapper = document.createElement('div');
  eachChainWrapper.classList.add('each-chain-wrapper');

  const generalTextSubtitle = document.createElement('h2');
  generalTextSubtitle.classList.add('general-text-subtitle');
  generalTextSubtitle.innerText = chain.identifier;
  eachChainWrapper.appendChild(generalTextSubtitle);

  const generalTextText = document.createElement('span');
  generalTextText.classList.add('general-text-text');
  generalTextText.style.marginLeft = '5px';
  generalTextText.innerText = ` (~${chain.latest_block_height})`;
  eachChainWrapper.appendChild(generalTextText);

  const generalFormButtonEdit = document.createElement('a');
  generalFormButtonEdit.classList.add('general-form-button');
  generalFormButtonEdit.style.marginLeft = 'auto';
  generalFormButtonEdit.setAttribute('href', '/update?identifier=' + chain.identifier);
  generalFormButtonEdit.innerText = 'Edit';
  eachChainWrapper.appendChild(generalFormButtonEdit);

  if (!chain.latest_update_status) {
    const generalFormButtonStatus = document.createElement('a');
    generalFormButtonStatus.classList.add('general-form-button');
    generalFormButtonStatus.style.marginLeft = '20px';
    generalFormButtonStatus.setAttribute('href', '/status?identifier=' + chain.identifier);
    generalFormButtonStatus.innerText = 'Set as Updated';
    eachChainWrapper.appendChild(generalFormButtonStatus);
  } else {
    const generalFormButtonNotAllowed = document.createElement('div');
    generalFormButtonNotAllowed.classList.add('general-form-button-not-allowed');
    generalFormButtonNotAllowed.style.marginLeft = '20px';
    generalFormButtonNotAllowed.innerText = 'Already Updated';
    eachChainWrapper.appendChild(generalFormButtonNotAllowed);
  };

  allContent.appendChild(eachChainWrapper);
};