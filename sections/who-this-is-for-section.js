/* "Who this is for" - scroll-driven pinned version.

   Kept entirely separate from index_pink.html on purpose, same pattern
   as earn-scroll-section.js/earn-section.js/preloader.js: this file
   injects its own <style> and markup into the
   #who-this-is-for-section-mount div left in the main page (right
   after the "More ways to earn than one" scroll section), so nothing
   about this section's markup, styling or behavior lives in the main
   file itself - the main file only has a mount point + a <script src>
   for this.

   Source: adapted from the standalone who-this-is-for (2).html demo.
   Two things were deliberately dropped from that demo on the way in,
   same as earn-scroll-section.js: the two "demo-spacer" placeholder
   blocks it used to have scroll room to pin against (this page already
   has real sections above and below to scroll through), and their
   "Scroll down..."/"Section unpins here..." instructional captions,
   which were demo-only scaffolding, not real page copy.

   All classes/ids/CSS custom properties are prefixed "who-scroll-"
   (CSS) / "whoScroll" (JS ids) - renamed from the source demo's bare
   "who-"/"who" names so this can sit on the same page as
   earn-scroll-section.js (and anything else) without any collisions.

   Visual language matches the rest of the site's existing tokens: the
   pink/lavender gradient background (var(--color-1) -> var(--color-2),
   the same one used on <html> and on .earn-scroll-section from
   earn-scroll-section.js) and the site's purple accent (#545784,
   var(--color-3)) rather than the demo's own hand-picked
   --color-accent value (which happens to already be that same purple,
   kept as-is). The demo's --color-card-active (#46486e) is also kept
   as-is - it's already close to the site's own dark ink tone and reads
   correctly as an "active card" fill.

   Behavior: a 940vh scroll wrapper pins the section for the duration of
   the scroll and moves through 8 steps: an intro full-screen line
   ("Who this is for?"), the heading sliding from center into its
   resting spot in the left column, the 5 audience points revealed and
   spotlighted one at a time (Full-Time Freelancer, New Independent,
   Side-Hustler, Consultant, Gen Z Independent) with a matching dynamic
   sentence under the heading, then a closing full-screen tagline -
   see the IIFE below for the scroll-to-progress math (unchanged from
   the source demo, only renamed). */
(function () {
    var mount = document.getElementById('who-this-is-for-section-mount');
    if (!mount) return;

    var css = ''
        + '.who-scroll-wrapper *{box-sizing:border-box;}'
        + '.who-scroll-wrapper{position:relative;height:940vh;font-family:"Outfit",sans-serif;color:#1a1a2e;}'
        /* No background of its own - fully transparent, so the single
           page-wide gradient on <html> (linear-gradient(45deg,
           var(--color-1), var(--color-2)), background-attachment:fixed)
           shows straight through. That gradient is the only one the
           page paints anywhere.

           An earlier attempt had this section (and
           earn-scroll-section.js) each paint their own local copy of
           that same gradient instead. That cannot work: two stacked
           100vh boxes each painting a 45deg gradient from their own
           top-left means the END color of one meets the START color of
           the next at their shared edge - a guaranteed hard line,
           exactly the seam this was meant to remove.

           Note the deliberate absence of overflow:hidden here too.
           position:sticky + overflow:hidden is what promotes this
           section to its own compositing layer, and a
           background-attachment:fixed image gets recomputed per
           compositing layer at paint time - which made <html>'s shared
           background itself paint inconsistently across the boundary.
           overflow:hidden was only ever needed to clip the decorative
           blob glows, and those are gone (an earlier version of both
           files had them, positioned per-section, and their mismatch
           at each handoff was its own separate source of seam), so
           dropping it keeps both pinned sections in the same layer as
           the rest of the page and lets the one fixed background
           render continuously across them. */
        + '.who-scroll-section{position:sticky;top:0;height:100vh;width:100%;display:flex;align-items:center;background:transparent;}'
        + '.who-scroll-container{width:100%;max-width:75rem;margin:0 auto;padding:0 2rem;position:relative;z-index:2;display:flex;flex-direction:row;align-items:center;justify-content:space-between;height:100%;gap:4rem;opacity:1;transform:scale(1);filter:blur(0);transition:opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1), filter .65s ease;}'
        + '.who-scroll-container.is-intro-active,.who-scroll-container.is-finale-active{opacity:0;transform:scale(.97);filter:blur(8px);pointer-events:none;}'
        + '.who-scroll-left-panel{flex:1;display:flex;flex-direction:column;gap:3rem;max-width:34rem;}'
        + '.who-scroll-right-panel{flex:1;display:flex;align-items:center;width:100%;}'
        + '.who-scroll-heading-holder{max-width:100%;opacity:0;filter:blur(6px);transform:translate(var(--wshx, 0px), var(--wshy, 0px));transition:opacity .5s cubic-bezier(.16,1,.3,1), filter .5s ease;will-change:transform,opacity;}'
        + '.who-scroll-heading-holder.is-visible{opacity:1;filter:blur(0);}'
        + '.who-scroll-heading{font-size:clamp(2.2rem, 4vw, 3.5rem);font-weight:600;line-height:1.1;letter-spacing:-.02em;color:#1a1a2e;margin:0;}'
        + '.who-scroll-heading .pink{color:#545784;}'
        + '.who-scroll-bottom-row{display:flex;align-items:center;justify-content:flex-start;width:100%;opacity:0;transform:translateY(10px);filter:blur(5px);transition:opacity .55s ease, transform .55s ease, filter .5s ease;}'
        + '.who-scroll-bottom-row.is-visible{opacity:1;transform:translateY(0);filter:blur(0);}'
        + '.who-scroll-sentence-text{font-size:clamp(1.1rem, 1.8vw, 1.4rem);font-weight:400;line-height:1.35;color:#000;text-align:left;width:100%;opacity:1;filter:blur(0);transition:opacity .4s ease, filter .4s ease;will-change:opacity,filter;margin:0;}'
        + '.who-scroll-sentence-text .pink{color:#000;font-weight:400;}'
        + '.who-scroll-stage{position:relative;width:100%;}'
        + '.who-scroll-list{display:flex;flex-direction:column;gap:.8rem;}'
        + '.who-scroll-point{display:flex;align-items:flex-start;padding:1.4rem 1.8rem;border-radius:1rem;opacity:0;transform:translateY(22px) scale(.97);background:rgba(255,255,255,0.3);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1), background .35s ease, box-shadow .35s ease;}'
        + '.who-scroll-point.is-visible{opacity:1;transform:translateY(0) scale(1);}'
        + '.who-scroll-point.is-current{opacity:1;transform:translateY(0) scale(1.02);background:#46486e;box-shadow:0 16px 36px rgba(51,53,90,.28);}'
        + '.who-scroll-point-text{min-width:0;flex:1 1 auto;}'
        + '.who-scroll-point-title{font-size:clamp(1.1rem, 1.8vw, 1.4rem);font-weight:600;line-height:1.2;color:#1a1a2e;margin:0 0 .4rem;transition:color .3s ease;}'
        + '.who-scroll-point-desc{font-size:1rem;line-height:1.45;color:rgba(0,0,0,.66);margin:0;transition:color .3s ease;}'
        + '.who-scroll-point.is-current .who-scroll-point-title,.who-scroll-point.is-current .who-scroll-point-desc{color:#ffffff;}'
        + '.who-scroll-intro,.who-scroll-final{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 3rem;opacity:0;transform:scale(.94);filter:blur(10px);pointer-events:none;transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1), filter .7s cubic-bezier(.16,1,.3,1);}'
        + '.who-scroll-intro.is-visible,.who-scroll-final.is-visible{opacity:1;transform:scale(1);filter:blur(0);pointer-events:auto;}'
        + '.who-scroll-fullscreen-tagline{font-size:clamp(1.9rem, 4.2vw, 3.2rem);font-weight:700;line-height:1.25;letter-spacing:-.01em;color:#1a1a2e;max-width:42rem;margin:0 auto;}'
        + '.who-scroll-fullscreen-tagline .pink{color:#545784;}'
        // Mobile point list: unlike desktop (where only the current
        // point is shown, absolutely stacked in place of the others),
        // mobile keeps every already-seen point visible, stacked
        // underneath the current one in normal document flow - the
        // current point stays highlighted at the top of the stack,
        // older points below it fade progressively lighter the further
        // down (older) they are. Not-yet-reached points stay collapsed
        // (0 height) below the fold so the stage doesn't jump ahead of
        // the scroll position. --who-fade-depth (0 = current, 1 = one
        // step older, 2 = two steps older, ...) is set per-point from
        // JS in setActiveIndex() and drives the opacity via
        // calc() below - one rule handles every depth instead of a
        // fixed per-index class list.
        // .who-scroll-container is a flex box that used to center its
        // content vertically (justify-content:center) - fine when only
        // one point was ever visible at a time, but once older points
        // stack up below the current one the content block grows
        // taller than the 100vh pinned section, and centering pushes
        // the OVERFLOW EQUALLY off both the top and bottom - the top
        // edge ends up poking up underneath the fixed nav. Anchored to
        // flex-start instead (with top padding to clear the nav) so
        // growth only ever pushes downward, and .who-scroll-stage
        // scrolls internally (own overflow-y) once the stack no longer
        // fits, rather than the whole pinned section growing past
        // 100vh.
        + '@media screen and (max-width:991px){'
        + '  .who-scroll-container{flex-direction:column;align-items:center;justify-content:flex-start;gap:1.25rem;padding:5.5rem 1.5rem 1.5rem;text-align:center;height:100%;}'
        + '  .who-scroll-left-panel,.who-scroll-right-panel{max-width:100%;align-items:center;flex:none;width:100%;}'
        + '  .who-scroll-left-panel{gap:1rem;align-items:center;flex:none;}'
        + '  .who-scroll-right-panel{flex:1 1 auto;min-height:0;align-items:flex-start;}'
        + '  .who-scroll-heading-holder{text-align:center;}'
        + '  .who-scroll-heading{font-size:clamp(1.5rem, 6vw, 2.1rem);text-align:center;}'
        + '  .who-scroll-sentence-text{text-align:center;}'
        + '  .who-scroll-bottom-row{justify-content:center;}'
        + '  .who-scroll-stage{position:relative;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;}'
        + '  .who-scroll-list{position:relative;width:100%;display:flex;flex-direction:column;}'
        /* order:99 on the base (not-yet-visible) rule pushes every
           not-yet-reached point to the very end of the flex order,
           behind every point that actually has an order override
           (-1 for current, --who-fade-depth 1/2/3/4 for older ones) -
           without this they default to order:0, which sorts BETWEEN
           the current point (order:-1) and any older point past depth
           0 (order:1+). Three invisible, 0-height points would then
           still occupy slots in the middle of the stack, each still
           contributing its own margin-bottom gap - exactly the "far
           below" gap in the reported screenshot, since those collapsed
           points' spacing added up between the current card and the
           next actually-visible one. margin-bottom:0 here (only
           restored on .is-visible) closes the same gap from the
           spacing side too. */
        + '  .who-scroll-point{position:relative;width:100%;text-align:left;padding:1rem 1.2rem;margin-bottom:0;opacity:0;max-height:0;transform:translateY(-10px) scale(.97);pointer-events:none;overflow:hidden;order:99;transition:opacity .5s cubic-bezier(.16,1,.3,1), transform .5s cubic-bezier(.16,1,.3,1), max-height .5s cubic-bezier(.16,1,.3,1), margin-bottom .5s cubic-bezier(.16,1,.3,1), background .35s ease, box-shadow .35s ease;}'
        + '  .who-scroll-point.is-visible{opacity:calc(1 - (var(--who-fade-depth, 0) * .22));max-height:12rem;margin-bottom:.7rem;transform:translateY(0) scale(1);pointer-events:auto;order:var(--who-fade-depth, 0);}'
        + '  .who-scroll-point.is-current{opacity:1;transform:translateY(0) scale(1.02);background:#46486e;box-shadow:0 16px 36px rgba(51,53,90,.28);order:-1;}'
        + '  .who-scroll-point-title{font-size:1.1rem;}'
        + '  .who-scroll-point-desc{font-size:.92rem;}'
        + '}'
        + '@media (prefers-reduced-motion: reduce){'
        + '  .who-scroll-container,.who-scroll-point,.who-scroll-sentence-text,.who-scroll-intro,.who-scroll-final{transition-duration:.01ms !important;}'
        + '}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var points = [
        { title: 'The Full-Time Freelancer', desc: 'Already independent, already skilled, tired of proving it every single time.', sentence: 'Built for <span class="pink">the full-time freelancer</span>.' },
        { title: 'The New Independent', desc: 'New to independence, not new to delivering results.', sentence: 'Built for <span class="pink">the new independent</span>.' },
        { title: 'The Side-Hustler', desc: 'Building something of their own, one project at a time, alongside everything else.', sentence: 'Built for <span class="pink">the side-hustler</span>.' },
        { title: 'The Consultant', desc: 'Sells expertise, not hours.', sentence: 'Built for <span class="pink">the consultant</span>.' },
        { title: 'The Gen Z Independent', desc: 'Never wanted the 9-to-5 in the first place. Wants freedom that actually pays.', sentence: 'Built for <span class="pink">the Gen Z independent</span>.' }
    ];

    var pointsHtml = points.map(function (p, i) {
        return ''
            + '<div class="who-scroll-point" data-index="' + i + '">'
            + '  <div class="who-scroll-point-text">'
            + '    <h3 class="who-scroll-point-title">' + p.title + '</h3>'
            + '    <p class="who-scroll-point-desc">' + p.desc + '</p>'
            + '  </div>'
            + '</div>';
    }).join('');

    mount.outerHTML = ''
        + '<div class="who-scroll-wrapper" id="whoScrollWrapper">'
        + '  <section class="who-scroll-section" id="whoScrollSection">'
        + '    <div class="who-scroll-container" id="whoScrollContainer">'
        + '      <div class="who-scroll-left-panel">'
        + '        <div class="who-scroll-heading-holder" id="whoScrollHeadingHolder">'
        + '          <h2 class="who-scroll-heading">Every kind of <span class="pink">independent</span>, welcome here.</h2>'
        + '        </div>'
        + '        <div class="who-scroll-bottom-row" id="whoScrollBottomRow">'
        + '          <div class="who-scroll-sentence-text" id="whoScrollDynamicSentence">Built for <span class="pink">the full-time freelancer</span>.</div>'
        + '        </div>'
        + '      </div>'
        + '      <div class="who-scroll-right-panel">'
        + '        <div class="who-scroll-stage">'
        + '          <div class="who-scroll-list" id="whoScrollList">' + pointsHtml + '</div>'
        + '        </div>'
        + '      </div>'
        + '    </div>'
        + '    <div class="who-scroll-intro" id="whoScrollIntro">'
        + '      <h2 class="wl-scroll-intro-heading">Who this is <span class="pink">for?</span></h2>'
        + '    </div>'
        + '    <div class="who-scroll-final" id="whoScrollFinal">'
        + '      <h3 class="who-scroll-fullscreen-tagline">Different paths. <span class="pink">Same system.</span> Built for however you choose to work.</h3>'
        + '    </div>'
        + '  </section>'
        + '</div>';

    // --- scroll-driven step logic (unchanged from the source demo,
    // only renamed to the whoScroll* ids/classes above so this file
    // can sit on the same page as earn-scroll-section.js and anything
    // else without collisions) ---
    var wrapper       = document.getElementById('whoScrollWrapper');
    var section       = document.getElementById('whoScrollSection');
    var container     = document.getElementById('whoScrollContainer');
    var points$       = Array.prototype.slice.call(document.querySelectorAll('.who-scroll-point'));
    var intro         = document.getElementById('whoScrollIntro');
    var final         = document.getElementById('whoScrollFinal');
    var headingHolder = document.getElementById('whoScrollHeadingHolder');
    var headingEl     = headingHolder.querySelector('.who-scroll-heading');
    var bottomRow     = document.getElementById('whoScrollBottomRow');
    var sentence      = document.getElementById('whoScrollDynamicSentence');

    var POINT_COUNT = points$.length;       // 5
    var TOTAL_STEPS = POINT_COUNT + 3;      // intro (1) + heading (1) + points (5) + finale (1) = 8

    var sentences = points.map(function (p) { return p.sentence; });

    var currentActive = -1;
    var sentenceTimer = null;
    var ticking = false;

    // ---- heading FLIP setup ----
    // Measures the heading's real, natural, in-layout position (inside
    // the left panel) and computes how far it would need to travel to
    // sit centered in the viewport. That offset becomes its scroll-start
    // position, animated back down to (0,0) - its true resting place -
    // as the user scrolls through the heading step. It's one element the
    // whole time, so there's no seam between a "moving" copy and a
    // "landed" copy.
    var headingStartX = 0;
    var headingStartY = 0;

    function measureHeadingStart() {
        var hadIntro  = container.classList.contains('is-intro-active');
        var hadFinale = container.classList.contains('is-finale-active');
        var prevTransition = container.style.transition;

        container.style.transition = 'none';
        container.classList.remove('is-intro-active', 'is-finale-active');
        headingHolder.style.setProperty('--wshx', '0px');
        headingHolder.style.setProperty('--wshy', '0px');
        void container.offsetHeight; // force reflow so measurement is accurate

        var sectionRect = section.getBoundingClientRect();
        var rect = headingEl.getBoundingClientRect();
        var naturalCenterX = (rect.left - sectionRect.left) + rect.width / 2;
        var naturalCenterY = (rect.top - sectionRect.top) + rect.height / 2;

        headingStartX = (sectionRect.width / 2) - naturalCenterX;
        headingStartY = (sectionRect.height / 2) - naturalCenterY;

        if (hadIntro) container.classList.add('is-intro-active');
        if (hadFinale) container.classList.add('is-finale-active');
        container.style.transition = prevTransition;
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    var resizeTimer = null;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measureHeadingStart, 150);
    }

    function clearPoints() {
        points$.forEach(function (point) {
            point.classList.remove('is-visible', 'is-current');
        });
    }

    function setActiveIndex(index) {
        if (index === currentActive) return;
        currentActive = index;

        points$.forEach(function (point, i) {
            point.classList.toggle('is-visible', i <= index);
            point.classList.toggle('is-current', i === index);
            // Mobile stacked-list fade: depth is how many steps older
            // than the current point this one is (0 for the current
            // point itself, 1 for the point right before it, and so on)
            // - .who-scroll-point.is-visible's opacity formula in the
            // CSS above reads this to fade older points progressively
            // lighter the further down the stack they sit. Desktop
            // ignores this variable entirely (only current is ever
            // shown there), so it's harmless to set unconditionally.
            point.style.setProperty('--who-fade-depth', String(Math.max(0, index - i)));
        });

        if (sentences[index]) {
            clearTimeout(sentenceTimer);
            sentence.style.filter = 'blur(9px)';
            sentence.style.opacity = '0';
            sentenceTimer = setTimeout(function () {
                sentence.innerHTML = sentences[index];
                sentence.style.filter = 'blur(0)';
                sentence.style.opacity = '1';
            }, 190);
        }
    }

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function update() {
        ticking = false;
        var rect = wrapper.getBoundingClientRect();
        var viewportH = window.innerHeight;
        var scrollableHeight = wrapper.offsetHeight - viewportH;
        if (scrollableHeight <= 0) return;

        var scrolled = -rect.top;
        var progress = clamp(scrolled / scrollableHeight, 0, 1);

        var raw = progress * TOTAL_STEPS;
        var stepFloor = Math.min(Math.floor(raw), TOTAL_STEPS - 1);
        var stepFrac = raw - stepFloor;

        if (stepFloor === 0) {
            // ---- step 0: intro, full-screen "Who this is for?" ----
            var ENTER_AT = 0.08;
            var EXIT_AT  = 0.7;
            var introVisible = stepFrac > ENTER_AT && stepFrac <= EXIT_AT;

            intro.classList.toggle('is-visible', introVisible);
            final.classList.remove('is-visible');
            container.classList.remove('is-finale-active');
            container.classList.add('is-intro-active');

            headingHolder.classList.remove('is-visible');
            headingHolder.style.setProperty('--wshx', headingStartX + 'px');
            headingHolder.style.setProperty('--wshy', headingStartY + 'px');
            bottomRow.classList.remove('is-visible');

            if (currentActive !== -1) {
                clearPoints();
                currentActive = -1;
            }
        } else if (stepFloor === 1) {
            // ---- step 1: heading opens centered, slides + fades into
            // its real left-column position in one continuous motion ----
            intro.classList.remove('is-visible');
            final.classList.remove('is-visible');
            container.classList.remove('is-finale-active');
            container.classList.remove('is-intro-active');
            bottomRow.classList.remove('is-visible');

            var FADE_ENTER  = 0.10;
            var SHIFT_START = 0.06;
            var SHIFT_END   = 0.85;

            headingHolder.classList.toggle('is-visible', stepFrac > FADE_ENTER);

            var t = clamp((stepFrac - SHIFT_START) / (SHIFT_END - SHIFT_START), 0, 1);
            var eased = easeOutCubic(t);
            headingHolder.style.setProperty('--wshx', (headingStartX * (1 - eased)) + 'px');
            headingHolder.style.setProperty('--wshy', (headingStartY * (1 - eased)) + 'px');

            if (currentActive !== -1) {
                clearPoints();
                currentActive = -1;
            }
        } else if (stepFloor <= POINT_COUNT + 1) {
            // ---- point-by-point reveal (heading is already in place) ----
            intro.classList.remove('is-visible');
            final.classList.remove('is-visible');
            container.classList.remove('is-intro-active');
            container.classList.remove('is-finale-active');
            headingHolder.classList.add('is-visible');
            headingHolder.style.setProperty('--wshx', '0px');
            headingHolder.style.setProperty('--wshy', '0px');
            bottomRow.classList.add('is-visible');
            setActiveIndex(stepFloor - 2);
        } else {
            // ---- finale: full-screen closing line ----
            intro.classList.remove('is-visible');
            container.classList.remove('is-intro-active');
            headingHolder.classList.add('is-visible');
            headingHolder.style.setProperty('--wshx', '0px');
            headingHolder.style.setProperty('--wshy', '0px');
            bottomRow.classList.add('is-visible');

            var finaleVisible = stepFrac > 0.12 || progress >= 0.999;
            if (currentActive !== POINT_COUNT) {
                points$.forEach(function (point) { point.classList.add('is-visible'); point.classList.remove('is-current'); });
                currentActive = POINT_COUNT;
            }
            container.classList.toggle('is-finale-active', finaleVisible);
            final.classList.toggle('is-visible', finaleVisible);
        }
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    measureHeadingStart();
    update();
})();
