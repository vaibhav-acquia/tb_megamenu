<?php

/**
 * @file 
 * Contains \Drupal\tb_megamenu\TBMegaMenuBuilder.
 * 
 * Retrieve menus and Mega Menus.
 */

namespace Drupal\tb_megamenu;

class TBMegaMenuBuilder {
  
  /**
   * Get all of MegaMenus.
   * 
   * @return array
   */
  public function getMegaMenus() {
    $query = db_select('menu_tree', 'm');
    $query->leftJoin('tb_megamenus', 't', 't.menu_name = m.menu_name');
    $query->fields('m', array('menu_name', 'title'));
    $query->distinct();
    $menus = $query->execute()->fetchAll();
    return $menus;
  }
}