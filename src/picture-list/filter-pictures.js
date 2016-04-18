'use strict';

(function() {

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
   * Фильтр, устанавливаемый по умолчанию
   * @constant
   * @type  {String}
   */
  var DEFAULT_FILTER = filters.POPULAR;

  /**
   * Период от текущей даты в прошлое (в миллисекундах), картинки за
   * которые считаются новыми
   * @constant
   * @type  {Number}
   */
  var NEW_PICTURES_DELTA = 14 * (24 * 60 * 60 * 1000);

  /**
   * Текущий выбранный фильтр
   * @type  {String}
   */
  var currentFilter = DEFAULT_FILTER;

  var filtersContainer = document.querySelector('.filters'),
    filtersList = filtersContainer.querySelectorAll('.filters-radio');

  /**
   * Инициализация фильтрации
   * @param  {Object}  pictures  Список картинок для фильтрации
   */
  function initializeFiltration(picturesList) {
    setFiltersEnabled(picturesList);
    setFilterEnabled(picturesList, DEFAULT_FILTER);
    filtersContainer.classList.remove('hidden');
  }

  /**
   * Обработка события нажатия на фильтры
   */
  function setFiltersEnabled(pictureList) {
    filtersContainer.addEventListener('click', function(event) {
      currentFilter = event.target.id;
      if (event.target.classList.contains('filters-radio')) {
        setFilterEnabled(pictureList, currentFilter);
      }
    });
  }

  /**
   * Отрисовка отфильтрованного списка картинок
   * @param  {String}  filter  Выбранный фильтр
   */
  function setFilterEnabled(pictureList) {
    renderPictures.renderPage( getFilteredPictures(pictureList, currentFilter), 0, true );
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
  function getFilteredPictures(picturesList, filter) {
    var picturesToFilter = picturesList.slice();
    switch (filter) {
      case filters.NEW:
        return getNewPictures(picturesToFilter);
      case filters.DISCUSSED:
        return getDiscussedPictures(picturesToFilter);
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
  function getNewPictures(picturesToFilter) {
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
  function getDiscussedPictures(picturesToFilter) {
    picturesToFilter.sort(function(a, b) {
      return b.comments - a.comments;
    });
    return picturesToFilter;
  }

  /**
   * Получение списка картинок, отфильтрованного согласно текущего фильтра
   * @param   {Object}    picturesList  Список отфильтрованных картинок
   * @return  {Function}
   */
  function getFilteredPicturesByCurrentFilter(picturesList) {
    return getFilteredPictures(picturesList, currentFilter);
  }

})();
