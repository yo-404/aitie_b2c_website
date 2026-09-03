/* Scroll-driven pin/blur/pop choreography for the "Is this you?"
   testimonial section (.cta_wrapper).

   Kept entirely separate from index_pink.html on purpose, same pattern
   as the other sections/*.js files. Unlike earn-scroll-section.js/
   who-this-is-for-section.js/join-waitlist-section.js though, this one
   does NOT inject fresh markup into a mount point - .cta_wrapper's
   markup (the "Is this you?" heading + 4 rows of testimonial cards)
   already exists in index_pink.html. This file only layers pin/blur/
   pop CSS + a scroll handler on top of that existing markup, plus a
   blur/fade treatment on the section immediately BEFORE it
   (.gradient-section, "every job makes the next one easier" etc.) so
   the two hand off cleanly instead of the new section just appearing
   underneath while the old one is still fully visible.

   Requested choreography, in order across one continuous scroll pass:
     1. .gradient-section (already pinned for its own 350vh scroll
        distance) blurs and fades out as the user scrolls past its
        remaining distance - handled by watching ITS OWN scroll
        progress here rather than adding a second pin, since it is
        already sticky/pinned by Webflow's own CSS.
     2. Once that section has fully scrolled away, .cta_wrapper pins
        for a fresh 300vh pass. The "Is this you?" heading pops into the
        vertical center of the screen (blur+scale+opacity, matching the
        pop-in technique used in the other scroll sections).
     3. Continuing to scroll, that heading slides from center up to its
        normal position at the top of the section (a plain transform,
        not a fade - it stays visible throughout).
     4. Once the heading reaches the top, the 4 testimonial rows fade/
        slide in in sequence, then the section releases back into
        normal scroll.

   Nothing here touches .gradient-section's own pin/scroll-trigger
   logic (that's Webflow's native IX2 scroll-linked opacity on its
   .gradient-section-text-holder children, untouched) - it only adds an
   independent blur+fade to the section as a whole, driven by the same
   scroll position. */
(function () {
    var wrapper = document.querySelector('.cta_wrapper');
    var prevSection = document.querySelector('.gradient-section');
    if (!wrapper) return;

    var css = ''
        // --- previous section (.gradient-section) blur/fade-out ---
        // Applied to the section as a whole, independent of Webflow's
        // own IX2 opacity animation on the heading holders inside it.
        + '.gradient-section{transition:opacity .4s ease, filter .4s ease;}'
        + '.gradient-section.is-prev-fading{opacity:0;filter:blur(14px);}'

        // --- pin scaffold for .cta_wrapper, same shape as the other
        // scroll sections' own wrapper/section split ---
        + '.testimonial-pin-spacer{position:relative;height:300vh;}'
        + '.cta_wrapper.is-testimonial-pin{position:sticky;top:0;height:100vh;width:100%;overflow:hidden;display:flex;align-items:center;}'
        + '.cta_wrapper.is-testimonial-pin .section-te{width:100%;}'
        + '.cta_wrapper.is-testimonial-pin .padding-section-medium{height:100vh;display:flex;flex-direction:column;justify-content:center;}'

        // "Is this you?" heading: starts blurred/scaled-down/invisible,
        // pops into the vertical center of the pinned viewport, then
        // (once popped in) slides up to its normal top-of-section spot
        // via a plain transform - stays visible while it moves.
        //
        // !important on opacity/filter/transform here (and on the rows
        // below): Webflow's own fade-in-move-on-scroll IX2 interaction
        // is still attached to these same elements and keeps re-writing
        // their inline style (opacity/transform) on every scroll frame,
        // continuously fighting this script's own classes/inline
        // transform - not just a one-time initial value that
        // removeAttribute('style') can clear. !important is the only
        // way this script's values reliably win every frame.
        // The slide position itself is read from a CSS custom property
        // (--slide-y, set inline by setHeadingSlide() below) rather than
        // a plain inline transform - transform still needs !important
        // to beat Webflow's own inline transform, and !important on a
        // static value would freeze the slide; referencing a variable
        // keeps it !important AND live-updatable from JS.
        + '.cta_wrapper.is-testimonial-pin .center-text-holder{--slide-y:0px;opacity:0 !important;transform:translateY(var(--slide-y)) !important;filter:blur(10px) !important;transition:opacity .6s cubic-bezier(.16,1,.3,1), filter .6s cubic-bezier(.16,1,.3,1);will-change:transform;}'
        + '.cta_wrapper.is-testimonial-pin .center-text-holder.is-visible{opacity:1 !important;filter:blur(0) !important;}'

        // testimonial rows: hidden until the heading has finished
        // sliding to the top, then fade/slide up into place in
        // sequence.
        + '.cta_wrapper.is-testimonial-pin .cta-list-wrap>.fade-in-move-on-scroll{opacity:0 !important;transform:translateY(28px) !important;filter:blur(6px) !important;transition:opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1), filter .5s ease;}'
        + '.cta_wrapper.is-testimonial-pin .cta-list-wrap>.fade-in-move-on-scroll.is-visible{opacity:1 !important;transform:translateY(0) !important;filter:blur(0) !important;}'

        + '@media (prefers-reduced-motion: reduce){'
        + '  .gradient-section,.cta_wrapper.is-testimonial-pin .center-text-holder,.cta_wrapper.is-testimonial-pin .cta-list-wrap>.fade-in-move-on-scroll{transition-duration:.01ms !important;}'
        + '}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Wrap .cta_wrapper in a tall spacer so it has scroll distance to
    // pin against, same shape as earn-scroll-section.js's
    // .earn-scroll-wrapper > .earn-scroll-section split.
    var spacer = document.createElement('div');
    spacer.className = 'testimonial-pin-spacer';
    wrapper.parentNode.insertBefore(spacer, wrapper);
    spacer.appendChild(wrapper);
    wrapper.classList.add('is-testimonial-pin');

    var headingHolder = wrapper.querySelector('.center-text-holder');
    var rows = Array.prototype.slice.call(wrapper.querySelectorAll('.cta-list-wrap > .fade-in-move-on-scroll'));
    // Webflow's own fade-in-move-on-scroll IX2 would otherwise fight
    // with this script's own opacity/transform on the same elements -
    // cleared so only the classes this file toggles are in control.
    if (headingHolder) headingHolder.removeAttribute('style');
    rows.forEach(function (row) { row.removeAttribute('style'); });

    var ROW_COUNT = rows.length; // 4

    var ticking = false;
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function updatePrevSection() {
        if (!prevSection) return;
        // .gradient-section-image-bg (the actual position:sticky child
        // that stays pinned at top:0 while .gradient-section, its 350vh
        // containing block, still has remaining scroll distance below
        // it) only stays visually "in place" up until that containing
        // block's own bottom edge reaches the bottom of the viewport -
        // past that point sticky naturally releases and the element
        // starts scrolling normally with the rest of the page.
        //
        // The previous version of this function watched
        // .gradient-section's bottom edge approaching the TOP of the
        // viewport - but that distance only starts closing once the
        // sticky child has ALREADY released and is scrolling away, so
        // the fade-out and the slide-away happened at the same time:
        // it read as sliding off screen while fading, not fading calmly
        // in place. Computing progress against the section's own top
        // instead (independent of where its bottom edge currently is)
        // lets the fade finish completely BEFORE that release point -
        // by the time sticky actually lets go and the element would
        // start sliding, it's already faded to fully invisible, so the
        // motion happens unseen and the fade itself reads as static.
        var rect = prevSection.getBoundingClientRect();
        var viewportH = window.innerHeight;
        var totalScrollable = prevSection.offsetHeight - viewportH;
        if (totalScrollable <= 0) return;

        var scrolledIntoSection = -rect.top;
        var sectionProgress = clamp(scrolledIntoSection / totalScrollable, 0, 1);

        // Fade at the very end of the section's own pinned scroll
        // range (after heading 4 has had its full display time), finishing
        // at 99% - right before 100% (the sticky-release point), so the
        // element is already invisible by the time it would start moving.
        var FADE_START = 0.94;
        var FADE_END   = 0.99;
        var raw = clamp((sectionProgress - FADE_START) / (FADE_END - FADE_START), 0, 1);

        prevSection.classList.toggle('is-prev-fading', raw > 0.05);
        prevSection.style.opacity = String(1 - raw);
        prevSection.style.filter = 'blur(' + (raw * 14) + 'px)';
    }

    function update() {
        ticking = false;
        updatePrevSection();

        var rect = spacer.getBoundingClientRect();
        var viewportH = window.innerHeight;
        var scrollableHeight = spacer.offsetHeight - viewportH;
        if (scrollableHeight <= 0) return;

        var scrolled = -rect.top;
        var progress = clamp(scrolled / scrollableHeight, 0, 1);

        // 3 phases across the pin's own scroll distance:
        //   0.00 - 0.18  heading pops into center, holds
        //   0.18 - 0.34  heading slides from center to top
        //   0.34 - 1.00  rows reveal in sequence, then release
        var POP_END   = 0.18;
        var SLIDE_END = 0.34;

        if (progress < POP_END) {
            headingHolder && headingHolder.classList.toggle('is-visible', progress > 0.03);
            setHeadingSlide(0);
            clearRows();
        } else if (progress < SLIDE_END) {
            headingHolder && headingHolder.classList.add('is-visible');
            var slideProgress = (progress - POP_END) / (SLIDE_END - POP_END);
            setHeadingSlide(slideProgress);
            clearRows();
        } else {
            headingHolder && headingHolder.classList.add('is-visible');
            setHeadingSlide(1);

            var rowsProgress = clamp((progress - SLIDE_END) / (1 - SLIDE_END - 0.08), 0, 1);
            var activeCount = Math.round(rowsProgress * ROW_COUNT);
            rows.forEach(function (row, i) {
                row.classList.toggle('is-visible', i < activeCount);
            });
        }
    }

    // Slides the heading from vertical-center (of the pinned 100vh
    // viewport) up to its normal in-flow position at the top of
    // .padding-section-medium, driven by t in [0,1]. translateY(0) is
    // the heading's own natural/laid-out position (top of section);
    // t=0 offsets it down to the viewport's vertical center instead,
    // t=1 removes that offset entirely.
    function setHeadingSlide(t) {
        if (!headingHolder) return;
        // Measured fresh each call (not cached) since it's cheap and
        // stays correct across resizes without needing its own
        // resize-specific recompute step.
        var naturalTop = headingHolder.offsetTop;
        var viewportCenter = window.innerHeight / 2;
        var travel = viewportCenter - naturalTop - (headingHolder.offsetHeight / 2);
        var y = travel * (1 - t);
        headingHolder.style.setProperty('--slide-y', y + 'px');
    }

    function clearRows() {
        rows.forEach(function (row) { row.classList.remove('is-visible'); });
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
