document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const topNotice = document.querySelector('.top-notice');

    // 스크롤 이벤트 (헤더 배경 변경)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
            header.style.top = '0'; 
        } else {
            header.classList.remove('scrolled');
            if(topNotice) {
                header.style.top = topNotice.offsetHeight + 'px';
            }
        }
    });

    if(window.scrollY <= 10 && topNotice) {
        header.style.top = topNotice.offsetHeight + 'px';
    }

    // 모바일 햄버거 메뉴 펼침/접힘 토글 로직
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const gnb = document.querySelector('.gnb');
    
    if(mobileBtn && gnb) {
        mobileBtn.addEventListener('click', () => {
            // .active 클래스를 껐다 켰다 하면서 메뉴를 엽니다
            gnb.classList.toggle('active');
            
            // 모바일 메뉴가 열렸을 때 헤더 배경을 강제로 하얗게 만듦 (가독성 확보)
            if(gnb.classList.contains('active')) {
                header.classList.add('scrolled');
            } else if (window.scrollY <= 10) {
                header.classList.remove('scrolled');
            }
        });
    }
});