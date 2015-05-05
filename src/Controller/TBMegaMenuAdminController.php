<?php

/**
 * @file
 * Contains \Drupal\tb_megamenu\Controller\TBMegaMenuAdminController.
 */

namespace Drupal\tb_megamenu\Controller;

use Drupal\Core\Url;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\tb_megamenu\TBMegaMenuBuilder;
use Symfony\Component\HttpFoundation\Response;


class TBMegaMenuAdminController extends ControllerBase {

  /**
   * This is page callback. Listing mega menus.
   */
  public function listMegaMenus() {
    // Get menus.
    $menus = menu_ui_get_menus();
    // Prepare data for each row.
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
    // Prepare label for headers.
    $header = array(
      'menu-name' => t('Menu Name'),
      'menu-title' => t('Menu Title'),
      'menu-operations' => t('Operations')
    );

    $table = array(
      '#theme' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => t('No MegaMenu block available. <a href="@link">Add Menu</a>.', array('@link' => \Drupal::url('entity.menu.add_form'))),
      '#attributes' => array('id' => 'tb_megamenu'),
    );
    return $table;
  }
  
  /**
   * This is menu callback. Save configuration of TB Mega Menu.
   */
  public function saveConfiguration() {
    $action = isset($_POST['action']) ? $_POST['action'] : NULL;
    $result = '';
    switch ($action) {
      case 'load':
        $block = TBMegaMenuBuilder::renderBlock($_POST['menu_name'], $_POST['theme']);
        $result = drupal_render($block);
        break;
      
      case 'save':
        $menu_config = isset($_POST['menu_config']) ? $_POST['menu_config'] : NULL;
        $block_config = isset($_POST['block_config']) ? $_POST['block_config'] : NULL;
        $menu_name = isset($_POST['menu_name']) ? $_POST['menu_name'] : NULL;
        $theme = isset($_POST['theme']) ? $_POST['theme'] : NULL;
        if ($menu_config && $menu_name) {
          // Sync mega menu before store.
          $menu_tree_parameters = (new MenuTreeParameters)->onlyEnabledLinks();
          $menu_items = \Drupal::menuTree()->load($menu_name, $menu_tree_parameters);
          TBMegaMenuBuilder::syncConfigAll($menu_items, $menu_config, 'backend');
          TBMegaMenuBuilder::syncOrderMenus($menu_config);

          $merge = db_merge('tb_megamenus');
          $result = $merge->key(array('menu_name' => $menu_name, 'theme' => $theme))
                ->fields(array(
                  'block_config' => json_encode($block_config),
                  'menu_config' => json_encode($menu_config),
                ))
                ->execute();
        }
        break;
        
      case 'load_block':
        $block_id = isset($_POST['block_id']) ? $_POST['block_id'] : NULL;
        $id = isset($_POST['id']) ? $_POST['id'] : NULL;
        $showblocktitle = isset($_POST['showblocktitle']) ? $_POST['showblocktitle'] : NULL;
        if ($block_id) {
          $argument = array(
            '#theme' => 'tb_megamenu_block',
            '#block_id' => $block_id, 
            '#section' => 'backend', 
            '#showblocktitle' => $showblocktitle
          );
          $content = drupal_render($argument);
          $result = json_encode(array('content' => $content, 'id' => $id));
        }
        break;
        
      default:
        break;
    }
    
    return new Response($result);
  }
  
  /**
   * This is a menu page. To edit Mega Menu.
   */
  public function configMegaMenu($menu_name) {
    // Add font-awesome library.
    $page['#attached']['library'][] = 'tb_megamenu/form.font-awesome';
    // Add chosen library.
    $page['#attached']['library'][] = 'tb_megamenu/form.chosen';
    // Add a custom library.
    $page['#attached']['library'][] = 'tb_megamenu/form.configure-megamenu';
    
    $abs_url_config = \Drupal::url('tb_megamenu.admin.save', array(), array('absolute' => TRUE));
    $page['#attached']['drupalSettings']['TBMegaMenu']['saveConfigURL'] = $abs_url_config;
    if (!empty($menu_name)) {
      $page['tb_megamenu'] = array(
        '#theme' => 'tb_megamenu_backend',
        '#menu_name' => $menu_name,
      );
    }
    return $page;
  }

}
