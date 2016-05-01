'use strict';

module.exports = PictureData;

var utils = require('../common/utils');

/**
 * Функция-конструктор, которая обеспечивет получение данных от сервера,
 * передачу этих данных (при необходимости) в других модулях программы, а
 * также получение обновленных данных из других модулей и обновление их
 * на сервере (!!!Я ХРАНЮ ВСЕ ИЗМЕНЕНИЯ ДАННЫХ В LOCALSTORAGE)
 * @constructor
 * @param  {Object}  data  Информация от сервера
 */
function PictureData(data) {
  utils.bindAllFunc(this);
  this.pictureData = data;
}

/**
 * Прототип конструктора PictureData. Получение адреса картини
 * @return  {String}  URL-картинки
 */
PictureData.prototype.getImageUrl = function() {
  return this.pictureData.url;
};

/**
 * Прототип конструктора PictureData. Получение числа комментариев к картинке
 * @return  {Number}  Количество комментариев
 */
PictureData.prototype.getCommentsCount = function() {
  return this.pictureData.comments;
};

/**
 * Прототип конструктора PictureData. Получение даты картинки
 * @return  {Date}  Дата картинки в миллисекундах
 */
PictureData.prototype.getPictureDateInMs = function() {
  return new Date(this.pictureData.date).getTime();
};

/**
 * Прототип конструктора PictureData. Получение числа лайков к картинке
 * @return  {Number}  Количество лайков
 */
PictureData.prototype.getLikesCount = function() {
  var localStorageLikes = this._getLocalStorageLikesKey();

  if ( this.isLiked() ) {
    return localStorage.getItem(localStorageLikes);
  } else {
    return this.pictureData.likes;
  }
};

/**
 * Прототип конструктора PictureData. Обновление количества лайков
 * при изменении состояния лайка к картинке в галерее
 */
PictureData.prototype.toggleLikes = function() {
  if (this.isLiked()) {
    this._unLikePicture();
  } else {
    this._likePicture();
  }
};

/**
 * Прототип конструктора PictureData. Установка лайка для картинки
 */
PictureData.prototype._likePicture = function() {
  localStorage.setItem(this._getLocalStorageLikesKey(), this.pictureData.likes + 1);
};

/**
 * Прототип конструктора PictureData. Удаление лайка для картинки
 */
PictureData.prototype._unLikePicture = function() {
  localStorage.removeItem(this._getLocalStorageLikesKey());
};

/**
 * Прототип конструктора PictureData. Формирование шаблона названий
 * свойст localStorage, хранящих новое количество лайков под картинками
 * @return  {String}  Шаблон названия свойств localStorage
 */
PictureData.prototype._getLocalStorageLikesKey = function() {
  return 'Likes for ' + this.pictureData.url;
};

/**
 * Прототип конструктора PictureData. Проверка того, лайкнула ли картинка
 * @return  {Boolean}
 */
PictureData.prototype.isLiked = function() {
  return ( localStorage.getItem( this._getLocalStorageLikesKey() ) ) ? true : false;
};
