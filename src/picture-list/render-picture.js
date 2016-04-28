'use strict';

module.exports = Photo;

var BaseComponent = require('../base-component'),
  utils = require('../utils');

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
 * Функция-конструктор для создания карточек с картинками
 * @constructor
 * @param  {Object}   picture  Информация о картинке
 */
function Photo(picture) {
  BaseComponent.call(this, _getPictureElement(picture));
  this.url = picture.url;
}

// Наследование объектов конструктора Photo от "главного" DOM-элемента
utils.inherit(Photo, BaseComponent);

/**
 * Прототип конструктора Photo. Вставка картинки в свой контейнер.
 * Установка обработчиков событий
 */
Photo.prototype.renderTo = function(container) {
  BaseComponent.prototype.renderTo.call(this, container);
  this.element.addEventListener('click', this._openGallery);
};

/**
 * Прототип конструктора Photo. Удаление DOM-элемента картинки.
 * Удаление обработчиков событий
 */
Photo.prototype.remove = function() {
  BaseComponent.prototype.remove.call(this);
  this.element.removeEventListener('click', this._openGallery);
};

/**
 * Прототип конструктора Photo. Обработчик события нажатия на картинку
 */
Photo.prototype._openGallery = function(event) {
  event.preventDefault();
  window.location.hash = this.url;
};

/**
 * Подготовка карточки картинки
 * @param   {Object}  picture      Информация о картинке
 * @return  {Object}               Карточка картинки
 */
function _getPictureElement(picture) {
  var element = pictureToClone.cloneNode(true),
    pictureImage = new Image(IMAGE_SIZE, IMAGE_SIZE),
    pictureLoadTimeout;

  element.querySelector('.picture-comments').textContent = picture.comments;
  element.querySelector('.picture-likes').textContent = picture.likes;

  pictureImage.onload = function() {
    clearTimeout(pictureLoadTimeout);
    element.querySelector('img').src = pictureImage.src;
  };

  pictureImage.onerror = function() {
    element.classList.add(FAILURE_CLASS);
  };

  pictureImage.src = picture.url;

  pictureLoadTimeout = setTimeout( function() {
    pictureImage.src = '';
    element.classList.add(FAILURE_CLASS);
  }, IMAGE_LOAD_TIMEOUT);

  return element;
}
