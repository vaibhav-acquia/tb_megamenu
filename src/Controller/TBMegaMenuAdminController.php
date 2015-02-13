<?php

/**
 * @file
 * Contains \Drupal\tb_megamenu\Controller\TBMegaMenuAdminController.
 */

namespace Drupal\tb_megamenu\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;

class TBMegaMenuAdminController extends ControllerBase {
  
  /**
   * The settings form.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request of the page.
   * @param string $type
   *   The type of the overview form ('approval' or 'new') default to 'new'.
   *
   * @return array
   */
  public function adminPage(Request $request, $type = 'new') {
    return $this->formBuilder->getForm('\Drupal\tb_megamenu\Form\TBMegaMenuAdminForm', $type);
  }
}
