<?php

/**
 * @file Contains The settings of TB Mega Menu form.
 */
namespace Drupal\tb_megamenu\Form;

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
    $tb_megamenu_builder = new TBMegaMenuBuilder();
    $menus = $tb_megamenu_builder->getMegaMenus();
    foreach ($menus as $menu) {
      $form[$menu->menu_name]['#tb_megamenu'] = $menu;
      $form[$menu->menu_name]['menu_name'] = array('#markup' => $menu->menu_name);
      $form[$menu->menu_name]['title'] = array('#markup' => $menu->title);
      $form[$menu->menu_name]['config_megamenu'] = array('#type' => 'link', '#title' => t('Config'), '#href' => "admin/structure/tb-megamenu/$menu->menu_name");
      $form[$menu->menu_name]['config_links'] = array('#type' => 'link', '#title' => t('Edit links'), '#href' => "admin/structure/menu/manage/$menu->menu_name");
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
