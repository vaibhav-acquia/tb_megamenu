(function ($, Drupal, drupalSettings) {
  
  "use strict";
  
  Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};
  Drupal.TBMegaMenu.ajax_link = "' . " + drupalSettings.tb_megamenu.clean_url + ". '";
  
})(jQuery, Drupal, drupalSettings);