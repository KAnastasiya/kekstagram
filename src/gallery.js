'use strict';

module.exports = Gallery;

var bindAllFunc = require('./bind-all-function');

/**
 * Функция-конструктор для создания галереи
 * @constructor
 * @param  {Element}  element  DOM-элемент, в котором располагается галерея
 */
function Gallery(element) {
  bindAllFunc(this);

  this.galleryElement = element;
  this.galleryPictures = [];

  this.galleryElement.addEventListener('click', this._showNextPicture);
  window.addEventListener('hashchange', this.changeGalleryState);
}

/**
 * Прототип конструктора Gallery. Установка DOM-элемента, в котором находится галерея
 * @param  {Element}  container  DOM-элемент, в котором находится галерея
 */
Gallery.prototype.setGalleryContainer = function(container) {
  this.galleryContainer = container;
};

/**
 * Прототип конструктора Gallery. Установка DOM-элементов, которые являются
 * частями картинок галереи
 * @param  {Element}  container  Элемент,в котором отображается картинка
 * @param  {Element}  likes      Элемент,в котором отображаются лайки к картинке
 * @param  {Element}  comments   Элемент,в котором отображаются комментарии к картинке
 */
Gallery.prototype.setGalleryPictureElements = function(container, likes, comments) {
  this.pictureContainer = container;
  this.pictureLikes = likes;
  this.pictureComments = comments;
};

/**
 * Прототип конструктора Gallery. Загрузка в галлерею списка картинок
 * @param  {Object}  picturesList  Список картинок
 */
Gallery.prototype.setGalleryPictures = function(picturesList) {
  this.galleryPictures = picturesList;
};

/**
 * Прототип конструктора Gallery. Если в адресной строке присутствует hash,
 * то галерея открывается; иначе галерея закрывается
 */
Gallery.prototype.changeGalleryState = function() {
  var HASH_REG_EXP = new RegExp(/#photos\/(\S+)/),
    currentHash = location.hash;

  if ( currentHash.match(HASH_REG_EXP) ) {
    this._showGalleryPicture(currentHash.slice(1));
    this.galleryContainer.classList.remove('invisible');
    this.galleryContainer.addEventListener('click', this._closeGallery);
    document.addEventListener('keydown', this._closeGalleryByEscape);
  } else {
    this.galleryContainer.classList.add('invisible');
    this.galleryContainer.removeEventListener('click', this._closeGallery);
    document.removeEventListener('keydown', this._closeGalleryByEscape);
  }
};

/**
 * Прототип конструктора Gallery. Отрисовка в галерее информации о картинке
 */
Gallery.prototype._showGalleryPicture = function(hash) {
  var currentPicture = this.galleryPictures.find(function(picture) {
    return picture.url === hash;
  });

  this.pictureContainer.src = currentPicture.url;
  this.pictureComments.textContent = currentPicture.comments;
  this.pictureLikes.textContent = currentPicture.likes;
  this.pictureIndex = this.galleryPictures.indexOf(currentPicture);
};

/**
 * Прототип конструктора Gallery. Обработка нажатия на текущую картинку галереи
 * @param {Object}  event  Событие
 */
Gallery.prototype._showNextPicture = function(event) {
  event.stopPropagation();
  this.pictureIndex++;
  window.location.hash = this.galleryPictures[this.pictureIndex].url;
};

/**
 * Прототип конструктора Gallery. Закрытие галереи
 */
Gallery.prototype._closeGallery = function() {
  window.location.hash = '';
};

/**
 * Прототип конструктора Gallery. Обработка нажатия на клавишу Escape
 */
Gallery.prototype._closeGalleryByEscape = function(event) {
  if (event.keyCode === 27) {
    this._closeGallery();
  }
};
