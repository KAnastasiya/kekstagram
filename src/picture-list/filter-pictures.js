'use strict';

module.exports = {
  initializeFiltration: initializeFiltration,
  getFilteredPicturesByCurrentFilter: getFilteredPicturesByCurrentFilter
};

var renderPictures = require('./render-pictures');

/**
 * Поддерживаемые способы фильтрации
 * @constant
 * @type  {Object}
 */
var filters = {
  POPULAR: 'filter-popular',
  NEW: 'filter-new',
  DISCUSSED: 'filter-discussed'
};

/**
 * Фильтр по-умолчанию, то есть фильтр который устанавливается, если
 * ранее не был выбран никакой другой фильтр (в localStorage фильтр не сохранен)
 * @constant
 * @type  {String}
 */
var DEFAULT_FILTER = filters.POPULAR;

/**
 * Свойство localStorage,в котором хранится фильтр, примененный к
 * списку картинок
 * @constant
 * @type  {String}
 */
var PICTURES_FILTER_IN_STORAGE = 'picturesListFilter';

/**
 * Период от текущей даты в прошлое (в миллисекундах), картинки за
 * которые считаются новыми
 * @constant
 * @type  {Number}
 */
var NEW_PICTURES_DELTA = 14 * (24 * 60 * 60 * 1000);

var filtersContainer = document.querySelector('.filters'),
  filtersList = filtersContainer.querySelectorAll('.filters-radio'),
  currentFilter;

/**
 * Инициализация фильтрации
 * @param  {Object}  picturesList  Список картинок для фильтрации
 */
function initializeFiltration(picturesList) {
  _setFiltersEnabled(picturesList);
  _setFilterEnabled(picturesList);
  filtersContainer.classList.remove('hidden');
}

/**
 * Обработка события нажатия на фильтры
 * @param  {Object}  picturesList  Список картинок для фильтрации
 */
function _setFiltersEnabled(picturesList) {
  filtersContainer.addEventListener('click', function(event) {
    _setFilterInStorage(event.target.id);
    if (event.target.classList.contains('filters-radio')) {
      _setFilterEnabled(picturesList);
    }
  });
}

/**
 * Отрисовка отфильтрованного списка картинок
 * @param  {Object}  picturesList  Список картинок для фильтрации
 */
function _setFilterEnabled(picturesList) {
  // Определяем, какой фильтр применить. Если ранее какой-то фильр уже был
  // выбран, то нужно применить его. В противном случае установить фильтр
  // по умолчанию
  if (localStorage.hasOwnProperty(PICTURES_FILTER_IN_STORAGE)) {
    currentFilter = _getFilterFromStorage();
  } else {
    currentFilter = DEFAULT_FILTER;
  }

  renderPictures.renderPage( _getFilteredPictures(picturesList, currentFilter), 0, true );

  for (var j = 0; j < filtersList.length; j++) {
    filtersList[j].removeAttribute('checked');
  }
  filtersContainer.querySelector('#' + currentFilter).setAttribute('checked', 'true');
}

/**
 * Получение отфильтрованного списка картинок
 * @param   {Object}  picturesList  Исходный список картинок
 * @param   {String}  filter        Примененный фильтр
 * @return  {Object}                Отфильтрованный списк картинок
 */
function _getFilteredPictures(picturesList, filter) {
  var picturesToFilter = picturesList.slice();
  switch (filter) {
    case filters.NEW:
      return _getNewPictures(picturesToFilter);
    case filters.DISCUSSED:
      return _getDiscussedPictures(picturesToFilter);
    case filters.POPULAR:
    default:
      return picturesToFilter;
  }
}

/**
 * Фильтр "Новые". Получение списка картинок, загруженных за даты, более
 * поздние, чем минимально допустимая дата; сортировка этого списка по
 * убыванию дат
 * @param   {Object}  picturesToFilter  Список картинок, полученный от сервера
 * @return  {Object}                    Отфильтрованный список картинок
 */
function _getNewPictures(picturesToFilter) {
  var minDate = Date.now() - NEW_PICTURES_DELTA;

  var newPictures = picturesToFilter.filter(function(pictureData) {
    var pictureDate = new Date(pictureData.date).getTime();
    return pictureDate >= minDate;
  });

  picturesToFilter = newPictures.sort(function(a, b) {
    var pictureDate1 = new Date(a.date).getTime(),
      pictureDate2 = new Date(b.date).getTime();
    return pictureDate2 - pictureDate1;
  });

  return picturesToFilter;
}

/**
 * Фильтр "Обсуждаемые". Сортировка картинок по убыванию количества
 * комментариев к ним
 * @param   {Object}  picturesToFilter  Список картинок, полученный от сервера
 * @return  {Object}                    Список отсортированных картинок
 */
function _getDiscussedPictures(picturesToFilter) {
  picturesToFilter.sort(function(a, b) {
    return b.comments - a.comments;
  });
  return picturesToFilter;
}

/**
 * Сохранение выбранного фильтра в localStorage
 * @param  {String}  filter  Выбранный фильтр
 */
function _setFilterInStorage(filter) {
  localStorage.setItem(PICTURES_FILTER_IN_STORAGE, filter);
}

/**
 * Чтение выбранного фильтра из localStorage
 */
function _getFilterFromStorage() {
  return localStorage.getItem(PICTURES_FILTER_IN_STORAGE);
}

/**
 * Получение списка картинок, отфильтрованного согласно текущего фильтра
 * @param   {Object}    picturesList  Список отфильтрованных картинок
 * @return  {Function}
 */
function getFilteredPicturesByCurrentFilter(picturesList) {
  return _getFilteredPictures(picturesList, currentFilter);
}
