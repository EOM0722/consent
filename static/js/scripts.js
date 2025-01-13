let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// 서버 URL 설정
const API_URL = 'https://atob.ngrok.app';

document.addEventListener('DOMContentLoaded', function () {
    canvas = document.getElementById('signatureCanvas');
    ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const containerWidth = canvas.parentElement.offsetWidth - 20;
        canvas.width = containerWidth;
        canvas.height = 200;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', () => (isDrawing = false));
});

function handleTouch(e) {
    e.preventDefault(); // 기본 터치 동작 방지 (예: 화면 스크롤)

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (e.type === 'touchstart') {
        isDrawing = true;
        lastX = x;
        lastY = y;
    } else if (e.type === 'touchmove' && isDrawing) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
    } else if (e.type === 'touchend' || e.type === 'touchcancel') {
        isDrawing = false;
    }
}

function openHealthCheck() {
    const width = Math.min(1200, window.screen.width * 0.9);
    const height = Math.min(900, window.screen.height * 0.9);
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
        'https://eo-m.com/2025/HSP/HSP_Controller.asp?part=nfc&mehId=GV4541&mtype=1',
        'healthCheck',
        `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes`
    );
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}

function clearSignature() {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function saveSignature() {
    const canvas = document.getElementById('signatureCanvas');
    const signatureData = canvas.toDataURL('image/png');
    const name = document.getElementById('name').value;

    console.log('서명 저장 시도...');
    console.log(`API URL: ${API_URL}/save-signature`);

    fetch(`${API_URL}/save-signature`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            signature: signatureData,
            name: name,
        }),
    })
        .then((response) => {
            console.log('응답 상태:', response.status);
            return response.json();
        })
        .then((data) => {
            console.log('서버 응답:', data);
            if (data.success) {
                console.log('서명 저장 성공:', data.filename);
            } else {
                console.error('서명 저장 실패:', data.error);
                alert('서명 저장에 실패했습니다.');
            }
        })
        .catch((error) => {
            console.error('서명 저장 중 오류:', error);
            alert('서명 저장 중 오류가 발생했습니다.');
        });
}

function submitForm() {
    const form = document.getElementById('contactForm');
    const name = document.getElementById('name').value;
    const birthdate =
        document.getElementById('birthYear').value +
        '-' +
        String(document.getElementById('birthMonth').value).padStart(2, '0') +
        '-' +
        String(document.getElementById('birthDay').value).padStart(2, '0');
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const gender = document.getElementById('gender').value;
    const consentDate =
        document.getElementById('consentYear').value +
        '-' +
        String(document.getElementById('consentMonth').value).padStart(2, '0') +
        '-' +
        String(document.getElementById('consentDay').value).padStart(2, '0');
    const consent = document.getElementById('consent').checked;

    if (!consent) {
        alert('인체유래물등 기증 동의가 필요합니다.');
        return;
    }

    saveSignature();

    // Form 데이터 전송
    fetch(
        'https://script.google.com/macros/s/AKfycby5CTjdm75XCPmW9CAHIqUZH6gr10G_E_Z8xzLyuUAjYkwYz7Ay3wpQEmNRtNuQ4REj/exec',
        {
            method: 'POST',
            body: new URLSearchParams({
                name: name,
                birthdate: birthdate,
                address: address,
                phone: phone,
                gender: gender,
                consentDate: consentDate,
                consent: consent,
            }),
        }
    )
        .then((response) => {
            if (response.ok) {
                document.getElementById('submitSuccessMessage').classList.remove('d-none');
                form.reset();
                clearSignature();
            } else {
                document.getElementById('submitErrorMessage').classList.remove('d-none');
            }
        })
        .catch((error) => {
            console.error('Form 전송 중 오류:', error);
        });
}
