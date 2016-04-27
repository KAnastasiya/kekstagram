'use strict';

module.exports = Gallery;

var bindAllFunc = require('./bind-all-function');

/**
 * Функция-конструктор для создания галереи
 * @constructor
 */
function Gallery(element) {
  // Фиксация контекста
  bindAllFunc(this);

  this.galleryElement = element;
  this.galleryPictures = [];
  window.addEventListener('openPhotoInGallery', this._initGallery, true);
  this.galleryElement.addEventListener('click', this._showNextPicture);
}

/**
 * Прототип конструктора Gallery. Установка DOM-элемента, в котором находится галерея
 * @param  {Element}  galleryContainer  DOM-элемент, в котором находится галерея
 */
Gallery.prototype.setGalleryContainer = function(galleryContainer) {
  this.galleryContainer = galleryContainer;
};

/**
 * Прототип конструктора Gallery. Установка DOM-элементов,из которых состоят картинки галереи
 * @param  {Element}  pictureContainer  DOM-элемент,в котором отображается картинка
 * @param  {Element}  pictureLikes      DOM-элемент,в котором отображаются лайки к картинке
 * @param  {Element}  pictureComments   DOM-элемент,в котором отображаются комментарии к картинке
 */
Gallery.prototype.setGalleryPictureElements = function(pictureContainer, pictureLikes, pictureComments) {
  this.pictureContainer = pictureContainer;
  this.pictureLikes = pictureLikes;
  this.pictureComments = pictureComments;
};

/**
 * Прототип конструктора Gallery. Загрузка в галлерею списка картинок
 * @param  {Object}  pictureList  Список картинок
 */
Gallery.prototype.setGalleryPictures = function(pictureList) {
  this.galleryPictures = pictureList;
};

/**
 * Прототип конструктора Gallery. Показ галереи
 * @param  {Object}  event  Событие, вызвавшее срабаgalleryElementтывание обработчика
 */
Gallery.prototype._initGallery = function(event) {
  this.galleryContainer.classList.remove('invisible');
  this.pictureIndex = event.detail;
  this._showGalleryPicture();

  this.galleryContainer.addEventListener('click', this._closeGallery);
  document.addEventListener('keydown', this._closeGalleryByEscape);
};

/**
 * Прототип конструктора Gallery. Отрисовка в галерее информации о картинке
 */
Gallery.prototype._showGalleryPicture = function() {
  this.pictureContainer.src = this.galleryPictures[this.pictureIndex].url;
  this.pictureComments.textContent = this.galleryPictures[this.pictureIndex].comments;
  this.pictureLikes.textContent = this.galleryPictures[this.pictureIndex].likes;
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
  this.galleryContainer.classList.add('invisible');
  this.galleryContainer.removeEventListener('click', this._closeGallery);
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
