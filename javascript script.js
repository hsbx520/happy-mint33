document.addEventListener('DOMContentLoaded', () => {
  // Safe element selection with fallback
  function safeGetElement(selector) {
    const element = document.querySelector(selector);
    return element || { 
      addEventListener: () => {}, 
      click: () => {}, 
      textContent: '', 
      value: '' 
    };
  }

  // Clipboard.js initialization with error handling
  let clipboard;
  try {
    clipboard = new ClipboardJS('.copy-button');
  } catch (error) {
    console.error('Failed to initialize Clipboard.js:', error);
  }

  if (clipboard) {
    clipboard.on('success', function (e) {
      try {
        const targetId = e.trigger?.getAttribute('data-clipboard-target');
        const targetElement = targetId ? document.querySelector(targetId) : null;

        if (targetElement && targetId === '#referralLink') {
          const referralStatus = safeGetElement('#referralStatus');
          referralStatus.textContent = '链接已复制!';
        } else if (targetElement && (targetId === '#presaleAddress3' || targetId === '#presaleAddress2')) {
          const customAlert = safeGetElement('#customAlert');
          const customAlertMessage = safeGetElement('#customAlertMessage');

          function showAlert(message) {
            if (customAlert && customAlertMessage) {
              customAlertMessage.textContent = message;
              customAlert.style.display = 'block';
              setTimeout(() => {
                customAlert.style.display = 'none';
              }, 3000);
            }
          }

          showAlert('预售地址已复制到剪贴板!');
        }
      } catch (error) {
        console.error('Copy success handler error:', error);
      }

      e.clearSelection();
    });

    clipboard.on('error', function (e) {
      const targetId = e.trigger?.getAttribute('data-clipboard-target');
      const referralStatus = safeGetElement('#referralStatus');
      
      if (targetId === '#referralLink') {
        referralStatus.textContent = '复制失败，请手动复制.';
      } else {
        console.error('复制失败:', e);
        alert('复制失败，请手动复制。');
      }
    });
  }

  const solAddressInput = safeGetElement('#solAddress');
  const claimRewardButton = safeGetElement('#claimReward');
  const claimStatusDisplay = safeGetElement('#claimStatus');
  const referralLinkInput = safeGetElement('#referralLink');
  const referralStatusDisplay = safeGetElement('#referralStatus');
  const invitedCountDisplay = safeGetElement('#invitedCount');
  const happyAirdropDisplay = safeGetElement('#happyAirdrop');

  let referralCode = null;
  let referralLink = null;
  let invitedCount = 0;
  let happyAirdropAmount = 0;

  if (localStorage.getItem('invitedCount')) {
    invitedCount = parseInt(localStorage.getItem('invitedCount'));
  }

  function updateInvitationInfo() {
    invitedCountDisplay.textContent = `已邀请: ${invitedCount} 人`;
    happyAirdropAmount = invitedCount * 2000;
    happyAirdropDisplay.textContent = `等待领取的 Happy 代币: ${happyAirdropAmount}`;
  }

  updateInvitationInfo();

  async function generateReferralLink(solAddress) {
    try {
      const response = await fetch('http://localhost:3000/api/referral/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ solAddress: solAddress })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      referralCode = data.referralCode;

      const baseUrl = "https://happy.sh";
      referralLink = `${baseUrl}/${referralCode}`;
      referralLinkInput.value = referralLink;
      return referralLink;

    } catch (error) {
      console.error("Failed to generate referral link:", error);
      claimStatusDisplay.textContent = `生成邀请链接失败. 请重试. ${error.message}`;
      return null;
    }
  }

  claimRewardButton.addEventListener('click', async () => {
    const customAlert = safeGetElement('#customAlert');
    const customAlertMessage = safeGetElement('#customAlertMessage');

    function showAlert(message) {
      customAlertMessage.textContent = message;
      customAlert.style.display = 'block';
      setTimeout(() => {
        customAlert.style.display = 'none';
      }, 3000);
    }

    showAlert('即将推出。敬请期待!');
  });

  solAddressInput.addEventListener('input', () => {
    referralLinkInput.value = '';
    referralCode = null;
    referralLink = null;
  });

  async function handleReferral() {
    const urlParts = window.location.pathname.split('/');
    const refCode = urlParts[1]; 

    if (refCode) {
      try {
        const response = await fetch('http://localhost:3000/api/referral/increment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ referralCode: refCode })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        invitedCount++;
        updateInvitationInfo();

        localStorage.setItem('invitedCount', invitedCount.toString());

        console.log(`Referral Code: ${refCode}`);

        window.history.replaceState({}, document.title, window.location.pathname);

      } catch (error) {
        console.error("Failed to increment referral count:", error);
      }
    }
  }

  handleReferral();

  window.addEventListener('error', function(event) {
    console.error('Uncaught error:', event.error);
    const customAlert = safeGetElement('#customAlert');
    const customAlertMessage = safeGetElement('#customAlertMessage');
    if (customAlert && customAlertMessage) {
      customAlertMessage.textContent = '发生了一个意外错误，请刷新页面。';
      customAlert.style.display = 'block';
      setTimeout(() => {
        customAlert.style.display = 'none';
      }, 3000);
    }
  });
});