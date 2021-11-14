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
  var focusableSelector = 'a:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), details:not([disabled]):not([tabindex="-1"]), [tabindex]:not([disabled]):not([tabindex="-1"])';

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
      } // Build the list of tabbable elements as these may change between mobile
      // and desktop.


      var $focusable = $thisMenu.find(focusableSelector);
      $focusable = $focusable.filter(function (index, item) {
        return $(item).is(':visible');
      });
      var $topLevel = $focusable.filter((index, item) => {
        return $(item).is('.tbm-link.level-1, .tbm-link.level-1 + .tbm-submenu-toggle');
      });
      Drupal.TBMegaMenu[menuId]['focusable'] = $focusable;
      Drupal.TBMegaMenu[menuId]['topLevel'] = $topLevel;
    });
  }

  var throttled = _.throttle(responsiveMenu, 100);

  $(window).on('load resize', throttled);

  Drupal.TBMegaMenu.getNextPrevElement = function (direction, excludeSubnav = false) {
    // Add all the elements we want to include in our selection
    var $current = $(document.activeElement);
    var nextElement = null;

    if ($current.length) {
      var $focusable = $(focusableSelector).filter(function () {
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
        var TBMega = new TBMegaMenu($(this).attr('id'));
        TBMega.init();
      });
    }
  };
})(jQuery, Drupal, drupalSettings);

/***/ })

/******/ });
//# sourceMappingURL=frontend.js.map