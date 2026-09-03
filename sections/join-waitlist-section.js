/* "Join the waitlist" - scroll-driven pinned version.

   Kept entirely separate from index_pink.html on purpose, same pattern
   as earn-scroll-section.js/who-this-is-for-section.js: this file
   injects its own <style> and markup into the
   #join-waitlist-section-mount div left in the main page (in place of
   the old "Add your Notes in minutes" section, which was removed), so
   nothing about this section's markup, styling or behavior lives in
   the main file itself - the main file only has a mount point + a
   <script src> for this.

   Source: adapted from the standalone join-waitlist.html demo. As with
   the other two scroll sections, the two "demo-spacer" placeholder
   blocks (used in the demo to have scroll room to pin against) and
   their "Scroll down..."/"Section unpins here..." instructional
   captions are dropped - demo-only scaffolding, not real page copy.

   Background: this section paints NO background of its own (no local
   gradient, no radial highlight, no decorative blob glows - the demo's
   own version of all three are dropped entirely here). It sits fully
   transparent so the single page-wide gradient on <html>
   (linear-gradient(45deg, var(--color-1), var(--color-2)),
   background-attachment:fixed) shows straight through, exactly like
   earn-scroll-section.js and who-this-is-for-section.js. See the long
   comment on .earn-scroll-section in that file for why: two adjacent
   sections each painting their own copy of a diagonal gradient produces
   a hard seam at the shared edge, and position:sticky + overflow:hidden
   forces a section onto its own compositing layer, which makes even a
   background-attachment:fixed image painted on <html> render
   inconsistently across that boundary. Both problems go away once
   nothing but <html> ever paints a background and overflow:hidden is
   dropped from the pinned section.

   All classes/ids are prefixed "wl-scroll-" (CSS) / "wlScroll" (JS ids)
   - renamed from the source demo's bare "wl-"/"wl" names so this can
   sit on the same page as the other two scroll sections without
   collisions.

   Behavior: a 500vh scroll wrapper (matching the source demo's own
   duration) pins the section and moves through 6 steps: a full-screen
   "Coming soon." moment, then the heading, subtext, CTA button, and
   social-proof row are each revealed in sequence - see the IIFE below
   for the scroll-to-progress math (ported from the source demo,
   unchanged apart from renaming). */
(function () {
    var mount = document.getElementById('join-waitlist-section-mount');
    if (!mount) return;

    var css = ''
        + '.wl-scroll-wrapper *{box-sizing:border-box;}'
        + '.wl-scroll-wrapper{position:relative;height:500vh;font-family:"Outfit",sans-serif;color:#1a1a2e;}'
        + '.wl-scroll-section{position:sticky;top:0;height:100vh;width:100%;display:flex;align-items:center;justify-content:center;background:transparent;}'

        + '.wl-scroll-intro{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 3rem;opacity:0;transform:scale(.94);filter:blur(10px);pointer-events:none;transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1), filter .7s cubic-bezier(.16,1,.3,1);}'
        + '.wl-scroll-intro.is-visible{opacity:1;transform:scale(1);filter:blur(0);pointer-events:auto;}'
        + '.wl-scroll-intro-heading{font-size:clamp(2.8rem, 8vw, 6rem);font-weight:800;line-height:1.05;letter-spacing:-.02em;color:#1a1a2e;max-width:46rem;margin:0 auto;}'
        + '.wl-scroll-intro-heading .pink{color:#545784;}'

        + '.wl-scroll-container{position:relative;z-index:2;width:100%;max-width:42rem;margin:0 auto;padding:0 2rem;display:flex;flex-direction:column;align-items:center;text-align:center;gap:1.75rem;opacity:1;transform:scale(1);filter:blur(0);transition:opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1), filter .55s ease;}'
        + '.wl-scroll-container.is-intro-active{opacity:0;transform:scale(.97);filter:blur(8px);pointer-events:none;}'

        + '.wl-scroll-item{opacity:0;transform:translateY(22px) scale(.97);filter:blur(6px);transition:opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1), filter .5s ease;}'
        + '.wl-scroll-item.is-visible{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}'

        + '.wl-scroll-heading{font-size:clamp(2.2rem, 5vw, 3.6rem);font-weight:700;line-height:1.1;letter-spacing:-.02em;color:#1a1a2e;margin:0;}'
        + '.wl-scroll-heading .pink{color:#545784;}'

        + '.wl-scroll-subtext{font-size:clamp(1rem, 1.6vw, 1.2rem);line-height:1.55;color:rgba(26,26,46,.72);max-width:34rem;margin:0;}'

        + '.wl-scroll-cta{display:inline-flex;align-items:center;gap:.6rem;font-family:"Outfit",sans-serif;font-size:1.05rem;font-weight:600;padding:1.05rem 2.2rem;border-radius:.9rem;border:none;color:#fff;background:#33355a;text-decoration:none;cursor:pointer;box-shadow:0 16px 36px rgba(51,53,90,.28);transition:background .25s ease, transform .2s ease, box-shadow .25s ease;}'
        + '.wl-scroll-cta:hover{background:#46486e;transform:translateY(-2px);box-shadow:0 20px 40px rgba(51,53,90,.34);}'
        + '.wl-scroll-cta:active{transform:translateY(0) scale(.98);}'
        + '.wl-scroll-cta svg{width:1.1rem;height:1.1rem;stroke:#fff;}'
        + '.wl-scroll-item.wl-scroll-cta-wrap.is-current .wl-scroll-cta{animation:wlScrollCtaPop .5s cubic-bezier(.16,1,.3,1);}'
        + '@keyframes wlScrollCtaPop{0%{transform:scale(.9);}60%{transform:scale(1.04);}100%{transform:scale(1);}}'

        + '.wl-scroll-proof{display:flex;align-items:center;gap:.9rem;}'
        + '.wl-scroll-avatars{display:flex;}'
        + '.wl-scroll-avatars img{width:2.3rem;height:2.3rem;border-radius:50%;border:2px solid var(--color-1, #EDEAFB);margin-left:-.6rem;object-fit:cover;display:block;background:#b9adf6;}'
        + '.wl-scroll-avatars img:first-child{margin-left:0;}'
        + '.wl-scroll-avatar-more{width:2.3rem;height:2.3rem;border-radius:50%;border:2px solid var(--color-1, #EDEAFB);margin-left:-.6rem;background:#33355a;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:700;color:#fff;}'
        + '.wl-scroll-proof-text{font-size:.88rem;color:rgba(26,26,46,.65);text-align:left;margin:0;}'
        + '.wl-scroll-proof-text strong{color:#1a1a2e;}'

        + '@media screen and (max-width:640px){'
        + '  .wl-scroll-proof{flex-direction:column;gap:.5rem;}'
        + '}'
        + '@media (prefers-reduced-motion: reduce){'
        + '  .wl-scroll-item,.wl-scroll-cta,.wl-scroll-intro,.wl-scroll-container{transition-duration:.01ms !important;animation-duration:.01ms !important;}'
        + '}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var arrowSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    mount.outerHTML = ''
        + '<div class="wl-scroll-wrapper" id="wlScrollWrapper">'
        + '  <section class="wl-scroll-section" id="wlScrollSection">'
        + '    <div class="wl-scroll-intro" id="wlScrollIntro">'
        + '      <h2 class="wl-scroll-intro-heading">Coming <span class="pink">soon</span>.</h2>'
        + '    </div>'
        + '    <div class="wl-scroll-container" id="wlScrollContainer">'
        + '      <h2 class="wl-scroll-item wl-scroll-heading" data-index="0">Be first in line for <span class="pink">the launch</span>.</h2>'
        + '      <p class="wl-scroll-item wl-scroll-subtext" data-index="1">We\'ll email you the moment we open the doors — plus a few early perks for joining before launch day.</p>'
        + '      <div class="wl-scroll-item wl-scroll-cta-wrap" data-index="2">'
        + '        <a class="wl-scroll-cta" href="waitlist.html" id="wlScrollCtaButton">'
        + '          Join the waitlist'
        + '          ' + arrowSvg
        + '        </a>'
        + '      </div>'
        + '      <div class="wl-scroll-item wl-scroll-proof" data-index="3">'
        // + '        <div class="wl-scroll-avatars">'
        // + '          <img src="https://i.pravatar.cc/64?img=32" alt="" loading="lazy">'
        // + '          <img src="https://i.pravatar.cc/64?img=47" alt="" loading="lazy">'
        // + '          <img src="https://i.pravatar.cc/64?img=12" alt="" loading="lazy">'
        // + '          <span class="wl-scroll-avatar-more">+</span>'
        // + '        </div>'
        // + '        <p class="wl-scroll-proof-text"><strong>1,204 independents</strong> already joined</p>'
        + '      </div>'
        + '    </div>'
        + '  </section>'
        + '</div>';

    // --- scroll-driven step logic, ported from the source demo with
    // only the ids/classes renamed to wl-scroll-*/wlScroll* ---
    var wrapper   = document.getElementById('wlScrollWrapper');
    var container = document.getElementById('wlScrollContainer');
    var items     = Array.prototype.slice.call(document.querySelectorAll('.wl-scroll-item'));
    var intro     = document.getElementById('wlScrollIntro');

    var ITEM_COUNT  = items.length;         // 4: heading, subtext, CTA, proof
    var TOTAL_STEPS = ITEM_COUNT + 1;       // intro (1) + items (4) = 5

    var currentActive = -1;
    var ticking = false;

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function clearItems() {
        items.forEach(function (item) {
            item.classList.remove('is-visible', 'is-current');
        });
    }

    function setActiveIndex(index) {
        if (index === currentActive) return;
        currentActive = index;

        items.forEach(function (item, i) {
            item.classList.toggle('is-visible', i <= index);
            item.classList.toggle('is-current', i === index);
        });
    }

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
            // ---- step 0: full-screen "Coming soon" moment ----
            var ENTER_AT = 0.08;
            var EXIT_AT  = 0.75;
            var introVisible = stepFrac > ENTER_AT && stepFrac <= EXIT_AT;

            intro.classList.toggle('is-visible', introVisible);
            container.classList.add('is-intro-active');

            if (currentActive !== -1) {
                clearItems();
                currentActive = -1;
            }
        } else {
            // ---- steps 1..N: sequential item reveal ----
            intro.classList.remove('is-visible');
            container.classList.remove('is-intro-active');

            // Reserve a small hold at the very end so the last item
            // stays fully revealed for a beat before the section
            // unpins.
            var HOLD = 0.1;
            var itemsProgress = clamp((stepFloor - 1 + stepFrac) / (ITEM_COUNT - HOLD), 0, 1);
            var itemRaw = itemsProgress * ITEM_COUNT;
            var itemIndex = clamp(Math.floor(itemRaw), 0, ITEM_COUNT - 1);

            setActiveIndex(itemIndex);
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

    update();
})();
