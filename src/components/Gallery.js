'use strict';

module.exports = Gallery;

var BaseComponent = require('./BaseComponent'),
  utils = require('../common/utils');

/**
 * Функция-конструктор для создания галереи
 * @constructor
 * @param  {Element}  element  DOM-элемент, в котором располагается галерея
 */
function Gallery(element) {
  BaseComponent.call(this, element);
  this.galleryPictures = [];
  window.addEventListener('hashchange', this.onChangeGalleryState);
}

// Наследование объектов конструктора Gallery от "главного" DOM-элемента
utils.inherit(Gallery, BaseComponent);

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
 * @param  {Array}  pictureDataList  Список картинок
 */
Gallery.prototype.setGalleryPictures = function(pictureDataList) {
  this.galleryPictures = pictureDataList;
};

/**
 * Прототип конструктора Gallery. Управление состоянием галереи:
 * если в адресной строке присутствует hash, и он удовлетворяет
 * заданному шаблону, то галерея показывается; иначе галерея скрывается
 */
Gallery.prototype.onChangeGalleryState = function() {
  var HASH_REG_EXP = new RegExp(/#photos\/(\S+)/),
    currentHash = location.hash;

  if ( currentHash.match(HASH_REG_EXP) ) {
    this._showGallery(currentHash);
  } else {
    this._hideGallery();
  }
};

/**
 * Прототип конструктора Gallery. Показ галереи
 */
Gallery.prototype._showGallery = function(hash) {
  this._showGalleryPicture(hash.slice(1));
  this.galleryContainer.classList.remove('invisible');
  this.galleryContainer.addEventListener('click', this._onRemoveUrlHash);
  document.addEventListener('keydown', this._onRemoveUrlHashByEscape);
};

/**
 * Прототип конструктора Gallery. Отрисовка в галерее информации о картинке
 */
Gallery.prototype._showGalleryPicture = function(hash) {
  var currentPicture = this.galleryPictures.find(function(picture) {
    return picture.getImageUrl() === hash;
  });

  this.pictureContainer.src = currentPicture.getImageUrl();
  this.pictureIndex = this.galleryPictures.indexOf(currentPicture);
  this.pictureComments.textContent = currentPicture.getCommentsCount();
  this._changelikesIcon();

  this.pictureLikes.addEventListener('click', this._onChangeLikesCount);
  this.pictureContainer.addEventListener('click', this._onShowNextPicture, true);
};

/**
 * Прототип конструктора Gallery. Изменение количества лайков под картинкой
 * @param  {Object}  event  Событие
 */
Gallery.prototype._onChangeLikesCount = function(event) {
  event.stopPropagation();
  var updateLikesInPhoto = new CustomEvent('updateLikesInPhoto');
  this.galleryPictures[this.pictureIndex].toggleLikes();
  this._changelikesIcon();
  window.dispatchEvent(updateLikesInPhoto);
};

/**
 * Прототип конструктора Gallery. Управление внешним видом иконки
 */
Gallery.prototype._changelikesIcon = function() {
  var LIKED_ICON = 'likes-count-liked',
    currentPictureData = this.galleryPictures[this.pictureIndex];

  if ( currentPictureData.isLiked() ) {
    this.pictureLikes.classList.add(LIKED_ICON);
  } else {
    this.pictureLikes.classList.remove(LIKED_ICON);
  }

  this.pictureLikes.textContent = currentPictureData.getLikesCount();
};

/**
 * Прототип конструктора Gallery. Обработка нажатия на текущую картинку галереи
 * @param {Object}  event  Событие
 */
Gallery.prototype._onShowNextPicture = function(event) {
  event.stopPropagation();
  this.pictureIndex++;
  window.location.hash = this.galleryPictures[this.pictureIndex].getImageUrl();
};

/**
 * Прототип конструктора Gallery. Скрытие галереи
 */
Gallery.prototype._hideGallery = function() {
  this.galleryContainer.classList.add('invisible');
  this.galleryContainer.removeEventListener('click', this._onRemoveUrlHash);
  document.removeEventListener('keydown', this._onRemoveUrlHashByEscape);
};

/**
 * Прототип конструктора Gallery.Инициализация закрытия галерея путем
 * удаления hash из адресной строки
 */
Gallery.prototype._onRemoveUrlHash = function() {
  window.location.hash = '';
};

/**
 * Прототип конструктора Gallery. Инициализация закрытия галерея по
 * нажатию на клавишу Escape
 * @param {Object}  event  Событие
 */
Gallery.prototype._onRemoveUrlHashByEscape = function(event) {
  if (event.keyCode === 27) {
    this._onRemoveUrlHash();
  }
};
