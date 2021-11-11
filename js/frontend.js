/**
 * @file
 * Defines Javascript behaviors for MegaMenu frontend.
 */

(function ($, Drupal, drupalSettings) {
  'use strict';

  Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};

  Drupal.TBMegaMenu.focusableElements =
    'a:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), details:not([disabled]):not([tabindex="-1"]), [tabindex]:not([disabled]):not([tabindex="-1"])';

  Drupal.TBMegaMenu.$focusable = $(Drupal.TBMegaMenu.focusableElements);

  Drupal.TBMegaMenu.menuResponsive = function () {
    $('.tbm').each(function () {
      var $thisMenu = $(this);
      var menuId = $thisMenu.attr('id');
      Drupal.TBMegaMenu[menuId] = {};
      var breakpoint = parseInt($thisMenu.data('breakpoint'));

      if (window.matchMedia(`(max-width: ${breakpoint}px)`).matches) {
        $thisMenu.addClass('tbm--mobile');
      } else {
        $thisMenu.removeClass('tbm--mobile');
      }

      // Build the list of tabbable elements as these may change between mobile
      // and desktop.
      var $focusable = $thisMenu.find(Drupal.TBMegaMenu.focusableElements);
      $focusable = $focusable.filter(function (index, item) {
        return $(item).is(':visible');
      });

      var $topLevel = $focusable.filter((index, item) => {
        return $(item).is(
          '.tbm-link.level-1, .tbm-link.level-1 + .tbm-submenu-toggle',
        );
      });

      Drupal.TBMegaMenu[menuId]['focusable'] = $focusable;
      Drupal.TBMegaMenu[menuId]['topLevel'] = $topLevel;
    });
  };

  $(window).on('load resize', function () {
    Drupal.TBMegaMenu.menuResponsive();
  });

  Drupal.TBMegaMenu.getNextPrevElement = function (
    direction,
    excludeSubnav = false,
  ) {
    // Add all the elements we want to include in our selection
    var $current = $(document.activeElement);
    var nextElement = null;

    if ($current.length) {
      var $focusable = $(Drupal.TBMegaMenu.focusableElements).filter(
        function () {
          var $this = $(this);
          if (excludeSubnav) {
            return (
              $this.closest('.tbm-subnav').length === 0 && $this.is(':visible')
            );
          }

          return $this.is(':visible');
        },
      );

      var index = $focusable.index($current);
      if (index > -1) {
        if (direction === 'next') {
          nextElement = $focusable[index + 1] || $focusable[0];
        } else {
          nextElement = $focusable[index - 1] || $focusable[0];
        }
      }
    }

    return nextElement;
  };

  Drupal.behaviors.tbMegaMenuAction = {
    attach: function (context, settings) {
      $('.tbm', context)
        .once('tbm')
        .each(function () {
          /* Keyboard Control Setup */
          // Semi-Global Variables
          var navParent = $(this);
          var menuId = navParent.attr('id');
          var menuSettings = drupalSettings['TBMegaMenu'][menuId];
          var isTouch = window.matchMedia('(pointer: coarse)').matches;
          var hasArrows = menuSettings['arrows'] === '1';

          // We have to define this as a function because it can change as the browser resizes.
          function isMobile() {
            return navParent.hasClass('tbm--mobile');
          }

          // Key Pressed
          function keydownEvent(k) {
            // Determine Key
            switch (k.keyCode) {
              // TAB
              case 9:
                // On mobile, we can follow the natural tab order.
                if (!isMobile()) {
                  nav_tab(k);
                }
                break;

              // ENTER
              case 13:
                nav_enter();
                break;

              // ESC
              case 27:
                nav_esc();
                break;

              // LEFT
              case 37:
                k.preventDefault();
                nav_left(k);
                break;

              // UP
              case 38:
                k.preventDefault();
                nav_up(k);
                break;

              // RIGHT
              case 39:
                k.preventDefault();
                nav_right(k);
                break;

              // DOWN
              case 40:
                k.preventDefault();
                nav_down(k);
                break;

              // Else
              default:
              // Do nothing
            } // determine key
          } // keydownEvent

          /* Keypress Functions */
          // Tab
          function nav_tab(k) {
            k.preventDefault();

            if (nav_is_toplink()) {
              if (k.shiftKey || k.keyCode === 38 || k.keyCode === 37) {
                nav_prev_toplink();
              } else {
                nav_next_toplink();
              }
            } else {
              if (k.shiftKey || k.keyCode === 38 || k.keyCode === 37) {
                Drupal.TBMegaMenu.getNextPrevElement('prev').focus();
              } else {
                Drupal.TBMegaMenu.getNextPrevElement('next').focus();
              }
            }
          }

          // Escape
          function nav_esc() {
            nav_close_megamenu();
          }

          // Enter
          function nav_enter() {
            if ($(document.activeElement).hasClass('no-link')) {
              $(document.activeElement).trigger('click');
            }
          }

          // Left
          function nav_left(k) {
            if (nav_is_toplink()) {
              nav_prev_toplink();
            } else {
              // TODO/NICE TO HAVE - Go to previous column
              nav_up(k);
            }
          }

          // Right
          function nav_right(k) {
            if (nav_is_toplink()) {
              nav_next_toplink();
            } else {
              // TODO/NICE TO HAVE - Go to previous column
              nav_down(k);
            }
          }

          // Up
          function nav_up(k) {
            if (nav_is_toplink()) {
              // Do nothing.
            } else {
              nav_tab(k);
            }
          }

          // Down
          function nav_down(k) {
            if (nav_is_toplink()) {
              Drupal.TBMegaMenu.getNextPrevElement('next').focus();
              // nav_next_column();
            } else if (
              // If the next element takes the user out of this top level, then do nothing.
              Drupal.TBMegaMenu.getNextPrevElement('next').closest(
                '.tbm-item.level-1',
              ) !== document.activeElement.closest('.tbm-item.level-1')
            ) {
              // Do nothing.
            } else {
              nav_tab(k);
            }
          }

          /* Helper Functions */
          // Determine Link Level
          function nav_is_toplink() {
            var $topLevel = Drupal.TBMegaMenu[menuId]['topLevel'];
            return $topLevel.index(document.activeElement) > -1;
          }

          function nav_is_last_toplink() {
            var $topLevel = Drupal.TBMegaMenu[menuId]['topLevel'];
            return (
              $topLevel.index(document.activeElement) === $topLevel.length - 1
            );
          }

          function nav_is_first_toplink() {
            var $topLevel = Drupal.TBMegaMenu[menuId]['topLevel'];
            return $topLevel.index(document.activeElement) === 0;
          }

          // Close Mega Menu
          function nav_close_megamenu() {
            navParent.find('.open').removeClass('open');
            navParent.find('.tbm-clicked').removeClass('tbm-clicked');
            ariaCheck();
          }

          // Next Toplink
          function nav_next_toplink() {
            if (!nav_is_last_toplink()) {
              var $topLevel = Drupal.TBMegaMenu[menuId]['topLevel'];
              var index = $topLevel.index(document.activeElement);

              if (index > -1) {
                $topLevel[index + 1].focus();
              }
            } else {
              nav_close_megamenu();

              // Focus on the next element.
              Drupal.TBMegaMenu.getNextPrevElement('next', true).focus();
            }
          }

          // Previous Toplink
          function nav_prev_toplink() {
            if (!nav_is_first_toplink()) {
              var $topLevel = Drupal.TBMegaMenu[menuId]['topLevel'];
              var index = $topLevel.index(document.activeElement);

              if (index > -1) {
                $topLevel[index - 1].focus();
              }
            } else {
              // Focus on the previous element.
              Drupal.TBMegaMenu.getNextPrevElement('prev', true).focus();
            }
          }

          var ariaCheck = function () {
            $('li.tbm-item', this).each(function () {
              if ($(this).is('.tbm-group')) {
                // Mega menu item has mega class (it's a true mega menu)
                if (!$(this).parents().is('.open')) {
                  // Mega menu item has mega class and its ancestor is closed, so apply appropriate ARIA attributes
                  $(this)
                    .find('.tbm-toggle, .tbm-submenu-toggle')
                    .attr('aria-expanded', 'false');
                } else if ($(this).parents().is('.open')) {
                  // Mega menu item has mega class and its ancestor is open, so apply appropriate ARIA attributes
                  $(this)
                    .find('.tbm-toggle, .tbm-submenu-toggle')
                    .attr('aria-expanded', 'true');
                }
              } else if (
                $(this).is('.tbm-item--has-dropdown') ||
                $(this).is('.tbm-item--has-flyout')
              ) {
                // Mega menu item has dropdown (it's a flyout menu)
                if (!$(this).is('.open')) {
                  // Mega menu item has dropdown class and is closed, so apply appropriate ARIA attributes
                  $(this)
                    .find('.tbm-toggle, .tbm-submenu-toggle')
                    .attr('aria-expanded', 'false');
                } else if ($(this).is('.open')) {
                  // Mega menu item has dropdown class and is open, so apply appropriate ARIA attributes
                  $(this)
                    .find('.tbm-toggle, .tbm-submenu-toggle')
                    .attr('aria-expanded', 'true');
                }
              } else {
                // Mega menu item is neither a mega or dropdown class, so remove ARIA attributes (it doesn't have children)
                $(this)
                  .find('.tbm-toggle, .tbm-submenu-toggle')
                  .removeAttr('aria-expanded');
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
            $subMenu
              .find('.tbm-toggle, .tbm-submenu-toggle')
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
            // If the menu is currently open, collapse all open dropdowns before
            // hiding the menu.
            if (navParent.hasClass('tbm--mobile-show')) {
              nav_close_megamenu();
              $(this).attr('aria-expanded', 'false');
            } else {
              $(this).attr('aria-expanded', 'true');
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
            $('.tbm-item', this).on('mouseenter', function (event) {
              if (!isMobile() && !hasArrows) {
                showMenu($(this), mm_timeout);
              }
            });

            // Show dropdwons and flyouts on focus.
            $('.tbm-toggle', this).on('focus', function (event) {
              if (!isMobile() && !hasArrows) {
                var $this = $(this);
                var $subMenu = $this.closest('li');
                showMenu($subMenu, mm_timeout);
                // If the focus moves outside of the subMenu, close it.
                $(document).on('focusin', function (event) {
                  if ($subMenu.has(event.target).length) {
                    return;
                  }
                  $(document).unbind(event);
                  hideMenu($subMenu, mm_timeout);
                });
              }
            });

            $('.tbm-item', this).on('mouseleave', function (event) {
              if (!isMobile() && !hasArrows) {
                hideMenu($(this), mm_timeout);
              }
            });
          }

          // Define actions for touch devices.
          var createTouchMenu = function (items) {
            items
              .children('.tbm-link-container')
              .children('.tbm-link')
              .each(function () {
                var $item = $(this);
                var tbitem = $(this).closest('.tbm-item');

                $item.click(function (event) {
                  if (!isMobile() && isTouch && !hasArrows) {
                    console.log('clicked touch');
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
                      navParent.find('.tbm-clicked').removeClass('tbm-clicked');

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
          createTouchMenu($('.tbm-item', this).has('.tbm-submenu'));

          // Toggle submenus.
          $('.tbm-submenu-toggle, .tbm-link.no-link', this).on(
            'click',
            function () {
              if (isMobile()) {
                var $parentItem = $(this).closest('.tbm-item');

                if ($parentItem.hasClass('open')) {
                  hideMenu($parentItem, mm_timeout);
                } else {
                  showMenu($parentItem, mm_timeout);
                }
              }

              if (
                !isMobile() &&
                !(isTouch && !hasArrows && $(this).hasClass('no-link'))
              ) {
                console.log('doing toggle');
                var $parentItem = $(this).closest('.tbm-item');

                if ($parentItem.hasClass('open')) {
                  hideMenu($parentItem, mm_timeout);

                  // Hide any children.
                  $parentItem.find('.open').each(function (index, item) {
                    var $this = $(this);

                    hideMenu($this, mm_timeout);
                  });
                } else {
                  showMenu($parentItem, mm_timeout);

                  // Find any siblings and close them.
                  $parentItem.siblings().each(function (index, item) {
                    var $this = $(this);

                    hideMenu($this, mm_timeout);

                    // Hide any children.
                    $this.find('.open').each(function (index, item) {
                      var $this = $(this);

                      hideMenu($this, mm_timeout);
                    });
                  });
                }
              }
            },
          );

          // Add keyboard listeners.
          navParent.on('keydown', keydownEvent);
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
