document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const topNotice = document.querySelector('.top-notice');

    // 스크롤 이벤트 (헤더 배경 변경)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
            // 최상단 띠배너가 안 보일 때 헤더를 최상단으로 올림
            header.style.top = '0'; 
        } else {
            header.classList.remove('scrolled');
            // 스크롤이 맨 위면 다시 띠배너 아래로 위치
            if(topNotice) {
                header.style.top = topNotice.offsetHeight + 'px';
            }
        }
    });

    // 초기 로드시 헤더 위치 세팅
    if(window.scrollY <= 10 && topNotice) {
        header.style.top = topNotice.offsetHeight + 'px';
    }

    // 모바일 햄버거 메뉴 클릭 이벤트 (기본 틀)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    mobileBtn.addEventListener('click', () => {
        alert('모바일 메뉴 오픈 애니메이션을 여기에 연결합니다.');
        // 모바일 메뉴 사이드바 로직 추가...
    });
});