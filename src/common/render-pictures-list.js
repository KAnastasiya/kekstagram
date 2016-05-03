'use strict';

module.exports = {
  renderPage: renderPage,
  renderNextPageIfNeeded: renderNextPageIfNeeded,
  loadingIsProgress: loadingIsProgress,
  endLoading: endLoading,
  showLoadingError: showLoadingError
};

var Photo = require('../components/Photo'),
  Gallery = require('../components/Gallery');

/**
 * Размер страницы с картинками (число картинок, помещаемых на одной странице)
 * @constant
 * @type  {Number}
 */
var PAGE_SIZE = 12;

/**
 * CSS-класс, отрисовующий индикатор загрузки картинок
 * @constant
 * @type  {String}
 */
var LOADING_CLASS = 'pictures-loading';

/**
 * CSS-класс, стилизующий сообщения об ошибках загрузки данных с сервера
 * @constant
 * @type  {String}
 */
var FAILURE_CLASS = 'pictures-failure';

/**
 * Номер страницы с картинками. Отрисовка начинается с первой (нулевой) страницы
 * @type  {Number}
 */
var pageNumber = 0;

var picturesContainer = document.querySelector('.pictures'),
  renderedPictures = [];

/**
 * Создание и наполнение объекта "Галерея"
 */
var gallery = new Gallery(document.querySelector('.gallery-overlay-preview')),
  galleryPictureElement = document.querySelector('.gallery-overlay-image'),
  galleryPictureLikes = document.querySelector('.likes-count'),
  galleryPictureComments = document.querySelector('.comments-count');

gallery.setGalleryContainer(document.querySelector('.gallery-overlay'));
gallery.setGalleryPictureElements(galleryPictureElement, galleryPictureLikes, galleryPictureComments);

/**
 * Отрисовка списка картинок выбранной страницы
 * @param  {Array}    pictureDataList  Список картинок, полученный с сервера
 * @param  {Number}   pageNum          Номер страницы
 * @param  {Boolean}  replace          Признак необходимости очистки списка
 *                                     ранее отрисованных картинок
 */
function renderPage(pictureDataList, pageNum, replace) {
  var from = pageNum * PAGE_SIZE,
    to = from + PAGE_SIZE;

  // Контейнер-обертка для вставки списка картинок. Используется
  // для быстрой вставки списка картинок в DOM. Автоматически будет
  // удален после вставки картинок
  var fragment = document.createDocumentFragment();

  pageNumber = pageNum;

  // Предварительная очистка содержимого страницы. Используется при
  // отрисовке отфильтрованных списков
  if (replace) {
    renderedPictures.forEach(function(photo) {
      photo.remove();
    });
    renderedPictures = [];
  }

  // Получение информации о каждой картинке и вставка картинок в fragment
  pictureDataList.slice(from, to).forEach(function(pictureData) {
    var photo = new Photo(document.querySelector('#picture-template'), pictureData);
    photo.renderTo(fragment);
    renderedPictures.push(photo);
  });

  // Отрисовка картинок (их вставка в DOM)
  picturesContainer.appendChild(fragment);

  renderNextPageIfNeeded(pictureDataList);
  gallery.setGalleryPictures(pictureDataList);
  gallery.onChangeGalleryState();
}

/**
 * Проверка на наличие следующей страницы с картинками и на необходимость ее отрисовки
 * @param  {Array}  pictureDataList  Список картинок
 */
function renderNextPageIfNeeded(pictureDataList) {
  if (_isBottomReached() && _isNextPageAvailable(pictureDataList)) {
    pageNumber++;
    renderPage(pictureDataList, pageNumber);
  }
}

/**
 * Проверка на наличие страниц с картинками, следующих за текущей страницей
 * @param   {Array}   pictureDataList  Список картинок
 * @return  {Boolean}                  Признак наличия следующей страницы
 */
function _isNextPageAvailable(pictureDataList) {
  return pageNumber < Math.floor(pictureDataList.length / PAGE_SIZE);
}

/**
 * Проверка на достижение конца (низа) текущей страницы с картинками
 * @return  {Boolean}  Признак достижения конца страницы
 */
function _isBottomReached() {
  var pageElements = document.querySelectorAll('.picture'),
    lastPageElement = pageElements[pageElements.length - 1],
    lastPageElementPosition = lastPageElement.getBoundingClientRect();

  return lastPageElementPosition.top <= window.innerHeight;
}

/**
 * Показ индикации процесса загрузки данных
 */
function loadingIsProgress() {
  picturesContainer.classList.add(LOADING_CLASS);
}

/**
 * Скрытие индикации процесса загрузки данных
 */
function endLoading() {
  picturesContainer.classList.remove(LOADING_CLASS);
}

/**
 * Обработка ошибок при загрузке данных с сервера
 */
function showLoadingError() {
  endLoading();
  picturesContainer.classList.add(FAILURE_CLASS);
}
