var $ = require('jquery');
var CoreView = require('backbone/core-view');
var utils = require('../helpers/utils');

var IMAGE_FILE_ATTRS = {
  width: '18px',
  height: '18px'
};

module.exports = CoreView.extend({
  initialize: function (opts) {
    if (!opts.imageClass) { throw new Error('Image class is mandatory.'); }

    this._imageClass = opts.imageClass;
    this._imageUrl = opts.imageUrl;
    this._color = opts.color;

    this._lastImage = {
      url: null,
      content: null
    };
  },

  render: function () {
    var self = this;
    var isSVG = this._isSVG(this._imageUrl);

    if (isSVG) {
      this._requestImage(this._imageUrl, function (content) {
        var svg = content.cloneNode(true);
        var $svg = $(svg);
        $svg = $svg.removeAttr('xmlns:a');
        $svg.attr('class', self._imageClass + ' js-image');

        for (var attribute in IMAGE_FILE_ATTRS) {
          $svg.attr(attribute, IMAGE_FILE_ATTRS[attribute]);
        }

        self.$el.empty().append($svg);

        $svg.css('fill', self._color);
        $svg.find('path').css('fill', 'inherit');
      });
    } else {
      var $img = $('<img crossorigin="anonymous"/>');
      $img.attr('class', self._imageClass + ' js-image');
      $img.attr('src', this._imageUrl + '?req=markup');

      for (var attribute in IMAGE_FILE_ATTRS) {
        $img.attr(attribute, IMAGE_FILE_ATTRS[attribute]);
      }

      this.$el.empty().append($img);
    }

    return this;
  },

  _requestImage: function (url, callback) {
    var self = this;
    var completeUrl = url + '?req=ajax';

    if (this._lastImage.url === completeUrl) {
      callback && callback(this._lastImage.content);
    } else {
      $.ajax(completeUrl)
      .done(function (data) {
        self._lastImage.url = completeUrl;
        var content = self._lastImage.content = data.getElementsByTagName('svg')[0];
        callback && callback(content);
      })
      .fail(function () {
        throw new Error("Couldn't get " + completeUrl + ' file.');
      });
    }
  },

  updateImageColor: function (color) {
    this.$('.js-image').css('fill', color);
  },

  _isSVG: function (url) {
    if (!url) {
      return false;
    }
    var noQueryString = url.split('?')[0];
    return noQueryString && utils.endsWith(noQueryString.toUpperCase(), 'SVG');
  }
});
