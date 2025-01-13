function saveSignature() {
  const canvas = document.getElementById('signatureCanvas');
  const signatureData = canvas.toDataURL('image/png');
  const name = document.getElementById('name').value;

  console.log('서명 저장 시도...');
  console.log(`API URL: ${API_URL}`);

  fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      signature: signatureData,
      name: name
    })
  })
  .then(response => {
    console.log('응답 상태:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('서버 응답:', data);
    if (data.success) {
      console.log('서명 저장 성공:', data.filename);
    } else {
      console.error('서명 저장 실패:', data.error);
      alert('서명 저장에 실패했습니다.');
    }
  })
  .catch(error => {
    console.error('서명 저장 중 오류:', error);
    alert('서명 저장 중 오류가 발생했습니다.');
  });
}

function submitForm() {
  var form = document.getElementById('contactForm');
  var name = document.getElementById('name').value;
  var birthdate = document.getElementById('birthYear').value + '-' + 
              String(document.getElementById('birthMonth').value).padStart(2, '0') + '-' + 
              String(document.getElementById('birthDay').value).padStart(2, '0');
  var address = document.getElementById('address').value;
  var phone = document.getElementById('phone').value;
  var gender = document.getElementById('gender').value;
  var consentDate = document.getElementById('consentYear').value + '-' + 
                   String(document.getElementById('consentMonth').value).padStart(2, '0') + '-' + 
                   String(document.getElementById('consentDay').value).padStart(2, '0');
  var consent = document.getElementById('consent').checked;

  if (!consent) {
    alert('인체유래물등 기증 동의가 필요합니다.');
    return;
  }

  // 서명 저장
  saveSignature();

  var url = 'https://script.google.com/macros/s/AKfycby5CTjdm75XCPmW9CAHIqUZH6gr10G_E_Z8xzLyuUAjYkwYz7Ay3wpQEmNRtNuQ4REj/exec';
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        document.getElementById('submitSuccessMessage').classList.remove('d-none');
        form.reset();
        clearSignature();
        
        const width = Math.min(1200, window.screen.width * 0.9);
        const height = Math.min(900, window.screen.height * 0.9);
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open(
          'https://eo-m.com/2025/HSP/HSP_Controller.asp?part=nfc&mehId=GV4541&mtype=1',
          'questionnaire',
          `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes`
        );
      } else {
        document.getElementById('submitErrorMessage').classList.remove('d-none');
      }
      document.getElementById('submitButton').disabled = false;
    }
  };

  var data = 'name=' + encodeURIComponent(name) +
    '&birthdate=' + encodeURIComponent(birthdate) +
    '&address=' + encodeURIComponent(address) +
    '&phone=' + encodeURIComponent(phone) +
    '&gender=' + encodeURIComponent(gender) +
    '&consentDate=' + encodeURIComponent(consentDate) +
    '&consent=' + encodeURIComponent(consent);

  xhr.send(data);
  document.getElementById('submitButton').disabled = true;
}
