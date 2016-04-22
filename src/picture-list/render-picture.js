'use strict';

module.exports = {
  Photo: Photo
};

var gallery = require('../gallery');

/**
 * Размер картинки (и ширина, и высота)
 * @constant
 * @type  {Number}
 */
var IMAGE_SIZE = 182;

/**
 * Таймаут загрузки изображения картинки
 * @constant
 * @type  {Number}
 */
var IMAGE_LOAD_TIMEOUT = 10000;

/**
 * CSS-класс, сообщающий, что изображение картинки загрузить не удалось
 * @constant
 * @type  {String}
 */
var FAILURE_CLASS = 'picture-load-failure';

/**
 * Шаблон контента карточки картинки
 * @type  {Element}
 */
var pictureTemplate = document.querySelector('#picture-template');

/**
 * Контент шаблона карточки клиента
 */
var pictureToClone;

// Обеспечение кроссбраузерной шаблонизации
if ('content' in pictureTemplate) {
  pictureToClone = pictureTemplate.content.querySelector('.picture');
} else {
  pictureToClone = pictureTemplate.querySelector('.picture');
}

/**
 * Подготовка карточки картинки
 * @param   {Object}  data         Информация о картинке
 * @return  {Object}               Карточка картинки
 */
function _getPictureElement(data) {
  var element = pictureToClone.cloneNode(true),
    pictureImage = new Image(IMAGE_SIZE, IMAGE_SIZE),
    pictureLoadTimeout;

  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  pictureImage.onload = function() {
    clearTimeout(pictureLoadTimeout);
    element.querySelector('img').src = pictureImage.src;
  };

  pictureImage.onerror = function() {
    element.classList.add(FAILURE_CLASS);
  };

  pictureImage.src = data.url;

  pictureLoadTimeout = setTimeout( function() {
    pictureImage.src = '';
    element.classList.add(FAILURE_CLASS);
  }, IMAGE_LOAD_TIMEOUT);

  return element;
}

/**
 * Функция-конструктор для создания карточек с картинками
 * @constructor
 * @param  {Object}   data         Информация о картинке
 * @param  {Element}  container    Элемент, в который будет загружаться картинка
 * @param  {Object}   pictureList  Список картинок
 */
function Photo(data, container, pictureList) {
  var self = this;

  this.data = data;
  this.element = _getPictureElement(this.data);
  this.index = pictureList.indexOf(this.data);
  container.appendChild(this.element);

  this.element.addEventListener('click', function(event) {
    self._onPictureClick(event);
  });
}

/**
 * Прототип конструктора Photo. Обработчик события нажатия на картинку
 * @param   {Object}  event  Событие, вызвавшее срабатывание обработчика
 */
Photo.prototype._onPictureClick = function(event) {
  event.preventDefault();
  gallery.picturesGallery.openGallery(this.index);
};

/**
 * Прототип конструктора Photo. Удаление всех обработчиков событий
 */
Photo.prototype.remove = function() {
  this.element.removeEventListener('click', this._onPictureClick);
  this.element.parentNode.removeChild(this.element);
};
