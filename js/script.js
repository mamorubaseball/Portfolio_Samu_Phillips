// モバイルメニューの切り替え
const navToggle = document.querySelector('.nav-toggle');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    document.body.classList.toggle('menu-open');
    
    // モバイルメニューを作成・表示
    let mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // メニュー項目をコピー
        const navItems = document.querySelectorAll('.nav-menu a');
        navItems.forEach(item => {
            const link = document.createElement('a');
            link.href = item.href;
            link.textContent = item.textContent;
            if (item.classList.contains('nav-cta')) {
                link.classList.add('nav-cta');
            }
            
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
            
            mobileMenu.appendChild(link);
        });
        
        document.body.appendChild(mobileMenu);
    }
    
    mobileMenu.classList.toggle('active');
});

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = targetPosition - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// スクロールプログレスバーの追加
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

// 固定CTAの表示制御とその他スクロール効果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrollPos = window.scrollY;
    const floatingCta = document.getElementById('floatingCta');
    const backToTop = document.querySelector('.back-to-top');
    const heroSection = document.getElementById('home');
    const contactSection = document.getElementById('contact');
    
    // スクロールプログレスバー
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (scrollPos / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
    
    // ナビゲーションバーの変化
    if (scrollPos > 50) {
        navbar.style.backdropFilter = 'blur(20px)';
    } else {
        navbar.style.backdropFilter = 'blur(10px)';
    }
    
    // バックトゥトップボタン
    if (scrollPos > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
    
    // 固定CTA
    if (floatingCta && heroSection && contactSection) {
        if (scrollPos > heroSection.offsetHeight && 
            scrollPos < (contactSection.offsetTop - window.innerHeight * 0.5)) {
            floatingCta.classList.add('visible');
        } else {
            floatingCta.classList.remove('visible');
        }
    }
    
    // ナビゲーションアクティブ状態
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// スクロールアニメーション
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // カウントアップアニメーション
            if (entry.target.classList.contains('count-up')) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                const duration = 1500;
                const increment = target / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    entry.target.textContent = Math.floor(current);
                    
                    if (current >= target) {
                        entry.target.textContent = target;
                        clearInterval(timer);
                    }
                }, 16);
            }
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// 3Dホバーエフェクト
function setupTiltEffect(elements) {
    elements.forEach(element => {
        element.addEventListener('mousemove', e => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            element.style.transform = `perspective(1000px) rotateX(${-deltaY * 5}deg) rotateY(${deltaX * 5}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// DOM読み込み後の処理
// スライダー機能
function initSliders() {
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(slider => {
        const wrapper = slider.querySelector('.slider-wrapper');
        const slides = slider.querySelectorAll('.slider-item');
        const dots = slider.querySelectorAll('.slider-dot');
        const prevArrow = slider.querySelector('.prev-arrow');
        const nextArrow = slider.querySelector('.next-arrow');
        let currentIndex = 0;
        let startX, moveX;
        let isMultiSlider = slider.querySelector('.multi-slider-wrapper') !== null;
        let isVideoSlider = slider.closest('#videos') !== null;
        let isScrolling = false;
        let scrollTimeout;
        
        // 複数アイテム表示スライダーの処理
        if (isMultiSlider) {
            const multiWrapper = slider.querySelector('.multi-slider-wrapper');
            const multiSlides = slider.querySelectorAll('.multi-slider-item');
            let slidesToShow = window.innerWidth > 992 ? 3 : window.innerWidth > 576 ? 2 : 1;
            let slideWidth = 100 / slidesToShow;
            let totalSlides = multiSlides.length;
            let maxIndex = Math.max(0, totalSlides - slidesToShow);
            
            // 初期スタイル設定
            multiSlides.forEach(slide => {
                slide.style.width = `${slideWidth}%`;
            });
            
            // 次へボタン
            if (nextArrow) {
                nextArrow.addEventListener('click', () => {
                    if (currentIndex < maxIndex) {
                        currentIndex++;
                        updateMultiSlider();
                    }
                });
            }
            
            // 前へボタン
            if (prevArrow) {
                prevArrow.addEventListener('click', () => {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateMultiSlider();
                    }
                });
            }
            
            // スライダーの更新
            function updateMultiSlider() {
                const translateX = -currentIndex * (100 / totalSlides * slidesToShow / totalSlides * slidesToShow);
                multiWrapper.style.transform = `translateX(${translateX}%)`;
                
                if (dots.length) {
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === Math.floor(currentIndex / slidesToShow));
                    });
                }
            }
            
            // ウィンドウリサイズ時の処理
            window.addEventListener('resize', () => {
                const oldSlidesToShow = slidesToShow;
                slidesToShow = window.innerWidth > 992 ? 3 : window.innerWidth > 576 ? 2 : 1;
                
                if (oldSlidesToShow !== slidesToShow) {
                    slideWidth = 100 / slidesToShow;
                    maxIndex = Math.max(0, totalSlides - slidesToShow);
                    currentIndex = Math.min(currentIndex, maxIndex);
                    
                    multiSlides.forEach(slide => {
                        slide.style.width = `${slideWidth}%`;
                    });
                    
                    updateMultiSlider();
                }
            });
            
            return;
        }
        
        // 通常スライダーの処理
        function goToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            // アクティブなスライドを更新
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
                slide.style.transform = `translateX(${100 * (i - index)}%)`;
            });
            
            // アクティブなドットを更新
            if (dots.length) {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            }
            
            currentIndex = index;
        }
        
        // スクロールによるスライド切り替え（アニメーション付き）
        function smoothScrollToSlide(direction) {
            if (isScrolling) return;
            isScrolling = true;
            
            const targetIndex = direction > 0 ? currentIndex + 1 : currentIndex - 1;
            const finalIndex = targetIndex < 0 ? slides.length - 1 : targetIndex >= slides.length ? 0 : targetIndex;
            
            // 初期位置と目標位置を設定
            const startPos = 0;
            const endPos = direction > 0 ? -100 : 100;
            
            // 現在のスライドと次のスライドを準備
            slides.forEach((slide, i) => {
                if (i === currentIndex) {
                    slide.style.transition = 'transform 0.5s ease-out';
                    slide.style.transform = `translateX(${endPos}%)`;
                } else if (i === finalIndex) {
                    slide.style.transition = 'transform 0.5s ease-out';
                    slide.style.transform = `translateX(${-endPos}%)`;
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                    slide.style.transform = `translateX(${i < finalIndex ? -100 : 100}%)`;
                }
            });
            
            // アニメーション完了後に状態を更新
            setTimeout(() => {
                slides.forEach((slide, i) => {
                    slide.style.transition = '';
                    if (i === finalIndex) {
                        slide.style.transform = 'translateX(0%)';
                    } else {
                        slide.classList.remove('active');
                        slide.style.transform = `translateX(${i < finalIndex ? -100 : 100}%)`;
                    }
                });
                
                currentIndex = finalIndex;
                
                // ドットを更新
                if (dots.length) {
                    dots.forEach((dot, i) => {
                        dot.classList.toggle('active', i === finalIndex);
                    });
                }
                
                // スクロールロックを解除（連続スクロールを防止するためのディレイ）
                setTimeout(() => {
                    isScrolling = false;
                }, 300);
            }, 500);
        }
        
        // 初期化
        goToSlide(0);
        
        // YouTubeスライダーのホイールスクロール対応
        if (isVideoSlider) {
            slider.style.overflowX = 'hidden';
            slider.style.cursor = 'grab';
            
            // ホイールスクロールイベント
            slider.addEventListener('wheel', (e) => {
                e.preventDefault();
                
                // ホイールのデルタを使用して方向を決定
                const delta = Math.sign(e.deltaY || e.deltaX || 0);
                
                // スロットリングを適用（頻繁なスクロールを防止）
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (delta > 0) {
                        smoothScrollToSlide(1); // 下/右スクロール
                    } else if (delta < 0) {
                        smoothScrollToSlide(-1); // 上/左スクロール
                    }
                }, 50);
            }, { passive: false });
            
            // マウスドラッグ対応
            let isDragging = false;
            let dragStartX = 0;
            let dragDistance = 0;
            
            slider.addEventListener('mousedown', (e) => {
                isDragging = true;
                dragStartX = e.clientX;
                slider.style.cursor = 'grabbing';
            });
            
            slider.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                dragDistance = e.clientX - dragStartX;
                
                // ドラッグ中の視覚的フィードバック
                if (Math.abs(dragDistance) > 30 && !isScrolling) {
                    slides.forEach((slide, i) => {
                        if (i === currentIndex) {
                            slide.style.transform = `translateX(${dragDistance * 0.3}%)`;
                        }
                    });
                }
            });
            
            slider.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                slider.style.cursor = 'grab';
                
                if (Math.abs(dragDistance) > 50 && !isScrolling) {
                    if (dragDistance > 0) {
                        smoothScrollToSlide(-1); // 左へ
                    } else {
                        smoothScrollToSlide(1); // 右へ
                    }
                } else {
                    // 距離が足りない場合は元に戻す
                    slides.forEach((slide, i) => {
                        if (i === currentIndex) {
                            slide.style.transition = 'transform 0.3s ease';
                            slide.style.transform = 'translateX(0)';
                            setTimeout(() => {
                                slide.style.transition = '';
                            }, 300);
                        }
                    });
                }
                
                dragDistance = 0;
            });
            
            slider.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    slider.style.cursor = 'grab';
                    
                    // ドラッグ中にマウスが離れた場合は元に戻す
                    slides.forEach((slide, i) => {
                        if (i === currentIndex) {
                            slide.style.transition = 'transform 0.3s ease';
                            slide.style.transform = 'translateX(0)';
                            setTimeout(() => {
                                slide.style.transition = '';
                            }, 300);
                        }
                    });
                }
            });
            
            // 矢印キー対応
            window.addEventListener('keydown', (e) => {
                if (isScrolling) return;
                
                // スライダーが表示されているかチェック
                const rect = slider.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isVisible) {
                    if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        smoothScrollToSlide(1);
                    } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        smoothScrollToSlide(-1);
                    }
                }
            });
            
            // 矢印ボタンは保持するが、スムーズスクロールに変更
            if (nextArrow) {
                nextArrow.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isScrolling) {
                        smoothScrollToSlide(1);
                    }
                });
            }
            
            if (prevArrow) {
                prevArrow.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isScrolling) {
                        smoothScrollToSlide(-1);
                    }
                });
            }
            
            // タッチスワイプもスムーズスクロールに変更
            slider.addEventListener('touchstart', (e) => {
                startX = e.changedTouches[0].screenX;
            });
            
            slider.addEventListener('touchmove', (e) => {
                moveX = e.changedTouches[0].screenX;
                // タッチ中の視覚的フィードバック
                if (!isScrolling && Math.abs(moveX - startX) > 30) {
                    slides.forEach((slide, i) => {
                        if (i === currentIndex) {
                            const movePercent = (moveX - startX) * 0.3;
                            slide.style.transform = `translateX(${movePercent}%)`;
                        }
                    });
                }
            });
            
            slider.addEventListener('touchend', () => {
                if (isScrolling) return;
                
                if (startX + 50 < moveX) {
                    // 右にスワイプ
                    smoothScrollToSlide(-1);
                } else if (startX - 50 > moveX) {
                    // 左にスワイプ
                    smoothScrollToSlide(1);
                } else {
                    // 距離が足りない場合は元に戻す
                    slides.forEach((slide, i) => {
                        if (i === currentIndex) {
                            slide.style.transition = 'transform 0.3s ease';
                            slide.style.transform = 'translateX(0)';
                            setTimeout(() => {
                                slide.style.transition = '';
                            }, 300);
                        }
                    });
                }
            });
        } else {
            // 通常スライダーの場合は従来の処理を維持
            
            // 次へボタン
            if (nextArrow) {
                nextArrow.addEventListener('click', () => {
                    goToSlide(currentIndex + 1);
                });
            }
            
            // 前へボタン
            if (prevArrow) {
                prevArrow.addEventListener('click', () => {
                    goToSlide(currentIndex - 1);
                });
            }
            
            // ドットナビゲーション
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    goToSlide(index);
                });
            });
            
            // タッチスワイプ対応
            slider.addEventListener('touchstart', (e) => {
                startX = e.changedTouches[0].screenX;
            });
            
            slider.addEventListener('touchmove', (e) => {
                moveX = e.changedTouches[0].screenX;
            });
            
            slider.addEventListener('touchend', () => {
                if (startX + 50 < moveX) {
                    // 右にスワイプ
                    goToSlide(currentIndex - 1);
                } else if (startX - 50 > moveX) {
                    // 左にスワイプ
                    goToSlide(currentIndex + 1);
                }
            });
            
            // 自動スライド（オプション）
            if (slider.classList.contains('auto-slide')) {
                setInterval(() => {
                    goToSlide(currentIndex + 1);
                }, 5000);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // スライダーの初期化
    initSliders();
    // アニメーション要素の設定
    const animatedElements = document.querySelectorAll(
        '.hero-content, .hero-image, .transformation-card, .testimonial-item, ' +
        '.video-item, .supplement-item, .about-content, .contact-form, ' +
        '.benefit-item, .feature, .note-content, .social-links a'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // カウントアップ要素の設定
    // const countElements = document.querySelectorAll('.stat-number, .result-number');
    // countElements.forEach(el => {
    //     const value = el.textContent.replace(/[^0-9]/g, '');
    //     el.setAttribute('data-target', value);
    //     el.classList.add('count-up');
    //     el.textContent = '10';
    // });
    
    // 3Dホバーエフェクトの適用
    const tiltElements = document.querySelectorAll('.testimonial-item, .supplement-item, .video-item, .feature');
    setupTiltEffect(tiltElements);
    
    // アニメーションスタイルの追加
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        @media (prefers-reduced-motion: reduce) {
            .animate-on-scroll {
                transition: none;
                opacity: 1;
                transform: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 遅延読み込み最適化
    // 画像に loading="lazy" 属性を追加
    document.querySelectorAll('img:not([loading])').forEach(img => {
        img.setAttribute('loading', 'lazy');
    });

    function scrollVideos(direction) {
        const container = document.getElementById('videoContainer');
        const scrollAmount = 400;

        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    function loadVideo(playButton) {
        const iframe = playButton.parentElement.querySelector('iframe');
        const src = iframe.getAttribute('data-src');

        if (src) {
            iframe.src = src + '?autoplay=1';
            playButton.style.display = 'none';
        }
    }

    // タッチスクロールの改善
    let isScrolling = false;
    const container = document.getElementById('videoContainer');

    container.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                // スクロール位置に応じてインジケーターを更新
                updateScrollIndicator();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    function updateScrollIndicator() {
        // 必要に応じてスクロールインジケーターを実装
    }

    // キーボードナビゲーション
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            scrollVideos('left');
        } else if (e.key === 'ArrowRight') {
            scrollVideos('right');
        }
    });
    
    // // YouTube動画の遅延読み込み
    // document.querySelectorAll('.video-overlay').forEach(overlay => {
    //     overlay.addEventListener('click', function() {
    //         const wrapper = this.closest('.video-wrapper');
    //         const iframe = wrapper.querySelector('iframe');
    //
    //         if (iframe && iframe.dataset.src) {
    //             iframe.src = iframe.dataset.src;
    //             this.style.opacity = '0';
    //
    //             setTimeout(() => {
    //                 this.style.display = 'none';
    //             }, 500);
    //         }
    //     });
    // });
    //
    // // YouTube動画のサムネイル表示
    // document.querySelectorAll('.video-wrapper').forEach(wrapper => {
    //     const iframe = wrapper.querySelector('iframe');
    //     if (iframe && iframe.dataset.src) {
    //         const videoId = getYouTubeVideoId(iframe.dataset.src);
    //
    //         if (videoId) {
    //             const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    //             const thumbnailImg = document.createElement('img');
    //             thumbnailImg.src = thumbnailUrl;
    //             thumbnailImg.alt = 'Video thumbnail';
    //             thumbnailImg.className = 'video-thumbnail';
    //             thumbnailImg.setAttribute('loading', 'lazy');
    //
    //             wrapper.insertBefore(thumbnailImg, wrapper.firstChild);
    //         }
    //     }
    // });
    //
    // // YouTube動画IDの抽出ヘルパー関数
    // function getYouTubeVideoId(url) {
    //     if (!url) return null;
    //     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    //     const match = url.match(regExp);
    //     return (match && match[2].length === 11) ? match[2] : null;
    // }
    //
    // フォーム送信処理
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 入力検証
            let isValid = true;
            const requiredFields = ['name', 'email', 'goal'];
            
            requiredFields.forEach(field => {
                const input = this.querySelector(`[name="${field}"]`);
                
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    
                    let errorMsg = input.parentElement.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.textContent = '入力が必要です';
                        input.parentElement.appendChild(errorMsg);
                    }
                } else {
                    input.classList.remove('error');
                    const errorMsg = input.parentElement.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
            
            // Eメール形式の検証
            const emailInput = this.querySelector('[name="email"]');
            if (emailInput.value && !isValidEmail(emailInput.value)) {
                isValid = false;
                emailInput.classList.add('error');
                
                let errorMsg = emailInput.parentElement.querySelector('.error-message');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = '有効なメールアドレスを入力してください';
                    emailInput.parentElement.appendChild(errorMsg);
                }
            }
            
            if (!isValid) return;
            
            // 送信中表示
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
            
            // 送信成功のシミュレーション（実際にはサーバーへのリクエストが入ります）
            setTimeout(() => {
                // フォームを非表示にして完了メッセージを表示
                this.style.opacity = '0';
                this.style.height = '0';
                this.style.overflow = 'hidden';
                
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success glass';
                successMessage.innerHTML = `
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>予約を受け付けました！</h3>
                    <p>24時間以内に担当者からご連絡いたします。<br>確認メールを ${emailInput.value} に送信しました。</p>
                `;
                
                this.parentElement.appendChild(successMessage);
                
                // 完了メッセージのスタイルを追加
                const style = document.createElement('style');
                style.textContent = `
                    .form-success {
                        padding: 40px;
                        text-align: center;
                        border-radius: 20px;
                        animation: fadeIn 0.5s ease forwards;
                    }
                    
                    .success-icon {
                        font-size: 4rem;
                        color: #00d4ff;
                        margin-bottom: 20px;
                    }
                    
                    @keyframes fadeIn {
                        0% { opacity: 0; transform: translateY(20px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    
                    .error-message {
                        color: #ff0080;
                        font-size: 0.85rem;
                        margin-top: 4px;
                    }
                    
                    .error {
                        border-color: #ff0080 !important;
                    }
                `;
                document.head.appendChild(style);
            }, 1500);
        });
    }
    
    // メールアドレス検証ヘルパー関数
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }
    
    // モーション軽減モードの検出
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        // アニメーションを無効化
        document.documentElement.classList.add('reduced-motion');
    }
});