/* "More ways to earn than one" - scroll-driven pinned version.

   Kept entirely separate from index_pink.html on purpose, same pattern
   as earn-section.js/preloader.js: this file injects its own <style>
   and markup into the #earn-scroll-section-mount div left in the main
   page (right after .no-writing), so nothing about this section's
   markup, styling or behavior lives in the main file itself - the
   main file only has a mount point + a <script src> for this.

   Flow (per explicit request, a revision of the first version of this
   file which mirrored who-this-is-for-section.js's intro-line +
   heading-FLIP-into-left-column + split-panel-items structure):
     1. No eyebrow badge - removed.
     2. Heading opens centered, full-screen, on its own (no intro line
        before it this time).
     3. Heading fades out, then the subtext takes over the same centered
        full-screen spot, at a larger font size than before.
     4. Subtext fades out, then the 4 items (Jobs/Commits/Taps/Referrals)
        are revealed one at a time in a left-text/right-image split -
        each showing its title + full description on the left and its
        image (enlarged from the previous version) on the right, plus
        the short dynamic sentence underneath (earnScrollBottomRow,
        explicitly asked to be retained) that already existed in the
        prior version of this file.
     5. Finale full-screen closing tagline, kept as its own step at the
        end, same look as the heading/subtext moments.

   Visual language matches the rest of the site's existing tokens: the
   pink/lavender gradient background (var(--color-1) -> var(--color-2))
   and the site's purple accent (#545784, var(--color-3)), same as
   who-this-is-for-section.js and the previous version of this file.

   The heading's centered-to-resting-position slide is NOT reused here
   the way who-this-is-for-section.js does it - that technique exists
   specifically to move a heading from a centered opening position into
   a permanent left-column spot it keeps for the rest of the section.
   Here the heading has no permanent resting spot; it only ever appears
   centered, once, then is fully replaced by the subtext and then the
   items. So the heading and subtext are just two more full-screen
   centered moments, styled like the intro/finale text.

   Each item's image is a real image from images/earn_section_v1/
   (job.png, commits.png, taps.png, refferal.png - matched to each item
   by content; replaced the original images/earn-section/ set per
   explicit request). These are transparent-background cutouts (alpha
   channel confirmed - some image viewers render their transparent
   areas as a solid magenta placeholder color instead of checkerboard,
   which is a viewer quirk, not an actual opaque fill in the file), not
   screenshots in a frame, so there's no card box, border or shadow
   around them - the artwork sits directly on the section's own
   gradient, sized with object-fit:contain and enlarged further from
   the previous version.

   Behavior: an 940vh scroll wrapper pins the section and moves through
   7 steps: heading (1) + subtext (1) + items (4) + finale (1) - see
   the IIFE below.

   No decorative corner "blob" glows here (an earlier version of both
   this file and who-this-is-for-section.js had them). Each section
   positioned its own blobs relative to its own box, so one section's
   blob faded out right as the next section's differently-positioned
   blob faded in - that mismatch is what actually produced a visible
   seam at the handoff between pinned sections, even after the base
   gradient itself was made pixel-identical between them. Removed
   entirely (in both files) rather than trying to sync them, since
   there's nothing left to mismatch once they're gone. */
(function () {
    var mount = document.getElementById('earn-scroll-section-mount');
    if (!mount) return;

    // The "No / Applying / Chasing / Monotony" section right before
    // this one (.section.no-writing, pinned via its own
    // .sticky-no-writing) used to just scroll out from under this
    // section as the user kept scrolling. Per explicit request it now
    // blurs and fades out instead, watched the same way
    // testimonial-scroll.js watches .gradient-section before the
    // testimonial section: driven by ITS OWN scroll position (no
    // second pin added), fading out as its bottom edge approaches the
    // top of the viewport, so this section reads as fading in
    // underneath rather than just being revealed by a scroll-out.
    var prevSection = document.querySelector('.section.no-writing');

    var css = ''
        + '.section.no-writing{transition:opacity .4s ease, filter .4s ease;}'
        + '.section.no-writing.is-prev-fading{opacity:0;filter:blur(14px);}'
        + '.earn-scroll-wrapper *{box-sizing:border-box;}'
        + '.earn-scroll-wrapper{position:relative;height:940vh;font-family:"Outfit",sans-serif;color:#1a1a2e;}'
        /* No background of its own - fully transparent, so the single
           page-wide gradient on <html> (linear-gradient(45deg,
           var(--color-1), var(--color-2)), background-attachment:fixed)
           shows straight through. That gradient is the only one the
           page paints anywhere.

           An earlier attempt had this section (and
           who-this-is-for-section.js) each paint their own local copy
           of that same gradient instead. That cannot work: two
           stacked 100vh boxes each painting a 45deg gradient from
           their own top-left means the END color of one meets the
           START color of the next at their shared edge - a guaranteed
           hard line, exactly the seam this was meant to remove.

           Note the deliberate absence of overflow:hidden here too.
           position:sticky + overflow:hidden is what promotes this
           section to its own compositing layer, and a
           background-attachment:fixed image gets recomputed per
           compositing layer at paint time - which made <html>'s shared
           background itself paint inconsistently across the boundary.
           overflow:hidden was only ever needed to clip the decorative
           blob glows, and those are gone (see the note at the top of
           this file), so dropping it keeps both pinned sections in the
           same layer as the rest of the page and lets the one fixed
           background render continuously across them. */
        + '.earn-scroll-section{position:sticky;top:0;height:100vh;width:100%;display:flex;align-items:center;background:transparent;}'

        /* full-screen centered moments: heading, subtext, finale - all
           three share the same look/transition, only the font size
           differs (subtext is explicitly larger than the old inline
           left-column version, per request) */
        + '.earn-scroll-moment{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 3rem;opacity:0;transform:scale(.94);filter:blur(10px);pointer-events:none;transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1), filter .7s cubic-bezier(.16,1,.3,1);}'
        + '.earn-scroll-moment.is-visible{opacity:1;transform:scale(1);filter:blur(0);pointer-events:auto;}'
        + '.earn-scroll-heading{font-size:clamp(2.2rem, 5vw, 4rem);font-weight:600;line-height:1.15;letter-spacing:-.02em;color:#1a1a2e;max-width:44rem;margin:0 auto;}'
        + '.earn-scroll-heading .pink{color:#393a5e;}'
        + '.earn-scroll-subtext{font-size:clamp(1.7rem, 3.4vw, 2.6rem);font-weight:500;line-height:1.45;color:rgba(26,26,46,.85);max-width:50rem;margin:0 auto;}'
        + '.earn-scroll-fullscreen-tagline{font-size:clamp(1.9rem, 4.2vw, 3.2rem);font-weight:700;line-height:1.25;letter-spacing:-.01em;color:#1a1a2e;max-width:42rem;margin:0 auto;}'
        + '.earn-scroll-fullscreen-tagline .pink{color:#393a5e;}'

        /* item stage: left text (title + description + short bottom
           sentence) / right enlarged image, revealed one item at a time */
        + '.earn-scroll-container{width:100%;max-width:78rem;margin:0 auto;padding:0 2rem;position:relative;z-index:2;display:flex;flex-direction:row;align-items:center;justify-content:space-between;height:100%;gap:3rem;transition:opacity .5s ease;}'
        + '.earn-scroll-left-panel{flex:1 1 38%;max-width:38%;display:flex;flex-direction:column;gap:1.5rem;}'
        + '.earn-scroll-right-panel{flex:1 1 58%;max-width:58%;display:flex;align-items:center;justify-content:center;width:100%;height:38rem;}'
        + '.earn-scroll-row{position:absolute;inset:0;display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:3rem;opacity:0;transform:translateY(22px) scale(.97);pointer-events:none;transition:opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1);}'
        + '.earn-scroll-row.is-current{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}'

        /* title/description/sentence each animate in on their own,
           staggered rather than all popping in with the row at once -
           each starts blurred/offset and only reaches full opacity
           once the row itself is current AND that piece's own
           is-visible class lands (added with a setTimeout stagger from
           setActiveIndex(), so they arrive title -> description ->
           sentence, matching the reading order). Image intentionally
           fades/scales in on the same timing as the row itself, not
           staggered with the text - it is the anchor the text is
           describing, not another line of copy. */
        + '.earn-scroll-row-title,.earn-scroll-row-desc,.earn-scroll-bottom-row{opacity:0;transform:translateY(16px);filter:blur(4px);transition:opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1), filter .5s ease;}'
        + '.earn-scroll-row.is-current .earn-scroll-row-title.is-visible,'
        + '.earn-scroll-row.is-current .earn-scroll-row-desc.is-visible,'
        + '.earn-scroll-row.is-current .earn-scroll-bottom-row.is-visible{opacity:1;transform:translateY(0);filter:blur(0);}'
        + '.earn-scroll-row-title{font-size:clamp(1.9rem, 3vw, 2.6rem);font-weight:600;line-height:1.1;color:rgba(26,26,46,.85);margin:0 0 .9rem;}'
        + '.earn-scroll-row-desc{font-size:1.18rem;line-height:1.42;color:rgba(0,0,0,.72);max-width:32rem;margin:0 0 1.5rem;}'
        + '.earn-scroll-row-preview{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}'
        + '.earn-scroll-row-preview img{width:100%;height:100%;object-fit:contain;display:block;}'
        + '.earn-scroll-bottom-row{width:100%;}'
        + '.earn-scroll-sentence-text{font-size:clamp(1.35rem, 2.1vw, 1.75rem);font-weight:500;line-height:1.4;color:#000;text-align:left;width:100%;margin:0;}'
        + '.earn-scroll-sentence-text .pink{color:#545784;font-weight:600;}'

        + '@media screen and (max-width:991px){'
        + '  .earn-scroll-container{display:block;padding:0 1.5rem;text-align:center;}'
        /* .earn-scroll-left-panel (title+desc+sentence) and
           .earn-scroll-right-panel (image) are two separate flex
           children of .earn-scroll-row on desktop, side by side - but
           the requested mobile order (heading, then desc, THEN image,
           THEN sentence) interleaves a piece from the right panel
           between two pieces of the left panel. display:contents on
           both panels dissolves them as flex items - their own
           children (title/desc/bottom-row from the left, the image
           preview from the right) become direct flex items of
           .earn-scroll-row instead, so each one can be given its own
           `order` below regardless of which panel it originally lived
           in. */
        + '  .earn-scroll-left-panel,.earn-scroll-right-panel{display:contents;}'
        + '  .earn-scroll-row{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.1rem;text-align:center;padding:0 .5rem;}'
        /* Explicit order per request: heading, then the description
           text, then the image, then the short dynamic sentence. */
        + '  .earn-scroll-row-title{order:1;font-size:2.1rem;font-weight:700;color:#393a5e;}'
        + '  .earn-scroll-row-desc{order:2;max-width:100%;font-size:1.1rem;line-height:1.38;}'
        /* Was width/height:100% against .earn-scroll-right-panel's own
           fixed box on desktop - that parent no longer sizes it
           (display:contents above), so it needs its own explicit box
           here instead of inheriting a now-nonexistent 100%. */
        + '  .earn-scroll-row-preview{order:3;width:100%;height:14rem;flex:none;}'
        + '  .earn-scroll-bottom-row{order:4;width:100%;}'
        + '  .earn-scroll-sentence-text{text-align:center;}'
        + '}'
        + '@media (prefers-reduced-motion: reduce){'
        + '  .earn-scroll-row,.earn-scroll-sentence-text,.earn-scroll-moment{transition-duration:.01ms !important;}'
        + '}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var items = [
        {
            title: 'Jobs',
            desc: 'A single project, start to finish. Take it on, deliver milestones from wherever you are, get paid.',
            img: 'images/earn_section_v1/job.png',
            sentence: 'Take a quick <span class="pink">job</span> today.'
        },
        {
            title: 'Commits',
            desc: 'An ongoing monthly engagement with a company you trust. Steady, recurring income, without giving up your independence. Exclusive, non-exclusive, your call. Three months here, three months on another project, whatever works for you.',
            img: 'images/earn_section_v1/commits.png',
            sentence: '<span class="pink">Commit</span> to something longer next month.'
        },
        {
            title: 'Taps',
            desc: 'A direct 30-minute expert consultation. Get paid for your knowledge, not just your deliverables.',
            img: 'images/earn_section_v1/taps.png',
            sentence: 'Say yes to a <span class="pink">Tap</span>.'
        },
        {
            title: 'Referrals',
            desc: 'Bring someone you trust into the network, and earn when they earn.',
            img: 'images/earn_section_v1/referral_transparent.png',
            sentence: '<span class="pink">Refer</span> in someone who deserves to be here too.'
        }
    ];

    var rowsHtml = items.map(function (item, i) {
        return ''
            + '<div class="earn-scroll-row" data-index="' + i + '">'
            + '  <div class="earn-scroll-left-panel">'
            + '    <h3 class="earn-scroll-row-title">' + item.title + '</h3>'
            + '    <p class="earn-scroll-row-desc">' + item.desc + '</p>'
            + '    <div class="earn-scroll-bottom-row"><div class="earn-scroll-sentence-text">' + item.sentence + '</div></div>'
            + '  </div>'
            + '  <div class="earn-scroll-right-panel">'
            + '    <div class="earn-scroll-row-preview"><img src="' + item.img + '" alt="' + item.title + '" loading="lazy"></div>'
            + '  </div>'
            + '</div>';
    }).join('');

    mount.outerHTML = ''
        + '<div class="earn-scroll-wrapper" id="earnScrollWrapper">'
        + '  <section class="earn-scroll-section" id="earnScrollSection">'
        + '    <div class="earn-scroll-moment" id="earnScrollHeadingMoment">'
        + '      <h2 class="earn-scroll-heading">More ways to earn <span class="pink">than one</span>.</h2>'
        + '    </div>'
        + '    <div class="earn-scroll-moment" id="earnScrollSubtextMoment">'
        + '      <p class="earn-scroll-subtext">Independent work shouldn\'t mean one kind of income. Aitie gives you four ways to earn, and you choose what fits your life right now.</p>'
        + '    </div>'
        + '    <div class="earn-scroll-container" id="earnScrollList">' + rowsHtml + '</div>'
        + '    <div class="earn-scroll-moment" id="earnScrollFinalMoment">'
        + '      <h3 class="earn-scroll-fullscreen-tagline">However you want to earn, <span class="pink">there\'s a way built for it.</span></h3>'
        + '    </div>'
        + '  </section>'
        + '</div>';

    var wrapper = document.getElementById('earnScrollWrapper');
    var rows = Array.prototype.slice.call(document.querySelectorAll('.earn-scroll-row'));
    var headingMoment = document.getElementById('earnScrollHeadingMoment');
    var subtextMoment = document.getElementById('earnScrollSubtextMoment');
    var finalMoment = document.getElementById('earnScrollFinalMoment');
    var container = document.getElementById('earnScrollList');

    var ITEM_COUNT = rows.length;      // 4
    var TOTAL_STEPS = ITEM_COUNT + 3;   // heading (1) + subtext (1) + items (4) + finale (1) = 7

    var currentActive = -1;
    var ticking = false;
    var staggerTimers = [];

    // Stagger the title -> description -> sentence reveal within
    // whichever row just became current, instead of the whole block
    // popping in with the row's own fade. Each piece is reset to
    // hidden immediately (so re-entering a row always replays the
    // stagger rather than skipping straight to fully visible), and the
    // outgoing row's pieces are reset too so they don't stay lit while
    // faded out underneath the next one.
    function setActiveIndex(index) {
        if (index === currentActive) return;
        currentActive = index;

        staggerTimers.forEach(function (t) { clearTimeout(t); });
        staggerTimers = [];

        rows.forEach(function (row, i) {
            row.classList.toggle('is-current', i === index);
            var pieces = row.querySelectorAll('.earn-scroll-row-title, .earn-scroll-row-desc, .earn-scroll-bottom-row');
            if (i !== index) {
                pieces.forEach(function (el) { el.classList.remove('is-visible'); });
            }
        });

        if (index >= 0 && rows[index]) {
            var activeRow = rows[index];
            var pieces = [
                activeRow.querySelector('.earn-scroll-row-title'),
                activeRow.querySelector('.earn-scroll-row-desc'),
                activeRow.querySelector('.earn-scroll-bottom-row')
            ];
            pieces.forEach(function (el) { if (el) el.classList.remove('is-visible'); });
            pieces.forEach(function (el, i) {
                if (!el) return;
                staggerTimers.push(setTimeout(function () {
                    el.classList.add('is-visible');
                }, 160 + i * 140));
            });
        }
    }

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function updatePrevSection() {
        if (!prevSection) return;
        // .section.no-writing is a tall (2.5x viewport height) block
        // whose child .sticky-no-writing stays pinned at top:0 only
        // while .section.no-writing still has remaining scroll distance
        // below it - past that point sticky naturally releases and it
        // starts scrolling normally with the rest of the page.
        //
        // Watching .section.no-writing's bottom edge approaching the
        // TOP of the viewport (the previous version of this function)
        // only starts closing that distance once the sticky child has
        // ALREADY released and is scrolling away - so the fade-out and
        // the slide-away happened at the same time: it read as sliding
        // off screen while fading, not fading calmly in place.
        // Computing progress against the section's own top instead
        // (independent of where its bottom edge currently is) lets the
        // fade finish completely BEFORE that release point - by the
        // time sticky actually lets go and the element would start
        // sliding, it's already faded to fully invisible, so the motion
        // happens unseen and the fade itself reads as static. Same fix
        // as testimonial-scroll.js's own updatePrevSection() for
        // .gradient-section.
        var rect = prevSection.getBoundingClientRect();
        var viewportH = window.innerHeight;
        var totalScrollable = prevSection.offsetHeight - viewportH;
        if (totalScrollable <= 0) return;

        var scrolledIntoSection = -rect.top;
        var sectionProgress = clamp(scrolledIntoSection / totalScrollable, 0, 1);

        // Fade over the last 12% of the section's own pinned scroll
        // range, finishing at 92% - comfortably before 100% (the exact
        // sticky-release point).
        var FADE_START = 0.80;
        var FADE_END = 0.92;
        var raw = clamp((sectionProgress - FADE_START) / (FADE_END - FADE_START), 0, 1);

        prevSection.classList.toggle('is-prev-fading', raw > 0.05);
        prevSection.style.opacity = String(1 - raw);
        prevSection.style.filter = 'blur(' + (raw * 14) + 'px)';
    }

    function update() {
        ticking = false;
        updatePrevSection();

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
            // ---- step 0: heading, centered full-screen ----
            var ENTER_AT = 0.08;
            var EXIT_AT = 0.82;
            headingMoment.classList.toggle('is-visible', stepFrac > ENTER_AT && stepFrac <= EXIT_AT);
            subtextMoment.classList.remove('is-visible');
            if (currentActive !== -1) {
                setActiveIndex(-1);
            }
        } else if (stepFloor === 1) {
            // ---- step 1: subtext takes over the same centered spot ----
            var SUB_ENTER = 0.08;
            var SUB_EXIT = 0.85;
            headingMoment.classList.remove('is-visible');
            subtextMoment.classList.toggle('is-visible', stepFrac > SUB_ENTER && stepFrac <= SUB_EXIT);
            if (currentActive !== -1) {
                setActiveIndex(-1);
            }
        } else if (stepFloor <= ITEM_COUNT + 1) {
            // ---- item-by-item reveal ----
            headingMoment.classList.remove('is-visible');
            subtextMoment.classList.remove('is-visible');
            finalMoment.classList.remove('is-visible');
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
            setActiveIndex(stepFloor - 2);
        } else {
            // ---- finale: full-screen closing line ----
            var FINALE_ENTER = 0.1;
            var finaleVisible = stepFrac > FINALE_ENTER || progress >= 0.999;
            headingMoment.classList.remove('is-visible');
            subtextMoment.classList.remove('is-visible');
            finalMoment.classList.toggle('is-visible', finaleVisible);
            container.style.opacity = finaleVisible ? '0' : '1';
            container.style.pointerEvents = finaleVisible ? 'none' : 'auto';
            if (currentActive !== ITEM_COUNT) {
                setActiveIndex(ITEM_COUNT);
            }
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
