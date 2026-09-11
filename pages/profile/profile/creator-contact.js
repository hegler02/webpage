(() => {
  const button = document.querySelector('[data-copy-email]');
  const address = document.querySelector('#creator-email-address');
  const status = document.querySelector('#creator-copy-status');
  if (!button || !address || !status) return;
  const isEnglish = () => document.documentElement.dataset.lang === 'en';
  const updateLabel = () => {
    const label = isEnglish() ? 'Copy email address' : '이메일 주소 복사';
    button.setAttribute('aria-label', label);
    button.title = label;
  };
  updateLabel();
  new MutationObserver(() => { updateLabel(); status.textContent = ''; })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = '';
    try {
      await navigator.clipboard.writeText(address.textContent.trim());
      status.textContent = isEnglish() ? 'Email address copied.' : '이메일 주소를 복사했습니다.';
    } catch {
      status.textContent = isEnglish()
        ? 'Copy failed. Select the address to copy it manually.'
        : '복사하지 못했습니다. 주소를 선택해 복사해주세요.';
    } finally {
      button.disabled = false;
    }
  });
})();
