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
class TBMegaMenuAdminItemForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormID() {
    return 'tb_megamenu_admin_item_settings';
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
