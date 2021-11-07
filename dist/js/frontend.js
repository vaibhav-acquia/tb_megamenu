/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/frontend.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/frontend.js":
/*!************************!*\
  !*** ./js/frontend.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * @file
 * Defines Javascript behaviors for MegaMenu frontend.
 */
(function ($, Drupal, drupalSettings) {
  'use strict';

  Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};
  Drupal.TBMegaMenu.focusableElements = 'a:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), details:not([disabled]):not([tabindex="-1"]), [tabindex]:not([disabled]):not([tabindex="-1"])';

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

  Drupal.TBMegaMenu.getNextPrevElement = function (direction, excludeSubnav = false) {
    // Add all the elements we want to include in our selection
    var $current = $(document.activeElement);
    var nextElement = null;

    if ($current.length) {
      var $focusable = $(Drupal.TBMegaMenu.focusableElements).filter(function () {
        var $this = $(this);

        if (excludeSubnav) {
          return $this.closest('.tbm-subnav').length === 0 && $this.is(':visible');
        }

        return $this.is(':visible');
      });
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
      $('.tbm', context).once('tbm').each(function () {
        /* Keyboard Control Setup */
        // Semi-Global Variables
        var navParent = $(this);
        var isTouch = window.matchMedia('(pointer: coarse)').matches;

        function isMobile() {
          return navParent.hasClass('tbm--mobile');
        } // Key Pressed


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

            default: // Do nothing

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
        } // Escape


        function nav_esc() {
          nav_close_megamenu();
        } // Left


        function nav_left(k) {
          if (nav_is_toplink()) {
            nav_prev_toplink();
          } else {
            // TODO/NICE TO HAVE - Go to previous column
            nav_up(k);
          }
        } // Right


        function nav_right(k) {
          if (nav_is_toplink()) {
            nav_next_toplink();
          } else {
            // TODO/NICE TO HAVE - Go to previous column
            nav_down(k);
          }
        } // Up


        function nav_up(k) {
          if (nav_is_toplink()) {// Do nothing.
          } else {
            nav_tab(k);
          }
        } // Down


        function nav_down(k) {
          if (nav_is_toplink()) {
            Drupal.TBMegaMenu.getNextPrevElement('next').focus(); // nav_next_column();
          } else if ( // If the next element takes the user out of this top level, then do nothing.
          Drupal.TBMegaMenu.getNextPrevElement('next').closest('.tbm-item.level-1') !== document.activeElement.closest('.tbm-item.level-1')) {// Do nothing.
          } else {
            nav_tab(k);
          }
        }
        /* Helper Functions */
        // Determine Link Level


        function nav_is_toplink() {
          return document.activeElement.classList.contains('link-level-1');
        }

        function nav_is_last_toplink() {
          return document.activeElement === document.querySelector('.tbm-item.level-1:last-child ').querySelector('.link-level-1');
        }

        function nav_is_first_toplink() {
          return document.activeElement === document.querySelector('.tbm-item.level-1:first-child ').querySelector('.link-level-1');
        } // Close Mega Menu


        function nav_close_megamenu() {
          navParent.find('.open').removeClass('open');
          navParent.find('.tbm-clicked').removeClass('tbm-clicked');
          ariaCheck();
        } // Next Toplink


        function nav_next_toplink() {
          if (!nav_is_last_toplink()) {
            document.activeElement.closest('.tbm-item').nextElementSibling.querySelector('.tbm-link, .tbm-no-link').focus();
          } else {
            nav_close_megamenu(); // Focus on the next element.

            Drupal.TBMegaMenu.getNextPrevElement('next', true).focus();
            console.log(document.activeElement);
          }
        } // Previous Toplink


        function nav_prev_toplink() {
          if (!nav_is_first_toplink()) {
            document.activeElement.closest('.tbm-item').previousElementSibling.querySelector('.tbm-link, .tbm-no-link').focus();
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
                $(this).find('.tbm-toggle, .tbm-submenu-toggle').attr('aria-expanded', 'false');
              } else if ($(this).parents().is('.open')) {
                // Mega menu item has mega class and its ancestor is open, so apply appropriate ARIA attributes
                $(this).find('.tbm-toggle, .tbm-submenu-toggle').attr('aria-expanded', 'true');
              }
            } else if ($(this).is('.tbm-item--has-dropdown') || $(this).is('.tbm-item--has-flyout')) {
              // Mega menu item has dropdown (it's a flyout menu)
              if (!$(this).is('.open')) {
                // Mega menu item has dropdown class and is closed, so apply appropriate ARIA attributes
                $(this).find('.tbm-toggle, .tbm-submenu-toggle').attr('aria-expanded', 'false');
              } else if ($(this).is('.open')) {
                // Mega menu item has dropdown class and is open, so apply appropriate ARIA attributes
                $(this).find('.tbm-toggle, .tbm-submenu-toggle').attr('aria-expanded', 'true');
              }
            } else {
              // Mega menu item is neither a mega or dropdown class, so remove ARIA attributes (it doesn't have children)
              $(this).find('.tbm-toggle, .tbm-submenu-toggle').removeAttr('aria-expanded');
            }
          });
        };

        var showMenu = function ($subMenu, mm_timeout) {
          if ($subMenu.hasClass('level-1')) {
            $subMenu.addClass('animating');
            clearTimeout($subMenu.data('animatingTimeout'));
            $subMenu.data('animatingTimeout', setTimeout(function () {
              $subMenu.removeClass('animating');
            }, mm_timeout));
            clearTimeout($subMenu.data('hoverTimeout'));
            $subMenu.data('hoverTimeout', setTimeout(function () {
              $subMenu.addClass('open');
              ariaCheck();
            }, 100));
          } else {
            clearTimeout($subMenu.data('hoverTimeout'));
            $subMenu.data('hoverTimeout', setTimeout(function () {
              $subMenu.addClass('open');
              ariaCheck();
            }, 100));
          }
        };

        var hideMenu = function ($subMenu, mm_timeout) {
          $subMenu.find('.tbm-toggle, .tbm-submenu-toggle').attr('aria-expanded', 'false');

          if ($subMenu.hasClass('mega')) {
            $subMenu.addClass('animating');
            clearTimeout($subMenu.data('animatingTimeout'));
            $subMenu.data('animatingTimeout', setTimeout(function () {
              $subMenu.removeClass('animating');
            }, mm_timeout));
            clearTimeout($subMenu.data('hoverTimeout'));
            $subMenu.data('hoverTimeout', setTimeout(function () {
              $subMenu.removeClass('open');
              ariaCheck();
            }, 100));
          } else {
            clearTimeout($subMenu.data('hoverTimeout'));
            $subMenu.data('hoverTimeout', setTimeout(function () {
              $subMenu.removeClass('open');
              ariaCheck();
            }, 100));
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
          } // Toggle the menu visibility.


          $(this).parent().toggleClass('tbm--mobile-show');
        });

        if (!isTouch) {
          var mm_duration = navParent.data('duration') ? navParent.data('duration') : 0;
          var mm_timeout = mm_duration ? 100 + mm_duration : 500; // Show dropdowns and flyouts on hover.

          $('.tbm-nav > li, li.tbm-item', context).bind('mouseenter', function (event) {
            if (!isMobile()) {
              showMenu($(this), mm_timeout);
            }
          }); // Show dropdwons and flyouts on focus.

          $('.tbm-toggle', context).bind('focus', function (event) {
            if (!isMobile()) {
              var $this = $(this);
              var $subMenu = $this.closest('li');
              showMenu($subMenu, mm_timeout); // If the focus moves outside of the subMenu, close it.

              $(document).bind('focusin', function (event) {
                if ($subMenu.has(event.target).length) {
                  return;
                }

                $(document).unbind(event);
                hideMenu($subMenu, mm_timeout);
              });
            }
          });
          $('.tbm-nav > li, li.tbm-item', context).bind('mouseleave', function (event) {
            if (!isMobile()) {
              hideMenu($(this), mm_timeout);
            }
          });
        } // Define actions for touch devices.


        var createTouchMenu = function (items) {
          items.children('.tbm-link-container').children('.tbm-link, .tbm-no-link').each(function () {
            var $item = $(this);
            var tbitem = $(this).closest('.tbm-item');
            $item.click(function (event) {
              if (!isMobile() && isTouch) {
                // If the menu link has already been clicked once...
                if ($item.hasClass('tbm-clicked')) {
                  var $uri = $item.attr('href'); // If the menu link has a URI, go to the link.
                  // <nolink> menu items will not have a URI.

                  if ($uri) {
                    window.location.href = $uri;
                  } else {
                    $item.removeClass('tbm-clicked');
                    hideMenu(tbitem, mm_timeout);
                  }
                } else {
                  event.preventDefault(); // Hide any already open menus which are not parents of the
                  // currently clicked menu item.

                  var $openParents = $item.parents('.open');
                  var $allOpen = $('.tbm .open'); // Loop through all open items and check to see if they are
                  // parents of the clicked item.

                  $allOpen.each(function (index, item) {
                    if ($(item).is($openParents)) {// do nothing
                    } else {
                      $(item).removeClass('open');
                    }
                  }); // Apply aria attributes.

                  ariaCheck(); // Remove any existing tmb-clicked classes.

                  $('.tbm').find('.tbm-clicked').removeClass('tbm-clicked'); // Open the submenu and apply the tbm-clicked class.

                  $item.addClass('tbm-clicked');
                  showMenu(tbitem, mm_timeout);
                }
              }
            });
          }); // Anytime there's a click outside the menu, close the menu.

          $(document).on('click', function (event) {
            if ($(event.target).closest('.tbm-nav').length === 0) {
              if (navParent.find('.open').length > 0) {
                nav_close_megamenu();
              }
            }
          });
        }; // Add touch functionality.


        createTouchMenu($('.tbm ul.tbm-nav li.tbm-item', context).has('.tbm-submenu')); // Toggle submenus on mobile.

        $('.tbm-submenu-toggle, .tbm-no-link').on('click', function () {
          if (isMobile()) {
            var $parentItem = $(this).closest('.tbm-item');

            if ($parentItem.hasClass('open')) {
              hideMenu($parentItem, mm_timeout);
            } else {
              showMenu($parentItem, mm_timeout);
            }
          }
        }); // Add keyboard listeners.

        navParent.on('keydown', keydownEvent);
        $(window).on('load resize', function () {
          Drupal.TBMegaMenu.menuResponsive();
        });
      });
    }
  };
})(jQuery, Drupal, drupalSettings);

/***/ })

/******/ });
//# sourceMappingURL=frontend.js.map