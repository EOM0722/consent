let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// API 엔드포인트 URL (ngrok HTTPS URL 사용)
const API_URL = 'https://atob.ngrok.app';

// 서명 패드 초기화
document.addEventListener('DOMContentLoaded', function () {
    canvas = document.getElementById('signatureCanvas');
    ctx = canvas.getContext('2d');

    // Canvas 크기 설정 (부모 요소 크기에 맞춤)
    function resizeCanvas() {
        const containerWidth = canvas.parentElement.offsetWidth - 20; // 양쪽 여백 20px
        canvas.width = containerWidth;
        canvas.height = 200; // 고정 높이 설정
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas); // 창 크기 변경 시 재조정

    // 마우스 이벤트
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // 터치 이벤트
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', () => (isDrawing = false));
});

// 터치 이벤트 처리 함수
function handleTouch(e) {
    e.preventDefault();
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
    }
}

// "기증 없이 문진" 버튼 클릭 시 열리는 팝업
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

// 마우스 드로잉 시작
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

// 드로잉 중
function draw(e) {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

// 드로잉 종료
function stopDrawing() {
    isDrawing = false;
}

// 서명 초기화
function clearSignature() {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// 서명 저장
async function saveSignature() {
    const canvas = document.getElementById('signatureCanvas');
    const signatureData = canvas.toDataURL('image/png');
    const name = document.getElementById('name').value;

    console.log('서명 저장 시도...');

    try {
        const response = await fetch(`${API_URL}/save-signature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                signature: signatureData,
                name: name,
            }),
        });

        const data = await response.json();
        if (data.success) {
            console.log('서명이 성공적으로 저장되었습니다:', data.filename);
            return true;
        } else {
            console.error('서명 저장 실패:', data.error);
            return false;
        }
    } catch (error) {
        console.error('서명 저장 중 오류 발생:', error);
        return false;
    }
}

// 폼 제출
async function submitForm() {
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

    // 서명 저장
    const isSignatureSaved = await saveSignature();
    if (!isSignatureSaved) {
        alert('서명 저장 중 오류가 발생했습니다.');
        return;
    }

    // 구글 스크립트 API 호출
    const url =
        'https://script.google.com/macros/s/AKfycby5CTjdm75XCPmW9CAHIqUZH6gr10G_E_Z8xzLyuUAjYkwYz7Ay3wpQEmNRtNuQ4REj/exec';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document
                    .getElementById('submitSuccessMessage')
                    .classList.remove('d-none');
                form.reset();
                clearSignature();
                openHealthCheck();
            } else {
                document
                    .getElementById('submitErrorMessage')
                    .classList.remove('d-none');
            }
            document.getElementById('submitButton').disabled = false;
        }
    };

    const data =
        'name=' +
        encodeURIComponent(name) +
        '&birthdate=' +
        encodeURIComponent(birthdate) +
        '&address=' +
        encodeURIComponent(address) +
        '&phone=' +
        encodeURIComponent(phone) +
        '&gender=' +
        encodeURIComponent(gender) +
        '&consentDate=' +
        encodeURIComponent(consentDate) +
        '&consent=' +
        encodeURIComponent(consent);

    xhr.send(data);
    document.getElementById('submitButton').disabled = true;
}
