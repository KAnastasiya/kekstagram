'use strict';

module.exports = Gallery;

var bindAllFunc = require('./bind-all-function');

var galleryContainer = document.querySelector('.gallery-overlay'),
  galleryPictures = [];

/**
 * Функция-конструктор для создания галереи
 * @constructor
 */
function Gallery() {
  // Фиксация контекста
  bindAllFunc(this);

  var galleryElement = document.querySelector('.gallery-overlay-preview');

  window.addEventListener('openPhotoInGallery', this._initGallery, true);
  galleryElement.addEventListener('click', this._showNextPicture);
}

/**
 * Прототип конструктора Gallery. Загрузка в галлерею списка картинок
 * @param  {Object}  pictureList  Список картинок
 */
Gallery.prototype.setGalleryPictures = function(pictureList) {
  galleryPictures = pictureList;
};

/**
 * Прототип конструктора Gallery. Показ галереи
 * @param  {Object}  event  Событие, вызвавшее срабаgalleryElementтывание обработчика
 */
Gallery.prototype._initGallery = function(event) {
  galleryContainer.classList.remove('invisible');
  this.pictureIndex = event.detail;
  this._showGalleryPicture();

  galleryContainer.addEventListener('click', this._closeGallery);
  document.addEventListener('keydown', this._closeGalleryByEscape);
};

/**
 * Прототип конструктора Gallery. Отрисовка в галерее информации о картинке
 */
Gallery.prototype._showGalleryPicture = function() {
  var picture = document.querySelector('.gallery-overlay-image'),
    likes = document.querySelector('.likes-count'),
    comments = document.querySelector('.comments-count');

  picture.src = galleryPictures[this.pictureIndex].url;
  comments.textContent = galleryPictures[this.pictureIndex].comments;
  likes.textContent = galleryPictures[this.pictureIndex].likes;
};

/**
 * Прототип конструктора Gallery. Обработка нажатия на текущую картинку в галерее
 */
Gallery.prototype._showNextPicture = function(event) {
  event.stopPropagation();
  this.pictureIndex++;
  this._showGalleryPicture();
};

/**
 * Прототип конструктора Gallery. Закрытие галереи
 */
Gallery.prototype._closeGallery = function() {
  galleryContainer.classList.add('invisible');
  galleryContainer.removeEventListener('click', this._closeGallery);
  document.removeEventListener('keydown', this._closeGalleryByEscape);
};

/**
 * Прототип конструктора Gallery. Обработка нажатия на клавишу Escape
 */
Gallery.prototype._closeGalleryByEscape = function(event) {
  if (event.keyCode === 27) {
    this._closeGallery();
  }
};
