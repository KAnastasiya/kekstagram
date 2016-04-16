'use strict';

var picturesContainer = document.querySelector('.pictures'),
  filtersContainer = document.querySelector('.filters'),
  filtersList = filtersContainer.querySelectorAll('.filters-radio'),
  pictureTemplate = document.querySelector('#picture-template'),
  pictureToClone,
  pictures = [],
  pageNumber = 0,
  PICTURES_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json',
  IMAGE_SIZE = 182,
  SERVER_TIMEOUT = 10000,
  NEW_PICTURES_DELTA = 14 * 24 * 60 * 60 * 1000,
  PAGE_SIZE = 12,
  SCROLL_TIMEOUT = 100;

/**
 * Поддерживаемые способы фильтрации
 * @type {Object}
 */
var filters = {
  POPULAR: 'filter-popular',
  NEW: 'filter-new',
  DISCUSSED: 'filter-discussed'
};

/**
 * Фильтр, устанавливаемый сразу при загрузке сайта
 * @type {String}
 */
var DEFAULT_FILTER = filters.POPULAR;

/**
 * Текущий выбранный фильтр
 * @type {String}
 */
var currentFilter = DEFAULT_FILTER;

// Обеспечение кроссбраузерной шаблонизации
if ('content' in pictureTemplate) {
  pictureToClone = pictureTemplate.content.querySelector('.picture');
} else {
  pictureToClone = pictureTemplate.querySelector('.picture');
}

/**
 * Обработка ошибок взаимодействия с сервером
 */
function onAjaxError() {
  picturesContainer.classList.remove('pictures-loading');
  picturesContainer.classList.add('pictures-failure');
}

/**
 * Загрузка картинок и информации о них с сервера
 * @param  {Function} callback
 */
var getPictures = function(callback) {
  var xhr = new XMLHttpRequest();

  picturesContainer.classList.add('pictures-loading');

  xhr.onload = function(event) {
    var loadedData = JSON.parse(event.target.response);
    picturesContainer.classList.remove('pictures-loading');
    callback(loadedData);
  };

  xhr.onerror = onAjaxError;

  xhr.timeout = SERVER_TIMEOUT;
  xhr.ontimeout = onAjaxError;

  xhr.open('GET', PICTURES_LOAD_URL);
  xhr.send();
};

/**
 * Разбор и отрисовка информации об одной картинке
 * @param  {Object} data  Информация о картинке
 */
var getPictureElement = function(data) {
  var element = pictureToClone.cloneNode(true),
    pictureImage = new Image(IMAGE_SIZE, IMAGE_SIZE),
    pictureLoadTimeout;

  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;
  picturesContainer.appendChild(element);

  pictureImage.onload = function() {
    clearTimeout(pictureLoadTimeout);
    element.querySelector('img').src = pictureImage.src;
  };

  pictureImage.onerror = function() {
    element.classList.add('picture-load-failure');
  };

  pictureImage.src = data.url;

  pictureLoadTimeout = setTimeout( function() {
    pictureImage.src = '';
    element.classList.add('picture-load-failure');
  }, SERVER_TIMEOUT);
};

/**
 * Фильтр "Новые". Получение списка картинок, загруженных за даты, более
 * поздние, чем минимально допустимая дата; сортировка этого списка по
 * убыванию дат
 * @param  {Object} picturesToFilter  Список картинок, полученный от сервера
 * @return {Object}                   Отфильтрованный список картинок
 */
var getNewPictures = function(picturesToFilter) {
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
};

/**
 * Фильтр "Обсуждаемые". Сортировка картинок по убыванию количества
 * комментариев к ним
 * @param  {Object} picturesToFilter  Список картинок, полученный от сервера
 * @return {Object}                   Список отсортированных картинок
 */
var getDiscussedPictures = function(picturesToFilter) {
  picturesToFilter.sort(function(a, b) {
    return b.comments - a.comments;
  });
  return picturesToFilter;
};

/**
 * Фильтрация списка картинок, согласно выбранного типа
 * @param  {Object} picturesList  Исходный список картинок
 * @param  {String} filter        Примененный фильтр
 * @return {Object}               Отфильтрованный списк картинок
 */
var getFilteredPictures = function(picturesList, filter) {
  var picturesToFilter = picturesList.slice();
  switch (filter) {
    case filters.NEW:
      return getNewPictures(picturesToFilter);
    case filters.DISCUSSED:
      return getDiscussedPictures(picturesToFilter);
    case filter.POPULAR:
    default:
      return picturesToFilter;
  }
};

/**
 * Обработка события нажатия на фильтры
 */
var setFiltersEnabled = function() {
  filtersContainer.addEventListener('click', function(event) {
    currentFilter = event.target.id;
    if (event.target.classList.contains('filters-radio')) {
      setFilterEnabled(currentFilter);
    }
  });
};

/**
 * Отрисовка отфильтрованного списка картинок
 * @param {String} filter  Выбранный фильтр
 */
var setFilterEnabled = function() {
  pageNumber = 0;
  renderPage( getFilteredPictures(pictures, currentFilter), true );
  for (var j = 0; j < filtersList.length; j++) {
    filtersList[j].removeAttribute('checked');
  }
  filtersContainer.querySelector('#' + currentFilter).setAttribute('checked', 'true');
};

/**
 * Проверка на наличие страниц с картинками, следующих за текущей страницей
 * @param  {Object}  pictures  Список картинок
 * @return {Boolean}           Признак наличия следующей страницы
 */
var isNextPageAvailable = function(picturesList) {
  return pageNumber < Math.floor(picturesList.length / PAGE_SIZE);
};

/**
 * Проверка на достижение конца (низа) текущей страницы с картинками
 * @return {Boolean}  Признак достижения конца страницы
 */
var isBottomReached = function() {
  var pageElements = document.querySelectorAll('.picture'),
    lastPageElement = pageElements[pageElements.length - 1],
    lastPageElementPosition = lastPageElement.getBoundingClientRect();

  return lastPageElementPosition.top <= window.innerHeight;
};

/**
 * Отрисовка следующей страницы картинок, если достигнут
 * конец текущей страницы, при скроллинге. Применяется троттлинг
 */
var setScrollEnabled = function() {
  var scrollTimeout;

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      renderNextPageIfNeeded( getFilteredPictures(pictures, currentFilter) );
    }, SCROLL_TIMEOUT);
  });
};

/**
 * Отрисовка следующей страницы картинок при изменении размеров
 * экрана/окна браузера
 */
window.addEventListener('resize', function() {
  renderNextPageIfNeeded( getFilteredPictures(pictures, currentFilter) );
});

/**
 * Отрисовка информации обо всех картинках текущей страницы
 * @param {Object}  pictureList  Список картинок
 * @param {Boolean} replace      Признак необходимости очистки
 *                               списка ранее отрисованных картинок
 */
function renderPage(pictureList, replace) {
  var from = pageNumber * PAGE_SIZE,
    to = from + PAGE_SIZE;

  if (replace) {
    picturesContainer.innerHTML = '';
  }

  pictureList.slice(from, to).forEach(getPictureElement);
  renderNextPageIfNeeded(pictureList);
}

/**
 * Проверка на наличие следующей страницы с картинками и на
 * необходимость ее отрисовки
 * @param {Object} pictureList  Список картинок
 */
function renderNextPageIfNeeded(pictureList) {
  if (isBottomReached() && isNextPageAvailable(pictureList)) {
    pageNumber++;
    renderPage(pictureList);
  }
}

/**
 * Отрисовка страницы сразу после получения данных с сервера
 */
getPictures(function(loaderPictures) {
  pictures = loaderPictures;
  setFiltersEnabled();
  setFilterEnabled(DEFAULT_FILTER);
  setScrollEnabled();
  filtersContainer.classList.remove('hidden');
});
