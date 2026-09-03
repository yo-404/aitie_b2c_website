/* Blur/fade-in entry for pinned sections, instead of them scrolling up
   from below into view.

   Applies to two sections, both structured the same way (a tall outer
   wrapper containing a position:sticky child that pins for one
   viewport's worth of scroll): .gradient-section > .gradient-section-image-bg
   ("every job makes the next one easier" etc.) and .section.no-writing
   > .sticky-no-writing ("No / Applying / Chasing / Monotony"). Their
   EXIT already blurs/fades out in place (see testimonial-scroll.js's
   and earn-scroll-section.js's own updatePrevSection() functions) -
   this file is the matching fix for their ENTRY, which otherwise just
   scrolls the section up from below like any normal block until it
   reaches the top and sticks.

   Technique: while the section's sticky child is still below the
   viewport (not yet at its natural pin point), and gets within one
   viewport height of entering, this switches it to position:fixed at
   top:0 early - holding it stationary right where it's about to pin,
   instead of letting it keep scrolling up with the page - and fades/
   blurs it in over a short scroll distance. A spacer of the sticky
   child's own height is inserted right before it in the DOM so the
   page doesn't jump/reflow when the child leaves normal flow for
   position:fixed (the same role .gradient-section/.section.no-writing's
   own extra scroll height already plays for the PINNED phase - this
   spacer only exists for the brief entry phase, removed again once the
   fade-in finishes and control hands back to the section's own native
   position:sticky).

   Once the fade-in reaches 1 (fully visible) AND scroll has reached the
   point where the section would naturally start pinning on its own,
   this switches the child back to position:sticky and removes the
   spacer - from then on the section's own existing pin/exit-fade logic
   (in testimonial-scroll.js / earn-scroll-section.js) takes over
   exactly as before, with no visible seam at the handoff since the
   fade is already complete and the element is already sitting at the
   same top:0 position either way. */
(function () {
    var targets = [
        { outer: '.gradient-section', sticky: '.gradient-section-image-bg' },
        { outer: '.section.no-writing', sticky: '.sticky-no-writing' }
    ];

    // !important on position: .gradient-section-image-bg carries its own
    // position:sticky !important rule elsewhere in index_pink.html (needed
    // for its normal pinned/exit behavior) - this class needs to win over
    // that specifically while holding, or the inline position:fixed this
    // script sets in JS gets silently overridden back to sticky.
    var css = ''
        + '.entry-fade-holding{position:fixed !important;transition:none !important;}'
        + '.entry-fade-holding.is-fading-in{opacity:0;filter:blur(14px);}'
        + '.entry-fade-spacer{width:100%;}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var instances = targets.map(function (t) {
        var outer = document.querySelector(t.outer);
        var sticky = outer && outer.querySelector(t.sticky);
        if (!outer || !sticky) return null;

        return {
            outer: outer,
            sticky: sticky,
            spacer: null,
            holding: false,
            done: false // true once this section has ever finished its
                        // entry fade - never re-triggers on scroll-back-up,
                        // matching "enter once" rather than replaying
                        // every time the section re-enters the viewport
        };
    }).filter(Boolean);

    if (!instances.length) return;

    var ticking = false;
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function beginHolding(inst) {
        if (inst.holding) return;
        inst.holding = true;

        var rect = inst.sticky.getBoundingClientRect();
        var spacer = document.createElement('div');
        spacer.className = 'entry-fade-spacer';
        spacer.style.height = rect.height + 'px';
        inst.sticky.parentNode.insertBefore(spacer, inst.sticky);
        inst.spacer = spacer;

        // Both .gradient-section and .section.no-writing set a
        // transition on `filter` for their own exit-fade (even at
        // filter:blur(0px), an actual value rather than the keyword
        // `none`) - any non-`none` filter on an ancestor establishes a
        // new containing block for position:fixed descendants, per the
        // CSS spec (same effect as `transform`). That silently
        // re-anchors this element's fixed top:0 to the ANCESTOR's box
        // instead of the viewport, landing it wherever that ancestor
        // currently sits rather than the top of the screen. Recording
        // the original parent/next-sibling and moving the element to
        // be a direct child of <body> for the duration of the hold
        // sidesteps that entirely - body has no such filter, so fixed
        // positioning behaves normally there.
        inst.originalParent = inst.sticky.parentNode;
        inst.originalNextSibling = inst.sticky.nextSibling;
        document.body.appendChild(inst.sticky);

        inst.sticky.style.position = 'fixed';
        inst.sticky.style.top = '0px';
        inst.sticky.style.left = rect.left + 'px';
        inst.sticky.style.width = rect.width + 'px';
        inst.sticky.style.zIndex = '5';
        inst.sticky.classList.add('entry-fade-holding', 'is-fading-in');
    }

    function endHolding(inst) {
        if (!inst.holding) return;
        inst.holding = false;
        inst.done = true;

        inst.sticky.style.position = '';
        inst.sticky.style.top = '';
        inst.sticky.style.left = '';
        inst.sticky.style.width = '';
        inst.sticky.style.zIndex = '';
        inst.sticky.style.opacity = '';
        inst.sticky.style.filter = '';
        inst.sticky.classList.remove('entry-fade-holding', 'is-fading-in');

        // Move it back to exactly where it came from before handing
        // control back to its own native position:sticky.
        inst.originalParent.insertBefore(inst.sticky, inst.originalNextSibling);

        if (inst.spacer) {
            inst.spacer.parentNode.removeChild(inst.spacer);
            inst.spacer = null;
        }
    }

    function update() {
        ticking = false;
        var viewportH = window.innerHeight;

        // Fixed, short trigger distance rather than a full viewport of
        // approach room - a full-viewport window assumes there's
        // reliably that much scroll distance between "start the hold"
        // and "the section's own top reaches 0" (the natural
        // position:sticky pin point), but that gap is whatever the
        // surrounding page layout happens to leave, not something this
        // script controls - on some pages/viewports (mobile in
        // particular) it was far less than a full viewport, so the
        // fade only got a sliver of its intended scroll distance to
        // play out in before hand-off, making it look like it barely
        // ran/glitched rather than completing smoothly. A fixed 420px
        // window is independent of layout and always gets its full
        // distance to fade across.
        var TRIGGER_DISTANCE = 420;

        instances.forEach(function (inst) {
            if (inst.done) return;

            var outerRect = inst.outer.getBoundingClientRect();

            // Not yet within the trigger distance of entering - leave
            // it in normal flow (still off-screen below, nothing to
            // fade yet).
            if (outerRect.top > TRIGGER_DISTANCE) return;

            // The section's own top has scrolled past the top of the
            // viewport already - this is exactly where native
            // position:sticky would take over on its own. Hand off to
            // it now: fade-in is complete (or close enough - progress
            // is clamped to 1 by then) and the element is already
            // sitting at the right spot.
            if (outerRect.top <= 0) {
                endHolding(inst);
                return;
            }

            beginHolding(inst);

            // Progress across the fixed approach distance: 0 when the
            // section's top is exactly TRIGGER_DISTANCE below the
            // current view, 1 by the time it reaches the top.
            var progress = clamp(1 - (outerRect.top / TRIGGER_DISTANCE), 0, 1);
            inst.sticky.style.opacity = String(progress);
            inst.sticky.style.filter = 'blur(' + ((1 - progress) * 14) + 'px)';
        });
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
