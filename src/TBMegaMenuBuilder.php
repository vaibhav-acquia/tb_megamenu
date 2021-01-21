<?php

namespace Drupal\tb_megamenu;

use Drupal\Core\Entity\EntityTypeManager;
use Drupal\Core\Logger\LoggerChannelFactory;
use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\Core\Menu\MenuLinkTree;
use Drupal\Core\Menu\MenuTreeStorage;
use Drupal\Core\Path\PathMatcher;
use Drupal\tb_megamenu\Entity\MegaMenuConfig;

/**
 * Handler for creating, editing, and displaying Mega Menus.
 */
class TBMegaMenuBuilder {

  /**
   * The logger service.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactory
   */
  private $logger;

  /**
   * The menu link service.
   *
   * @var \Drupal\Core\Menu\MenuLinkTree
   */
  private $menuTree;

  /**
   * The entity manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  private $entityTypeManager;

  /**
   * The path matcher service.
   *
   * @var \Drupal\Core\Path\PathMatcher
   */
  private $pathMatcher;

  /**
   * The menu tree storage service.
   *
   * @var \Drupal\Core\Menu\MenuTreeStorage
   */
  private $menuStorage;

  /**
   * Constructs a TBMegaMenuBuilder.
   *
   * @param \Drupal\Core\Logger\LoggerChannelFactory $logger
   *   The logger service.
   * @param \Drupal\Core\Menu\MenuLinkTree $menu_tree
   *   The menu link service.
   * @param \Drupal\Core\Entity\EntityTypeManager $entity_manager
   *   The entity manager service.
   * @param \Drupal\Core\Path\PathMatcher $path_matcher
   *   The path matcher service.
   * @param \Drupal\Core\Menu\MenuTreeStorage $menu_storage
   *   The menu tree storage service.
   */
  public function __construct(LoggerChannelFactory $logger, MenuLinkTree $menu_tree, EntityTypeManager $entity_manager, PathMatcher $path_matcher, MenuTreeStorage $menu_storage) {
    $this->logger = $logger;
    $this->menuTree = $menu_tree;
    $this->entityManager = $entity_manager;
    $this->pathMatcher = $path_matcher;
    $this->menuStorage = $menu_storage;
  }

  /**
   * Get the configuration of blocks.
   *
   * @param string $menu_name
   *   Menu Machine name.
   * @param string $theme
   *   Theme machine name.
   *
   * @return array
   *   The block config array
   */
  public function getBlockConfig($menu_name, $theme) {
    $menu = self::getMenus($menu_name, $theme);
    return ($menu) ? $menu->getBlockConfig() : [];
  }

  /**
   * Get menus that belongs TB mega menu.
   *
   * @param string $menu_name
   *   The menu machine name.
   * @param string $theme
   *   The theme machine name.
   *
   * @return \Drupal\tb_megamenu\MegaMenuConfigInterface|null
   *   The configuration entity for this menu or NULL if not found.
   */
  public function getMenus($menu_name, $theme) {
    $config = MegaMenuConfig::loadMenu($menu_name, $theme);
    if ($config === NULL) {
      $this->logger('tb_megamenu')->warning(
        t("Could not find TB Megamenu configuration for menu: @menu, theme: @theme", [
          '@menu' => $menu_name,
          '@theme' => $theme,
        ]
      ));
    }
    return $config;
  }

  /**
   * Find a menu item.
   *
   * @param string $menu_name
   *   Menu machine name.
   * @param string $plugin_id
   *   The menu item plugin id.
   *
   * @return \Drupal\Core\Menu\MenuLinkTreeElement
   *   The menu item element.
   */
  public function getMenuItem($menu_name, $plugin_id) {
    $tree = $this->menuTree->load($menu_name, (new MenuTreeParameters())->onlyEnabledLinks());
    $item = self::findMenuItem($tree, $plugin_id);
    return $item;
  }

  /**
   * Search by menu item.
   *
   * @param mixed $tree
   *   The menu tree.
   * @param mixed $plugin_id
   *   The item plugin id.
   *
   * @return \Drupal\Core\Menu\MenuLinkTreeElement
   *   The menu link element.
   */
  public function findMenuItem($tree, $plugin_id) {
    foreach ($tree as $menu_plugin_id => $item) {
      if ($menu_plugin_id == $plugin_id) {
        return $item;
      }
      elseif ($result = self::findMenuItem($item->subtree, $plugin_id)) {
        return $result;
      }
    }
    return NULL;
  }

  /**
   * Load blocks by block_id.
   *
   * @param string $block_id
   *   The block id.
   *
   * @return \Drupal\Core\Entity\EntityInterface|null
   *   The block entity.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function loadEntityBlock($block_id) {
    return $this->entityManager->getStorage('block')->load($block_id);
  }

  /**
   * Get configuration of menu.
   *
   * @param string $menu_name
   *   The menu machine name.
   * @param string $theme
   *   The theme machine name.
   *
   * @return array|object
   *   The menu configuration info.
   */
  public function getMenuConfig($menu_name, $theme) {
    $menu = self::getMenus($menu_name, $theme);
    return isset($menu) ? $menu->getMenuConfig() : [];
  }

  /**
   * Create the default attributes for the configuration of block.
   *
   * @param array $block_config
   *   The block config array to fill with default values.
   */
  public function editBlockConfig(array &$block_config) {
    $block_config += [
      'animation' => 'none',
      'style' => '',
      'auto-arrow' => TRUE,
      'duration' => 400,
      'delay' => 200,
      'always-show-submenu' => TRUE,
      'off-canvas' => 0,
      'number-columns' => 0,
    ];
  }

  /**
   * Set the default values to configuration in Sub TB Megamenu if it's empty.
   *
   * @param array $submenu_config
   *   The array to fill with default values.
   */
  public function editSubMenuConfig(array &$submenu_config) {
    $submenu_config += [
      'width' => '',
      'class' => '',
      'group' => '',
    ];
  }

  /**
   * Set the default values to configuration in TB Megamenu item if it's empty.
   *
   * @param array $item_config
   *   The array to fill with default values.
   */
  public function editItemConfig(array &$item_config) {
    $attributes = [
      'xicon' => '',
      'class' => '',
      'caption' => '',
      'alignsub' => '',
      'group' => 0,
      'hidewcol' => 0,
      'hidesub' => 0,
    ];
    foreach ($attributes as $attribute => $value) {
      if (!isset($item_config[$attribute])) {
        $item_config[$attribute] = $value;
      }
    }
  }

  /**
   * Set the default values to configuration in columns if it's empty.
   *
   * @param array $col_config
   *   The array to fill with default values.
   */
  public function editColumnConfig(array &$col_config) {
    $attributes = [
      'width' => 12,
      'class' => '',
      'hidewcol' => 0,
      'showblocktitle' => 0,
    ];
    foreach ($attributes as $attribute => $value) {
      if (!isset($col_config[$attribute])) {
        $col_config[$attribute] = $value;
      }
    }
  }

  /**
   * Create block which using tb_megamenu.
   *
   * @param string $menu_name
   *   The menu machine name.
   * @param string $theme
   *   The theme machine name.
   *
   * @return array
   *   The render array.
   */
  public function renderBlock($menu_name, $theme) {
    return [
      '#theme' => 'tb_megamenu',
      '#menu_name' => $menu_name,
      '#block_theme' => $theme,
      '#section' => 'backend',
      '#post_render' => ['\Drupal\tb_megamenu\Controller\TBMegaMenuController::tbMegamenuAttachNumberColumns'],
    ];
  }

  /**
   * Get Id of column.
   *
   * @param int $number_columns
   *   The number of columns.
   *
   * @return string
   *   The column id.
   */
  public function getIdColumn($number_columns) {
    $value = &drupal_static('column');
    if (!isset($value)) {
      $value = 1;
    }
    elseif (!$number_columns || $value < $number_columns) {
      $value++;
    }
    return "tb-megamenu-column-$value";
  }

  /**
   * Get all of blocks in system without blocks which belong to TB Mega Menu.
   *
   * In array, each element includes key which is plugin_id and value which is
   * label of block.
   *
   * @staticvar array $_blocks_array
   *
   * @return \Drupal\Core\Entity\EntityTypeInterface[]
   *   An array of block entities or an empty array if none found.
   */
  public function getAllBlocks($theme) {
    static $_blocks_array = [];
    if (empty($_blocks_array)) {
      // Get storage handler of block.
      $block_storage = $this->entityManager->getStorage('block');
      // Get the enabled block in the default theme.
      $entity_ids = $block_storage->getQuery()->condition('theme', $theme)->execute();
      $entities = $block_storage->loadMultiple($entity_ids);
      $_blocks_array = [];
      foreach ($entities as $block_id => $block) {
        if ($block->get('settings')['provider'] != 'tb_megamenu') {
          $_blocks_array[$block_id] = $block->label();
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
   *   The block configuration.
   *
   * @return array
   *   The default block configuration.
   */
  public function createAnimationOptions(array $block_config) {
    return [
      'none' => t('None'),
      'fading' => t('Fading'),
      'slide' => t('Slide'),
      'zoom' => t('Zoom'),
      'elastic' => t('Elastic'),
    ];
  }

  /**
   * Create options for styles.
   *
   * @param array $block_config
   *   The block configuration.
   *
   * @return array
   *   The options array.
   */
  public function createStyleOptions(array $block_config) {
    return [
      '' => t('Default'),
      'black' => t('Black'),
      'blue' => t('Blue'),
      'green' => t('Green'),
    ];
  }

  /**
   * Builds the page trail for marking active items.
   *
   * @param \Drupal\Core\Menu\MenuLinkTreeElement[] $menu_items
   *   The menu items to use.
   */
  public function buildPageTrail(array $menu_items) {
    $trail = [];
    foreach ($menu_items as $pluginId => $item) {
      $is_front = $this->pathMatcher->isFrontPage();
      $route_name = $item->link->getPluginDefinition()['route_name'];
      if ($item->inActiveTrail || ($route_name == '<front>' && $is_front)) {
        $trail[$pluginId] = $item;
      }

      if ($item->subtree) {
        $trail += self::buildPageTrail($item->subtree);
      }
    }
    return $trail;
  }

  /**
   * Add item config values to menu config array.
   *
   * @param array $menu_items
   *   The menu tree for this config.
   * @param array $menu_config
   *   The menu configuration.
   * @param string $section
   *   The menu section.
   */
  public function syncConfigAll(array $menu_items, array &$menu_config, $section) {
    foreach ($menu_items as $id => $menu_item) {
      $item_config = isset($menu_config[$id]) ? $menu_config[$id] : [];
      if ($menu_item->hasChildren || $item_config) {
        self::syncConfig($menu_item->subtree, $item_config, $section);
        $menu_config[$id] = $item_config;
        self::syncConfigAll($menu_item->subtree, $menu_config, $section);
      }
    }
  }

  /**
   * Populate the item_config values.
   *
   * @param array $items
   *   Menu items.
   * @param array $item_config
   *   The item config array to populate.
   * @param string $section
   *   The menu section.
   */
  public function syncConfig(array $items, array &$item_config, $section) {
    if (empty($item_config['rows_content'])) {
      $item_config['rows_content'][0][0] = [
        'col_content' => [],
        'col_config' => [],
      ];

      foreach ($items as $plugin_id => $item) {
        if ($item->link->isEnabled()) {
          $item_config['rows_content'][0][0]['col_content'][] = [
            'type' => 'menu_item',
            'plugin_id' => $plugin_id,
            'tb_item_config' => [],
            'weight' => $item->link->getWeight(),
          ];
        }
      }
      if (empty($item_config['rows_content'][0][0]['col_content'])) {
        unset($item_config['rows_content'][0]);
      }
    }
    else {
      $hash = [];
      foreach ($item_config['rows_content'] as $i => $row) {
        foreach ($row as $j => $col) {
          foreach ($col['col_content'] as $k => $tb_item) {
            if ($tb_item['type'] == 'menu_item') {
              $hash[$tb_item['plugin_id']] = [
                'row' => $i,
                'col' => $j,
              ];
              $existed = FALSE;
              foreach ($items as $plugin_id => $item) {
                if ($item->link->isEnabled() && $tb_item['plugin_id'] == $plugin_id) {
                  $item_config['rows_content'][$i][$j]['col_content'][$k]['weight'] = $item->link->getWeight();
                  $existed = TRUE;
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
            elseif ($tb_item['type'] == 'block' && !empty($tb_item['block_id'])) {
              if (!self::isBlockContentEmpty($tb_item['block_id'], $section)) {
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
              if (empty($tb_item)) {
                unset($item_config['rows_content'][$i][$j]['col_content'][$k]);
              }
              $this->logger('tb_megamenu')->warning('Unknown / invalid column content: <pre>@content</pre>', [
                '@content' => print_r($tb_item, TRUE),
              ]);
            }
          }
        }
      }
      $row = -1;
      $col = -1;
      foreach ($items as $plugin_id => $item) {
        if ($item->link->isEnabled()) {
          if (isset($hash[$plugin_id])) {
            $row = $hash[$plugin_id]['row'];
            $col = $hash[$plugin_id]['col'];
            continue;
          }
          if ($row > -1) {
            self::insertTbMenuItem($item_config, $row, $col, $item);
          }
          else {
            $row = $col = 0;
            while (isset($item_config['rows_content'][$row][$col]['col_content'][0]['type']) &&
            $item_config['rows_content'][$row][$col]['col_content'][0]['type'] == 'block') {

              $row++;
            }
            self::insertTbMenuItem($item_config, $row, $col, $item);
            $item_config['rows_content'][$row][$col]['col_config'] = [];
          }
        }
      }
    }
  }

  /**
   * Sync order of menu items between menu and tb_megamenus.
   *
   * @param array $menu_config
   *   The menu configuration.
   */
  public function syncOrderMenus(array &$menu_config) {
    foreach ($menu_config as $mlid => $config) {
      foreach ($config['rows_content'] as $rows_id => $row) {
        $item_sorted = [];
        // Get weight from items.
        foreach ($row as $col) {
          foreach ($col['col_content'] as $menu_item) {
            if ($menu_item['type'] == 'menu_item') {
              $item_sorted[$menu_item['weight']][] = $menu_item;
            }
          }
        }
        // Sort menu by weight.
        ksort($item_sorted);
        $new_list = [];
        foreach ($item_sorted as $weight_group) {
          foreach ($weight_group as $item) {
            $new_list[] = $item;
          }
        }
        $item_sorted = $new_list;
        foreach ($row as $rid => $col) {
          foreach ($col['col_content'] as $menu_item_id => $menu_item) {
            if ($menu_item['type'] == 'menu_item') {
              $menu_config[$mlid]['rows_content'][$rows_id][$rid]['col_content'][$menu_item_id] = array_shift($item_sorted);
            }
          }
        }
      }
    }
  }

  /**
   * Test if a block has content or not.
   *
   * @param mixed $block_id
   *   The block id.
   * @param mixed $section
   *   The menu section.
   *
   * @return bool
   *   True if empty.
   */
  public function isBlockContentEmpty($block_id, $section) {
    $entity_block = self::loadEntityBlock($block_id);
    if ($entity_block && ($entity_block->getPlugin()->build() || $section == 'backend')) {
      return TRUE;
    }
    return FALSE;
  }

  /**
   * Insert a menu item into the item config array.
   *
   * @param array $item_config
   *   The item config array.
   * @param string $row
   *   The row to insert at.
   * @param string $col
   *   The column to insert at.
   * @param mixed $item
   *   The menu item to insert.
   */
  public function insertTbMenuItem(array &$item_config, $row, $col, $item) {
    $i = 0;
    $col_content = isset($item_config['rows_content'][$row][$col]['col_content']) ? array_values($item_config['rows_content'][$row][$col]['col_content']) : [];
    current($col_content);
    foreach ($col_content as $value) {
      if (!empty($value['weight']) && $value['weight'] < $item->link->getWeight()) {
        next($col_content);
        $i = key($col_content);
      }
    }
    for ($j = count($col_content); $j > $i; $j--) {
      $col_content[$j] = $col_content[$j - 1];
    }
    $col_content[$i] = [
      'plugin_id' => $item->link->getPluginId(),
      'type' => 'menu_item',
      'weight' => $item->link->getWeight(),
      'tb_item_config' => [],
    ];
    $item_config['rows_content'][$row][$col]['col_content'] = $col_content;
  }

}
