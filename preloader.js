/* Page preloader: the "aitie" wordmark assembles itself once on load -
   each letter flies in from its own direction (data-from on the SVG
   path), then the two dots on the "i"s spiral in last, swapping sides
   as they corkscrew into place. Split out of the original
   single-path-per-letter logo SVG (images/logotype_white .svg) into
   individual <path> elements so each piece can be animated on its own;
   the two "i" glyphs each contained two filled subpaths (stem + dot) in
   one <path> d attribute, so those were separated at the second "M"
   command into their own <path>s (.preloader-dot).

   Self-contained on purpose: this file injects its own <style> and
   markup and runs immediately when the <script> tag is parsed (not
   waiting for DOMContentLoaded), so it must be placed as the very first
   thing in <body> in the host page - before any other content should be
   visible. Written as plain synchronous DOM/CSSOM calls (no fetch of a
   separate HTML partial) because the page is opened directly as a
   file:// document in places, where fetching a local file is blocked by
   CORS; a single <script src="preloader.js"> has no such restriction. */
(function () {
    var css = '.page-preloader{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#0c0d1a;}' +
        '.preloader-logo{width:min(60vw,420px);height:auto;overflow:visible !important;}' +
        '.preloader-piece{opacity:0;}' +
        '.page-preloader.is-done{pointer-events:none;}' +
        'html.preloader-lock-scroll,html.preloader-lock-scroll body{overflow:hidden !important;height:100%;}';
    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Scroll stays locked (no wheel/touch/keyboard scrolling) for the
    // full preloader sequence - assembly, the move into the hero logo,
    // the hold, and the color transition - so the page can't be
    // scrolled out from under the animation before it's done. Released
    // in the single cleanup path shared by both the normal handoff and
    // the no-target fallback below.
    document.documentElement.classList.add('preloader-lock-scroll');
    function unlockScroll() {
        document.documentElement.classList.remove('preloader-lock-scroll');
    }

    var svgNS = 'http://www.w3.org/2000/svg';
    var pieces = [
        { from: 'left', dot: false, d: 'M106.732 73.21C116.22 82.2546 120.963 94.7779 120.963 110.843V206.223C120.963 207.804 119.698 209.069 118.117 209.069H96.7706C95.4107 209.069 94.2406 208.089 93.956 206.76L91.6791 195.122C79.8199 206.792 65.3992 212.642 48.4485 212.642C39.6886 212.642 31.6243 210.966 24.2242 207.582C16.8241 204.199 10.942 199.36 6.57788 193.067C2.21371 186.774 0 179.532 0 171.309V161.727C0 148.951 5.37615 138.736 16.1601 131.083C26.9124 123.43 41.6809 119.603 60.4974 119.603H87.3149V109.768C87.3149 101.198 85.1645 94.9361 80.8952 91.0147C76.5943 87.0932 70.0796 85.1324 61.3197 85.1324C53.6666 85.1324 46.4878 86.0495 39.8467 87.8838C33.9646 89.4966 27.8294 91.8052 21.4729 94.8412C20.0498 95.5053 18.3738 94.9677 17.678 93.5446L9.70866 77.4161C9.04455 76.0562 9.51893 74.4117 10.8155 73.6527C27.0072 64.3551 44.8434 59.7064 64.324 59.7064C83.8046 59.7064 97.245 64.2287 106.732 73.2417V73.21ZM72.6728 183.864C78.2387 181.492 83.1089 177.95 87.3149 173.207V140.918H63.7864C43.7049 140.918 33.6799 148.318 33.6799 163.087V168.558C33.6799 174.408 35.4509 178.994 39.0245 182.378C42.5664 185.762 47.9109 187.438 55.0264 187.438C61.2248 187.438 67.1069 186.268 72.6728 183.896V183.864Z' },
        { from: 'top', dot: false, d: 'M149.236 63.4703H191.265C192.846 63.4703 194.111 64.7353 194.111 66.3166V85.7973C194.111 87.3785 192.846 88.6434 191.265 88.6434H172.227V206.192C172.227 207.773 170.962 209.038 169.381 209.038H141.172C139.59 209.038 138.325 207.773 138.325 206.192V74.4124C138.325 68.3721 143.227 63.4703 149.267 63.4703H149.236Z' },
        { from: 'dot-top', dot: true, d: 'M156.604 40.7639C150.944 40.7639 146.105 38.8032 142.089 34.8818C138.072 30.9604 136.08 26.185 136.08 20.5243C136.08 14.6737 138.104 9.80355 142.089 5.88211C146.105 1.96067 150.944 0 156.604 0C162.265 0 167.104 2.02395 171.12 6.00863C175.136 10.0249 177.129 14.8635 177.129 20.5243C177.129 26.185 175.136 30.9604 171.12 34.8818C167.104 38.8032 162.265 40.7639 156.604 40.7639Z' },
        { from: 'bottom', dot: false, d: 'M300.493 206.508C300.714 207.963 299.797 209.354 298.406 209.702C290.974 211.631 283.321 212.58 275.415 212.58C261.184 212.58 250.273 209.354 242.715 202.871C235.157 196.388 231.362 186.395 231.362 172.923V88.6435H212.04C210.458 88.6435 209.193 87.3786 209.193 85.7973V66.3166C209.193 64.7354 210.458 63.4703 212.04 63.4703H232.184L234.746 20.1765C234.841 18.6585 236.074 17.4884 237.592 17.4884H262.417C263.998 17.4884 265.263 18.7534 265.263 20.3346V63.4388H293.883C295.465 63.4388 296.73 64.7037 296.73 66.285V85.7657C296.73 87.3469 295.465 88.6119 293.883 88.6119H265.263V170.962C265.263 176.243 266.718 180.165 269.628 182.726C272.537 185.288 277.028 186.553 283.036 186.553C286.705 186.553 290.5 186.268 294.389 185.667C295.971 185.414 297.457 186.458 297.678 188.039L300.43 206.445L300.493 206.508Z' },
        { from: 'right', dot: false, d: 'M364.726 209.038H336.517C334.936 209.038 333.671 207.773 333.671 206.192V88.6434H314.633C313.052 88.6434 311.787 87.3785 311.787 85.7973V66.3166C311.787 64.7353 313.052 63.4703 314.633 63.4703H356.662C362.702 63.4703 367.604 68.3721 367.604 74.4124V206.192C367.604 207.773 366.339 209.038 364.758 209.038H364.726Z' },
        { from: 'dot-top', dot: true, d: 'M334.746 34.8818C330.73 30.9604 328.738 26.185 328.738 20.5243C328.738 14.8635 330.73 10.0249 334.746 6.00863C338.763 1.99232 343.601 0 349.262 0C354.923 0 359.761 1.96067 363.778 5.88211C367.794 9.80355 369.786 14.6737 369.786 20.5243C369.786 26.3748 367.762 30.9604 363.778 34.8818C359.761 38.8032 354.923 40.7639 349.262 40.7639C343.601 40.7639 338.763 38.8032 334.746 34.8818Z' },
        { from: 'top-right', dot: false, d: 'M506.751 146.928H417.064C417.254 160.779 420.542 170.962 426.899 177.445C433.287 183.928 442.869 187.154 455.646 187.154C462.761 187.154 469.276 186.11 475.221 183.992C480.439 182.157 486.068 179.627 492.077 176.402C493.437 175.674 495.113 176.117 495.903 177.445L505.201 193.1C505.96 194.364 505.644 196.041 504.41 196.894C498.275 201.132 491.002 204.737 482.59 207.678C473.197 210.967 463.488 212.612 453.463 212.612C439.043 212.612 426.614 209.639 416.115 203.725C405.616 197.812 397.647 189.684 392.175 179.374C386.704 169.065 383.953 157.269 383.953 143.923V128.87C383.953 115.746 386.61 103.918 391.891 93.419C397.172 82.9197 404.762 74.6658 414.597 68.6571C424.432 62.6485 435.944 59.6125 449.068 59.6125C469.118 59.6125 484.645 65.6845 495.587 77.7966C506.529 89.9404 512 107.492 512 130.483C512 134.373 511.779 138.452 511.368 142.753C511.146 145.125 509.091 146.896 506.719 146.896L506.751 146.928ZM481.672 123.399C481.672 110.813 478.921 101.199 473.45 94.5259C467.979 87.8532 459.947 84.5326 449.384 84.5326C438.821 84.5326 431.105 87.9164 425.729 94.6524C420.353 101.388 417.475 111.445 417.095 124.759H481.672V123.399Z' }
    ];

    var preloader = document.createElement('div');
    preloader.id = 'page-preloader';
    preloader.className = 'page-preloader';

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'preloader-logo');
    svg.setAttribute('viewBox', '0 0 512 213');

    pieces.forEach(function (piece) {
        var path = document.createElementNS(svgNS, 'path');
        path.setAttribute('class', piece.dot ? 'preloader-piece preloader-dot' : 'preloader-piece');
        path.setAttribute('data-from', piece.from);
        path.setAttribute('d', piece.d);
        path.setAttribute('fill', 'white');
        svg.appendChild(path);
    });

    preloader.appendChild(svg);

    if (document.body.firstChild) {
        document.body.insertBefore(preloader, document.body.firstChild);
    } else {
        document.body.appendChild(preloader);
    }

    var offsets = {
        'left': [-160, 0],
        'right': [160, 0],
        'top': [0, -140],
        'bottom': [0, 140]
    };

    var letters = preloader.querySelectorAll('.preloader-piece:not(.preloader-dot)');
    var dots = preloader.querySelectorAll('.preloader-dot');
    var letterDuration = 900;
    var letterStagger = 120;
    var dotDelayAfterLetters = 200;
    var dotDuration = 1500;

    function animatePiece(el, duration, delay) {
        var offset = offsets[el.getAttribute('data-from')] || [0, 0];
        el.style.opacity = '1';
        return el.animate([
            { transform: 'translate(' + offset[0] + 'px,' + offset[1] + 'px) scale(0.85)', opacity: 0 },
            { transform: 'translate(0,0) scale(1)', opacity: 1 }
        ], {
            duration: duration,
            delay: delay,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both'
        });
    }

    /* Dots swap sides and spiral in: the left "i"'s dot starts far to
       the right of its landing spot, the right "i"'s dot starts far to
       the left of its own - each traces a true spiral (a circle around
       the landing point whose radius decays to 0 over exactly one
       turn), entering the spiral from its starting side so the two
       visibly cross paths before corkscrewing down into place.
       direction flips the spiral's handedness per dot so they don't
       read as mirror-identical motion. */
    function animateDotSpiral(el, duration, delay, startAngle, direction) {
        el.style.opacity = '1';
        var steps = 40;
        var turns = 1;
        var maxRadius = 190;
        var frames = [];
        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            var ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            var radius = maxRadius * (1 - ease);
            var angle = startAngle + direction * turns * 2 * Math.PI * ease;
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius * 0.6;
            var scale = 0.3 + 0.7 * ease;
            frames.push({
                transform: 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) scale(' + scale.toFixed(3) + ')',
                opacity: t < 0.06 ? t / 0.06 : 1,
                offset: t
            });
        }
        return el.animate(frames, {
            duration: duration,
            delay: delay,
            easing: 'linear',
            fill: 'both'
        });
    }

    letters.forEach(function (el, i) {
        animatePiece(el, letterDuration, i * letterStagger);
    });

    var lettersDoneAt = (letters.length - 1) * letterStagger + letterDuration;

    /* First dot in DOM order belongs to the left "i" - its spiral starts
       on the right (angle 0) and winds counter-clockwise, so its
       opening arc sweeps in from the right. Second belongs to the right
       "i" - its spiral starts on the left (angle PI) and winds
       clockwise, sweeping in from the left. */
    dots.forEach(function (el, i) {
        var startAngle = i === 0 ? 0 : Math.PI;
        var direction = i === 0 ? -1 : 1;
        animateDotSpiral(el, dotDuration, lettersDoneAt + dotDelayAfterLetters, startAngle, direction);
    });

    var totalDuration = lettersDoneAt + dotDelayAfterLetters + dotDuration;

    /* Final handoff, in four stages once the wordmark has fully
       assembled:
         1. move - shrink/move the whole preloader logo (as one unit,
            via a transform on the <svg> itself) from its big centered
            position to exactly overlap the real "aitie" wordmark
            inside .hero-text-holder (.integrations_wrapper .hero-logo)
            - same x/y and width/height. The dark background stays
            fully opaque through this - nothing underneath is visible
            yet.
         2. hold - the phone mockup (.home-hero-mobile-holder) is
            lifted above the preloader's own z-index so it shows on
            top of the still-dark background, sitting there next to
            the (still white) logo for 1.5s. The rest of the real page
            stays hidden behind the preloader.
         3. color - over another 1.5s, the logo's fill fades from white
            to the real hero-logo's own color (read from its computed
            style, so it matches whatever theme is active) while the
            background fades to transparent at the same time, revealing
            the rest of the page.
         4. cleanup - drop the phone mockup's temporary z-index bump and
            remove the preloader outright.

       Reading rects/styles with getBoundingClientRect/getComputedStyle
       works immediately on load (layout and style don't depend on an
       element's own opacity/IX2 animation state), so none of this
       needs to wait for anything else on the page. Falls back to a
       plain fade if the hero logo or phone mockup can't be found, so
       the preloader never gets stuck. */
    function getTargetLogoEl() {
        var hero = document.querySelector('.hero-text-holder .hero-logo');
        if (hero && hero.getBoundingClientRect().width > 0) return hero;
        var desktop = document.querySelector('.nav-logo-desktop .logo-image');
        if (desktop && desktop.getBoundingClientRect().width > 0) return desktop;
        var mobile = document.querySelector('.nav-logo-mobile .logo-image');
        if (mobile && mobile.getBoundingClientRect().width > 0) return mobile;
        return null;
    }

    setTimeout(function () {
        var target = getTargetLogoEl();
        var moveDuration = 650;
        var mobileHolderRevealDuration = 700;
        var holdDuration = 2500;
        var colorDuration = 1500;

        if (!target) {
            preloader.classList.add('is-done');
            preloader.style.transition = 'opacity 0.5s ease';
            preloader.style.opacity = '0';
            setTimeout(function () {
                preloader.remove();
                unlockScroll();
            }, 500);
            return;
        }

        // --- Stage 1: move to the hero logo's position/size
        var svgRect = svg.getBoundingClientRect();
        var targetRect = target.getBoundingClientRect();

        var scaleX = targetRect.width / svgRect.width;
        var scaleY = targetRect.height / svgRect.height;
        var scale = Math.min(scaleX, scaleY);

        // translate needed so svg's center lands on target's center,
        // expressed in pre-scale pixels since transform-origin stays
        // at the svg's own center (default 50% 50%).
        var svgCenterX = svgRect.left + svgRect.width / 2;
        var svgCenterY = svgRect.top + svgRect.height / 2;
        var targetCenterX = targetRect.left + targetRect.width / 2;
        var targetCenterY = targetRect.top + targetRect.height / 2;
        var dx = targetCenterX - svgCenterX;
        var dy = targetCenterY - svgCenterY;

        svg.animate([
            { transform: 'translate(0,0) scale(1)' },
            { transform: 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) scale(' + scale.toFixed(4) + ')' }
        ], {
            duration: moveDuration,
            easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
            fill: 'both'
        });

        setTimeout(function () {
            // --- Stage 2: hold, phone mockup shown above the preloader.
            // .home-hero-mobile-holder sits deep inside ancestors that
            // each establish their own stacking context (.section and
            // .container-medium both have position:relative plus a
            // numeric z-index), so a z-index bump on the holder itself
            // can never escape them to beat the preloader's z-index,
            // which sits as a direct child of <body>. Instead, actually
            // reparent the holder to <body> for the duration of the
            // hold, pinned with position:fixed at its own current
            // on-screen rect, and leave an empty placeholder behind so
            // removing it doesn't reflow the rest of the section; then
            // swap it back afterward.
            var mobileHolder = document.querySelector('.home-hero-mobile-holder');
            var placeholder = null;
            var restoreStyles = null;

            if (mobileHolder) {
                // getBoundingClientRect() already reflects IX2's own
                // scale3d(1.5,1.5,1)/translate3d(...) inline transform on
                // this element (its "Hero Home Mobile Animation" resting
                // state) - i.e. this rect IS the correct real on-screen
                // box. Setting width/height to that box while the
                // original transform inline style is still present would
                // apply the 1.5x scale a second time on top of it, which
                // is what made the reparented copy come out oversized and
                // offset. Explicitly overriding transform to none cancels
                // that, so the width/height set below render literally,
                // at the same real size/position the page already shows.
                var holderRect = mobileHolder.getBoundingClientRect();
                placeholder = document.createComment('preloader-mobile-holder-placeholder');
                mobileHolder.parentNode.insertBefore(placeholder, mobileHolder);

                restoreStyles = {
                    position: mobileHolder.style.position,
                    top: mobileHolder.style.top,
                    left: mobileHolder.style.left,
                    width: mobileHolder.style.width,
                    height: mobileHolder.style.height,
                    margin: mobileHolder.style.margin,
                    zIndex: mobileHolder.style.zIndex,
                    transform: mobileHolder.style.transform
                };

                mobileHolder.style.position = 'fixed';
                mobileHolder.style.top = holderRect.top + 'px';
                mobileHolder.style.left = holderRect.left + 'px';
                mobileHolder.style.width = holderRect.width + 'px';
                mobileHolder.style.height = holderRect.height + 'px';
                mobileHolder.style.margin = '0';
                mobileHolder.style.zIndex = '10000';
                mobileHolder.style.transform = 'none';
                document.body.appendChild(mobileHolder);

                // Reveal with a fade-in + blur-out entrance, rather than
                // just appearing instantly at full opacity.
                mobileHolder.animate([
                    { opacity: 0, filter: 'blur(18px)' },
                    { opacity: 1, filter: 'blur(0px)' }
                ], {
                    duration: mobileHolderRevealDuration,
                    easing: 'ease-out',
                    fill: 'both'
                });
            }

            function restoreMobileHolder() {
                if (!mobileHolder || !placeholder) return;
                mobileHolder.style.position = restoreStyles.position;
                mobileHolder.style.top = restoreStyles.top;
                mobileHolder.style.left = restoreStyles.left;
                mobileHolder.style.width = restoreStyles.width;
                mobileHolder.style.height = restoreStyles.height;
                mobileHolder.style.margin = restoreStyles.margin;
                mobileHolder.style.zIndex = restoreStyles.zIndex;
                mobileHolder.style.transform = restoreStyles.transform;
                placeholder.parentNode.insertBefore(mobileHolder, placeholder);
                placeholder.remove();
            }

            setTimeout(function () {
                // --- Stage 3: logo color white -> black (matching the
                // real hero-logo, which is images/logotype_black.svg),
                // background fades to transparent, at the same time.
                // brightness(0) turns the white fill black without
                // needing to touch each path's own fill attribute.
                svg.animate([
                    { filter: 'brightness(1)' },
                    { filter: 'brightness(0)' }
                ], {
                    duration: colorDuration,
                    easing: 'ease-in-out',
                    fill: 'both'
                });

                preloader.animate([
                    { background: '#0c0d1a' },
                    { background: 'transparent' }
                ], {
                    duration: colorDuration,
                    easing: 'ease',
                    fill: 'both'
                });

                preloader.classList.add('is-done');

                setTimeout(function () {
                    restoreMobileHolder();
                    preloader.remove();
                    unlockScroll();
                }, colorDuration + 80);
            }, holdDuration);
        }, moveDuration);
    }, totalDuration + 250);
})();
