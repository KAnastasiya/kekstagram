'use strict';

module.exports = {
  showErrorMessage: showErrorMessage,
  hideErrorMessage: hideErrorMessage
};

var utilities = require('./picture-process-utilities');

/**
 * CSS-класс, стилизующий сообщения об ошибках обработки картинок
 * @constant
 * @type  {String}
 */
var ERROR_CLASS = 'upload-message-error';

var uploadMessage = document.querySelector('.upload-message'),
  uploadMessageContainer = uploadMessage.querySelector('.upload-message-container');

 /**
 * Обработчик ошибок. Отображение сообщений об ошибках
 * @param   {String}   action         Тип возникшей ошибки
 * @param   {String}   message        Текст сообщения об ошибке
 * @return  {Element}  uploadMessage  DOM-элемент сообщения об ошибке
 */
function showErrorMessage(action, message) {
  var isError = false;

  switch (action) {
    case 'uploading':
      message = message || 'Кексограмим&hellip;';
      break;
    case 'wrongFileFormat':
      isError = true;
      message = message || 'Неподдерживаемый формат файла<br> <a href="'
                           + document.location
                           + '">Попробовать еще раз</a>.';
      break;
    case 'resizeError':
    default:
      isError = true;
      message = message || 'Неверное значение поля';
      break;
  }

  uploadMessageContainer.innerHTML = message;
  utilities.showElement(uploadMessage);
  uploadMessage.classList.toggle(ERROR_CLASS, isError);
  return uploadMessage;
}

/**
 * Скрытие сообщения об ошибке
 */
function hideErrorMessage() {
  utilities.hideElement(uploadMessage);
}
