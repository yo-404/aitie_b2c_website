/* Center-pop -> scale-to-side FLIP entrance for the "Here is what
   Aitie actually gives You" heading (#capabilitiesHeadingFadeWrapper),
   on the Features page (feature.html).

   Desktop behavior, two strictly SEQUENTIAL phases (not overlapping -
   the heading must finish fading in completely before it starts
   moving at all):
     Phase A (fade-in): the heading blur-fades in centered dead in the
       middle of the viewport, at a fixed large scale, with NO
       movement whatsoever - it just gets clearer/more opaque in
       place until fully visible (opacity 1, blur 0).
     Phase B (move-to-side): only once Phase A has completely
       finished does the heading start scaling down and sliding
       directly (straight-line interpolation, no wobble) into its
       normal resting spot in the sticky left column - opacity and
       blur are already locked at their final values throughout, only
       position/scale animate here.
   Once Phase B completes, sections/capabilities-card-reveal.js
   (inline in feature.html) starts the cards' own sequential reveal,
   gated on this script's "is-settled" class.

   Implementation - a real FLIP (First/Last/Invert/Play) for Phase B.
   Critically, both endpoints of the interpolation are captured ONCE,
   the instant Phase B begins, and never re-measured mid-flight:
     - "First" (resting) rect is frozen the moment Phase B starts, by
       temporarily forcing the sticky holder into its pinned state
       (position:fixed at top:32vh) to read its true final left/top/
       width - this is the exact spot the real CSS-sticky element
       will occupy once scrolled there, captured up front rather than
       re-read live every frame.
     - "Last" (large, centered) point is the viewport center, which
       only changes on resize.
   An earlier version re-measured the resting top from the sticky
   holder's live (still-scrolling, not-yet-pinned) position on every
   frame instead of freezing it - since that live position was itself
   still moving throughout Phase B (drifting up as the page kept
   scrolling), the interpolation target kept changing underneath the
   animation, producing a down-then-up wobble instead of a straight
   line to the resting spot. Freezing both endpoints once up front and
   never touching them again for the rest of Phase B eliminates that
   entirely - the path is now always a straight, monotonic line.

   Mobile: no sticky column to move into (.capabilities-sticky-holder
   is position:static there), so instead of Phase B's move, the
   heading becomes a fixed, viewport-CENTERED overlay (both axes) for
   a full blur fade IN -> hold -> fade OUT cycle, entirely driven by
   scroll distance since the section started entering. Once that
   whole cycle finishes, "is-cycle-done" is set - the cards (mobile
   branch of feature.html's inline card-reveal script) are gated on
   that class and stay hidden until the heading has completely
   finished and faded away, instead of appearing at the same time. */
(function () {
    var section = document.querySelector('.capabilities-section-holder');
    var wrapper = document.getElementById('capabilitiesHeadingFadeWrapper');
    var stickyHolder = document.querySelector('.capabilities-sticky-holder');
    if (!section || !wrapper || !stickyHolder) return;

    var LARGE_SCALE = 2.05; // how much bigger than natural width, when centered
    // Scroll distance (in px) each phase takes, back to back - Phase
    // A (fade-in, no movement) plays first over FADE_RANGE, then
    // Phase B (move/scale to resting spot) plays over MOVE_RANGE,
    // starting only once Phase A has completely finished.
    var FADE_RANGE = 260;
    var MOVE_RANGE = 500;

    // Mobile-only: fade in over MOBILE_FADE_RANGE, hold fully visible
    // for MOBILE_HOLD_RANGE, then fade back out over another
    // MOBILE_FADE_RANGE - see the mobile branch below.
    var MOBILE_FADE_RANGE = 220;
    var MOBILE_HOLD_RANGE = 260;

    var ticking = false;
    var isFlipActive = false; // whether position:fixed overlay mode is engaged
    var settled = false;
    // Frozen Phase B endpoints - captured once when Phase B starts,
    // reused for the rest of that run (cleared whenever we fall back
    // out of Phase B, e.g. scrolling back up past it).
    var frozenFirst = null; // {left, top, width, height, centerX, centerY}

    function isDesktop() {
        return window.innerWidth >= 768;
    }

    function update() {
        ticking = false;

        if (!isDesktop()) {
            // Mobile: fixed, viewport-centered overlay (no sticky
            // column to move into on mobile) that blur-fades IN, holds
            // fully visible for a beat, then blur-fades back OUT - a
            // complete in/out cycle driven by scroll distance since the
            // section started entering, in three back-to-back phases:
            //   Phase A (fade in):  0            -> MOBILE_FADE_RANGE
            //   Phase B (hold):     MOBILE_FADE_RANGE -> +MOBILE_HOLD_RANGE
            //   Phase C (fade out): +MOBILE_HOLD_RANGE -> +MOBILE_FADE_RANGE
            // Cards (gated in feature.html's card-reveal script) only
            // start appearing once this whole cycle finishes and
            // "is-cycle-done" is set - never overlapping the heading.
            var sectionRectMobile = section.getBoundingClientRect();
            var traveledMobile = window.innerHeight - sectionRectMobile.top;

            if (traveledMobile <= 0) {
                wrapper.classList.remove('is-mobile-centered', 'is-settled', 'is-cycle-done');
                wrapper.style.opacity = '0';
                wrapper.style.filter = 'blur(14px)';
                return;
            }

            var fadeInEnd = MOBILE_FADE_RANGE;
            var holdEnd = fadeInEnd + MOBILE_HOLD_RANGE;
            var fadeOutEnd = holdEnd + MOBILE_FADE_RANGE;

            var mobileOpacity;
            if (traveledMobile <= fadeInEnd) {
                mobileOpacity = traveledMobile / MOBILE_FADE_RANGE;
            } else if (traveledMobile <= holdEnd) {
                mobileOpacity = 1;
            } else if (traveledMobile <= fadeOutEnd) {
                mobileOpacity = 1 - (traveledMobile - holdEnd) / MOBILE_FADE_RANGE;
            } else {
                mobileOpacity = 0;
            }
            mobileOpacity = Math.max(0, Math.min(1, mobileOpacity));

            var cycleDone = traveledMobile >= fadeOutEnd;

            if (mobileOpacity > 0 || traveledMobile < fadeOutEnd) {
                wrapper.classList.add('is-mobile-centered');
                wrapper.style.width = Math.min(window.innerWidth * 0.9, 560) + 'px';
            } else {
                wrapper.classList.remove('is-mobile-centered');
                wrapper.style.width = '';
            }

            wrapper.style.opacity = String(mobileOpacity);
            wrapper.style.filter = 'blur(' + (14 * (1 - mobileOpacity)) + 'px)';
            wrapper.style.transition = 'none';
            wrapper.classList.toggle('is-settled', mobileOpacity >= 0.999);
            wrapper.classList.toggle('is-cycle-done', cycleDone);
            return;
        }

        wrapper.style.transition = 'none';

        var sectionRect = section.getBoundingClientRect();
        // Section hasn't reached the viewport yet - keep the heading
        // hidden and reset, ready to play from the start once it does.
        if (sectionRect.top >= window.innerHeight) {
            wrapper.style.opacity = '0';
            if (isFlipActive) {
                wrapper.classList.remove('is-flip-active');
                wrapper.style.position = '';
                wrapper.style.top = '';
                wrapper.style.left = '';
                wrapper.style.width = '';
                wrapper.style.transform = '';
                isFlipActive = false;
                frozenFirst = null;
            }
            wrapper.classList.remove('is-settled');
            settled = false;
            return;
        }

        // Distance scrolled since the section's top edge first reached
        // the bottom of the viewport - drives both phases below, back
        // to back (Phase A first, then Phase B only once A is done).
        var traveled = window.innerHeight - sectionRect.top;

        if (traveled <= 0) {
            wrapper.style.opacity = '0';
            if (isFlipActive) {
                wrapper.classList.remove('is-flip-active');
                wrapper.style.position = '';
                wrapper.style.top = '';
                wrapper.style.left = '';
                wrapper.style.width = '';
                wrapper.style.transform = '';
                isFlipActive = false;
                frozenFirst = null;
            }
            wrapper.classList.remove('is-settled');
            settled = false;
            return;
        }

        // Phase A progress (0 -> 1 over FADE_RANGE): pure fade/blur,
        // zero movement. Phase B progress (0 -> 1 over the following
        // MOVE_RANGE) only starts counting once Phase A's distance has
        // been fully consumed.
        var fadeProgress = Math.max(0, Math.min(1, traveled / FADE_RANGE));
        var moveProgress = Math.max(0, Math.min(1, (traveled - FADE_RANGE) / MOVE_RANGE));

        wrapper.style.opacity = String(fadeProgress);
        wrapper.style.filter = 'blur(' + (14 * (1 - fadeProgress)) + 'px)';

        // Only truly "settled" once BOTH Phase B has finished AND the
        // sticky element has actually reached its pinned top:32vh spot
        // (see the natural-top comment below) - guards against handing
        // off to normal static flow while the real sticky position
        // would still be moving, which would otherwise show as a small
        // jump/drift right after handoff.
        var gridItemTopNow = stickyHolder.parentElement.getBoundingClientRect().top;
        var stickyHasPinned = gridItemTopNow <= window.innerHeight * 0.32;

        if (moveProgress >= 1 && stickyHasPinned) {
            // Fully settled - drop the fixed-overlay mode entirely so
            // the wrapper behaves like a normal static element in the
            // sticky column again (matches its natural rect exactly,
            // so there's no visible jump).
            if (isFlipActive) {
                wrapper.classList.remove('is-flip-active');
                wrapper.style.position = '';
                wrapper.style.top = '';
                wrapper.style.left = '';
                wrapper.style.width = '';
                wrapper.style.transform = '';
                isFlipActive = false;
                frozenFirst = null;
            }
            if (!settled) {
                settled = true;
            }
            wrapper.classList.add('is-settled');
            return;
        }

        // Mid-animation: engage the fixed-overlay so the heading can
        // move freely over the whole viewport, then interpolate its
        // transform between the large/centered "Last" state and the
        // natural resting "First" state.
        if (!isFlipActive) {
            wrapper.classList.add('is-flip-active');
            isFlipActive = true;
        }
        settled = false;
        wrapper.classList.remove('is-settled');

        // "First" - natural resting rect, FROZEN once the instant
        // Phase B starts (moveProgress first becomes > 0) and reused
        // for the rest of this run - never re-measured live mid-
        // flight (see the file-level comment for why: the sticky
        // holder's live, not-yet-pinned position keeps drifting as
        // the page scrolls, which previously made the interpolation
        // TARGET itself move during the animation, causing a
        // down-then-up wobble). left/width come from the grid
        // column's own layout (stable regardless of scroll -
        // .capabilities-grid-item is a normal, non-sticky element).
        // top is simply "32vh", the exact value CSS sticky positioning
        // itself resolves to once pinned - using that constant
        // directly (rather than reading the live, still-unpinned
        // rect) means the interpolation always heads straight for
        // the real final resting spot from the very start of Phase B.
        if (!frozenFirst || moveProgress <= 0) {
            wrapper.style.position = '';
            wrapper.style.transform = '';
            wrapper.style.width = '';
            var gridItemRect = stickyHolder.parentElement.getBoundingClientRect();
            var fNaturalWidth = gridItemRect.width;
            var fNaturalLeft = gridItemRect.left;
            var fNaturalTop = window.innerHeight * 0.32;
            var fNaturalHeight = wrapper.getBoundingClientRect().height;
            frozenFirst = {
                left: fNaturalLeft,
                top: fNaturalTop,
                width: fNaturalWidth,
                centerX: fNaturalLeft + fNaturalWidth / 2,
                centerY: fNaturalTop + fNaturalHeight / 2
            };
        }

        // "Last" - large, centered over the viewport (as a CENTER
        // point, not an edge - interpolating edges while the box is
        // also scaling would leave it visually off-center at every
        // point except progress===0/1, since a smaller box anchored
        // to the same left edge as a bigger one sits well left of
        // where a centered smaller box would be).
        var lastCenterX = window.innerWidth / 2;
        var lastCenterY = window.innerHeight / 2;

        // Interpolate Last -> First as moveProgress goes 0 -> 1
        // (ease-out curve so it settles gently rather than linearly),
        // entirely in terms of center point + scale - keeps the box
        // visually centered on the interpolated point at every frame,
        // regardless of its current scaled size. Both endpoints are
        // now fixed for the whole of Phase B, so this is always a
        // straight, monotonic line - no wobble. While moveProgress is
        // still 0 (Phase A, still fading in) this holds it exactly at
        // the centered "Last" state with zero movement.
        var eased = 1 - Math.pow(1 - moveProgress, 3);
        var curCenterX = lastCenterX + (frozenFirst.centerX - lastCenterX) * eased;
        var curCenterY = lastCenterY + (frozenFirst.centerY - lastCenterY) * eased;
        var curScale = LARGE_SCALE + (1 - LARGE_SCALE) * eased;

        wrapper.style.position = 'fixed';
        wrapper.style.left = frozenFirst.left + 'px';
        wrapper.style.top = frozenFirst.top + 'px';
        wrapper.style.width = frozenFirst.width + 'px';
        wrapper.style.transformOrigin = 'center center';
        wrapper.style.transform =
            'translate(' + (curCenterX - frozenFirst.centerX) + 'px, ' + (curCenterY - frozenFirst.centerY) + 'px) scale(' + curScale + ')';
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
