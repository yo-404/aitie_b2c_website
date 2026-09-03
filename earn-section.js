/* "More ways to earn than one" section.

   Updated requirements:
   1. Only headings are shown initially/when collapsed.
   2. On scroll, only ONE option is expanded at a time (revealing text below heading & image on right).
   3. When scrolled further, the active option collapses back to heading-only, and the next option expands.
   4. Equal height for expanded option cards.
   5. Image takes generous area on the right without covering text.
   6. Dynamic bottom sentence updates as each option expands.
   7. Centered, larger grand tagline at the bottom. */
(function () {
    var mount = document.getElementById('earn-section-mount');
    if (!mount) return;

    var css = ''
        + '.earn-section{background:linear-gradient(45deg, var(--color-1, #EDEAFB), var(--color-2, #b9adf6));color:#000;overflow:hidden;padding-top:4.5rem;padding-bottom:5rem;}'
        + '.earn-section .padding-global{padding-left:2rem;padding-right:2rem;width:100%;}'
        + '.earn-section .container-medium{width:100%;max-width:80rem;margin:0 auto;}'
        + '.earn-heading-holder{max-width:44rem;margin:0 0 2.5rem;}'
        + '.earn-eyebrow{display:flex;align-items:center;gap:.6rem;font-family:"Outfit",sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#000;margin-bottom:1.25rem;opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease;}'
        + '.earn-eyebrow-dot{width:.5rem;height:.5rem;background:#545784;flex:0 0 auto;border-radius:50%;}'
        + '.earn-heading{font-family:var(--_ui-styles---fonts--heading, "Outfit", sans-serif);font-size:4rem;font-weight:500;line-height:1.1;margin:0 0 1.25rem;color:#000;opacity:0;transform:translateY(24px);transition:opacity .7s ease .05s,transform .7s ease .05s;}'
        + '.earn-heading .pink{color:#545784;}'
        + '.earn-subtext{font-family:"Outfit",sans-serif;font-size:1.05rem;font-weight:400;line-height:1.55;color:rgba(0,0,0,0.75);margin:0;max-width:36rem;opacity:0;transform:translateY(24px);transition:opacity .7s ease .12s,transform .7s ease .12s;}'
        + '.earn-section.has-loaded .earn-eyebrow,.earn-section.has-loaded .earn-heading,.earn-section.has-loaded .earn-subtext{opacity:1;transform:translateY(0);}'
        
        + '.earn-list{display:flex;flex-direction:column;gap:0.85rem;}'
        + '.earn-row{position:relative;display:flex;align-items:center;justify-content:space-between;gap:2rem;padding:1.25rem 2.25rem;border-radius:1.5rem;cursor:pointer;background:rgba(255,255,255,0.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1.5px solid rgba(255,255,255,0.6);height:72px;box-sizing:border-box;transition:height .45s cubic-bezier(0.16,1,0.3,1),background .45s cubic-bezier(0.16,1,0.3,1),border-color .45s cubic-bezier(0.16,1,0.3,1),box-shadow .45s cubic-bezier(0.16,1,0.3,1),opacity .6s ease,transform .6s ease;opacity:0;transform:translateY(24px);overflow:hidden;}'
        + '.earn-row.is-visible{opacity:1;transform:translateY(0);}'
        + '.earn-row.is-active{height:240px;background:#ffffff;border-color:#ffffff;box-shadow:0 20px 45px rgba(84,87,132,0.15),0 4px 15px rgba(0,0,0,0.04);}'
        
        + '.earn-row-left{flex:1 1 52%;max-width:52%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;min-width:0;}'
        + '.earn-row-title{font-family:var(--_ui-styles---fonts--heading, "Outfit", sans-serif);font-size:2.2rem;font-weight:600;line-height:1.15;color:#1a1a2e;margin:0;transition:color .3s ease;}'
        + '.earn-row-body{opacity:0;max-height:0;transform:translateY(10px);pointer-events:none;transition:opacity .35s ease 0.05s,transform .35s ease 0.05s,max-height .4s ease,margin-top .4s ease;margin-top:0;}'
        + '.earn-row.is-active .earn-row-body{opacity:1;max-height:160px;transform:translateY(0);pointer-events:auto;margin-top:0.6rem;}'
        + '.earn-row-desc{font-family:"Outfit",sans-serif;font-size:0.98rem;font-weight:400;line-height:1.5;color:rgba(0,0,0,0.75);margin:0 0 0.85rem 0;}'
        + '.earn-row-learn-more{display:inline-flex;align-items:center;gap:0.5rem;font-family:"Outfit",sans-serif;font-size:0.82rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#545784;text-decoration:none;}'
        
        + '.earn-row-arrow{position:absolute;top:1.15rem;right:1.75rem;width:2.3rem;height:2.3rem;border-radius:50%;background:rgba(84,87,132,0.1);display:flex;align-items:center;justify-content:center;transition:transform .35s ease,background .35s ease;z-index:3;}'
        + '.earn-row-arrow svg{width:1rem;height:1rem;stroke:#545784;transition:transform .3s ease,stroke .3s ease;}'
        + '.earn-row.is-active .earn-row-arrow{background:#545784;transform:scale(1.05);}'
        + '.earn-row.is-active .earn-row-arrow svg{stroke:#ffffff;transform:rotate(45deg);}'
        
        + '.earn-row-right{flex:1 1 42%;max-width:42%;height:100%;display:flex;align-items:center;justify-content:flex-end;opacity:0;transform:scale(0.92) translateX(15px);pointer-events:none;transition:opacity .4s ease 0.05s,transform .4s cubic-bezier(0.16,1,0.3,1) 0.05s;}'
        + '.earn-row.is-active .earn-row-right{opacity:1;transform:scale(1) translateX(0);pointer-events:auto;}'
        + '.earn-row-preview{width:100%;height:100%;max-height:180px;border-radius:1.25rem;overflow:hidden;box-shadow:0 14px 35px rgba(84,87,132,0.22);border:3px solid #ffffff;}'
        + '.earn-row-preview img{width:100%;height:100%;object-fit:cover;display:block;}'
        
        + '.earn-bottom-container{margin-top:3.5rem;display:flex;flex-direction:column;align-items:center;text-align:center;gap:2rem;opacity:0;transform:translateY(24px);transition:opacity .7s ease .2s,transform .7s ease .2s;}'
        + '.earn-section.has-loaded .earn-bottom-container{opacity:1;transform:translateY(0);}'
        + '.earn-sentence-box{background:rgba(255,255,255,0.75);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,0.95);border-radius:1.25rem;padding:1.25rem 2.5rem;max-width:44rem;width:100%;box-shadow:0 12px 35px rgba(84,87,132,0.12);display:flex;flex-direction:column;align-items:center;gap:0.4rem;box-sizing:border-box;}'
        + '.earn-sentence-badge{font-family:"Outfit",sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#545784;}'
        + '.earn-sentence-text{font-family:"Outfit",sans-serif;font-size:1.35rem;font-weight:500;line-height:1.45;color:#1a1a2e;transition:opacity .3s ease,transform .3s ease;}'
        + '.earn-grand-tagline{font-family:var(--_ui-styles---fonts--heading, "Outfit", sans-serif);font-size:2.25rem;font-weight:600;line-height:1.3;color:#1a1a2e;text-align:center;max-width:48rem;margin:0;}'
        
        + '@media screen and (max-width:991px){'
        + '  .earn-heading{font-size:3.2rem;}'
        + '  .earn-row.is-active{height:250px;}'
        + '  .earn-grand-tagline{font-size:1.9rem;}'
        + '}'
        + '@media screen and (max-width:767px){'
        + '  .earn-heading{font-size:2.2rem;}'
        + '  .earn-row{height:64px;padding:1rem 1.25rem;}'
        + '  .earn-row.is-active{height:auto;min-height:320px;flex-direction:column;align-items:flex-start;padding:1.25rem;gap:1rem;}'
        + '  .earn-row-left{max-width:100%;width:100%;}'
        + '  .earn-row-right{max-width:100%;width:100%;height:150px;margin-top:0.5rem;}'
        + '  .earn-sentence-text{font-size:1.15rem;}'
        + '  .earn-grand-tagline{font-size:1.5rem;}'
        + '}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var items = [
        {
            title: 'Jobs',
            desc: 'A single project, start to finish. Take it on, deliver milestones from wherever you are, get paid.',
            img: 'images/First Page.png',
            sentence: 'Take a quick job today.'
        },
        {
            title: 'Commits',
            desc: 'An ongoing monthly engagement with a company you trust. Steady, recurring income, without giving up your independence. Exclusive, non-exclusive, your call.',
            img: 'images/earnings.png',
            sentence: 'Commit to something longer next month.'
        },
        {
            title: 'Taps',
            desc: 'A direct 30-minute expert consultation. Get paid for your knowledge, not just your deliverables.',
            img: 'images/work passport.png',
            sentence: 'Say yes to a Tap.'
        },
        {
            title: 'Referrals',
            desc: 'Bring someone you trust into the network, and earn when they earn.',
            img: 'images/invites.png',
            sentence: 'Bring in someone who deserves to be here too.'
        }
    ];

    var arrowSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M7 17L17 7M17 7H8M17 7V16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</svg>';

    var rowsHtml = items.map(function (item, i) {
        return ''
            + '<div class="earn-row" data-index="' + i + '">'
            + '  <div class="earn-row-left">'
            + '    <h3 class="earn-row-title">' + item.title + '</h3>'
            + '    <div class="earn-row-body">'
            + '      <p class="earn-row-desc">' + item.desc + '</p>'
            + '      <a href="#" class="earn-row-learn-more">Learn more</a>'
            + '    </div>'
            + '  </div>'
            + '  <div class="earn-row-right">'
            + '    <div class="earn-row-preview"><img src="' + item.img + '" alt="' + item.title + '" loading="lazy"></div>'
            + '  </div>'
            + '  <div class="earn-row-arrow">' + arrowSvg + '</div>'
            + '</div>';
    }).join('');

    mount.outerHTML = ''
        + '<div class="section earn-section" id="earn-section-container">'
        + '  <div class="padding-global">'
        + '    <div class="container-medium">'
        + '      <div class="earn-heading-holder">'
        + '        <div class="earn-eyebrow"><span class="earn-eyebrow-dot"></span>WAYS TO EARN</div>'
        + '        <h2 class="earn-heading">More ways to earn <span class="pink">than one</span>.</h2>'
        + '        <p class="earn-subtext">Independent work shouldn\'t mean one kind of income. Aitie gives you four ways to earn, and you choose what fits your life right now.</p>'
        + '      </div>'
        + '      <div class="earn-list">' + rowsHtml + '</div>'
        + '      <div class="earn-bottom-container">'
        + '        <div class="earn-sentence-box">'
        + '          <div class="earn-sentence-badge">OPTION FOCUS</div>'
        + '          <div class="earn-sentence-text" id="earn-dynamic-sentence">' + items[0].sentence + '</div>'
        + '        </div>'
        + '        <h3 class="earn-grand-tagline">However you want to earn, there\'s a way built for it.</h3>'
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</div>';

    var section = document.getElementById('earn-section-container') || document.querySelector('.earn-section');
    var rows = section.querySelectorAll('.earn-row');
    var activeIndex = 0;

    function setActiveIndex(index) {
        if (index === activeIndex && rows[index].classList.contains('is-active')) return;
        activeIndex = index;

        rows.forEach(function (row, i) {
            row.classList.toggle('is-active', i === index);
        });

        var sentenceEl = document.getElementById('earn-dynamic-sentence');
        if (sentenceEl && items[index]) {
            sentenceEl.style.opacity = '0';
            sentenceEl.style.transform = 'translateY(6px)';
            setTimeout(function () {
                sentenceEl.textContent = items[index].sentence;
                sentenceEl.style.opacity = '1';
                sentenceEl.style.transform = 'translateY(0)';
            }, 150);
        }
    }

    // --- Load-in animation
    var loadObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            section.classList.add('has-loaded');
            rows.forEach(function (row, i) {
                setTimeout(function () {
                    row.classList.add('is-visible');
                }, 200 + i * 100);
            });
            loadObserver.disconnect();
        });
    }, { threshold: 0.15 });
    loadObserver.observe(section);

    // --- Scroll Trigger: activate options sequentially as user scrolls down
    function updateScrollTrigger() {
        var viewportHeight = window.innerHeight;
        var viewportCenter = viewportHeight * 0.45;
        var bestIndex = activeIndex;
        var minDistance = Infinity;

        rows.forEach(function (row, i) {
            var rect = row.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < viewportHeight) {
                var rowCenter = rect.top + rect.height / 2;
                var distance = Math.abs(viewportCenter - rowCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    bestIndex = i;
                }
            }
        });

        if (bestIndex !== -1) {
            setActiveIndex(bestIndex);
        }
    }

    window.addEventListener('scroll', updateScrollTrigger, { passive: true });
    window.addEventListener('resize', updateScrollTrigger, { passive: true });

    // Initial activation
    rows[0].classList.add('is-active');

    // Interactive click & hover fallback triggers
    rows.forEach(function (row, i) {
        row.addEventListener('click', function () {
            setActiveIndex(i);
        });
        row.addEventListener('mouseenter', function () {
            setActiveIndex(i);
        });
    });
})();

