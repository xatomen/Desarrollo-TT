(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  /**
   * Plugin base class
   * 
   */
  var Plugin =
  /*#__PURE__*/
  function () {
    function Plugin(element, options) {
      _classCallCheck(this, Plugin);

      _defineProperty(this, "$element", void 0);

      _defineProperty(this, "options", void 0);

      this.$element = $(element);
      this.options = _objectSpread({}, this.constructor.defaults, options, this.$element.data());
      this.init();
    } // eslint-disable-next-line class-methods-use-this


    _createClass(Plugin, [{
      key: "init",
      value: function init() {
        throw new Error('You have to implement the method init!');
      } // eslint-disable-next-line class-methods-use-this

    }, {
      key: "update",
      value: function update() {}
    }, {
      key: "setOptions",
      value: function setOptions(options) {
        this.options = _objectSpread({}, this.options, options);
        this.update();
      }
    }]);

    return Plugin;
  }();

  _defineProperty(Plugin, "code", void 0);

  _defineProperty(Plugin, "key", '');

  _defineProperty(Plugin, "defaults", {});
  var register = function register(Descendant) {
    $.fn[Descendant.code] = function pluginGenerator(options) {
      return this.each(function elementFinder() {
        if (!$.data(this, Descendant.key)) {
          $.data(this, Descendant.key, new Descendant(this, options));
        } else {
          $.data(this, Descendant.key).setOptions(options);
        }
      });
    };
  };

  var Toolbar =
  /*#__PURE__*/
  function (_Plugin) {
    _inherits(Toolbar, _Plugin);

    function Toolbar(element, options) {
      var _this;

      _classCallCheck(this, Toolbar);

      if (!Toolbar.instance) {
        _this = _possibleConstructorReturn(this, _getPrototypeOf(Toolbar).call(this, element, options));
        Toolbar.instance = _assertThisInitialized(_assertThisInitialized(_this));
      }

      return _possibleConstructorReturn(_this, Toolbar.instance);
    }

    _createClass(Toolbar, [{
      key: "init",
      value: function init() {
        var _this2 = this;

        this.options.index = this.getIndex(); // get index from the current value.

        this.update(); // and update UI.

        var $html = $('html');
        var $toolbar = $('.toolbar'); // Use this.$element for non global behavior

        var $prev = $(Toolbar.buttons.decrease); // Use this.$element.find for non global behavior

        var $next = $(Toolbar.buttons.increase); // Use this.$element.find for non global behavior

        var $contrast = $(Toolbar.buttons.contrast); // Use this.$element.find for non global behavior

        var $toggle = $(Toolbar.buttons.toggler); // Use this.$element.find for non global behavior

        var storedContrast = !!localStorage.getItem(Toolbar.storageKeyPaths.contrast);
        $html.toggleClass(this.options.contrast, storedContrast);
        $contrast.on('click', function (e) {
          e.preventDefault();
          $(e.currentTarget).toggleClass('active');
          $html.toggleClass(_this2.options.contrast);

          if ($html.hasClass(_this2.options.contrast)) {
            localStorage.setItem(Toolbar.storageKeyPaths.contrast, 'active');
          } else {
            localStorage.removeItem(Toolbar.storageKeyPaths.contrast);
          }
        }); // show / hide - mobile

        $toggle.on('click', function (e) {
          e.preventDefault();
          $toolbar.toggleClass('active');
        });
        $prev.on('click', function (e) {
          e.preventDefault();

          if (!$prev.hasClass('disabled') && _this2.options.index > 0) {
            _this2.options.index = _this2.getIndex() - 1;
            _this2.options.value = _this2.options.values[_this2.options.index];

            _this2.update();

            _this2.$element.trigger(Toolbar.changeEvent, _this2.options.value);
          }
        });
        $next.on('click', function (e) {
          e.preventDefault();

          if (!$next.hasClass('disabled') && _this2.options.index < _this2.options.values.length) {
            _this2.options.index = _this2.getIndex() + 1;
            _this2.options.value = _this2.options.values[_this2.options.index];

            _this2.update();

            _this2.$element.trigger(Toolbar.changeEvent, _this2.options.value);
          }
        });
      } // #

    }, {
      key: "getIndex",
      value: function getIndex() {
        return (this.options.values || []).indexOf(this.options.value);
      } // #

    }, {
      key: "update",
      value: function update() {
        $('html').css({
          fontSize: this.options.value
        }).removeClass(this.options.classes.join(' ')).addClass(this.options.classes[this.options.index]);
        localStorage.setItem(Toolbar.storageKeyPaths.index, this.options.index);
        var $prev = $(Toolbar.buttons.decrease); // Use this.$element.find for non global behavior

        var $next = $(Toolbar.buttons.increase); // Use this.$element.find for non global behavior

        $prev.removeClass('disabled');
        $next.removeClass('disabled');

        if (this.options.index === 0) {
          $prev.addClass('disabled');
        }

        if (this.options.index === this.options.values.length - 1) {
          $next.addClass('disabled');
        }

        this.updateNavbar();
      }
    }, {
      key: "updateNavbar",
      value: function updateNavbar() {
        var $nav = $('.navbar');
        var navbarExpandClass = localStorage.getItem(Toolbar.storageKeyPaths.expand);

        if (!navbarExpandClass) {
          navbarExpandClass = $nav.attr('class').split(' ').find(function (item) {
            return /navbar-expand-*/.test(item);
          }) || Toolbar.defaultExpand;
          localStorage.setItem(Toolbar.storageKeyPaths.expand, navbarExpandClass);
        }

        if (this.options.index === 0) {
          $nav.addClass(localStorage.getItem(Toolbar.storageKeyPaths.expand) || Toolbar.defaultExpand);
        }

        if (this.options.index > 0) {
          $nav.removeClass(navbarExpandClass);
        }
      }
    }]);

    return Toolbar;
  }(Plugin);

  _defineProperty(Toolbar, "code", 'toolbar');

  _defineProperty(Toolbar, "key", 'gl.toolbar');

  _defineProperty(Toolbar, "instance", void 0);

  _defineProperty(Toolbar, "defaults", {
    value: '16px',
    index: 0,
    values: ['16px', '20px', '24px'],
    classes: ['a11y-font-0', 'a11y-font-1', 'a11y-font-2'],
    contrast: 'a11y-contrast'
  });

  _defineProperty(Toolbar, "storageKey", 'gob.cl:toolbar');

  _defineProperty(Toolbar, "changeEvent", 'change.gl.toolbar');

  _defineProperty(Toolbar, "buttons", {
    contrast: '.toolbar-behavior-contrast',
    decrease: '.toolbar-behavior-decrease',
    increase: '.toolbar-behavior-increase',
    toggler: '.toolbar-toggler'
  });

  _defineProperty(Toolbar, "defaultExpand", 'navbar-expand-lg');

  _defineProperty(Toolbar, "storageKeyPaths", {
    contrast: "".concat(Toolbar.storageKey, ".contrast"),
    index: "".concat(Toolbar.storageKey, ".index"),
    expand: "".concat(Toolbar.storageKey, ".expand")
  });

  register(Toolbar);

  if (!window.rsConf) {
    window.rsConf = {
      general: {
        usePost: true
      },
      ui: {}
    };
  } // TODO: refactor this.


  if (!window.rsConf.ui) {
    window.rsConf.ui = {};
  }

  window.rsConf.ui.rsbtnClass = 'rsbtn-gobcl-skin';
  window.rsConf.ui.player = ['<span class="rsbtn_box">', ' <a href="javascript:void(0);" class="rsbtn_pause rsimg rspart rsbutton">', '   <span class="toolbar-btn-icon-content">', '     <em class="cl cl-pause"></em>', '     <em class="cl cl-play"></em>', '   </span> ', ' </a>', ' <span class="rsbtn_progress_container rspart">', '   <span class="rsbtn_progress_played"></span>', ' </span>', ' <a href="javascript:void(0);" class="rsbtn_dl rsimg rspart rsbutton">', '   <span class="toolbar-btn-icon-content">', '     <i class="cl cl-download"></i>', '   </span> ', ' </a>', ' <a href="javascript:void(0);" class="rsbtn_closer rsimg rspart rsbutton">', '   <span class="toolbar-btn-icon-content">', '     <i class="cl cl-close"></i>', '   </span> ', ' </a>', ' <span class="rsdefloat"></span>', '</span>'];

  var PseudoBackground =
  /*#__PURE__*/
  function (_Plugin) {
    _inherits(PseudoBackground, _Plugin);

    function PseudoBackground() {
      _classCallCheck(this, PseudoBackground);

      return _possibleConstructorReturn(this, _getPrototypeOf(PseudoBackground).apply(this, arguments));
    }

    _createClass(PseudoBackground, [{
      key: "init",
      value: function init() {
        var $source = this.$element.find('.pseudo-src').addClass('d-none');
        this.$element.css('background-image', "url(\"".concat($source.attr('src'), "\")"));
      }
    }]);

    return PseudoBackground;
  }(Plugin);

  _defineProperty(PseudoBackground, "code", 'pseudoBackground');

  _defineProperty(PseudoBackground, "key", 'gl.pseudo-background');

  register(PseudoBackground);

  /* eslint-disable quote-props */
  var accentMap = {
    'ẚ': 'a',
    'Á': 'a',
    'á': 'a',
    'À': 'a',
    'à': 'a',
    'Ă': 'a',
    'ă': 'a',
    'Ắ': 'a',
    'ắ': 'a',
    'Ằ': 'a',
    'ằ': 'a',
    'Ẵ': 'a',
    'ẵ': 'a',
    'Ẳ': 'a',
    'ẳ': 'a',
    'Â': 'a',
    'â': 'a',
    'Ấ': 'a',
    'ấ': 'a',
    'Ầ': 'a',
    'ầ': 'a',
    'Ẫ': 'a',
    'ẫ': 'a',
    'Ẩ': 'a',
    'ẩ': 'a',
    'Ǎ': 'a',
    'ǎ': 'a',
    'Å': 'a',
    'å': 'a',
    'Ǻ': 'a',
    'ǻ': 'a',
    'Ä': 'a',
    'ä': 'a',
    'Ǟ': 'a',
    'ǟ': 'a',
    'Ã': 'a',
    'ã': 'a',
    'Ȧ': 'a',
    'ȧ': 'a',
    'Ǡ': 'a',
    'ǡ': 'a',
    'Ą': 'a',
    'ą': 'a',
    'Ā': 'a',
    'ā': 'a',
    'Ả': 'a',
    'ả': 'a',
    'Ȁ': 'a',
    'ȁ': 'a',
    'Ȃ': 'a',
    'ȃ': 'a',
    'Ạ': 'a',
    'ạ': 'a',
    'Ặ': 'a',
    'ặ': 'a',
    'Ậ': 'a',
    'ậ': 'a',
    'Ḁ': 'a',
    'ḁ': 'a',
    'Ⱥ': 'a',
    'ⱥ': 'a',
    'Ǽ': 'a',
    'ǽ': 'a',
    'Ǣ': 'a',
    'ǣ': 'a',
    'Ḃ': 'b',
    'ḃ': 'b',
    'Ḅ': 'b',
    'ḅ': 'b',
    'Ḇ': 'b',
    'ḇ': 'b',
    'Ƀ': 'b',
    'ƀ': 'b',
    'ᵬ': 'b',
    'Ɓ': 'b',
    'ɓ': 'b',
    'Ƃ': 'b',
    'ƃ': 'b',
    'Ć': 'c',
    'ć': 'c',
    'Ĉ': 'c',
    'ĉ': 'c',
    'Č': 'c',
    'č': 'c',
    'Ċ': 'c',
    'ċ': 'c',
    'Ç': 'c',
    'ç': 'c',
    'Ḉ': 'c',
    'ḉ': 'c',
    'Ȼ': 'c',
    'ȼ': 'c',
    'Ƈ': 'c',
    'ƈ': 'c',
    'ɕ': 'c',
    'Ď': 'd',
    'ď': 'd',
    'Ḋ': 'd',
    'ḋ': 'd',
    'Ḑ': 'd',
    'ḑ': 'd',
    'Ḍ': 'd',
    'ḍ': 'd',
    'Ḓ': 'd',
    'ḓ': 'd',
    'Ḏ': 'd',
    'ḏ': 'd',
    'Đ': 'd',
    'đ': 'd',
    'ᵭ': 'd',
    'Ɖ': 'd',
    'ɖ': 'd',
    'Ɗ': 'd',
    'ɗ': 'd',
    'Ƌ': 'd',
    'ƌ': 'd',
    'ȡ': 'd',
    'ð': 'd',
    'É': 'e',
    'Ə': 'e',
    'Ǝ': 'e',
    'ǝ': 'e',
    'é': 'e',
    'È': 'e',
    'è': 'e',
    'Ĕ': 'e',
    'ĕ': 'e',
    'Ê': 'e',
    'ê': 'e',
    'Ế': 'e',
    'ế': 'e',
    'Ề': 'e',
    'ề': 'e',
    'Ễ': 'e',
    'ễ': 'e',
    'Ể': 'e',
    'ể': 'e',
    'Ě': 'e',
    'ě': 'e',
    'Ë': 'e',
    'ë': 'e',
    'Ẽ': 'e',
    'ẽ': 'e',
    'Ė': 'e',
    'ė': 'e',
    'Ȩ': 'e',
    'ȩ': 'e',
    'Ḝ': 'e',
    'ḝ': 'e',
    'Ę': 'e',
    'ę': 'e',
    'Ē': 'e',
    'ē': 'e',
    'Ḗ': 'e',
    'ḗ': 'e',
    'Ḕ': 'e',
    'ḕ': 'e',
    'Ẻ': 'e',
    'ẻ': 'e',
    'Ȅ': 'e',
    'ȅ': 'e',
    'Ȇ': 'e',
    'ȇ': 'e',
    'Ẹ': 'e',
    'ẹ': 'e',
    'Ệ': 'e',
    'ệ': 'e',
    'Ḙ': 'e',
    'ḙ': 'e',
    'Ḛ': 'e',
    'ḛ': 'e',
    'Ɇ': 'e',
    'ɇ': 'e',
    'ɚ': 'e',
    'ɝ': 'e',
    'Ḟ': 'f',
    'ḟ': 'f',
    'ᵮ': 'f',
    'Ƒ': 'f',
    'ƒ': 'f',
    'Ǵ': 'g',
    'ǵ': 'g',
    'Ğ': 'g',
    'ğ': 'g',
    'Ĝ': 'g',
    'ĝ': 'g',
    'Ǧ': 'g',
    'ǧ': 'g',
    'Ġ': 'g',
    'ġ': 'g',
    'Ģ': 'g',
    'ģ': 'g',
    'Ḡ': 'g',
    'ḡ': 'g',
    'Ǥ': 'g',
    'ǥ': 'g',
    'Ɠ': 'g',
    'ɠ': 'g',
    'Ĥ': 'h',
    'ĥ': 'h',
    'Ȟ': 'h',
    'ȟ': 'h',
    'Ḧ': 'h',
    'ḧ': 'h',
    'Ḣ': 'h',
    'ḣ': 'h',
    'Ḩ': 'h',
    'ḩ': 'h',
    'Ḥ': 'h',
    'ḥ': 'h',
    'Ḫ': 'h',
    'ḫ': 'h',
    'H': 'h',
    '̱': 'h',
    'ẖ': 'h',
    'Ħ': 'h',
    'ħ': 'h',
    'Ⱨ': 'h',
    'ⱨ': 'h',
    'Í': 'i',
    'í': 'i',
    'Ì': 'i',
    'ì': 'i',
    'Ĭ': 'i',
    'ĭ': 'i',
    'Î': 'i',
    'î': 'i',
    'Ǐ': 'i',
    'ǐ': 'i',
    'Ï': 'i',
    'ï': 'i',
    'Ḯ': 'i',
    'ḯ': 'i',
    'Ĩ': 'i',
    'ĩ': 'i',
    'İ': 'i',
    'i': 'i',
    'Į': 'i',
    'į': 'i',
    'Ī': 'i',
    'ī': 'i',
    'Ỉ': 'i',
    'ỉ': 'i',
    'Ȉ': 'i',
    'ȉ': 'i',
    'Ȋ': 'i',
    'ȋ': 'i',
    'Ị': 'i',
    'ị': 'i',
    'Ḭ': 'i',
    'ḭ': 'i',
    'I': 'i',
    'ı': 'i',
    'Ɨ': 'i',
    'ɨ': 'i',
    'Ĵ': 'j',
    'ĵ': 'j',
    'J': 'j',
    '̌': 'j',
    'ǰ': 'j',
    'ȷ': 'j',
    'Ɉ': 'j',
    'ɉ': 'j',
    'ʝ': 'j',
    'ɟ': 'j',
    'ʄ': 'j',
    'Ḱ': 'k',
    'ḱ': 'k',
    'Ǩ': 'k',
    'ǩ': 'k',
    'Ķ': 'k',
    'ķ': 'k',
    'Ḳ': 'k',
    'ḳ': 'k',
    'Ḵ': 'k',
    'ḵ': 'k',
    'Ƙ': 'k',
    'ƙ': 'k',
    'Ⱪ': 'k',
    'ⱪ': 'k',
    'Ĺ': 'a',
    'ĺ': 'l',
    'Ľ': 'l',
    'ľ': 'l',
    'Ļ': 'l',
    'ļ': 'l',
    'Ḷ': 'l',
    'ḷ': 'l',
    'Ḹ': 'l',
    'ḹ': 'l',
    'Ḽ': 'l',
    'ḽ': 'l',
    'Ḻ': 'l',
    'ḻ': 'l',
    'ł': 'l',
    'Ł': 'l',
    '̣': 'l',
    'Ŀ': 'l',
    'ŀ': 'l',
    'Ƚ': 'l',
    'ƚ': 'l',
    'Ⱡ': 'l',
    'ⱡ': 'l',
    'Ɫ': 'l',
    'ɫ': 'l',
    'ɬ': 'l',
    'ɭ': 'l',
    'ȴ': 'l',
    'Ḿ': 'm',
    'ḿ': 'm',
    'Ṁ': 'm',
    'ṁ': 'm',
    'Ṃ': 'm',
    'ṃ': 'm',
    'ɱ': 'm',
    'Ń': 'n',
    'ń': 'n',
    'Ǹ': 'n',
    'ǹ': 'n',
    'Ň': 'n',
    'ň': 'n',
    'Ñ': 'n',
    'ñ': 'n',
    'Ṅ': 'n',
    'ṅ': 'n',
    'Ņ': 'n',
    'ņ': 'n',
    'Ṇ': 'n',
    'ṇ': 'n',
    'Ṋ': 'n',
    'ṋ': 'n',
    'Ṉ': 'n',
    'ṉ': 'n',
    'Ɲ': 'n',
    'ɲ': 'n',
    'Ƞ': 'n',
    'ƞ': 'n',
    'ɳ': 'n',
    'ȵ': 'n',
    'N': 'n',
    '̈': 'n',
    'n': 'n',
    'Ó': 'o',
    'ó': 'o',
    'Ò': 'o',
    'ò': 'o',
    'Ŏ': 'o',
    'ŏ': 'o',
    'Ô': 'o',
    'ô': 'o',
    'Ố': 'o',
    'ố': 'o',
    'Ồ': 'o',
    'ồ': 'o',
    'Ỗ': 'o',
    'ỗ': 'o',
    'Ổ': 'o',
    'ổ': 'o',
    'Ǒ': 'o',
    'ǒ': 'o',
    'Ö': 'o',
    'ö': 'o',
    'Ȫ': 'o',
    'ȫ': 'o',
    'Ő': 'o',
    'ő': 'o',
    'Õ': 'o',
    'õ': 'o',
    'Ṍ': 'o',
    'ṍ': 'o',
    'Ṏ': 'o',
    'ṏ': 'o',
    'Ȭ': 'o',
    'ȭ': 'o',
    'Ȯ': 'o',
    'ȯ': 'o',
    'Ȱ': 'o',
    'ȱ': 'o',
    'Ø': 'o',
    'ø': 'o',
    'Ǿ': 'o',
    'ǿ': 'o',
    'Ǫ': 'o',
    'ǫ': 'o',
    'Ǭ': 'o',
    'ǭ': 'o',
    'Ō': 'o',
    'ō': 'o',
    'Ṓ': 'o',
    'ṓ': 'o',
    'Ṑ': 'o',
    'ṑ': 'o',
    'Ỏ': 'o',
    'ỏ': 'o',
    'Ȍ': 'o',
    'ȍ': 'o',
    'Ȏ': 'o',
    'ȏ': 'o',
    'Ơ': 'o',
    'ơ': 'o',
    'Ớ': 'o',
    'ớ': 'o',
    'Ờ': 'o',
    'ờ': 'o',
    'Ỡ': 'o',
    'ỡ': 'o',
    'Ở': 'o',
    'ở': 'o',
    'Ợ': 'o',
    'ợ': 'o',
    'Ọ': 'o',
    'ọ': 'o',
    'Ộ': 'o',
    'ộ': 'o',
    'Ɵ': 'o',
    'ɵ': 'o',
    'Ṕ': 'p',
    'ṕ': 'p',
    'Ṗ': 'p',
    'ṗ': 'p',
    'Ᵽ': 'p',
    'Ƥ': 'p',
    'ƥ': 'p',
    'P': 'p',
    '̃': 'p',
    'p': 'p',
    'ʠ': 'q',
    'Ɋ': 'q',
    'ɋ': 'q',
    'Ŕ': 'r',
    'ŕ': 'r',
    'Ř': 'r',
    'ř': 'r',
    'Ṙ': 'r',
    'ṙ': 'r',
    'Ŗ': 'r',
    'ŗ': 'r',
    'Ȑ': 'r',
    'ȑ': 'r',
    'Ȓ': 'r',
    'ȓ': 'r',
    'Ṛ': 'r',
    'ṛ': 'r',
    'Ṝ': 'r',
    'ṝ': 'r',
    'Ṟ': 'r',
    'ṟ': 'r',
    'Ɍ': 'r',
    'ɍ': 'r',
    'ᵲ': 'r',
    'ɼ': 'r',
    'Ɽ': 'r',
    'ɽ': 'r',
    'ɾ': 'r',
    'ᵳ': 'r',
    'ß': 's',
    'Ś': 's',
    'ś': 's',
    'Ṥ': 's',
    'ṥ': 's',
    'Ŝ': 's',
    'ŝ': 's',
    'Š': 's',
    'š': 's',
    'Ṧ': 's',
    'ṧ': 's',
    'Ṡ': 's',
    'ṡ': 's',
    'ẛ': 's',
    'Ş': 's',
    'ş': 's',
    'Ṣ': 's',
    'ṣ': 's',
    'Ṩ': 's',
    'ṩ': 's',
    'Ș': 's',
    'ș': 's',
    'ʂ': 's',
    'S': 's',
    '̩': 's',
    's': 's',
    'Þ': 't',
    'þ': 't',
    'Ť': 't',
    'ť': 't',
    'T': 't',
    'ẗ': 't',
    'Ṫ': 't',
    'ṫ': 't',
    'Ţ': 't',
    'ţ': 't',
    'Ṭ': 't',
    'ṭ': 't',
    'Ț': 't',
    'ț': 't',
    'Ṱ': 't',
    'ṱ': 't',
    'Ṯ': 't',
    'ṯ': 't',
    'Ŧ': 't',
    'ŧ': 't',
    'Ⱦ': 't',
    'ⱦ': 't',
    'ᵵ': 't',
    'ƫ': 't',
    'Ƭ': 't',
    'ƭ': 't',
    'Ʈ': 't',
    'ʈ': 't',
    'ȶ': 't',
    'Ú': 'u',
    'ú': 'u',
    'Ù': 'u',
    'ù': 'u',
    'Ŭ': 'u',
    'ŭ': 'u',
    'Û': 'u',
    'û': 'u',
    'Ǔ': 'u',
    'ǔ': 'u',
    'Ů': 'u',
    'ů': 'u',
    'Ü': 'u',
    'ü': 'u',
    'Ǘ': 'u',
    'ǘ': 'u',
    'Ǜ': 'u',
    'ǜ': 'u',
    'Ǚ': 'u',
    'ǚ': 'u',
    'Ǖ': 'u',
    'ǖ': 'u',
    'Ű': 'u',
    'ű': 'u',
    'Ũ': 'u',
    'ũ': 'u',
    'Ṹ': 'u',
    'ṹ': 'u',
    'Ų': 'u',
    'ų': 'u',
    'Ū': 'u',
    'ū': 'u',
    'Ṻ': 'u',
    'ṻ': 'u',
    'Ủ': 'u',
    'ủ': 'u',
    'Ȕ': 'u',
    'ȕ': 'u',
    'Ȗ': 'u',
    'ȗ': 'u',
    'Ư': 'u',
    'ư': 'u',
    'Ứ': 'u',
    'ứ': 'u',
    'Ừ': 'u',
    'ừ': 'u',
    'Ữ': 'u',
    'ữ': 'u',
    'Ử': 'u',
    'ử': 'u',
    'Ự': 'u',
    'ự': 'u',
    'Ụ': 'u',
    'ụ': 'u',
    'Ṳ': 'u',
    'ṳ': 'u',
    'Ṷ': 'u',
    'ṷ': 'u',
    'Ṵ': 'u',
    'ṵ': 'u',
    'Ʉ': 'u',
    'ʉ': 'u',
    'Ṽ': 'v',
    'ṽ': 'v',
    'Ṿ': 'v',
    'ṿ': 'v',
    'Ʋ': 'v',
    'ʋ': 'v',
    'Ẃ': 'w',
    'ẃ': 'w',
    'Ẁ': 'w',
    'ẁ': 'w',
    'Ŵ': 'w',
    'ŵ': 'w',
    'W': 'w',
    '̊': 'w',
    'ẘ': 'w',
    'Ẅ': 'w',
    'ẅ': 'w',
    'Ẇ': 'w',
    'ẇ': 'w',
    'Ẉ': 'w',
    'ẉ': 'w',
    'Ẍ': 'x',
    'ẍ': 'x',
    'Ẋ': 'x',
    'ẋ': 'x',
    'Ý': 'y',
    'ý': 'y',
    'Ỳ': 'y',
    'ỳ': 'y',
    'Ŷ': 'y',
    'ŷ': 'y',
    'Y': 'y',
    'ẙ': 'y',
    'Ÿ': 'y',
    'ÿ': 'y',
    'Ỹ': 'y',
    'ỹ': 'y',
    'Ẏ': 'y',
    'ẏ': 'y',
    'Ȳ': 'y',
    'ȳ': 'y',
    'Ỷ': 'y',
    'ỷ': 'y',
    'Ỵ': 'y',
    'ỵ': 'y',
    'ʏ': 'y',
    'Ɏ': 'y',
    'ɏ': 'y',
    'Ƴ': 'y',
    'ƴ': 'y',
    'Ź': 'z',
    'ź': 'z',
    'Ẑ': 'z',
    'ẑ': 'z',
    'Ž': 'z',
    'ž': 'z',
    'Ż': 'z',
    'ż': 'z',
    'Ẓ': 'z',
    'ẓ': 'z',
    'Ẕ': 'z',
    'ẕ': 'z',
    'Ƶ': 'z',
    'ƶ': 'z',
    'Ȥ': 'z',
    'ȥ': 'z',
    'ʐ': 'z',
    'ʑ': 'z',
    'Ⱬ': 'z',
    'ⱬ': 'z',
    'Ǯ': 'z',
    'ǯ': 'z',
    'ƺ': 'z',
    // Roman fullwidth ascii equivalents: 0xff00 to 0xff5e
    '２': '2',
    '６': '6',
    'Ｂ': 'B',
    'Ｆ': 'F',
    'Ｊ': 'J',
    'Ｎ': 'N',
    'Ｒ': 'R',
    'Ｖ': 'V',
    'Ｚ': 'Z',
    'ｂ': 'b',
    'ｆ': 'f',
    'ｊ': 'j',
    'ｎ': 'n',
    'ｒ': 'r',
    'ｖ': 'v',
    'ｚ': 'z',
    '１': '1',
    '５': '5',
    '９': '9',
    'Ａ': 'A',
    'Ｅ': 'E',
    'Ｉ': 'I',
    'Ｍ': 'M',
    'Ｑ': 'Q',
    'Ｕ': 'U',
    'Ｙ': 'Y',
    'ａ': 'a',
    'ｅ': 'e',
    'ｉ': 'i',
    'ｍ': 'm',
    'ｑ': 'q',
    'ｕ': 'u',
    'ｙ': 'y',
    '０': '0',
    '４': '4',
    '８': '8',
    'Ｄ': 'D',
    'Ｈ': 'H',
    'Ｌ': 'L',
    'Ｐ': 'P',
    'Ｔ': 'T',
    'Ｘ': 'X',
    'ｄ': 'd',
    'ｈ': 'h',
    'ｌ': 'l',
    'ｐ': 'p',
    'ｔ': 't',
    'ｘ': 'x',
    '３': '3',
    '７': '7',
    'Ｃ': 'C',
    'Ｇ': 'G',
    'Ｋ': 'K',
    'Ｏ': 'O',
    'Ｓ': 'S',
    'Ｗ': 'W',
    'ｃ': 'c',
    'ｇ': 'g',
    'ｋ': 'k',
    'ｏ': 'o',
    'ｓ': 's',
    'ｗ': 'w'
  };
  var accentFold = (function (s) {
    if (!s) {
      return '';
    }

    var ret = '';

    for (var i = 0; i < s.length; i += 1) {
      ret += accentMap[s.charAt(i)] || s.charAt(i);
    }

    return ret;
  });

  var Search =
  /*#__PURE__*/
  function (_Plugin) {
    _inherits(Search, _Plugin);

    function Search() {
      _classCallCheck(this, Search);

      return _possibleConstructorReturn(this, _getPrototypeOf(Search).apply(this, arguments));
    }

    _createClass(Search, [{
      key: "init",
      value: function init() {
        var $input = this.$element.find('.form-control');
        var $cancel = this.$element.find(Search.buttons.cancel);
        $cancel.addClass('d-none');

        if ($input.val()) {
          $cancel.removeClass('d-none');
        }

        $input.on('input', function () {
          if ($input.val()) {
            $cancel.removeClass('d-none');
          } else {
            $cancel.addClass('d-none');
          }
        });
        $cancel.on('click', function () {
          $input.val('');
          $cancel.addClass('d-none');
        });

        if (!this.options.isSimple) {
          this.configureViewFilterBehavior();
        }
      }
    }, {
      key: "configureViewFilterBehavior",
      value: function configureViewFilterBehavior() {
        var _this = this;

        this.$element.find('.form-control').on('input', function (event) {
          var value = accentFold($(event.currentTarget).val());
          $(_this.options.scrappingClass).each(function (index, element) {
            var $element = $(element);
            $element.removeClass('d-none');

            if (accentFold($element.data(_this.options.scrappingValue)).search(new RegExp(value, 'gi')) === -1) {
              $element.addClass('d-none');
            }
          });

          _this.groupBehavior();
        }).end().find(Search.buttons.cancel).on('click', function () {
          $(_this.options.scrappingClass).each(function (index, element) {
            $(element).removeClass('d-none');

            _this.groupBehavior();
          });
        });
      }
    }, {
      key: "groupBehavior",
      value: function groupBehavior() {
        var _this2 = this;

        this.options.groups.forEach(function (group) {
          $(".search-not-found.not-found-".concat(group.substr(1))).toggleClass('not-found', $("".concat(_this2.options.scrappingClass).concat(group)).length === $("".concat(_this2.options.scrappingClass).concat(group, ".d-none")).length);
        });
      }
    }]);

    return Search;
  }(Plugin);

  _defineProperty(Search, "code", 'domSearch');

  _defineProperty(Search, "key", 'gl.search');

  _defineProperty(Search, "defaults", {
    scrappingValue: 'search-value',
    scrappingClass: '.searchable',
    groups: [],
    isSimple: false
  });

  _defineProperty(Search, "buttons", {
    cancel: '.dom-search-behavior-cancel',
    search: '.dom-search-behavior-search'
  });

  register(Search);

  var Contingency =
  /*#__PURE__*/
  function (_Plugin) {
    _inherits(Contingency, _Plugin);

    function Contingency() {
      _classCallCheck(this, Contingency);

      return _possibleConstructorReturn(this, _getPrototypeOf(Contingency).apply(this, arguments));
    }

    _createClass(Contingency, [{
      key: "init",
      value: function init() {
        var _this = this;

        this.update();
        var $body = $('body');
        var $close = this.$element.find('.contingency-behavior-close');
        $close.on('click', function () {
          localStorage.setItem(Contingency.storageKeyPaths.state, 'active');
          $body.addClass('contingency-closed');
        });
        $(document).on('click', '.contingency-behavior-open', function () {
          localStorage.removeItem(Contingency.storageKeyPaths.state);
          $body.removeClass('contingency-closed');

          _this.setOptions({
            active: true
          });
        });
        $(document).on('click', '.contingency-behavior-change', function (e) {
          e.preventDefault();
          var $index = $(e.currentTarget);

          _this.internalUpdate($index.data('target'));
        });
      } // eslint-disable-next-line class-methods-use-this

    }, {
      key: "internalUpdate",
      value: function internalUpdate(target) {
        $('.contingency-item').addClass('d-none');
        $(target).removeClass('d-none');
        $('.contingency-index .contingency-item').removeClass('d-none');
        $(".contingency-index ".concat(target)).addClass('d-none');
        localStorage.setItem(Contingency.storageKeyPaths.current, target);
      }
    }, {
      key: "update",
      value: function update() {
        var $body = $('body');

        if (this.options.active) {
          $body.addClass('contingency-active').toggleClass('contingency-closed', !!localStorage.getItem(Contingency.storageKeyPaths.state));
          this.internalUpdate(localStorage.getItem(Contingency.storageKeyPaths.current) || Contingency.defaults.current);
        } else {
          $body.removeClass('contingency-active');
        }
      }
    }]);

    return Contingency;
  }(Plugin);

  _defineProperty(Contingency, "code", 'contingency');

  _defineProperty(Contingency, "key", 'gl.contingency');

  _defineProperty(Contingency, "storageKey", 'gob.cl:contingency');

  _defineProperty(Contingency, "storageKeyPaths", {
    state: "".concat(Contingency.storageKey, ".state"),
    current: "".concat(Contingency.storageKey, ".current")
  });

  _defineProperty(Contingency, "defaults", {
    current: '.contingency-1'
  });

  register(Contingency);

  var Onboarding =
  /*#__PURE__*/
  function (_Plugin) {
    _inherits(Onboarding, _Plugin);

    function Onboarding() {
      _classCallCheck(this, Onboarding);

      return _possibleConstructorReturn(this, _getPrototypeOf(Onboarding).apply(this, arguments));
    }

    _createClass(Onboarding, [{
      key: "init",
      value: function init() {
        this.update();
        var $body = $('body');
        var $dismiss = this.$element.find('.onboarding-behavior-dismiss');
        $dismiss.on('click', function () {
          localStorage.setItem(Onboarding.storageKey, 'active');
          $body.addClass('onboarding-closed');
        });
      }
    }, {
      key: "update",
      value: function update() {
        var $body = $('body');

        if (this.options.active && !localStorage.getItem(Onboarding.storageKey)) {
          $body.addClass('onboarding-active');
        } else {
          $body.removeClass('onboarding-active');
        }
      }
    }]);

    return Onboarding;
  }(Plugin);

  _defineProperty(Onboarding, "code", 'onboarding');

  _defineProperty(Onboarding, "key", 'gl.onboarding');

  _defineProperty(Onboarding, "storageKey", 'gob.cl:onboarding');

  register(Onboarding);

  /**
   * Smooth Scroll
   */
  var smoothScroll = (function () {
    var $body = $('body');
    $('a[href*="#"]') // Remove links that don't actually link to anything
    .not('[href="#"]').not('[href="#0"]').not('.not-smooth').click(function (event) {
      // On-page links
      if (window.location.pathname.replace(/^\//, '') === event.currentTarget.pathname.replace(/^\//, '') && window.location.hostname === event.currentTarget.hostname) {
        // Figure out element to scroll to
        var $target = $(event.currentTarget.hash);
        $target = $target.length ? $target : $("[name=".concat(event.currentTarget.hash.slice(1), "]")); // Does a scroll target exist?

        if ($target.length) {
          // Only prevent default if animation is actually gonna happen
          var scrollMemory = $(document).scrollTop();
          window.location.hash = event.currentTarget.hash;
          $(document).scrollTop(scrollMemory);
          $('.scroll-item').each(function (i, item) {
            var $scrollItem = $(item);

            if ($scrollItem.data('active')) {
              if ($scrollItem.data('active') === 'parent') {
                $scrollItem.parent().removeClass('active');
              } else {
                $($scrollItem.data('active')).removeClass('active');
              }
            } else {
              $(item).removeClass('active');
            }
          });
          var selector = ".scroll-item[href*='".concat(window.location.hash, "']");
          var $scrollItem = $(selector);

          if ($scrollItem.data('active')) {
            if ($scrollItem.data('active') === 'parent') {
              $scrollItem.parent().addClass('active');
            } else {
              $($scrollItem.data('active')).addClass('active');
            }
          } else {
            $scrollItem.addClass('active');
          }

          $('html, body').stop().animate({
            scrollTop: $target.offset().top - parseInt($($body.data('main') ? $body.data('main') : 'body').css('margin-top'), 10) - parseInt($body.data('offset') || 10, 10)
          }, 500, function () {
            // Callback after animation
            // Must change focus!
            var $realTarget = $($target);
            $realTarget.focus();

            if ($target.is(':focus')) {
              // Checking if the target was focused
              return false;
            }

            $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable

            $target.focus(); // Set focus again

            $target.addClass('active');
            return true;
          });
        }
      }
    });

    if (window.location.hash && window.location.hash !== '#') {
      var $target = $(window.location.hash);
      $target = $target.length ? $target : $("[name=".concat(window.location.hash.slice(1), "]"));

      if ($target.length) {
        $('.scroll-item').each(function (i, item) {
          var $scrollItem = $(item);

          if ($scrollItem.data('active')) {
            if ($scrollItem.data('active') === 'parent') {
              $scrollItem.parent().removeClass('active');
            } else {
              $($scrollItem.data('active')).removeClass('active');
            }
          } else {
            $(item).removeClass('active');
          }
        });
        var selector = ".scroll-item[href*='".concat(window.location.hash, "']");
        var $scrollItem = $(selector);

        if ($scrollItem.data('active')) {
          if ($scrollItem.data('active') === 'parent') {
            $scrollItem.parent().addClass('active');
          } else {
            $($scrollItem.data('active')).addClass('active');
          }
        } else {
          $scrollItem.addClass('active');
        }

        $('html, body').stop().animate({
          scrollTop: $target.offset().top - parseInt($($body.data('main') ? $body.data('main') : 'body').css('margin-top'), 10)
        }, 500, function () {
          // Callback after animation
          // Must change focus!
          var $realTarget = $($target);
          $realTarget.focus();

          if ($target.is(':focus')) {
            // Checking if the target was focused
            return false;
          }

          $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable

          $target.focus(); // Set focus again

          return true;
        });
      }
    }
  });

  /**
   * cover background support with data-attribute data-background.
   */
  var coverBackground = (function () {
    $('[data-background]').each(function (i, item) {
      if (!$(item).data('background-video')) {
        var $background = $('<div/>').addClass('contain-cover-background');

        if ($(item).data('background')) {
          if ($(item).data('opacity') || !$(item).data('inline')) {
            $background.css('background-image', "url(\"".concat($(item).data('background'), "\")"));
          } else {
            $(item).css('background-image', "url(\"".concat($(item).data('background'), "\")"));
          }
        } else {
          $(item).addClass('none');
        }

        if ($(item).data('opacity')) {
          $(item).append($background).addClass('contain-cover contain-cover-opacity');

          if ($(item).data('hover-disabled')) {
            $(item).addClass('hover-disabled');
          }
        } else if ($(item).data('inline')) {
          $(item).addClass('contain-cover contain-cover-background');

          if ($(item).data('background')) {
            $(item).css('background-image', "url(\"".concat($(item).data('background'), "\")"));
          } else {
            $(item).addClass('none');
          }
        } else {
          $(item).append($background).addClass('contain-cover');
        }
      } else {
        var $video = $('<video/>', {
          autoplay: 'autoplay',
          loop: 'loop',
          muted: true,
          poster: $(item).data('background')
        }).append($('<source/>', {
          src: $(item).data('background-video')
        }));
        $video[0].muted = true; // fix muted bug.

        $(item).append($('<div/>').append($video).addClass('video-container'), $('<div/>').addClass('contain-cover-opacity hover-disabled')).addClass('contain-cover contain-cover-video');
      }
    });
  });

  /**
   * Redirect behavior
   *
   * data-target-active-class: class for target on redirect, default-show.
   * data-timeout: time for redirect
   * data-body-class: class for body on redirect, default redirecting-active.
   */
  function redirecting () {
    $(document).on('click', '.redirecting-behavior-link', function (e) {
      e.preventDefault();
      var $link = $(e.currentTarget);
      $($link.data('target')).addClass($link.data('target-active-class') || 'show');
      $('body').addClass($link.data('body-class') || 'redirecting-active');
      setTimeout(function () {
        window.location = $link.attr('href');
      }, parseInt($link.data('timeout'), 10) || 3000);
    });
  }

  /* global $, document, moment, templates */

  /**
   * createInifiniteScroll - This function generates a creator of an infinite scroll
   * @param {string} urlTemplate - a link for ajax request
   * @param {function} urlTransformation -  function that adds additional parameters
   * to a requestUrl (optional), should accept url as parameter and return a new url.
   * Will be used only at first call, after it we just use what server sends us a 'next'
   * @param {string} templateName - a pug template which will be used to render results from server
   * @param {string} targetSelector - a selector to an existing container
   * @param {function} postLoadingTransformation - a function that is caused in the end
   * of the procedure (optional)
   * @returns {function} - a function that creates an infinite scroll
   */
  var createInfiniteScroll = (function (urlTemplate, urlTransformation, templateName, targetSelector, postLoadingTransformation) {
    return function factory() {
      // adding additional parameter to a request using a function-parameter
      var requestUrl = urlTransformation ? urlTransformation(urlTemplate) : urlTemplate;
      var isAlreadySent = false;
      var blockFutureRequests = false;
      var $loadingIndicator = $('.loading-indicator');
      $loadingIndicator.hide();
      document.addEventListener('scroll', function () {
        // This checks prevent additional request while the already sent one is not resolved
        if (isAlreadySent) {
          return;
        }

        if (!$loadingIndicator.length) {
          return;
        } // Here we check if a loading indicator is inside our viewport. If it is true
        // We can call a request


        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height(); // we use parent of an indicator because hidden elements do not have a height
        // but their container still has

        var elemTop = $loadingIndicator.parent().offset().top;
        var elemBottom = elemTop + $loadingIndicator.height();
        var shouldLoadMore = elemBottom <= docViewBottom - 10 && elemTop >= docViewTop;

        if (shouldLoadMore && !blockFutureRequests) {
          isAlreadySent = true;
          $loadingIndicator.show();
          window.GobCl.closeReadSpeaker();
          $.ajax(requestUrl, {
            success: function success(response) {
              // Setting a link for a consequent request
              requestUrl = response.next || requestUrl;
              var currentLanguage = response.current_language; // transforming a publishing date to a readable format for all results

              var articles = response.results.map(function (article) {
                var format;

                if (currentLanguage === 'es') {
                  format = 'LL';
                } else if (currentLanguage === 'en') {
                  format = 'll';
                }

                moment.locale(currentLanguage);
                return _objectSpread({}, article, {
                  publishing_date: moment(article.publishing_date).format(format)
                });
              }); // Generating DOM using a pug-template

              var newContent = templates[templateName]({
                articles: articles,
                currentLanguage: currentLanguage
              }); // Appending it to a current container

              $(targetSelector).append(newContent);
              isAlreadySent = false;
              $loadingIndicator.hide(); // post loading transformatiom

              if (postLoadingTransformation) postLoadingTransformation(); // If no more articles is loaded we block this function forever

              if (response.results.length === 0) {
                blockFutureRequests = true;
              }
            }
          });
        }
      });
    };
  });

  /**
   * create application context
   * @returns {{closeReadSpeaker: closeReadSpeaker, createInfiniteScroll: Function}}
   */

  var createContext = (function () {
    return {
      closeReadSpeaker: function closeReadSpeaker() {
        $('.rsbtn_closer').click();
      },
      createInfiniteScroll: createInfiniteScroll
    };
  });

  window.GobCL = createContext();
  $(function () {
    // plugins.
    $('.toolbar').toolbar();
    $('.pseudo-background').pseudoBackground();
    $('.dom-search').domSearch();
    $('.simple-search').domSearch({
      isSimple: true
    });
    $('.contingency').contingency();
    $('.onboarding').onboarding(); // behaviors.

    smoothScroll();
    coverBackground();
    redirecting();
  });

}());
//# sourceMappingURL=gob.cl.js.map
