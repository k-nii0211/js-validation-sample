(function () {
  'use strict';

  function AppModel(attrs) {
    this.val = '';
    this.attrs = {
      required: attrs.required || false,
      maxlength: attrs.maxlength || 8,
      minlength: attrs.minlength || 4
    };
    this.listeners = {
      valid: [],
      invalid: []
    };
  }

  AppModel.prototype = {
    on: function (event, func) {
      this.listeners[event].push(func);
    },
    trigger: function (event) {
      var listener = this.listeners[event];
      for (var i = 0, length = listener.length; i < length; i++) {
        var func = listener[i];
        if (typeof func === 'function') {
          func();
        }
      }
    },
    set: function (val) {
      if (this.val !== val) {
        this.val = val;
        this.validate();
      }
    },
    validate: function () {
      this.errors = [];
      for (var key in this.attrs) {
        if (!this.attrs.hasOwnProperty(key)) {
          continue;
        }
        var val = this.attrs[key];
        if (!this[key](val)) {
          this.errors.push(key);
        }
      }
      this.trigger(!this.errors.length ? 'valid' : 'invalid');
    },
    required: function () {
      return this.val !== '';
    },
    maxlength: function (num) {
      return num >= this.val.length;
    },
    minlength: function (num) {
      return num <= this.val.length;
    }
  };

  function AppView(element) {
    this.initialize(element);
    this.handleEvents();
  }

  AppView.prototype = {
    initialize: function (element) {
      this.$element = $(element);
      this.$list = this.$element.next().children();
      var obj = this.$element.data();

      if (this.$element.prop('required')) {
        obj['required'] = true;
      }
      this.model = new AppModel(obj);
    },
    handleEvents: function () {
      var self = this;

      this.$element.on('keyup', function (event) {
        self.onKeyUp(event);
      });

      this.model.on('valid', function () {
        self.onValid();
      });

      this.model.on('invalid', function () {
        self.onInValid();
      });
    },
    onKeyUp: function (event) {
      var $target = $(event.currentTarget);
      this.model.set($target.val());
    },
    onValid: function () {
      this.$element.removeClass('error');
      this.$list.hide();
    },
    onInValid: function () {
      var self = this;
      this.$element.addClass('error');
      this.$list.hide();

      $.each(this.model.errors, function (index, val) {
        self.$list.filter('[data-error="' + val + '"]').show();
      });
    }
  };

  $('input').each(function () {
    new AppView(this);
  });
}());
