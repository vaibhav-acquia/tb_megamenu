<?php

/**
 * @file
 * Contains \Drupal\tb_megamenu\Controller\TBMegaMenuAdminController.
 */

namespace Drupal\tb_megamenu\Controller;

use Drupal\Core\Url;
use Drupal\Core\Controller\ControllerBase;

class TBMegaMenuAdminController extends ControllerBase {
  
  /**
   * This is page callback. Listing mega menus.
   */
  public function listMegaMenus() {
    /**
     * Get menus.
     */
    $menus = menu_ui_get_menus();
    
    /**
     *  Prepare data for each row.
     */
    $rows = array();
    foreach ($menus as $name => $title) {
      $row = array(
        'menu-name' => $name,
        'menu-title' => $title
      );
      $dropbuttons = array(
        '#type' => 'operations',
        '#links' => array(
          'config' => array(
            'url' => new Url('tb_megamenu.admin.configure', array('menu_name' => $name)),
            'title' => 'Config'
          ),
          'edit' => array(
            'url' => new Url('entity.menu.edit_form', array('menu' => $name)),
            'title' => 'Edit links'
          ),
        )
      );
      $row['menu-operations'] = array('data' => $dropbuttons);
      $rows[] = $row;
    }

    /**
     *  Prepare label for headers.
     */
    $header = array(
      'menu-name' => t('Menu Name'), 
      'menu-title' => t('Menu Title'),
      'menu-operations' => t('Operations')
    );
    
    $table = array(
      '#theme' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => t('No MegaMenu block available. <a href="@link">Add MegaMenu Block</a>.', array('@link' => new Url('entity.menu.add_form'))),
      '#attributes' => array('id' => 'tb_megamenu'),
    );
    return $table;
  }
}
