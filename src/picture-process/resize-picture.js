'use strict';

module.exports = {
  showResizer: showResizer,
  initResizer: initResizer
};

var uploadPicture = require('./upload-picture'),
  retouchPicture = require('./retouch-picture'),
  utilities = require('./picture-process-utilities'),
  errors = require('./picture-process-errors');

var currentResizer,
  resizeForm = document.forms['upload-resize'],
  resizeLeft = document.querySelector('#resize-x'),
  resizeTop = document.querySelector('#resize-y'),
  resizeSide = document.querySelector('#resize-size'),
  resizeSubmitButton = document.querySelector('#resize-fwd');

/**
 * Инициализация формы кадрирования
 * @param  {Object}  fileReader  Загруженная картинка
 */
function initResizer(fileReader) {
  if (currentResizer) {
    currentResizer.remove();
    currentResizer = null;
  }
  currentResizer = new window.Resizer(fileReader.result);
  currentResizer.setElement(resizeForm);
  showResizer();
}

/**
 * Отображение формы кадрирования
 */
function showResizer() {
  utilities.showElement(resizeForm);
}

/**
 * Скрытие формы кадрирования
 */
function _hideResizer() {
  utilities.hideElement(resizeForm);
}

/**
 * Подстановка размеров области кадрирования в поля формы кадрирования
 */
window.addEventListener('resizerchange', function() {
  var constraint = currentResizer.getConstraint();
  resizeLeft.value = constraint.x;
  resizeTop.value = constraint.y;
  resizeSide.value = constraint.side;
});

/**
 * Обработчик изменения значений полей формы кадрирования
 */
resizeForm.addEventListener('input', function resizeOnInput() {
  var errorMessage = _validateResizeForm();

  if (errorMessage) {
    errors.showErrorMessage('resizeError', errorMessage);
    resizeSubmitButton.disabled = true;
  } else {
    errors.hideErrorMessage();
    resizeSubmitButton.disabled = false;
    currentResizer.setConstraint(+resizeLeft.value, +resizeTop.value, +resizeSide.value);
  }
});

/**
 * Проверка формы кадрирования на корректность заполнения
 * @return  {String}  Текст сообщения об ошибке
 */
function _validateResizeForm() {
  var maxPictureWidth = currentResizer._image.naturalWidth,
    maxPictureHeight = currentResizer._image.naturalHeight,
    resizeLeftValue = +resizeLeft.value,
    resizeTopValue = +resizeTop.value,
    resizeSideValue = +resizeSide.value,
    errorMessage = '';

  if (resizeLeftValue < 0 || resizeTopValue < 0 || resizeSideValue < 0) {
    errorMessage = 'Значение поля должно быть положительный';
  } else if (resizeLeftValue + resizeSideValue > maxPictureWidth
      || resizeTopValue + resizeSideValue > maxPictureHeight) {
    errorMessage = 'Кадрированное изображение должно находиться в пределах исходного изображения';
  } else if (resizeLeft.validity.invalid || resizeTop.validity.invalid || resizeSide.validity.invalid) {
    errorMessage = 'Неверное значение поля';
  }

  return errorMessage;
}

/**
 * Сохранение кадрирования картинки. Переход к ретушированию картинки
 */
resizeForm.addEventListener('submit', function(event) {
  event.preventDefault();
  _hideResizer();
  retouchPicture.initRetouch(currentResizer.exportImage().src);
});

/**
 * Сброс кадрирования картинки. Возврат к загрузке картинки
 */
resizeForm.addEventListener('reset', function(event) {
  event.preventDefault();
  _hideResizer();
  uploadPicture.showUpload();
  errors.hideErrorMessage();
});
