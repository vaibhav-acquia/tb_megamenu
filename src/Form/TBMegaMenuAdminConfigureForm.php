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
  public function buildForm(array $form, FormStateInterface $form_state, $menu_names = '') {
    // Add library font-awesome.
    $form['#attached']['library'][] = 'tb_megamenu/form.font-awesome';
    // Add library chosen.
    $form['#attached']['library'][] = 'tb_megamenu/form.chosen';
    
    // Preparing variable in JS for form.configure-inline.
//    $clean_url = \Drupal::config('clean_url');
    $form['#attached']['drupalSettings']['tb_megamenu']['clean_url'] = 'testing';
    $form['#attached']['library'][] = 'tb_megamenu/form.configure-inline';
    
    // Add a custom library.
    $form['#attached']['library'][] = 'tb_megamenu/form.configure-megamenu';
    
//    if (!empty($menu_names)) {
//      $form['tb_megamenu'] = array(
//        '#markup' => theme('tb_megamenu_backend', array(
//          'menu_name' => $menu_names[0],
//        )),
//      );
//    }
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
