/* Mobile-only scroll-driven treatment for the "Built for every kind of
   independent work." logos section (.logos_wrapper).

   Kept entirely separate from index_pink.html on purpose, same pattern
   as the other sections/*.js files: this file injects its own <style>
   and attaches its own scroll listener, so none of this behavior lives
   inline in the main file. Unlike earn-scroll-section.js/
   who-this-is-for-section.js, though, this one does NOT inject fresh
   markup into a mount point - .logos_wrapper's markup (heading, tag
   rotator, 10-icon grid + its duplicate for the desktop marquee loop)
   already exists in index_pink.html and is shared with desktop, which
   keeps its current two-column layout untouched. This file only
   layers mobile-specific CSS + a scroll handler on top of that
   existing markup, scoped to a max-width:767px media query and an
   `is-mobile-pin` class this script adds itself (so nothing here can
   ever affect desktop, even if the script runs there by mistake -
   see the width check in the IIFE below).

   Per explicit request, three separate things bundled into one file
   since they all only apply at the same mobile breakpoint on the same
   section:

   1. Layout: the heading + tag rotator block centered instead of
      left-aligned, and the icon grid turned into a single-row
      auto-scrolling marquee (reusing the desktop's own
      logos-marquee-scroll keyframes/track-duplication technique,
      which was previously gated to min-width:768px only) sized up
      from the mobile grid's original small icons.

   2. Pin + fade choreography: the section pins for a full 100vh scroll
      distance, staying put while the previous section
      (.integrations_wrapper) finishes scrolling out of view, then the
      heading/marquee content pops in centered (not visible by
      default - it fades/scales in only once scrolled into its pinned
      position), holds, then the whole section fades out as the user
      keeps scrolling, revealing the next section
      (.gradient-section, "Every job makes the next one easier...")
      fading in underneath/after it. This mirrors the fade/blur/scale
      "moment" technique already used in earn-scroll-section.js and
      who-this-is-for-section.js, just applied to markup that already
      exists in the main file instead of injected fresh.

   Desktop is completely unaffected: every rule here is either scoped
   inside @media (max-width:767px) or gated behind the is-mobile-pin
   class this script only adds when window width is at or under that
   breakpoint. */
(function () {
    var wrapper = document.querySelector('.logos_wrapper');
    if (!wrapper) return;

    var MOBILE_BREAKPOINT = 767;
    if (window.innerWidth > MOBILE_BREAKPOINT) return;

    var css = ''
        + '@media screen and (max-width: 767px) {'
        // --- pin scaffold: a tall spacer wrapper (added around
        // .logos_wrapper by this script below) holding the section
        // pinned for a full scroll pass, same shape as the other
        // scroll-driven sections' own wrapper/section split. ---
        + '  .logos-mobile-pin-spacer{position:relative;height:250vh;}'
        + '  .logos_wrapper.is-mobile-pin{position:sticky;top:0;height:100vh;width:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;}'
        + '  .logos_wrapper.is-mobile-pin .section{width:100%;}'

        // the actual heading/marquee content block fades+scales in
        // once pinned, instead of being visible by default - "pops in
        // the middle" per request, not present-then-static.
        //
        // !important on opacity/transform/filter: .logos_wrap still has
        // Webflow's own native scroll-linked IX2 reveal attached to it
        // (the data-w-id + inline opacity:0/transform on the raw
        // element), which keeps re-writing this same element's inline
        // style on every scroll frame based on ITS OWN idea of where
        // the element sits in the page - an idea that's wrong once this
        // script pins the element, so Webflow's inline style silently
        // overrides this script's is-visible class every single frame
        // (removeAttribute('style') below only clears it once at
        // mount, not on every subsequent frame Webflow rewrites it).
        // The visible symptom was the layout/marquee (both !important
        // already) working fine while the pop-in/hold/fade-out never
        // played at all - opacity was 100% governed by Webflow's own
        // animation instead. Same fix already applied to
        // testimonial-scroll.js/who-this-is-for-section.js for the
        // exact same class of conflict.
        + '  .logos_wrapper.is-mobile-pin .logos_wrap{opacity:0 !important;transform:scale(.94) !important;filter:blur(10px) !important;transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1), filter .7s cubic-bezier(.16,1,.3,1);}'
        + '  .logos_wrapper.is-mobile-pin .logos_wrap.is-visible{opacity:1 !important;transform:scale(1) !important;filter:blur(0) !important;}'

        // the section itself fades out as a whole on the way past it,
        // revealing the next section underneath as it goes.
        + '  .logos_wrapper.is-mobile-pin{opacity:1;transition:opacity .6s ease;}'
        + '  .logos_wrapper.is-mobile-pin.is-fading-out{opacity:0;}'

        // center-aligned heading + rotator, in place of the left-aligned
        // desktop layout.
        + '  .logos_wrapper.is-mobile-pin .logos_wrap{flex-direction:column;align-items:center;text-align:center;gap:1.5rem;padding:0 1.5rem;}'
        + '  .logos_wrapper.is-mobile-pin .hero-anim-load-6th{display:flex;flex-direction:column;align-items:center;}'
        + '  .logos_wrapper.is-mobile-pin .logos-tags-rotator{justify-content:center;}'

        // single-row auto-scrolling marquee, reusing the desktop
        // technique (two duplicate tracks side by side, one marked
        // aria-hidden, scrolling left on a continuous loop) instead of
        // the static multi-row grid. Icons sized up from the base
        // mobile grid.
        + '  .logos_wrapper.is-mobile-pin .logos-marquee-viewport{display:flex;width:100%;height:3.5rem;overflow:hidden;-webkit-mask-image:linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%);mask-image:linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%);}'
        + '  .logos_wrapper.is-mobile-pin .logos-marquee-track{display:grid;grid-auto-flow:column;grid-auto-columns:max-content;grid-template-columns:none;align-items:center;flex-wrap:nowrap;column-gap:3rem;width:max-content;height:100%;animation:logos-marquee-scroll 18s linear infinite;}'
        + '  .logos_wrapper.is-mobile-pin .logos-marquee-track[aria-hidden="true"]{display:grid;margin-left:3rem;}'
        + '  .logos_wrapper.is-mobile-pin .logos-grid-content{width:auto;height:100%;display:flex;align-items:center;}'
        + '  .logos_wrapper.is-mobile-pin .logos-image-holder{width:auto;height:100%;white-space:nowrap;}'
        + '  .logos_wrapper.is-mobile-pin .logos-image-holder .logos-image{height:2.75rem;max-height:none;width:auto;}'
        + '  .logos_wrapper.is-mobile-pin svg.logos-image{height:2.75rem;width:auto;}'
        + '}'
        + '@media (prefers-reduced-motion: reduce){'
        + '  .logos_wrapper.is-mobile-pin .logos_wrap,.logos_wrapper.is-mobile-pin{transition-duration:.01ms !important;}'
        + '  .logos_wrapper.is-mobile-pin .logos-marquee-track{animation:none !important;}'
        + '}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Wrap .logos_wrapper in a tall spacer so it has scroll distance to
    // pin against, same shape as earn-scroll-section.js's
    // .earn-scroll-wrapper > .earn-scroll-section split.
    var spacer = document.createElement('div');
    spacer.className = 'logos-mobile-pin-spacer';
    wrapper.parentNode.insertBefore(spacer, wrapper);
    spacer.appendChild(wrapper);
    wrapper.classList.add('is-mobile-pin');

    var wrap = wrapper.querySelector('.logos_wrap');
    // Webflow's own load-in animation (data-w-id + inline opacity:0)
    // on .logos_wrap would otherwise fight with the pop-in transition
    // this file drives instead - cleared so only this script's own
    // is-visible class controls its opacity/transform on mobile.
    wrap.removeAttribute('style');

    var ticking = false;
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function update() {
        ticking = false;
        var rect = spacer.getBoundingClientRect();
        var viewportH = window.innerHeight;
        var scrollableHeight = spacer.offsetHeight - viewportH;
        if (scrollableHeight <= 0) return;

        var scrolled = -rect.top;
        var progress = clamp(scrolled / scrollableHeight, 0, 1);

        // 3 phases across the pin's own scroll distance: pop in, hold,
        // fade out - the same 3-beat shape as the "moment" elements in
        // earn-scroll-section.js/who-this-is-for-section.js. VISIBLE_START/
        // VISIBLE_END bound the pop-in/pop-out of the content block itself;
        // HOLD_END is when the whole section starts fading away as a unit.
        var VISIBLE_START = 0.03;
        var VISIBLE_END = 0.97;
        var HOLD_END = 0.75;

        wrap.classList.toggle('is-visible', progress > VISIBLE_START && progress < VISIBLE_END);
        wrapper.classList.toggle('is-fading-out', progress > HOLD_END);
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
