/**
 * @file
 * Defines Javascript behaviors for MegaMenu frontend.
 */

(function ($, Drupal, drupalSettings) {
  'use strict';

  Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};

  Drupal.TBMegaMenu.oldWindowWidth = 0;
  Drupal.TBMegaMenu.displayedMenuMobile = false;
  Drupal.TBMegaMenu.supportedScreens = [980];
  Drupal.TBMegaMenu.menuResponsive = function () {
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    var navCollapse = $('.tbm').children('.tbm-collapse');
    if (windowWidth < Drupal.TBMegaMenu.supportedScreens[0]) {
      if (Drupal.TBMegaMenu.displayedMenuMobile) {
        navCollapse.css({ height: 'auto', overflow: 'visible' });
      } else {
        navCollapse.css({ height: 0, overflow: 'hidden' });
      }
    } else {
      // If width of window is greater than 980 (supported screen).
      if (navCollapse.height() <= 0) {
        navCollapse.css({ height: 'auto', overflow: 'visible' });
      }
    }
  };

  Drupal.TBMegaMenu.focusNextPrevElement = function (direction) {
    // Add all the elements we want to include in our selection
    var focusableElements =
      'a:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), details:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    var $current = $(document.activeElement);

    if ($current.length) {
      var $focusable = $(focusableElements).filter(function () {
        var $this = $(this);
        return (
          $this.closest('.tbm-subnav').length === 0 && $this.is(':visible')
        );
      });

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
          var navParent = document.querySelector('.tbm'),
            linkArray = new Array(),
            curPos = new Array(-1, -1, -1);

          // Each Top-Level Link
          $(this)
            .find('.level-1')
            .children('a, span')
            .not('.mobile-only')
            .each(function (i, toplink) {
              linkArray[i] = new Array();

              // Add Link to Array
              linkArray[i][-1] = toplink;

              // Determine Coordinates
              $(toplink).data({ coordinate: [i, -1] });

              // Each Column
              $(toplink)
                .next()
                .children()
                .children('.tbm-column')
                .each(function (j, column) {
                  // Only add to the linkArray if menu items exist.
                  // TODO - this does not allow for tabbing to links in blocks, only menu item links.
                  if (
                    $(column).find('.tbm-item').children('a, span').length > 0
                  ) {
                    linkArray[i][j] = new Array();

                    // Each Link
                    $(column)
                      .find('.tbm-item')
                      .children('a, span')
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
            .find('.tbm-item')
            .children('a, span')
            .focus(function () {
              curPos = $(this).data('coordinate');
            });

          // Key Pressed
          function keydownEvent(k) {
            // Determine Key
            switch (k.keyCode) {
              // TAB
              case 9:
                k.preventDefault();
                nav_tab(k);
                break;

              // RETURN
              case 13:
                nav_open_link();
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

          // Open Link
          function nav_open_link() {
            linkArray[curPos[0]][curPos[1]][curPos[2]].click();
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
              if (linkArray[curPos[0]][curPos[1]][curPos[2] + 1]) {
                linkArray[curPos[0]][curPos[1]][curPos[2] + 1].focus();
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
            $('.tbm .open').removeClass('open');
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
              if ($(this).is('.mega-group')) {
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
            $subMenu
              .children('.dropdown-toggle')
              .attr('aria-expanded', 'false');
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

          $('.tbm-button', this).click(function () {
            if (parseInt($(this).parent().children('.tbm-collapse').height())) {
              $(this)
                .parent()
                .children('.tbm-collapse')
                .css({ height: 0, overflow: 'hidden' });
              Drupal.TBMegaMenu.displayedMenuMobile = false;
            } else {
              $(this)
                .parent()
                .children('.tbm-collapse')
                .css({ height: 'auto', overflow: 'visible' });
              Drupal.TBMegaMenu.displayedMenuMobile = true;
            }
          });

          var isTouch = window.matchMedia('(pointer: coarse)').matches;

          if (!isTouch) {
            var mm_duration = 0;

            $('.tbm', context).each(function () {
              if ($(this).data('duration')) {
                mm_duration = $(this).data('duration');
              }
            });

            var mm_timeout = mm_duration ? 100 + mm_duration : 500;
            $('.tbm-nav > li, li.tbm-item', context).bind(
              'mouseenter',
              function (event) {
                showMenu($(this), mm_timeout);
              },
            );

            $(
              '.tbm-nav > li > .dropdown-toggle, li.tbm-item > .dropdown-toggle',
              context,
            ).bind('focus', function (event) {
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
            });

            $('.tbm-nav > li, li.tbm-item', context).bind(
              'mouseleave',
              function (event) {
                hideMenu($(this), mm_timeout);
              },
            );

            /**
             * Allow tabbing by appending the open class.
             * Works in tandem with CSS changes that utilize opacity rather than
             * display none
             */
            // If the selected anchor is not in the TB Megamenu, remove all "open"
            // class occurrences
            $('a, span').focus(function (event) {
              if (
                !$(this).parent().hasClass('tbm-item') &&
                !$(this).parents('.tbm-block').length
              ) {
                nav_close_megamenu();
              }
            });

            $('.tbm-nav > li > a, li.tbm-item > a').focus(function (event) {
              // Remove all occurrences of "open" from other menu trees
              var siblings = $(this).parents('.tbm-item').siblings();
              // var siblings = $(this).closest('.tbm-item.level-1').siblings();
              $.each(siblings, function (i, v) {
                var cousins = $(v).find('.open');
                $.each(cousins, function (index, value) {
                  $(value).removeClass('open');
                  ariaCheck($(this));
                });
                $(v).removeClass('open');
                ariaCheck();
              });
              // Open the submenu if the selected item has one
              if ($(this).next('.tbm-submenu').length > 0) {
                if (!$(this).parent().hasClass('open')) {
                  $(this).parent().addClass('open');
                }
              }
              // If the anchor's top-level parent is not open, open it
              if (
                !$(this)
                  .closest('.tbm-item.tbm-item--has-dropdown')
                  .hasClass('open') &&
                $(this)
                  .closest('.tbm-item.tbm-item--has-dropdown')
                  .find('.tbm-submenu').length > 0
              ) {
                $(this)
                  .closest('.tbm-item.tbm-item--has-dropdown')
                  .addClass('open');
                ariaCheck();
              }
              // If anchor's parent submenus are not open, open them
              var parents = $(this).parents('.tbm-item.tbm-item--has-flyout');
              $.each(parents, function (i, v) {
                if (!$(v).hasClass('open')) {
                  $(v).addClass('open');
                  ariaCheck();
                }
              });
            });
          }

          // Define actions for touch devices.
          var createTouchMenu = function (items) {
            items.children('a, span').each(function () {
              var $item = $(this);
              var tbitem = $(this).parent();

              $item.click(function (event) {
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

                  // Hide any already open menus.
                  nav_close_megamenu();
                  $('.tbm').find('.tbm-clicked').removeClass('tbm-clicked');

                  // Open the submenu.
                  $item.addClass('tbm-clicked');
                  showMenu(tbitem, mm_timeout);
                }
              });
            });

            // Anytime there's a click outside the menu, close the menu.
            $(document).on('click', function (event) {
              if ($(event.target).closest('.tbm-nav').length === 0) {
                nav_close_megamenu();
                $('.tbm').find('.tbm-clicked').removeClass('tbm-clicked');
              }
            });
          };

          if (isTouch) {
            createTouchMenu(
              $('.tbm ul.tbm-nav li.tbm-item', context).has('.tbm-submenu'),
            );
          }

          $(window).on('load resize', function () {
            var windowWidth = window.innerWidth
              ? window.innerWidth
              : $(window).width();
            if (windowWidth != Drupal.TBMegaMenu.oldWindowWidth) {
              Drupal.TBMegaMenu.oldWindowWidth = windowWidth;
              Drupal.TBMegaMenu.menuResponsive();

              if (windowWidth >= Drupal.TBMegaMenu.supportedScreens[0]) {
                navParent.addEventListener('keydown', keydownEvent);
              } else {
                navParent.removeEventListener('keydown', keydownEvent);
              }
            }
          });
        });
    },
  };
})(jQuery, Drupal, drupalSettings);