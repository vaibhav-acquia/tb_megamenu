/**
 * @file
 * Defines Javascript behaviors for MegaMenu frontend.
 */

(function ($, Drupal, drupalSettings) {
  'use strict';

  Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};

  Drupal.TBMegaMenu.focusableElements =
    'a:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), details:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

  Drupal.TBMegaMenu.menuResponsive = function () {
    $('.tbm').each(function () {
      var $thisMenu = $(this);
      var breakpoint = parseInt($thisMenu.data('breakpoint'));

      if (window.matchMedia(`(max-width: ${breakpoint}px)`).matches) {
        $thisMenu.addClass('tbm--mobile');
      } else {
        $thisMenu.removeClass('tbm--mobile');
      }
    });
  };

  Drupal.TBMegaMenu.focusNextPrevElement = function (direction) {
    // Add all the elements we want to include in our selection
    var $current = $(document.activeElement);

    if ($current.length) {
      var $focusable = $(Drupal.TBMegaMenu.focusableElements).filter(
        function () {
          var $this = $(this);
          return (
            $this.closest('.tbm-subnav').length === 0 && $this.is(':visible')
          );
        },
      );

      var index = $focusable.index($current);
      if (index > -1) {
        if (direction === 'next') {
          var nextElement = $focusable[index + 1] || $focusable[0];
        } else {
          var nextElement = $focusable[index - 1] || $focusable[0];
        }

        nextElement.focus();
      }
    }
  };

  Drupal.behaviors.tbMegaMenuAction = {
    attach: function (context, settings) {
      $('.tbm', context)
        .once('tbm')
        .each(function () {
          /* Keyboard Control Setup */
          // Semi-Global Variables
          var navParent = $(this),
            linkArray = new Array(),
            curPos = new Array(-1, -1, -1);
          var isTouch = window.matchMedia('(pointer: coarse)').matches;

          function isMobile() {
            return navParent.hasClass('tbm--mobile');
          }

          // Each Top-Level Link
          $(this)
            .find('.level-1')
            .children('.tbm-link-container')
            .children('.tbm-link, .tbm-no-link')
            .each(function (i, toplink) {
              linkArray[i] = new Array();

              // Add Link to Array
              linkArray[i][-1] = toplink;

              // Determine Coordinates
              $(toplink).data({ coordinate: [i, -1] });

              // Each top level submenu toggle.
              var subToggle = $(toplink).next('.tbm-submenu-toggle')[0];
              linkArray[i][-2] = subToggle;
              $(subToggle).data({ coordinate: [i, -2] });

              // Each Column
              $(toplink)
                .parent()
                .next()
                .children()
                .children('.tbm-column')
                .each(function (j, column) {
                  // Only add to the linkArray if menu items exist.
                  if (
                    $(column).find(Drupal.TBMegaMenu.focusableElements).length >
                    0
                  ) {
                    linkArray[i][j] = new Array();

                    // Each Link
                    $(column)
                      .find(Drupal.TBMegaMenu.focusableElements)
                      .each(function (k, sublink) {
                        // Add Link to Array
                        linkArray[i][j][k] = sublink;

                        // Determine Coordinates
                        $(sublink).data({ coordinate: [i, j, k] });
                      }); // each link
                  }
                }); // each column
            }); // each top-level link

          // Update Position on Focus
          $(this)
            .find('.tbm-nav')
            .find(Drupal.TBMegaMenu.focusableElements)
            .focus(function () {
              curPos = $(this).data('coordinate');
            });

          // Key Pressed
          function keydownEvent(k) {
            // Determine Key
            switch (k.keyCode) {
              // TAB
              case 9:
                // On mobile, we can follow the natural tab order.
                if (!isMobile()) {
                  k.preventDefault();
                  nav_tab(k);
                }
                break;

              // ESC
              case 27:
                nav_esc();
                break;

              // LEFT
              case 37:
                k.preventDefault();
                nav_left();
                break;

              // UP
              case 38:
                k.preventDefault();
                nav_up();
                break;

              // RIGHT
              case 39:
                k.preventDefault();
                nav_right();
                break;

              // DOWN
              case 40:
                k.preventDefault();
                nav_down();
                break;

              // HOME
              case 36:
                nav_home();
                break;

              // END
              case 35:
                nav_end();
                break;

              // Else
              default:
              // Do nothing
            } // determine key
          } // keydownEvent

          /* Keypress Functions */
          // Tab
          function nav_tab(k) {
            if (nav_is_toplink()) {
              if (k.shiftKey) {
                nav_prev_toplink();
              } else {
                nav_next_toplink();
              }
            } else {
              if (k.shiftKey) {
                nav_up();
              } else {
                nav_down();
              }
            }
          }

          // Escape
          function nav_esc() {
            nav_close_megamenu();
          }

          // Left
          function nav_left() {
            if (nav_is_toplink()) {
              nav_prev_toplink();
            } else {
              nav_prev_column();
            }
          }

          // Right
          function nav_right() {
            if (nav_is_toplink()) {
              nav_next_toplink();
            } else {
              nav_next_column();
            }
          }

          // Up
          function nav_up() {
            if (nav_is_toplink()) {
              nav_prev_toplink();
            } else {
              if (linkArray[curPos[0]][curPos[1]][curPos[2] - 1]) {
                // If the previous link in the array is hidden (ie, it's in a
                // submenu that is not currently expanded), then skip to the next
                // item in the array until we find one that's visible.
                if (
                  $(linkArray[curPos[0]][curPos[1]][curPos[2] - 1]).is(
                    ':visible',
                  )
                ) {
                  linkArray[curPos[0]][curPos[1]][curPos[2] - 1].focus();
                } else {
                  curPos = [curPos[0], curPos[1], curPos[2] - 1];
                  nav_up();
                }
              } else {
                nav_prev_column();
              }
            }
          }

          // Down
          function nav_down() {
            if (nav_is_toplink()) {
              nav_next_column();
            } else {
              if (
                linkArray[curPos[0]][curPos[1]][curPos[2] + 1] &&
                $(linkArray[curPos[0]][curPos[1]][curPos[2] + 1]).is(':visible')
              ) {
                linkArray[curPos[0]][curPos[1]][curPos[2] + 1].focus();
              } else if (
                // A little bit of a workaround for the fact that .tbm-submenu-toggle is visible only on mobile.
                linkArray[curPos[0]][curPos[1]][curPos[2] + 2] &&
                $(linkArray[curPos[0]][curPos[1]][curPos[2] + 2]).is(':visible')
              ) {
                linkArray[curPos[0]][curPos[1]][curPos[2] + 2].focus();
              } else {
                nav_next_column();
              }
            }
          }

          // Home Button
          function nav_home() {
            if (nav_is_toplink()) {
              linkArray[0][-1].focus();
            } else {
              linkArray[curPos[0]][0][0].focus();
            }
          }

          // End Button
          function nav_end() {
            if (nav_is_toplink()) {
              linkArray.slice(-1)[0][-1].focus();
            } else {
              linkArray[curPos[0]].slice(-1)[0].slice(-1)[0].focus();
            }
          }

          /* Helper Functions */
          // Determine Link Level
          function nav_is_toplink() {
            return curPos[1] < 0;
          }

          // Close Mega Menu
          function nav_close_megamenu() {
            navParent.find('.open').removeClass('open');
            navParent.find('.tbm-clicked').removeClass('tbm-clicked');
            ariaCheck();
          }

          // Next Toplink
          function nav_next_toplink() {
            if (linkArray[curPos[0] + 1]) {
              linkArray[curPos[0] + 1][-1].focus();
            } else {
              nav_close_megamenu();

              // Focus on the next element.
              Drupal.TBMegaMenu.focusNextPrevElement('next');
            }
          }

          // Previous Toplink
          function nav_prev_toplink() {
            if (linkArray[curPos[0] - 1]) {
              linkArray[curPos[0] - 1][-1].focus();
            } else {
              // Focus on the previous element.
              Drupal.TBMegaMenu.focusNextPrevElement('prev');
            }
          }

          // Previous Column
          function nav_prev_column() {
            if (linkArray[curPos[0]][curPos[1] - 1][0]) {
              linkArray[curPos[0]][curPos[1] - 1][0].focus();
            } else {
              nav_parent_toplink();
            }
          }

          // Next Column
          function nav_next_column() {
            if (linkArray[curPos[0]][curPos[1] + 1]) {
              linkArray[curPos[0]][curPos[1] + 1][0].focus();
            } else {
              nav_parent_toplink();
            }
          }

          // Go to Parent Toplink
          function nav_parent_toplink() {
            linkArray[curPos[0]][-1].focus();
          }

          var ariaCheck = function () {
            $('li.tbm-item', this).each(function () {
              if ($(this).is('.tbm-group')) {
                // Mega menu item has mega class (it's a true mega menu)
                if (!$(this).parents().is('.open')) {
                  // Mega menu item has mega class and its ancestor is closed, so apply appropriate ARIA attributes
                  $(this).children().attr('aria-expanded', 'false');
                } else if ($(this).parents().is('.open')) {
                  // Mega menu item has mega class and its ancestor is open, so apply appropriate ARIA attributes
                  $(this).children().attr('aria-expanded', 'true');
                }
              } else if (
                $(this).is('.tbm-item--has-dropdown') ||
                $(this).is('.tbm-item--has-flyout')
              ) {
                // Mega menu item has dropdown (it's a flyout menu)
                if (!$(this).is('.open')) {
                  // Mega menu item has dropdown class and is closed, so apply appropriate ARIA attributes
                  $(this).children().attr('aria-expanded', 'false');
                } else if ($(this).is('.open')) {
                  // Mega menu item has dropdown class and is open, so apply appropriate ARIA attributes
                  $(this).children().attr('aria-expanded', 'true');
                }
              } else {
                // Mega menu item is neither a mega or dropdown class, so remove ARIA attributes (it doesn't have children)
                $(this).children().removeAttr('aria-expanded');
              }
            });
          };

          var showMenu = function ($subMenu, mm_timeout) {
            if ($subMenu.hasClass('level-1')) {
              $subMenu.addClass('animating');
              clearTimeout($subMenu.data('animatingTimeout'));
              $subMenu.data(
                'animatingTimeout',
                setTimeout(function () {
                  $subMenu.removeClass('animating');
                }, mm_timeout),
              );
              clearTimeout($subMenu.data('hoverTimeout'));
              $subMenu.data(
                'hoverTimeout',
                setTimeout(function () {
                  $subMenu.addClass('open');
                  ariaCheck();
                }, 100),
              );
            } else {
              clearTimeout($subMenu.data('hoverTimeout'));
              $subMenu.data(
                'hoverTimeout',
                setTimeout(function () {
                  $subMenu.addClass('open');
                  ariaCheck();
                }, 100),
              );
            }
          };

          var hideMenu = function ($subMenu, mm_timeout) {
            $subMenu.children('.tbm-toggle').attr('aria-expanded', 'false');
            if ($subMenu.hasClass('mega')) {
              $subMenu.addClass('animating');
              clearTimeout($subMenu.data('animatingTimeout'));
              $subMenu.data(
                'animatingTimeout',
                setTimeout(function () {
                  $subMenu.removeClass('animating');
                }, mm_timeout),
              );
              clearTimeout($subMenu.data('hoverTimeout'));
              $subMenu.data(
                'hoverTimeout',
                setTimeout(function () {
                  $subMenu.removeClass('open');
                  ariaCheck();
                }, 100),
              );
            } else {
              clearTimeout($subMenu.data('hoverTimeout'));
              $subMenu.data(
                'hoverTimeout',
                setTimeout(function () {
                  $subMenu.removeClass('open');
                  ariaCheck();
                }, 100),
              );
            }
          };

          // TODO -- add aria-expanded here.
          $('.tbm-button', this).click(function () {
            // If the menu is currently open, collapse all open dropdowns before
            // hiding the menu.
            if (navParent.hasClass('tbm--mobile-show')) {
              nav_close_megamenu();
            }

            // Toggle the menu visibility.
            $(this).parent().toggleClass('tbm--mobile-show');
          });

          if (!isTouch) {
            var mm_duration = navParent.data('duration')
              ? navParent.data('duration')
              : 0;

            var mm_timeout = mm_duration ? 100 + mm_duration : 500;

            // Show dropdowns and flyouts on hover.
            $('.tbm-nav > li, li.tbm-item', context).bind(
              'mouseenter',
              function (event) {
                if (!isMobile()) {
                  showMenu($(this), mm_timeout);
                }
              },
            );

            // Show dropdwons and flyouts on focus.
            $('.tbm-toggle', context).bind('focus', function (event) {
              if (!isMobile()) {
                var $this = $(this);
                var $subMenu = $this.closest('li');
                showMenu($subMenu, mm_timeout);
                // If the focus moves outside of the subMenu, close it.
                $(document).bind('focusin', function (event) {
                  if ($subMenu.has(event.target).length) {
                    return;
                  }
                  $(document).unbind(event);
                  hideMenu($subMenu, mm_timeout);
                });
              }
            });

            $('.tbm-nav > li, li.tbm-item', context).bind(
              'mouseleave',
              function (event) {
                if (!isMobile()) {
                  hideMenu($(this), mm_timeout);
                }
              },
            );
          }

          // Define actions for touch devices.
          var createTouchMenu = function (items) {
            items
              .children('.tbm-link-container')
              .children('.tbm-link, .tbm-no-link')
              .each(function () {
                var $item = $(this);
                var tbitem = $(this).closest('.tbm-item');

                $item.click(function (event) {
                  if (!isMobile() && isTouch) {
                    // If the menu link has already been clicked once...
                    if ($item.hasClass('tbm-clicked')) {
                      var $uri = $item.attr('href');

                      // If the menu link has a URI, go to the link.
                      // <nolink> menu items will not have a URI.
                      if ($uri) {
                        window.location.href = $uri;
                      } else {
                        $item.removeClass('tbm-clicked');
                        hideMenu(tbitem, mm_timeout);
                      }
                    } else {
                      event.preventDefault();

                      // Hide any already open menus which are not parents of the
                      // currently clicked menu item.
                      var $openParents = $item.parents('.open');
                      var $allOpen = $('.tbm .open');

                      // Loop through all open items and check to see if they are
                      // parents of the clicked item.
                      $allOpen.each(function (index, item) {
                        if ($(item).is($openParents)) {
                          // do nothing
                        } else {
                          $(item).removeClass('open');
                        }
                      });

                      // Apply aria attributes.
                      ariaCheck();

                      // Remove any existing tmb-clicked classes.
                      $('.tbm').find('.tbm-clicked').removeClass('tbm-clicked');

                      // Open the submenu and apply the tbm-clicked class.
                      $item.addClass('tbm-clicked');
                      showMenu(tbitem, mm_timeout);
                    }
                  }
                });
              });

            // Anytime there's a click outside the menu, close the menu.
            $(document).on('click', function (event) {
              if ($(event.target).closest('.tbm-nav').length === 0) {
                if (navParent.find('.open').length > 0) {
                  nav_close_megamenu();
                }
              }
            });
          };

          // Add touch functionality.
          createTouchMenu(
            $('.tbm ul.tbm-nav li.tbm-item', context).has('.tbm-submenu'),
          );

          // Toggle submenus on mobile.
          $('.tbm-submenu-toggle, .tbm-no-link').on('click', function () {
            if (isMobile()) {
              var $parentItem = $(this).closest('.tbm-item');

              if ($parentItem.hasClass('open')) {
                hideMenu($parentItem, mm_timeout);
              } else {
                showMenu($parentItem, mm_timeout);
              }
            }
          });

          // Add keyboard listeners.
          navParent.on('keydown', keydownEvent);

          $(window).on('load resize', function () {
            Drupal.TBMegaMenu.menuResponsive();
          });
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
