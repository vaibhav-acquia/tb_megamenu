export class TBMegaMenu {
  constructor(id) {
    this.id = id;
    this.navParent = document.getElementById(this.id);
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;

    const menuSettings = drupalSettings['TBMegaMenu'][this.id];
    this.hasArrows = menuSettings['arrows'] === '1';

    const mm_duration = this.navParent.getAttribute('data-duration')
      ? parseInt(this.navParent.getAttribute('data-duration'))
      : 0;

    this.mm_timeout = mm_duration ? 100 + mm_duration : 500;
  }

  // We have to define this as a getter because it can change as the browser resizes.
  get isMobile() {
    return this.navParent.classList.contains('tbm--mobile');
  }

  keyDownHandler(k) {
    const _this = this;
    const menuId = this.navParent.attr('id');

    // Determine Key
    switch (k.keyCode) {
      // TAB
      case 9:
        // On mobile, we can follow the natural tab order.
        if (!_this.isMobile) {
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
    }

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
      _this.closeMenu();
    }

    // Enter
    function nav_enter() {
      if (jQuery(document.activeElement).hasClass('no-link')) {
        jQuery(document.activeElement).trigger('click');
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
      return $topLevel.index(document.activeElement) === $topLevel.length - 1;
    }

    function nav_is_first_toplink() {
      var $topLevel = Drupal.TBMegaMenu[menuId]['topLevel'];
      return $topLevel.index(document.activeElement) === 0;
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
        _this.closeMenu();

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
  }

  // Define actions for touch devices.
  handleTouch(items) {
    const _this = this;

    items
      .children('.tbm-link-container')
      .children('.tbm-link')
      .each(function () {
        var $item = jQuery(this);
        var tbitem = jQuery(this).closest('.tbm-item');

        $item.click(function (event) {
          if (!_this.isMobile && _this.isTouch && !_this.hasArrows) {
            // If the menu link has already been clicked once...
            if ($item.hasClass('tbm-clicked')) {
              var $uri = $item.attr('href');

              // If the menu link has a URI, go to the link.
              // <nolink> menu items will not have a URI.
              if ($uri) {
                window.location.href = $uri;
              } else {
                $item.removeClass('tbm-clicked');
                _this.hideMenu(tbitem, _this.mm_timeout);
              }
            } else {
              event.preventDefault();

              // Hide any already open menus which are not parents of the
              // currently clicked menu item.
              var $openParents = $item.parents('.open');
              var $allOpen = jQuery('.tbm .open');

              // Loop through all open items and check to see if they are
              // parents of the clicked item.
              $allOpen.each(function (index, item) {
                if (jQuery(item).is($openParents)) {
                  // do nothing
                } else {
                  jQuery(item).removeClass('open');
                }
              });

              // Apply aria attributes.
              _this.ariaCheck();

              // Remove any existing tmb-clicked classes.
              _this.navParent.find('.tbm-clicked').removeClass('tbm-clicked');

              // Open the submenu and apply the tbm-clicked class.
              $item.addClass('tbm-clicked');
              _this.showMenu(tbitem, _this.mm_timeout);
            }
          }
        });
      });

    // Anytime there's a click outside the menu, close the menu.
    jQuery(document).on('click', function (event) {
      if (jQuery(event.target).closest('.tbm-nav').length === 0) {
        if (_this.navParent.find('.open').length > 0) {
          _this.closeMenu();
        }
      }
    });
  }

  // Close Mega Menu
  closeMenu() {
    this.navParent.find('.open').removeClass('open');
    this.navParent.find('.tbm-clicked').removeClass('tbm-clicked');
    this.ariaCheck();
  }

  ariaCheck() {
    jQuery('li.tbm-item', this.navParent).each(function () {
      if (jQuery(this).is('.tbm-group')) {
        // Mega menu item has mega class (it's a true mega menu)
        if (!jQuery(this).parents().is('.open')) {
          // Mega menu item has mega class and its ancestor is closed, so apply appropriate ARIA attributes
          jQuery(this)
            .find('.tbm-toggle, .tbm-submenu-toggle')
            .attr('aria-expanded', 'false');
        } else if (jQuery(this).parents().is('.open')) {
          // Mega menu item has mega class and its ancestor is open, so apply appropriate ARIA attributes
          jQuery(this)
            .find('.tbm-toggle, .tbm-submenu-toggle')
            .attr('aria-expanded', 'true');
        }
      } else if (
        jQuery(this).is('.tbm-item--has-dropdown') ||
        jQuery(this).is('.tbm-item--has-flyout')
      ) {
        // Mega menu item has dropdown (it's a flyout menu)
        if (!jQuery(this).is('.open')) {
          // Mega menu item has dropdown class and is closed, so apply appropriate ARIA attributes
          jQuery(this)
            .find('.tbm-toggle, .tbm-submenu-toggle')
            .attr('aria-expanded', 'false');
        } else if (jQuery(this).is('.open')) {
          // Mega menu item has dropdown class and is open, so apply appropriate ARIA attributes
          jQuery(this)
            .find('.tbm-toggle, .tbm-submenu-toggle')
            .attr('aria-expanded', 'true');
        }
      } else {
        // Mega menu item is neither a mega or dropdown class, so remove ARIA attributes (it doesn't have children)
        jQuery(this)
          .find('.tbm-toggle, .tbm-submenu-toggle')
          .removeAttr('aria-expanded');
      }
    });
  }

  showMenu(listItem, mm_timeout) {
    const _this = this;

    if (listItem.classList.contains('level-1')) {
      listItem.classList.add('animating');
      clearTimeout(listItem.animatingTimeout);
      listItem.animatingTimeout = setTimeout(function () {
        listItem.classList.remove('animating');
      }, mm_timeout);
      clearTimeout(listItem.hoverTimeout);
      listItem.hoverTimeout = setTimeout(function () {
        listItem.classList.add('open');
        _this.ariaCheck();
      }, 100);
    } else {
      clearTimeout(listItem.hoverTimeout);
      listItem.hoverTimeout = setTimeout(function () {
        listItem.classList.add('open');
        _this.ariaCheck();
      }, 100);
    }
  }

  hideMenu($subMenu, mm_timeout) {
    const _this = this;

    $subMenu
      .find('.tbm-toggle, .tbm-submenu-toggle')
      .attr('aria-expanded', 'false');
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
          $subMenu.removeClass('open');
          _this.ariaCheck();
        }, 100),
      );
    } else {
      clearTimeout($subMenu.data('hoverTimeout'));
      $subMenu.data(
        'hoverTimeout',
        setTimeout(function () {
          $subMenu.removeClass('open');
          _this.ariaCheck();
        }, 100),
      );
    }
  }

  init() {
    const _this = this;

    // Open and close the menu when the hamburger is clicked.
    document.querySelectorAll('.tbm-button').forEach((element) => {
      element.addEventListener('click', (event) => {
        // If the menu is currently open, collapse all open dropdowns before
        // hiding the menu.
        if (_this.navParent.classList.contains('tbm--mobile-show')) {
          _this.closeMenu();
          event.currentTarget.setAttribute('aria-expanded', 'false');
        } else {
          event.currentTarget.setAttribute('aria-expanded', 'true');
        }

        // Toggle the menu visibility.
        _this.navParent.classList.toggle('tbm--mobile-show');
      });
    });

    if (!this.isTouch) {
      // Show dropdowns and flyouts on hover.
      this.navParent.querySelectorAll('.tbm-item').forEach((element) => {
        element.addEventListener('mouseenter', (event) => {
          if (!_this.isMobile && !_this.hasArrows) {
            _this.showMenu(element, _this.mm_timeout);
          }
        });
      });

      // Show dropdwons and flyouts on focus.
      jQuery('.tbm-toggle', this.navParent).on('focus', function (event) {
        if (!_this.isMobile && !_this.hasArrows) {
          var $this = jQuery(this);
          var $subMenu = $this.closest('li');
          _this.showMenu($subMenu, _this.mm_timeout);
          // If the focus moves outside of the subMenu, close it.
          jQuery(document).on('focusin', function (event) {
            if ($subMenu.has(event.target).length) {
              return;
            }
            jQuery(document).unbind(event);
            _this.hideMenu($subMenu, _this.mm_timeout);
          });
        }
      });

      jQuery('.tbm-item', this.navParent).on('mouseleave', function (event) {
        if (!_this.isMobile && !_this.hasArrows) {
          _this.hideMenu(jQuery(this), _this.mm_timeout);
        }
      });
    }

    // Add touch functionality.
    this.handleTouch(jQuery('.tbm-item', this.navParent).has('.tbm-submenu'));

    // Toggle submenus.
    jQuery('.tbm-submenu-toggle, .tbm-link.no-link', this.navParent).on(
      'click',
      function () {
        if (_this.isMobile) {
          var $parentItem = jQuery(this).closest('.tbm-item');

          if ($parentItem.hasClass('open')) {
            _this.hideMenu($parentItem, _this.mm_timeout);
          } else {
            _this.showMenu($parentItem, _this.mm_timeout);
          }
        }

        // Do not add a click listener if we are on a touch device with no
        // arrows and the element is a no-link element. In that case, we
        // want to use touch menu handler.
        if (
          !_this.isMobile &&
          !(
            _this.isTouch &&
            !_this.hasArrows &&
            jQuery(this).hasClass('no-link')
          )
        ) {
          var $parentItem = jQuery(this).closest('.tbm-item');

          if ($parentItem.hasClass('open')) {
            _this.hideMenu($parentItem, _this.mm_timeout);

            // Hide any children.
            $parentItem.find('.open').each(function (index, item) {
              var $this = jQuery(this);

              _this.hideMenu($this, _this.mm_timeout);
            });
          } else {
            _this.showMenu($parentItem, _this.mm_timeout);

            // Find any siblings and close them.
            $parentItem.siblings().each(function (index, item) {
              var $this = jQuery(this);

              _this.hideMenu($this, _this.mm_timeout);

              // Hide any children.
              $this.find('.open').each(function (index, item) {
                var $this = jQuery(this);

                _this.hideMenu($this, _this.mm_timeout);
              });
            });
          }
        }
      },
    );

    // Add keyboard listeners.
    this.navParent.on('keydown', this.keyDownHandler.bind(this));
  }
}
