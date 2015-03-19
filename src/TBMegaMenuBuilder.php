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

  /**
   * Get all of blocks in system without blocks which belong to TB Mega Menu.
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
        if (isset($dependencies['module'][0]) && $dependencies['module'][0] != 'tb_megamenu') {
          $settings = $block->get('settings');
          $idx = $dependencies['module'][0] . '--' . $settings['id'];
          $_blocks_array[$idx] = $settings['label'];
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
    $animations = array('none' => t('None'), 'fading' => t('Fading'), 'slide' => t('Slide'), 'zoom' => t('Zoom'), 'elastic' => t('Elastic'));
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

}
