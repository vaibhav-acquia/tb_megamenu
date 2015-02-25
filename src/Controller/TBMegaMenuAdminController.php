<?php

/**
 * @file
 * Contains \Drupal\tb_megamenu\Controller\TBMegaMenuAdminController.
 */

namespace Drupal\tb_megamenu\Controller;

use Drupal\Core\Url;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;

class TBMegaMenuAdminController extends ControllerBase {
  
  public function listMegaMenus() {
    $menus = menu_ui_get_menus();
    $rows = array();
    foreach ($menus as $name => $title) {
      $row = array();
      $row[] = $name;
      $row[] = $title;
      $dropbuttons = array(
        '#type' => 'operations',
        '#links' => array(
          'config' => array(
            'url' => new Url('entity.menu.edit_form', array('menu' => $name)),
            'title' => 'Config'
          ),
          'edit' => array(
            'url' => new Url('entity.menu.edit_form', array('menu' => $name)),
            'title' => 'Edit links'
          ),
        )
      );
      $row[] = drupal_render($dropbuttons); 
      $rows[] = $row;
    }
    
    $header = array(t('Menu Name'), t('Menu Title'));
    $header[] = array('data' => t('Operations'), 'colspan' => 2);
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
