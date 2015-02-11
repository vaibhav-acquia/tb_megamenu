<?php

/**
 * @file
 * Contains \Drupal\tb_megamenu\Controller\AdminController.
 */

namespace Drupal\tb_megamenu\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;

class AdminController extends ControllerBase {
  
  /**
   * Presents an administrative comment listing.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request of the page.
   * @param string $type
   *   The type of the overview form ('approval' or 'new') default to 'new'.
   *
   * @return array
   *   Then comment multiple delete confirmation form or the comments overview
   *   administration form.
   */
  public function adminPage(Request $request, $type = 'new') {
    //return $this->formBuilder->getForm('\Drupal\comment\Form\CommentAdminOverview', $type);
    $element = array(
      '#markup' => 'Hello, world',
    );
    return $element;
  }
}
