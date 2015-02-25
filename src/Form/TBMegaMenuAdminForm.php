<?php

/**
 * @file Contains The settings of TB Mega Menu form.
 */

namespace Drupal\tb_megamenu\Form;

use Drupal\Core\Url;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\tb_megamenu\TBMegaMenuBuilder;

/**
 * Create a settings form for TB Mega Menu.
 */
class TBMegaMenuAdminForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormID() {
    return 'tb_megamenu_admin_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
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
