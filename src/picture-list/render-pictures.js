'use strict';

module.exports = {
  renderPage: renderPage,
  renderNextPageIfNeeded: renderNextPageIfNeeded,
  loadingIsProgress: loadingIsProgress,
  endLoading: endLoading,
  showLoadingError: showLoadingError
};

var renderPicture = require('./render-picture');

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
 * Номер страницы с картинками по умолчанию. Отрисовка начинается
 * с первой (нулевой) страницы
 * @type  {Number}
 */
var pageNumber = 0;

var picturesContainer = document.querySelector('.pictures');

/**
 * Отрисовка списка картинок выбранной страницы
 * @param  {Object}   pictureList  Список картинок, полученный с сервера
 * @param  {Boolean}  replace      Признак необходимости очистки списка
 *                                 ранее отрисованных картинок
 */
function renderPage(pictureList, pageNum, replace) {
  var from = pageNum * PAGE_SIZE,
    to = from + PAGE_SIZE;

  pageNumber = pageNum;

  // Предварительная очистка содержимого страницы. Используется при
  // отрисовке отфильтрованных списков
  if (replace) {
    picturesContainer.innerHTML = '';
  }

  // Получение информации о каждой картинке и их отрисовка
  pictureList.slice(from, to).forEach(function(picture) {
    var element = renderPicture.getPictureElement(picture);
    picturesContainer.appendChild(element);
  });

  renderNextPageIfNeeded(pictureList);
}

/**
 * Проверка на наличие следующей страницы с картинками и на необходимость ее отрисовки
 * @param  {Object}  pictureList  Список картинок
 */
function renderNextPageIfNeeded(pictureList) {
  if (_isBottomReached() && _isNextPageAvailable(pictureList)) {
    pageNumber++;
    renderPage(pictureList, pageNumber);
  }
}

/**
 * Проверка на наличие страниц с картинками, следующих за текущей страницей
 * @param   {Object}   pictures  Список картинок
 * @return  {Boolean}            Признак наличия следующей страницы
 */
function _isNextPageAvailable(picturesList) {
  return pageNumber < Math.floor(picturesList.length / PAGE_SIZE);
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
