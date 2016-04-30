'use strict';

module.exports = Photo;

var BaseComponent = require('./BaseComponent'),
  utils = require('../common/utils');

/**
 * Функция-конструктор для создания карточек с картинками
 * @constructor
 * @param  {Element}      templateElement  DOM-элемент с шаблоном для формирования карточки
 * @param  {PictureData}  pictureData      Информация о картинке для наполнения шаблона
 */
function Photo(templateElement, pictureData) {
  this.pictureData = pictureData;
  this._createPictureElement(templateElement);
  this._setPictureDataToElement();
  BaseComponent.call(this, this.element);

  // Обработчик события изменения лайка к картинке в галерее
  window.addEventListener('updateLikesInPhoto', this._syncLikesCountWithGallery);
}

// Наследование объектов конструктора Photo от "главного" DOM-элемента
utils.inherit(Photo, BaseComponent);

/**
 * Прототип конструктора Photo. Создaние карточки по шаблону
 * @param  {Element}  templateElement  DOM-элемент, содержащий шаблон
 */
Photo.prototype._createPictureElement = function(templateElement) {
  var pictureToClone;

  if ('content' in templateElement) {
    pictureToClone = templateElement.content.querySelector('.picture');
  } else {
    pictureToClone = templateElement.querySelector('.picture');
  }

  this.element = pictureToClone.cloneNode(true);
};

/**
 * Прототип конструктора Photo. Наполнение карточки
 */
Photo.prototype._setPictureDataToElement = function() {
  // Загрузка картинки
  var NO_IMAGE_CLASS = 'picture-load-failure',
    pictureImage = new Image(182, 182),
    pictureLoadTimeout;

  pictureImage.onload = function() {
    clearTimeout(pictureLoadTimeout);
    this.element.querySelector('img').src = pictureImage.src;
  }.bind(this);

  pictureImage.src = this.pictureData.getImageUrl();

  pictureImage.onerror = function() {
    this.element.classList.add(NO_IMAGE_CLASS);
  }.bind(this);

  pictureLoadTimeout = setTimeout( function() {
    pictureImage.src = '';
    this.element.classList.add(NO_IMAGE_CLASS);
  }.bind(this), 10000);

  // Добавление количества комментариев и лайков
  this.element.querySelector('.picture-likes').textContent = this.pictureData.getLikesCount();
  this.element.querySelector('.picture-comments').textContent = this.pictureData.getCommentsCount();
};

/**
 * Прототип конструктора Photo. Вставка карточки в свой контейнер.
 * Установка обработчиков событий
 * @param  {Element}  container  Элемент, в который нужно поместить карточку
 */
Photo.prototype.renderTo = function(container) {
  BaseComponent.prototype.renderTo.call(this, container);
  this.element.addEventListener('click', this._openGallery);
};

/**
 * Прототип конструктора Photo. Обработчик события нажатия на картинку
 * @param  {Object}  event  Событие
 */
Photo.prototype._openGallery = function(event) {
  event.preventDefault();
  window.location.hash = this.pictureData.getImageUrl();
};

/**
 * Прототип конструктора Photo. Изменение количества лайков в карточке
 * при изменении состояния лайка к картинке в галерее
 * @param  {Object}  event  Событие
 */
Photo.prototype._syncLikesCountWithGallery = function(event) {
  event.stopPropagation();
  this.element.querySelector('.picture-likes').textContent = this.pictureData.getLikesCount();
};

/**
 * Прототип конструктора Photo. Удаление DOM-элемента картинки.
 * Удаление обработчиков событий
 */
Photo.prototype.remove = function() {
  BaseComponent.prototype.remove.call(this);
  this.element.removeEventListener('click', this._openGallery);
};
