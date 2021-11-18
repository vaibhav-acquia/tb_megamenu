import { TBMegaMenu } from './plugin.js';

/**
 * @file
 * Defines Javascript behaviors for MegaMenu frontend.
 */

(function ($, Drupal, drupalSettings) {
  'use strict';

  Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};

  var focusableSelector =
    'a:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), details:not([disabled]):not([tabindex="-1"]), [tabindex]:not([disabled]):not([tabindex="-1"])';

  function responsiveMenu() {
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
      var $focusable = $thisMenu.find(focusableSelector);
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
  }

  var throttled = _.throttle(responsiveMenu, 100);

  $(window).on('load resize', throttled);

  Drupal.TBMegaMenu.getNextPrevElement = function (
    direction,
    excludeSubnav = false,
  ) {
    // Add all the elements we want to include in our selection
    var $current = $(document.activeElement);
    var nextElement = null;

    if ($current.length) {
      var $focusable = $(focusableSelector).filter(function () {
        var $this = $(this);
        if (excludeSubnav) {
          return (
            $this.closest('.tbm-subnav').length === 0 && $this.is(':visible')
          );
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
      $('.tbm', context)
        .once('tbm')
        .each(function () {
          var TBMega = new TBMegaMenu($(this).attr('id'));

          TBMega.init();
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
