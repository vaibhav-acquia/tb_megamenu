<?php

/**
 * @file Contains The settings form of item in Mega Menus.
 */

namespace Drupal\tb_megamenu\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Create a settings form for TB Mega Menu.
 */
class TBMegaMenuAdminConfigureForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormID() {
    return 'tb_megamenu_configure_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $menu_name = '') {
//    $lib_fontawesome = tb_megamenu_check_library('fontawesome', 'fontawesome');
//    if (module_exists('fontawesome') && $lib_fontawesome) {
//      tb_megamenu_add_css($lib_fontawesome['css']);
//    }
//
//    $lib_chosen = tb_megamenu_check_library('chosen', 'chosen');
//    $lib_chosen_existed = module_exists('chosen') && $lib_chosen;
//    if ($lib_chosen_existed && !empty($lib_chosen['css'])) {
//      tb_megamenu_add_css($lib_chosen['css']);
//    }
//    if ($lib_chosen_existed && !empty($lib_chosen['js'])) {
//      drupal_add_js($lib_chosen['js']);
//    }
//
//    drupal_add_js('
//    (function ($) {
//      Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};
//      Drupal.TBMegaMenu.ajax_link = "' . (variable_get('clean_url', 0) ? '' : '?q=') . '";
//    })(jQuery);
//  ', 'inline');
//
//    drupal_add_js(drupal_get_path('module', 'tb_megamenu') . '/js/tb-megamenu-backend.js');
//    drupal_add_js(drupal_get_path('module', 'tb_megamenu') . '/js/tb-megamenu-object.js');
//    if (!empty($menu_names)) {
//      $form['tb_megamenu'] = array(
//        '#markup' => theme('tb_megamenu_backend', array(
//          'menu_name' => $menu_names[0],
//        )),
//      );
//    }
//    $form['#attached']['css'][drupal_get_path('module', 'tb_megamenu') . '/css/tb_megamenu_admin.css'] = array();
//    $form['#attached']['css'][drupal_get_path('module', 'tb_megamenu') . '/css/tb_megamenu_backend.css'] = array();
//    $form['#attached']['css'][drupal_get_path('module', 'tb_megamenu') . '/css/tb_megamenu_base.css'] = array();
//    $form['#attached']['css'][drupal_get_path('module', 'tb_megamenu') . '/css/tb_megamenu_bootstrap.css'] = array();
    
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    
  }

}
