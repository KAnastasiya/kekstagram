'use strict';

module.exports = {
  showUpload: showUpload
};

var resizePicture = require('./resize-picture'),
  utilities = require('./utils'),
  errors = require('./errors');

/**
 * Поддерживаемые форматы картинок
 * @type  {Object}
 */
var FileType = {
  'GIF': '',
  'JPEG': '',
  'PNG': '',
  'SVG+XML': ''
};

/**
 * Регулярное выражение, проверяющее тип загружаемого файла.
 * Составляется из ключей FileType.
 * @type {RegExp}
 */
var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

var uploadForm = document.forms['upload-select-image'];

/**
 * Отображение формы загрузки картинки
 */
function showUpload() {
  utilities.showElement(uploadForm);
  utilities.updateUploadFormBackground();
}

/**
 * Загрузка картинки. Если загруженный файл является изображением,
 * отображается форма кадрирования с соответствующей картинкой.
 * Иначе отображается сообщение об ошибке
 */
uploadForm.addEventListener('change', function(event) {
  var element = event.target;
  if (element.id === 'upload-file') {
    if (fileRegExp.test(element.files[0].type)) {
      var fileReader = new FileReader();

      errors.showErrorMessage('uploading');

      fileReader.addEventListener('load', function() {
        utilities.hideElement(uploadForm);
        errors.hideErrorMessage();
        resizePicture.initResizer(fileReader);
      });

      fileReader.readAsDataURL(element.files[0]);
    } else {
      errors.showErrorMessage('wrongFileFormat');
    }
  }
});
