/* Shared navbar + footer, injected on every page that includes this
   script - kept in one file so index_pink.html and waitlist.html (and
   any future page) render the exact same nav/footer markup instead of
   each keeping its own copy that can drift out of sync. Same pattern
   as the other sections/*.js files: this script owns its own markup
   and CSS, the host page only needs two empty mount points plus this
   <script> tag.

   Markup/copy is pulled directly from index_pink.html's own
   .nav_wrap/.footer_wrapper as they stood there - any future edit to
   the nav or footer should happen here, not by re-forking it into a
   page again.

   Depends on (must already be present on the host page, in this
   order, same as index_pink.html has them):
     1. The Webflow shared stylesheet link
        (az-lifelogx.webflow.shared*.css) - .nav, .footer-link,
        .footer-grid etc. are all real classes defined there, not
        redefined by this file.
     2. jQuery + the four webflow.*.js chunk scripts (Webflow's own
        nav interaction runtime - the mobile hamburger's open/close
        behavior on .w-nav-button doesn't work without them).
     3. Mount points: <div id="global-navbar-mount"></div> where the
        nav should sit, and <div id="global-footer-mount"></div> where
        the footer should sit.

   CSS overrides bundled here (nav/footer background transparency,
   logo blend mode) are the same ones index_pink.html already carried
   in its own inline <style> for these exact elements - duplicated
   into this file's own injected <style> rather than left for the host
   page to redeclare, so a page only needs this one script to get a
   fully-styled nav/footer. */
(function () {
    var navMount = document.getElementById('global-navbar-mount');
    var footerMount = document.getElementById('global-footer-mount');
    if (!navMount && !footerMount) return;

    var css = ''
        + '.nav-logo-desktop .logo-wrap,.nav-logo-mobile .logo-wrap{mix-blend-mode:difference;}'
        + '.nav_background,.w-nav,.nav,.navbar,.nav_wrap{background:transparent !important;background-color:transparent !important;}'
        + '.nav-menu-links{background-color:#000 !important;border-color:rgba(84,87,132,.25) !important;}'
        + '.section-footer{background-color:rgb(0,0,2) !important;}'
        + '.footer-bottom-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem 1.5rem;}'
        + '.footer-location{color:#9ca3af;}'
        + '.text-sm{font-size:.875rem;line-height:1.25rem;}'
        + '.text-gray-400{color:#9ca3af;}'
        + '.footer-social-links{display:flex;align-items:center;gap:1rem;}'
        + '.footer-social-link{display:flex;color:#9ca3af;transition:color .3s ease;}'
        + '.footer-social-link:hover{color:#fff;}'
        + '.footer-social-icon{width:1.15rem;height:1.15rem;}'
        + '@media screen and (max-width:767px){'
        + '  .footer-bottom-row{justify-content:center;text-align:center;}'
        + '  .footer-grid > .footer-content-grid[aria-hidden="true"]{display:none;}'
        + '}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var navHtml = ''
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
        + '              <div class="nav-link-wrap"><a href="/about" class="nav-link w-inline-block"><p>About</p></a></div>'
        + '              <div class="nav-link-wrap flex-center"><div><a href="feature.html" class="nav-link w-inline-block"><p>Features</p></a></div></div>'
        + '              <div class="nav-link-wrap flex-center"><div><a href="blogs.html" class="nav-link w-inline-block"><p>Blogs</p></a></div></div>'
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

    var footerHtml = ''
        + '<div mdlfy-content="component" class="footer_wrapper">'
        + '  <div class="section-footer">'
        + '    <div class="footer_09-wrapper">'
        + '      <div class="footer_wrap">'
        + '        <div class="text-extrabig-loop-wrap">'
        + '          <img class="text-extra-big-logo" src="images/logotype_white .svg" alt="Aitie" />'
        + '          <div class="gradient-footer"></div>'
        + '          <div class="text-extra-big-stroke-holder">'
        + '            <img class="text-extra-big-logo text-extra-big-logo-stroke" src="images/logotype_white .svg" alt="" aria-hidden="true" />'
        + '          </div>'
        + '        </div>'
        + '        <div class="padding-global">'
        + '          <div class="container-medium">'
        + '            <div class="padding-section-medium no-padding-top">'
        + '              <div class="footer-content-holder">'
        + '                <div><a href="/" class="footer-logo-link w-nav-brand">'
        + '                    <div class="footer-logo-wrap">'
        + '                      <div class="logo-wrap"><img loading="lazy" alt="Logo" src="images/logotype_white .svg" class="logo-image" /></div>'
        + '                    </div>'
        + '                  </a></div>'
        + '                <div class="footer-grid">'
        + '                  <div class="footer-content-grid" aria-hidden="true"></div>'
        + '                  <div class="footer-content-grid">'
        + '                    <div class="footer_list-wrap">'
        + '                      <div class="footer_link-wrap"><a href="/" class="footer-link w-inline-block"><p>Home</p></a></div>'
        + '                      <div class="footer_link-wrap"><a href="/about" class="footer-link w-inline-block"><p>About</p></a></div>'
        + '                      <div class="footer_link-wrap"><a href="feature.html" class="footer-link w-inline-block"><p>Features</p></a></div>'
        + '                      <div class="footer_link-wrap"><a href="blogs.html" class="footer-link w-inline-block"><p>Blogs</p></a></div>'
        + '                      <div class="footer_link-wrap"><a href="waitlist.html" class="footer-link w-inline-block"><p>Join Waitlist</p></a></div>'
        + '                    </div>'
        + '                  </div>'
        + '                  <div class="footer-content-grid">'
        + '                    <div class="footer_list-wrap">'
        + '                      <div class="footer_link-wrap"><a href="privacy-policy.html" class="footer-link w-inline-block"><p>Privacy policy</p></a></div>'
        + '                      <div class="footer_link-wrap"><a href="terms-and-conditions.html" class="footer-link w-inline-block"><p>Terms and Conditions</p></a></div>'
        + '                    </div>'
        + '                  </div>'
        + '                </div>'
        + '              </div>'
        + '              <div class="made-by-section footer-bottom-row">'
        + '                <div class="text-sm text-gray-400">© 2026 Aitie</div>'
        + '                <div class="flex flex-row items-center footer-location">'
        + '                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1.2" baseProfile="tiny" viewBox="0 0 24 24" class="mr-0.5 size-4 text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967l-11.376 5.308c-1.001.467-.963 1.129.085 1.479l4.103 1.367 1.368 4.102z"></path></svg><span class="text-sm text-gray-400">Bangalore, India</span>'
        + '                </div>'
        + '                <div class="text-sm text-gray-400 footer-rights">All rights reserved</div>'
        + '                <div class="footer-social-links">'
        + '                  <a href="mailto:app@aitie.co" aria-label="Email Aitie" class="footer-social-link w-inline-block">'
        + '                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-social-icon"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 6-10 7L2 6"></path></svg>'
        + '                  </a>'
        + '                  <a href="https://www.linkedin.com/company/aitie-app/" target="_blank" rel="noopener noreferrer" aria-label="Aitie on LinkedIn" class="footer-social-link w-inline-block">'
        + '                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="footer-social-icon"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.137 1.445-2.137 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z"></path></svg>'
        + '                  </a>'
        + '                </div>'
        + '              </div>'
        + '            </div>'
        + '          </div>'
        + '        </div>'
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</div>';

    if (navMount) navMount.outerHTML = navHtml;
    if (footerMount) footerMount.outerHTML = footerHtml;
})();
