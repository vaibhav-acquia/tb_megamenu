<?php

/**
 * @file
 * Contains \Drupal\tb_megamenu\Plugin\Block\TBMegaMenuBlock.
 */

namespace Drupal\tb_megamenu\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides blocks which belong to TB Mega Menu.
 *
 *
 * @Block(
 *   id = "tb_megamenu_menu_block",
 *   admin_label = @Translation("TB Mega Menu"),
 *   category = @Translation("TB Mega Menu"),
 *   deriver = "Drupal\tb_megamenu\Plugin\Derivative\TBMegaMenuBlock"
 * )
 *
 */
class TBMegaMenuBlock extends BlockBase {
  
  /**
   * {@inheritdoc}
   */
  public function build() {
    return array(
      '#theme' => 'tb_megamenu',
      '#menu_name' => $this->getDerivativeId(),
      '#attached' => array('library' => array('tb_megamenu/theme.tb_megamenu')),
      '#post_render' => array('tb_megamenu_attach_number_columns')
    );
  }
}
