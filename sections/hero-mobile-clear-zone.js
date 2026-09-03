/* Hero section (feature.html) - mobile only: keeps the floating
   photo cards (.feature-hero-card, inside .div-block-3) out of the
   "You do the Work / We make it Count" title + App Store/Google Play
   button zone.

   The cards are absolutely positioned (via Webflow's own shared CSS)
   scattered around the hero on top of a full-bleed overlay
   (.div-block-3), independent of the text/button layout - on
   narrower phones several of them land directly behind the title
   and buttons, visually colliding with the text. Per explicit
   request, cards should simply not be visible within that band (title
   top through button bottom, plus a little breathing room), and
   should freely reappear above and below it.

   Implementation: rather than hiding/repositioning individual cards
   (fragile - which specific cards intrude depends on viewport width),
   this measures the actual on-screen band the text+buttons occupy
   and punches a transparent gap for exactly that band out of
   .div-block-3 via a CSS mask-image (a vertical 3-stop gradient:
   opaque / transparent / opaque). Cards behind the gap are invisible;
   anything outside it renders normally. Recomputed on resize/load
   since the text block's height/position can reflow. Desktop is
   completely unaffected (mask is only ever applied under 768px). */
(function () {
    var textHolder = document.querySelector('.feature-hero-text-holder');
    var buttonHolder = document.querySelector('.about-button-holder');
    var imagesOverlay = document.querySelector('.div-block-3');
    if (!textHolder || !buttonHolder || !imagesOverlay) return;

    var PADDING = 28; // px of breathing room above/below the text+button band
    var FEATHER = 24; // px of soft fade at each edge of the gap, so it isn't a hard cut

    function isMobile() {
        return window.innerWidth < 768;
    }

    function update() {
        if (!isMobile()) {
            imagesOverlay.style.maskImage = '';
            imagesOverlay.style.webkitMaskImage = '';
            return;
        }

        var overlayRect = imagesOverlay.getBoundingClientRect();
        var titleRect = textHolder.getBoundingClientRect();
        var buttonsRect = buttonHolder.getBoundingClientRect();

        var gapTop = titleRect.top - overlayRect.top - PADDING;
        var gapBottom = buttonsRect.bottom - overlayRect.top + PADDING;
        var overlayHeight = overlayRect.height;
        if (overlayHeight <= 0) return;

        gapTop = Math.max(0, gapTop);
        gapBottom = Math.min(overlayHeight, gapBottom);
        if (gapBottom <= gapTop) return;

        var fadeInStart = Math.max(0, gapTop - FEATHER);
        var fadeOutEnd = Math.min(overlayHeight, gapBottom + FEATHER);

        var stops = [
            'black 0px',
            'black ' + fadeInStart + 'px',
            'transparent ' + gapTop + 'px',
            'transparent ' + gapBottom + 'px',
            'black ' + fadeOutEnd + 'px',
            'black 100%'
        ];
        var mask = 'linear-gradient(to bottom, ' + stops.join(', ') + ')';

        imagesOverlay.style.maskImage = mask;
        imagesOverlay.style.webkitMaskImage = mask;
    }

    var ticking = false;
    function onChange() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                ticking = false;
                update();
            });
            ticking = true;
        }
    }

    window.addEventListener('resize', onChange);
    window.addEventListener('load', update);
    if (document.readyState === 'complete') {
        update();
    }
    setTimeout(update, 100);
    setTimeout(update, 500);
})();
