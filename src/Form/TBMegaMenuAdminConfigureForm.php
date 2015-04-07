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
    // Add library font-awesome.
    $form['#attached']['library'][] = 'tb_megamenu/form.font-awesome';
    // Add library chosen.
    $form['#attached']['library'][] = 'tb_megamenu/form.chosen';
    // Add a custom library.
    $form['#attached']['library'][] = 'tb_megamenu/form.configure-megamenu';
    
    $abs_url_config = \Drupal::url('tb_megamenu.admin.save', array(), array('absolute' => TRUE));
    $form['#attached']['drupalSettings']['TBMegaMenu']['saveConfigURL'] = $abs_url_config;
    if (!empty($menu_name)) {
      $form['tb_megamenu'] = array(
        '#theme' => 'tb_megamenu_backend',
        '#menu_name' => $menu_name,
      );
    }
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
