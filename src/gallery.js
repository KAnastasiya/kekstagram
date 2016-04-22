'use strict';

module.exports = {
  picturesGallery: new Gallery()
};

/**
 * Функция-конструктор для создания галереи
 * @constructor
 */
function Gallery() {
  var galleryContainer = document.querySelector('.gallery-overlay'),
    gallery = document.querySelector('.gallery-overlay-preview'),
    picture = document.querySelector('.gallery-overlay-image'),
    likes = document.querySelector('.likes-count'),
    comments = document.querySelector('.comments-count'),
    galleryPictures = [],
    currentPictureIndex = 0;

  /**
   * Показ галереи
   * @param  {Number}  pictureIndex  Индекс выбранной картинки
   */
  this.initGallery = function(pictureIndex) {
    galleryContainer.classList.remove('invisible');
    currentPictureIndex = pictureIndex;
    _showGalleryPicture();

    galleryContainer.addEventListener('click', _closeGallery);
    document.addEventListener('keydown', _closeGalleryByEscape);
  };

    /**
   * Получение списка картинок
   * @param  {Object}  picturesList  Список картинок
   */
  this.setPicturesList = function(picturesList) {
    galleryPictures = picturesList;
  };

  /**
   * Отрисовка в галерее информации о картинке
   */
  function _showGalleryPicture() {
    picture.src = galleryPictures[currentPictureIndex].url;
    comments.textContent = galleryPictures[currentPictureIndex].comments;
    likes.textContent = galleryPictures[currentPictureIndex].likes;
  }

  /**
   * Закрытие галереи
   */
  function _closeGallery() {
    galleryContainer.classList.add('invisible');
    galleryContainer.removeEventListener('click', _closeGallery);
    document.removeEventListener('keydown', _closeGalleryByEscape);
  }

  /**
   * Обработка нажатия на текущю картинку в галерее
   */
  function _showNextPicture(event) {
    event.stopPropagation();
    currentPictureIndex++;
    _showGalleryPicture();
  }

  /**
   * Обработка нажатия на клавишу Escape
   */
  function _closeGalleryByEscape(event) {
    if (event.keyCode === 27) {
      _closeGallery();
    }
  }

  gallery.addEventListener('click', _showNextPicture);
}
