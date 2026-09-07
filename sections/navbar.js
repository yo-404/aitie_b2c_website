/* Shared navbar, injected into #global-navbar-mount.

   DESKTOP (>991px): the original Webflow horizontal navbar - inline links
   (Home / About / Features / Blogs / Contact) + a "Join Waitlist" button.
   Untouched from how it was.

   MOBILE (<=991px): a square hamburger button + full-page overlay menu, with
   "Join Waitlist" as a solid action button, and the bar hides on scroll down /
   reappears on scroll up.
*/
(function () {
    var navMount = document.getElementById('global-navbar-mount');
    if (!navMount) return;

    var ACCENT = '#545784';
    var INK = '#1a1a2e';

    /* ---------------- shared / desktop (Webflow) CSS ---------------- */
    var cssDesktop = ''
        /* hide the page scrollbar everywhere (content still scrolls) */
        + 'html{scrollbar-width:none;-ms-overflow-style:none;}'
        + 'html::-webkit-scrollbar,body::-webkit-scrollbar{width:0 !important;height:0 !important;display:none !important;}'
        + '.nav-logo-desktop .logo-wrap,.nav-logo-mobile .logo-wrap{mix-blend-mode:difference;}'
        + '.nav_background,.w-nav,.nav,.navbar,.nav_wrap,.nav-container,.nav-04-container,.navbar-holder,.w-layout-vflex,.nav-logo-desktop,.nav-logo-mobile,.nav-logo-wrap,.nav-logo-link{background:transparent !important;background-color:transparent !important;box-shadow:none !important;}'
        + '.nav-menu-links{background-color:#000 !important;border-color:rgba(84,87,132,.25) !important;}'
        + '.nav_buttons-wrap .button{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;}'
        + '.nav_buttons-wrap .button .button-text{transition:transform .35s cubic-bezier(.16,1,.3,1),opacity .35s ease;}'
        + '.nav_buttons-wrap .button .button-text-2nd{position:absolute;top:100%;left:0;width:100%;text-align:center;transition:transform .35s cubic-bezier(.16,1,.3,1),opacity .35s ease;}'
        + '.nav_buttons-wrap .button:hover .button-text{transform:translateY(-100%);}'
        + '.nav_buttons-wrap .button:hover .button-text-2nd{transform:translateY(-100%);}'
        + '.nav-link-wrap a.nav-link{transition:opacity .25s ease,color .25s ease;}'
        + '.nav-link-wrap a.nav-link:hover{opacity:.7;}'
        + '.w-webflow-badge,.buy-template-panel{display:none !important;visibility:hidden !important;opacity:0 !important;pointer-events:none !important;}';

    /* ---------------- mobile overlay CSS ----------------
       The mobile chrome is display:none EVERYWHERE by default and only
       turned back on inside the <=991px media query, so nothing mobile
       ever renders on desktop. */
    var cssMobile = [
        '.aitie-mnav,.aitie-burger,.aitie-menu{display:none !important;}',

        '@media screen and (max-width:991px){',
        /* the Webflow bar is fully replaced by our own on mobile */
        '  .nav_wrap{display:none !important;}',
        '  .aitie-mnav{display:flex !important;}',
        '  .aitie-burger{display:flex !important;}',
        '  .aitie-menu{display:flex !important;}',

        '  .aitie-mnav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;',
        '    padding:1rem clamp(1rem,5vw,1.75rem);pointer-events:none;',
        '    transition:transform .35s cubic-bezier(.16,1,.3,1),opacity .3s ease;}',
        '  .aitie-mnav.is-hidden{transform:translateY(-130%);opacity:0;pointer-events:none;}',
        '  .aitie-mnav > *{pointer-events:auto;}',
        '  .aitie-mnav-logo{display:inline-flex;align-items:center;text-decoration:none;transition:opacity .2s ease;}',
        '  .aitie-mnav-logo:active{opacity:.6;}',
        '  .aitie-mnav-logo img{height:1.6rem;width:auto;display:block;mix-blend-mode:difference;}',
        '  .aitie-mnav-actions{display:flex;align-items:center;gap:.6rem;}',

        '  .aitie-mnav-cta{display:inline-flex;align-items:center;justify-content:center;padding:.58rem 1.2rem;border-radius:999px;',
        '    background:' + INK + ';color:#fff;font-family:inherit;font-weight:700;font-size:.88rem;letter-spacing:-.01em;',
        '    text-decoration:none;white-space:nowrap;box-shadow:0 6px 18px rgba(26,26,46,.22);transition:transform .18s ease;}',
        '  .aitie-mnav-cta:active{transform:scale(.96);}',

        '  .aitie-burger{position:relative;width:2.9rem;height:2.9rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.32rem;',
        '    background:rgba(255,255,255,.14);border:1px solid rgba(84,87,132,.16);border-radius:.7rem;cursor:pointer;',
        '    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
        '    transition:background .25s ease,border-color .25s ease,transform .15s ease;-webkit-tap-highlight-color:transparent;}',
        '  .aitie-burger:active{transform:scale(.94);}',
        '  .aitie-burger span{display:block;width:1.15rem;height:2px;border-radius:2px;background:' + INK + ';',
        '    transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .2s ease,background-color .25s ease;}',
        '  .aitie-burger.is-open{background:' + INK + ';border-color:rgba(185,173,246,.35);}',
        '  .aitie-burger.is-open span{background:#fff;}',
        '  .aitie-burger.is-open span:nth-child(1){transform:translateY(.41rem) rotate(45deg);}',
        '  .aitie-burger.is-open span:nth-child(2){opacity:0;transform:scaleX(0);}',
        '  .aitie-burger.is-open span:nth-child(3){transform:translateY(-.41rem) rotate(-45deg);}',

        '  .aitie-menu{position:fixed;inset:0;z-index:999;display:flex;flex-direction:column;',
        '    background:linear-gradient(160deg,#EDEAFB,#b9adf6 90%);',
        '    opacity:0;visibility:hidden;transition:opacity .45s cubic-bezier(.16,1,.3,1),visibility 0s linear .45s;',
        '    overflow-y:auto;overscroll-behavior:contain;}',
        '  .aitie-menu.is-open{opacity:1;visibility:visible;transition:opacity .45s cubic-bezier(.16,1,.3,1);}',
        '  .aitie-menu-inner{width:100%;max-width:32rem;margin:auto;padding:6rem clamp(1.5rem,7vw,2.5rem) 3rem;display:flex;flex-direction:column;gap:2.2rem;}',

        '  .aitie-menu .aitie-reveal{opacity:0;transform:translateY(20px);transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);}',
        '  .aitie-menu.is-open .aitie-reveal{opacity:1;transform:translateY(0);}',
        '  .aitie-menu.is-open .aitie-reveal:nth-child(1){transition-delay:.08s;}',
        '  .aitie-menu.is-open .aitie-reveal:nth-child(2){transition-delay:.16s;}',
        '  .aitie-menu.is-open .aitie-reveal:nth-child(3){transition-delay:.24s;}',
        '  .aitie-menu.is-open .aitie-reveal:nth-child(4){transition-delay:.32s;}',

        '  .aitie-primary{display:flex;flex-direction:column;gap:.15rem;}',
        '  .aitie-primary a{display:inline-block;width:max-content;font-family:inherit;font-weight:800;letter-spacing:-.02em;',
        '    font-size:clamp(2rem,9vw,2.7rem);line-height:1.22;color:' + INK + ';text-decoration:none;transition:color .2s ease;}',
        '  .aitie-primary a:active{color:' + ACCENT + ';}',

        '  .aitie-secondary{display:flex;flex-wrap:wrap;gap:.6rem 1.5rem;}',
        '  .aitie-secondary a{font-family:inherit;font-weight:600;font-size:1.02rem;color:rgba(26,26,46,.72);text-decoration:none;}',

        '  .aitie-socials{display:flex;align-items:center;gap:.75rem;}',
        '  .aitie-socials a{display:inline-flex;align-items:center;justify-content:center;width:2.7rem;height:2.7rem;border-radius:999px;',
        '    background:rgba(255,255,255,.55);border:1px solid rgba(84,87,132,.2);color:' + ACCENT + ';text-decoration:none;}',
        '  .aitie-socials svg{width:1.1rem;height:1.1rem;}',

        '  .aitie-legal{margin-top:.3rem;padding-top:1.3rem;border-top:1px solid rgba(84,87,132,.22);display:flex;flex-direction:column;gap:.75rem;}',
        '  .aitie-legal a{display:inline-block;width:max-content;font-family:inherit;font-size:.85rem;font-weight:500;color:rgba(26,26,46,.55);text-decoration:none;transition:color .2s ease;}',
        '  .aitie-legal a:active{color:' + INK + ';}',

        '  body.aitie-menu-open{overflow:hidden;}',
        '}',
        '@media (prefers-reduced-motion:reduce){.aitie-menu,.aitie-menu .aitie-reveal,.aitie-burger span,.aitie-mnav{transition-duration:.01ms !important;}}'
    ].join('');

    var styleEl = document.createElement('style');
    styleEl.textContent = cssDesktop + cssMobile;
    document.head.appendChild(styleEl);

    var iconMail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 6-10 7L2 6"></path></svg>';
    var iconLinkedIn = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.137 1.445-2.137 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z"></path></svg>';

    /* ---------------- DESKTOP navbar markup (original Webflow) ---------------- */
    var desktopHtml = ''
        + '<div mdlfy-content="component" class="nav_wrap">'
        + '  <div class="navbar">'
        + '    <div data-w-id="1d33f374-784d-2d4e-f557-d2a85347d2a6" data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" class="nav w-nav">'
        + '      <div class="container-medium nav-container nav-04-container">'
        + '        <div class="w-layout-vflex navbar-holder">'
        + '          <div class="nav-logo-mobile"><a href="/" class="nav-logo-link w-nav-brand">'
        + '              <div class="nav-logo-wrap">'
        + '                <div class="logo-wrap"><img loading="lazy" src="images/logotype_black.svg" alt="Logo" class="logo-image" /></div>'
        + '              </div>'
        + '            </a></div>'
        + '          <nav role="navigation" class="nav-menu-button w-nav-menu">'
        + '            <div class="nav-logo-desktop"><a href="/" class="nav-logo-link w-nav-brand">'
        + '                <div class="nav-logo-wrap">'
        + '                  <div class="logo-wrap"><img loading="lazy" src="images/logotype_black.svg" alt="Logo" class="logo-image" /></div>'
        + '                </div>'
        + '              </a></div>'
        + '            <div class="nav-menu-links">'
        + '              <div class="nav-link-wrap"><a href="/" class="nav-link w-inline-block"><p>Home</p></a></div>'
        + '              <div class="nav-link-wrap"><a href="about.html" class="nav-link w-inline-block"><p>About</p></a></div>'
        + '              <div class="nav-link-wrap flex-center"><div><a href="feature.html" class="nav-link w-inline-block"><p>Features</p></a></div></div>'
        + '              <div class="nav-link-wrap flex-center"><div><a href="blogs.html" class="nav-link w-inline-block"><p>Blogs</p></a></div></div>'
        + '              <div class="nav-link-wrap flex-center"><div><a href="contact.html" class="nav-link w-inline-block"><p>Contact</p></a></div></div>'
        + '            </div>'
        + '            <div class="nav_buttons-wrap">'
        + '              <div><a href="waitlist.html" class="button w-inline-block">'
        + '                  <p class="button-text">Join Waitlist</p>'
        + '                  <p class="button-text-2nd">Join Waitlist</p>'
        + '                </a></div>'
        + '              <div data-w-id="1d33f374-784d-2d4e-f557-d2a85347d2d3" class="nav-icon-holder"><img src="https://cdn.prod.website-files.com/6929b6c693cb856e01ef7c05/692d7284f7e2d2e1e55f3636_Mark.svg" loading="lazy" alt="" class="nav-icon" /></div>'
        + '            </div>'
        + '            <div class="nav_mobile-bg-holder">'
        + '              <div class="nav_background"></div>'
        + '            </div>'
        + '          </nav>'
        + '          <div class="nav_mobile-bg-holder">'
        + '            <div class="nav_background"></div>'
        + '          </div>'
        + '          <div class="nav_menu-button w-nav-button">'
        + '            <div class="menu_icon-wrap">'
        + '              <div class="menu_line-top"></div>'
        + '              <div class="menu_line-middle"></div>'
        + '              <div class="menu_line-bottom"></div>'
        + '            </div>'
        + '          </div>'
        + '        </div>'
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</div>';

    /* ---------------- MOBILE navbar + overlay markup ---------------- */
    var mobileHtml = ''
        + '<header class="aitie-mnav" id="aitieMnav">'
        + '  <a href="/" class="aitie-mnav-logo" aria-label="Aitie home"><img src="images/logotype_black.svg" alt="Aitie" /></a>'
        + '  <div class="aitie-mnav-actions">'
        + '    <a href="waitlist.html" class="aitie-mnav-cta">Join Waitlist</a>'
        + '    <button type="button" class="aitie-burger" id="aitieBurger" aria-label="Open menu" aria-expanded="false" aria-controls="aitieMenu">'
        + '      <span></span><span></span><span></span>'
        + '    </button>'
        + '  </div>'
        + '</header>'
        + '<nav class="aitie-menu" id="aitieMenu" aria-label="Main menu" aria-hidden="true">'
        + '  <div class="aitie-menu-inner">'
        + '    <div class="aitie-primary aitie-reveal">'
        + '      <a href="/">Home</a>'
        + '      <a href="about.html">About</a>'
        + '      <a href="feature.html">Features</a>'
        + '      <a href="contact.html">Contact</a>'
        + '    </div>'
        + '    <div class="aitie-secondary aitie-reveal">'
        + '      <a href="blogs.html">Blogs</a>'
        + '      <a href="careers.html">Careers</a>'
        + '      <a href="waitlist.html">Join Waitlist</a>'
        + '    </div>'
        + '    <div class="aitie-socials aitie-reveal">'
        + '      <a href="mailto:app@aitie.co" aria-label="Email Aitie">' + iconMail + '</a>'
        + '      <a href="https://www.linkedin.com/company/aitie-app/" target="_blank" rel="noopener noreferrer" aria-label="Aitie on LinkedIn">' + iconLinkedIn + '</a>'
        + '    </div>'
        + '    <div class="aitie-legal aitie-reveal">'
        + '      <a href="terms-and-conditions.html">Terms &amp; Conditions</a>'
        + '      <a href="privacy-policy.html">Privacy Policy</a>'
        + '      <a href="support.html">Support</a>'
        + '      <a href="data-deletion.html">Data Deletion</a>'
        + '    </div>'
        + '  </div>'
        + '</nav>';

    navMount.outerHTML = desktopHtml + mobileHtml;

    /* ---------------- mobile overlay behaviour ---------------- */
    var mnav = document.getElementById('aitieMnav');
    var burger = document.getElementById('aitieBurger');
    var menu = document.getElementById('aitieMenu');
    if (!mnav || !burger || !menu) return;

    function setOpen(open) {
        burger.classList.toggle('is-open', open);
        menu.classList.toggle('is-open', open);
        document.body.classList.toggle('aitie-menu-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (open) mnav.classList.remove('is-hidden');
    }

    burger.addEventListener('click', function () {
        setOpen(!menu.classList.contains('is-open'));
    });
    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
    });

    /* hide on scroll down / show on scroll up (mobile only) */
    var mqMobile = window.matchMedia('(max-width: 991px)');
    var lastY = window.scrollY || 0;
    var ticking = false;
    var THRESHOLD = 6;

    function apply() {
        ticking = false;
        var y = window.scrollY || document.documentElement.scrollTop || 0;
        var dy = y - lastY;
        lastY = y;
        if (!mqMobile.matches || menu.classList.contains('is-open') || y < 80) {
            mnav.classList.remove('is-hidden');
            return;
        }
        if (dy > THRESHOLD) mnav.classList.add('is-hidden');
        else if (dy < -THRESHOLD) mnav.classList.remove('is-hidden');
    }
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(apply);
    }, { passive: true });

    function syncMode() { if (!mqMobile.matches) mnav.classList.remove('is-hidden'); }
    (mqMobile.addEventListener ? mqMobile.addEventListener('change', syncMode) : mqMobile.addListener(syncMode));
})();
