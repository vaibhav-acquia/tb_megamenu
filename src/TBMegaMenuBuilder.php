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
   * Check library is existed.
   * 
   * @param string $module
   * @param string $name
   */
  public static function checkLibrary($module, $name) {
    
  }

  /**
   * Get the configuration of blocks.
   * @param string $menu_name
   * @return array
   */
  public static function getBlockConfig($menu_name) {
    $menu = self::getMenus($menu_name);
    return $menu && isset($menu->block_config) ? json_decode($menu->block_config, true) : array();
  }

  /**
   * Get menus that belongs TB mega menu.
   * 
   * @global stdClass $language
   * @param string $menu_name
   * @return array
   */
  public static function getMenus($menu_name) {
    $query = db_select('menu_link_content_data', 'm');
    $query->leftJoin('tb_megamenus', 't', 't.menu_name = m.menu_name');
    $query->fields('m');
    $query->addField('t', 'menu_config');
    $query->addField('t', 'block_config');
    $query->condition('m.menu_name', $menu_name);
    $query->condition('m.langcode', \Drupal::languageManager()->getCurrentLanguage()->getId());
    return $query->execute()->fetchObject();
  }

  public static function getMenuItem($menu_name, $mlid) {
    $tree = $menu_items = \Drupal::menuTree()->load($menu_name, (new Menu\MenuTreeParameters)->onlyEnabledLinks());
    // Need to review this.
//    if (function_exists('i18n_menu_localize_tree')) {
//      $tree = i18n_menu_localize_tree($tree);
//    }
    $item = self::findMenuItem($tree, $mlid);
    return $item;
  }

  public static function findMenuItem($tree, $mlid) {
//    foreach ($tree as $item) {
//      if ($item['link']['mlid'] == $mlid) {
//        return $item;
//      }
//      else {
//        $result = self::findMenuItem($item['below'], $mlid);
//        if ($result) {
//          return $result;
//        }
//      }
//    }
    return NULL;
  }

  /**
   * Load block.
   * 
   * @param string $pluginId
   * @return array
   */
  public static function loadBlock($pluginId) {
    return \Drupal::service('plugin.manager.block')->createInstance($pluginId);
  }

  /**
   * Get configuration of menu.
   * 
   * @param string $menu_name
   * @return stdClass
   */
  public static function getMenuConfig($menu_name) {
    $menu = self::getMenus($menu_name);
    return $menu && isset($menu->menu_config) ? json_decode($menu->menu_config, true) : array();
  }

  /**
   * Create the default attributes for the configuration of block.
   * 
   * @param array $block_config
   */
  public static function editBlockConfig(&$block_config) {
    $attributes = array(
      'animation' => 'none',
      'style' => '',
      'auto-arrow' => TRUE,
      'duration' => 400,
      'delay' => 200,
      'always-show-menu' => 1,
      'off-canvas' => 0
    );
    foreach ($attributes as $attribute => $value) {
      if (!isset($block_config[$attribute])) {
        $block_config[$attribute] = $value;
      }
    }
  }

  /**
   * 
   * @param type $submenu_config
   */
  public static function editSubMenuConfig(&$submenu_config) {
    $attributes = array(
      'width' => '',
      'class' => '',
      'group' => '',
    );
    foreach ($attributes as $attribute => $value) {
      if (!isset($submenu_config[$attribute])) {
        $submenu_config[$attribute] = $value;
      }
    }
  }

  /**
   * 
   * @param type $item_config
   */
  public static function editItemConfig(&$item_config) {
    $attributes = array(
      'xicon' => '',
      'class' => '',
      'caption' => '',
      'alignsub' => '',
      'group' => 0,
      'hidewcol' => 0,
      'hidesub' => 0
    );
    foreach ($attributes as $attribute => $value) {
      if (!isset($item_config[$attribute])) {
        $item_config[$attribute] = $value;
      }
    }
  }

  public static function editColumnConig(&$col_config) {
    $attributes = array(
      'width' => 12,
      'class' => '',
      'hidewcol' => 0,
      'showblocktitle' => 0,
    );
    foreach ($attributes as $attribute => $value) {
      if (!isset($col_config[$attribute])) {
        $col_config[$attribute] = $value;
      }
    }
  }

  /**
   * Create block which using tb_megamenu.
   * 
   * @global array $tb_elements_counter
   * @param string $menu_name
   * @return array
   */
  public static function renderBlock($menu_name) {
    global $tb_elements_counter;
    $tb_elements_counter = array('column' => 0);
    $block = array(
      '#theme' => 'tb_megamenu',
      '#menu_name' => $menu_name,
      '#section' => 'backend'
    );
    $block['#attached']['drupalSettings']['TBMegaMenu']['TBElementsCounter'] = json_encode($tb_elements_counter);
    return $block;
  }

  public static function getCounter($key) {
    $value = &drupal_static($key, 0);
    $value++;
    global $tb_elements_counter;
    if (!$tb_elements_counter) {
      $tb_elements_counter = array();
    }
    $tb_elements_counter[$key] = $value;
    return "tb-megamenu-$key-$value";
  }

  /**
   * Get all of blocks in system without blocks which belong to TB Mega Menu.
   * 
   * In array, each element includes key which is PluginId and value which is label of block. 
   * 
   * @staticvar array $_blocks_array
   * @return array
   */
  public static function getAllBlocks() {
    static $_blocks_array = array();
    if (empty($_blocks_array)) {
      $blocks = _block_rehash(\Drupal::configFactory()->get('system.theme')->get('default'));
      $_blocks_array = array();
      foreach ($blocks as $block) {
        $dependencies = $block->getDependencies();
        $modules = array_values($dependencies['module']);
        if (!in_array('tb_megamenu', $modules)) {
          $settings = $block->get('settings');
          $_blocks_array[$settings['id']] = $settings['label'];
        }
      }
      asort($_blocks_array);
    }
    return $_blocks_array;
  }

  /**
   * Create options for animation.
   * 
   * @param array $block_config
   * @return array
   */
  public static function createAnimationOptions($block_config) {
    $animations = array(
      'none' => t('None'),
      'fading' => t('Fading'),
      'slide' => t('Slide'),
      'zoom' => t('Zoom'),
      'elastic' => t('Elastic')
    );
    $options = array();
    foreach ($animations as $value => $title) {
      if ($value == $block_config['animation']) {
        $options[] = '<option value="' . $value . '" selected="selected">' . $title . '</option>';
      }
      else {
        $options[] = '<option value="' . $value . '">' . $title . '</option>';
      }
    }
    return array('#markup' => implode("\n", $options));
  }

  /**
   * Create options for styles.
   * 
   * @param array $block_config
   * @return array
   */
  public static function createStyleOptions($block_config) {
    $styles = array(
      '' => t('Default'),
      'black' => t('Black'),
      'blue' => t('Blue'),
      'green' => t('Green'),
    );
    $options = array();
    foreach ($styles as $value => $title) {
      if ($value == $block_config['style']) {
        $options[] = '<option value="' . $value . '" selected="selected">' . $title . '</option>';
      }
      else {
        $options[] = '<option value="' . $value . '">' . $title . '</option>';
      }
    }
    return array('#markup' => implode("\n", $options));
  }

  public static function buildPageTrail($menu_items) {
    $trail = array();
    foreach ($menu_items as $pluginId => $item) {
      if ($item->inActiveTrail ||
              ($item->link->getPluginDefinition()['route_name'] == '<front>')) {
        $trail [$pluginId] = $item;
      }

      if ($item->subtree) {
        $trail += self::buildPageTrail($item->subtree);
      }
    }
    return $trail;
  }

  /**
   * 
   * @param array $items
   * @param array $menu_config
   * @param string $section
   */
  public static function syncConfigAll($items, &$menu_config, $section) {
    foreach ($items as $item) {
//      $mlid = $item['link']['mlid'];
//      $item_config = isset($menu_config[$mlid]) ? $menu_config[$mlid] : array();
//      if (!$item['link']['hidden'] && (!empty($item['below']) || !empty($item_config))) {
//        self::syncConfig($item['below'], $item_config, $mlid, $section);
//        $menu_config[$mlid] = $item_config;
//        self::syncConfigAll($item['below'], $menu_config, $section);
//      }
    }
  }

  /**
   * 
   * @param array $items
   * @param array $item_config
   * @param string $plugin_id
   * @param string $section
   */
  public static function syncConfig($items, &$item_config, $plugin_id, $section) {
    if (empty($item_config['rows_content'])) {
      $item_config['rows_content'] = array(0 => array(0 => array('col_content' => array(), 'col_config' => array())));
      foreach ($items as $item) {
        $mlid = $item['link']['mlid'];
        if (!$item['link']['hidden']) {
          $item_config['rows_content'][0][0]['col_content'][] = array(
            'type' => 'menu_item',
            'mlid' => $mlid,
            'tb_item_config' => array(),
            'weight' => $item['link']['weight'],
          );
        }
      }
      if (empty($item_config['rows_content'][0][0]['col_content'])) {
        unset($item_config['rows_content'][0]);
      }
    }
    else {
      $hash = array();
      foreach ($item_config['rows_content'] as $i => $row) {
        foreach ($row as $j => $col) {
          foreach ($col['col_content'] as $k => $tb_item) {
            if ($tb_item['type'] == 'menu_item') {
              $hash[$tb_item['mlid']] = array('row' => $i, 'col' => $j);
              $existed = false;
              foreach ($items as $item) {
                if (!$item['link']['hidden'] && $tb_item['mlid'] == $item['link']['mlid']) {
                  $item_config['rows_content'][$i][$j]['col_content'][$k]['weight'] = $item['link']['weight'];
                  $existed = true;
                  break;
                }
              }
              if (!$existed) {
                unset($item_config['rows_content'][$i][$j]['col_content'][$k]);
                if (empty($item_config['rows_content'][$i][$j]['col_content'])) {
                  unset($item_config['rows_content'][$i][$j]);
                }
                if (empty($item_config['rows_content'][$i])) {
                  unset($item_config['rows_content'][$i]);
                }
              }
            }
            else {
              if (!tb_megamenu_block_content_exists($tb_item['block_key'], $section)) {
                unset($item_config['rows_content'][$i][$j]['col_content'][$k]);
                if (empty($item_config['rows_content'][$i][$j]['col_content'])) {
                  unset($item_config['rows_content'][$i][$j]);
                }
                if (empty($item_config['rows_content'][$i])) {
                  unset($item_config['rows_content'][$i]);
                }
              }
            }
          }
        }
      }
      $row = -1;
      $col = -1;
      foreach ($items as $item) {
        $mlid = $item['link']['mlid'];
        if (!$item['link']['hidden']) {
          if (isset($hash[$mlid])) {
            $row = $hash[$mlid]['row'];
            $col = $hash[$mlid]['col'];
            continue;
          }
          if ($row > -1) {
            tb_megamenu_insert_tb_item($item_config, $row, $col, $item);
          }
          else {
            $row = 0;
            $col = 0;
            while (isset($item_config['rows_content'][$row][$col]['col_content']) && $item_config['rows_content'][$row][$col]['col_content'][0]['type'] == 'block') {
              $row++;
            }
            tb_megamenu_insert_tb_item($item_config, $row, $col, $item);
            $item_config['rows_content'][$row][$col]['col_config'] = array();
          }
        }
      }
    }
  }

}
