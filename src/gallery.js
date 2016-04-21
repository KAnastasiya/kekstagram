'use strict';

module.exports = {
  openGallery: openGallery,
  getPicturesList: getPicturesList
};

var galleryContainer = document.querySelector('.gallery-overlay'),
  gallery = document.querySelector('.gallery-overlay-preview'),
  picture = document.querySelector('.gallery-overlay-image'),
  likes = document.querySelector('.likes-count'),
  comments = document.querySelector('.comments-count'),
  galleryPictures = [],
  currentPictureIndex = 0;

gallery.addEventListener('click', _onPhotoClick);

/**
 * Получение списка картинок
 * @param  {Object}  picturesList  Список картинок
 * @return {Object}                Список картинок
 */
function getPicturesList(picturesList) {
  galleryPictures = picturesList;
  return galleryPictures;
}

/**
 * Показ галереи
 * @param   {String}  pictureIndex  Номер выбранной картинки
 */
function openGallery(pictureIndex) {
  currentPictureIndex = pictureIndex;
  galleryContainer.classList.remove('invisible');
  _showGalleryPicture();

  galleryContainer.addEventListener('click', _onGalleryContainerClick);
  document.addEventListener('keydown', _onDocumentKeyDown);
}

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
  galleryContainer.removeEventListener('click', _onGalleryContainerClick);
  document.removeEventListener('keydown', _onDocumentKeyDown);
}

/**
 * Обработка нажатия на текущю картинку в галерее
 */
function _onPhotoClick(event) {
  event.stopPropagation();
  currentPictureIndex++;
  _showGalleryPicture();
}

/**
 * Обработка нажатия на область вокруг формы галереи
 */
function _onGalleryContainerClick() {
  _closeGallery();
}

/**
 * Обработка нажатия на клавишу Escape
 */
function _onDocumentKeyDown(event) {
  if(event.keyCode === 27) {
    _closeGallery();
  }
}
