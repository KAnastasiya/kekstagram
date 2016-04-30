'use strict';

module.exports = {
  initializeFiltration: initializeFiltration,
  getFilteredPicturesByCurrentFilter: getFilteredPicturesByCurrentFilter
};

var renderPictures = require('./render-pictures-list');

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
 * @param  {Array}  pictureDataList  Список картинок для фильтрации
 */
function initializeFiltration(pictureDataList) {
  _setFiltersEnabled(pictureDataList);
  _setFilterEnabled(pictureDataList);
  filtersContainer.classList.remove('hidden');
}

/**
 * Обработка события нажатия на фильтры
 * @param  {Array}  pictureDataList  Список картинок для фильтрации
 */
function _setFiltersEnabled(pictureDataList) {
  filtersContainer.addEventListener('click', function(event) {
    _setFilterInStorage(event.target.id);
    if (event.target.classList.contains('filters-radio')) {
      _setFilterEnabled(pictureDataList);
    }
  });
}

/**
 * Отрисовка отфильтрованного списка картинок
 * @param  {Array}  pictureDataList  Список картинок для фильтрации
 */
function _setFilterEnabled(pictureDataList) {
  // Определяем, какой фильтр применить. Если ранее какой-то фильр уже был
  // выбран, то нужно применить его. В противном случае установить фильтр
  // по умолчанию
  if (localStorage.hasOwnProperty(PICTURES_FILTER_IN_STORAGE)) {
    currentFilter = _getFilterFromStorage();
  } else {
    currentFilter = DEFAULT_FILTER;
  }

  renderPictures.renderPage( _getFilteredPictures(pictureDataList, currentFilter), 0, true );

  for (var j = 0; j < filtersList.length; j++) {
    filtersList[j].removeAttribute('checked');
  }
  filtersContainer.querySelector('#' + currentFilter).setAttribute('checked', 'true');
}

/**
 * Получение отфильтрованного списка картинок
 * @param   {Array}   pictureDataList  Список картинок для фильтрации
 * @param   {String}  filter           Примененный фильтр
 * @return  {Array}                   Отфильтрованный список картинок
 */
function _getFilteredPictures(pictureDataList, filter) {
  var picturesToFilter = pictureDataList.slice();
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
 * @param   {Array}  picturesToFilter  Список картинок для фильтрации
 * @return  {Array}                    Отфильтрованный список картинок
 */
function _getNewPictures(picturesToFilter) {
  var minDate = Date.now() - NEW_PICTURES_DELTA;

  var newPictures = picturesToFilter.filter(function(pictureData) {
    return pictureData.getPictureDateInMs() >= minDate;
  });

  picturesToFilter = newPictures.sort(function(a, b) {
    return b.getPictureDateInMs() - a.getPictureDateInMs();
  });

  return picturesToFilter;
}

/**
 * Фильтр "Обсуждаемые". Сортировка картинок по убыванию количества
 * комментариев к ним
 * @param   {Array}  picturesToFilter  Список картинок, полученный от сервера
 * @return  {Array}                    Список отсортированных картинок
 */
function _getDiscussedPictures(picturesToFilter) {
  picturesToFilter.sort(function(a, b) {
    return b.getCommentsCount() - a.getCommentsCount();
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
 * @param   {Array}     pictureDataList  Список отфильтрованных картинок
 * @return  {Function}
 */
function getFilteredPicturesByCurrentFilter(picturesDataList) {
  return _getFilteredPictures(picturesDataList, currentFilter);
}
