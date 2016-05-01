'use strict';

module.exports = {
  showResizer: showResizer,
  initResizer: initResizer
};

var uploadPicture = require('./upload-picture'),
  retouchPicture = require('./retouch-picture'),
  utilities = require('./utils'),
  errors = require('./errors'),
  Resizer = require('../components/Resizer');

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
  currentResizer = new Resizer(fileReader.result);
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
 * Обработчик изменения значений полей формы кадрирования
 */
function _onFormInput() {
  var errorMessage = _validateResizeForm();

  if (errorMessage) {
    errors.showErrorMessage('resizeError', errorMessage);
    resizeSubmitButton.disabled = true;
  } else {
    _setFormSubmitEnabled();
    currentResizer.setConstraint(+resizeLeft.value, +resizeTop.value, +resizeSide.value);
  }
}

/**
 * Активация возможности отправки формы
 */
function _setFormSubmitEnabled() {
  errors.hideErrorMessage();
  resizeSubmitButton.disabled = false;
}

/**
 * Сохранение кадрирования картинки. Переход к ретушированию картинки
 */
function _onFormSubmit(event) {
  event.preventDefault();
  _hideResizer();
  retouchPicture.initRetouch(currentResizer.exportImage().src);
}

/**
 * Сброс кадрирования картинки. Возврат к загрузке картинки
 */
function _onFormReset(event) {
  event.preventDefault();
  _hideResizer();
  _setFormSubmitEnabled();
  uploadPicture.showUpload();
}

/**
 * Подстановка размеров области кадрирования в поля формы кадрирования
 */
function _onResizerChange() {
  var constraint = currentResizer.getConstraint();
  resizeLeft.value = constraint.x;
  resizeTop.value = constraint.y;
  resizeSide.value = constraint.side;
}

//Навешивание обработчиков событий
resizeForm.addEventListener('input', _onFormInput);
resizeForm.addEventListener('submit', _onFormSubmit);
resizeForm.addEventListener('reset', _onFormReset);
window.addEventListener('resizerchange', _onResizerChange);
