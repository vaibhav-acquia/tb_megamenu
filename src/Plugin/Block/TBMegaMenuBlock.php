<?php

/**
 * @file
 * Contains \Drupal\tb_megamenu\Plugin\Block\TBMegaMenuBlock.
 */

namespace Drupal\tb_megamenu\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\tb_megamenu\TBMegaMenuBuilder;

/**
 * Provides blocks which belong to TB Mega Menu.
 *
 *
 * @Block(
 *   id = "tb_megamenu_menu_block",
 *   admin_label = @Translation("TB Mega Menu"),
 *   category = @Translation("TB MegaMenus"),
 *   deriver = "Drupal\tb_megamenu\Plugin\Derivative\TBMegaMenuBlock"
 * )
 *
 */
class TBMegaMenuBlock extends BlockBase {
  
  /**
   * {@inheritdoc}
   */
  public function build() {
    $menu_name = $this->getDerivativeId();
    
    // It's used to test.
    $content = array(
      '#theme' => 'tb_megamenu_block',
      '#menu_name' => 'main_menu',
      '#block_key' => 'tb_megamenu_menu_block:footer',
      '#section' => 'frontend',
      '#showblocktitle' => 1,
    );
//
//    // Adjust the menu tree parameters based on the block's configuration.
//    $level = $this->configuration['level'];
//    $depth = $this->configuration['depth'];
//    $parameters->setMinDepth($level);
//    // When the depth is configured to zero, there is no depth limit. When depth
//    // is non-zero, it indicates the number of levels that must be displayed.
//    // Hence this is a relative depth that we must convert to an actual
//    // (absolute) depth, that may never exceed the maximum depth.
//    if ($depth > 0) {
//      $parameters->setMaxDepth(min($level + $depth - 1, $this->menuTree->maxDepth()));
//    }
//
//    $tree = $this->menuTree->load($menu_name, $parameters);
//    $manipulators = array(
//      array('callable' => 'menu.default_tree_manipulators:checkAccess'),
//      array('callable' => 'menu.default_tree_manipulators:generateIndexAndSort'),
//    );
//    $tree = $this->menuTree->transform($tree, $manipulators);
//    $this->menuTree->build($tree);
    return $content;
  }
}
