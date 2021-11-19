# The Better Mega Menu Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [\[Unreleased\]](https://www.drupal.org/project/tb_megamenu/releases/8.x-2.x)

- Added source SCSS.
- Removed dependencies on Bootstrap, Chosen and jQuery.
- Removed support for menu themes.
- Simplified keyboard nav.
  ** Home/End listeners removed.
  ** Left/Right behave the same as Tab key.
- Added support for clickable dropdowns to show/hide submenus.
- Removed fontawesome library and added optional dependency on the fontawesome module.
- Submenus take up the full width on the nav container by default.

TODO

- Fix mobile display when always show is set to true.
- Revisit keyboard functionality on touch devices and mobile, both with and without auto arrows.
