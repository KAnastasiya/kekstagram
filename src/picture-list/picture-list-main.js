'use strict';

(function() {

  var filterPictures = require('./filter-pictures'),
    renderPictures = require('./render-pictures');

  /**
   * Адрес сервера, с которого загружаются картинки
   * @constant
   * @type  {String}
   */
  var PICTURES_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json';

  /**
   * Таймаут для загрузки картинок с сервера
   * @constant
   * @type  {Number}
   */
  var SERVER_TIMEOUT = 10000;

  /**
   * Таймаут для организации троттлинга при постраничной отрисовке
   * картинок при скроллинге
   * @constant
   * @type  {Number}
   */
  var SCROLL_TIMEOUT = 100;

  /**
   * Список картинок, загруженных с сервера
   * @type  {Array}
   */
  var pictures = [];

  /**
   * Загрузка картинок и информации о них с сервера. Отрисовка страницы
   */
  (function loadPictures() {
    var xhr = new XMLHttpRequest();

    renderPictures.loadingIsProgress();

    xhr.onload = function(event) {
      pictures = JSON.parse(event.target.response);
      renderPictures.endLoading();

      // Инициализация фильтрации списка картинок
      filterPictures.initializeFiltration(pictures);

      // Инициализация обработчика скроллинга списка картинок
      setScrollEnabled();
    };

    xhr.onerror = renderPictures.showLoadingError;

    xhr.timeout = SERVER_TIMEOUT;
    xhr.ontimeout = renderPictures.showLoadingError;

    xhr.open('GET', PICTURES_LOAD_URL);
    xhr.send();
  })();

  /**
   * Проверка на наличие в списке отфильтрованных картинок следующей страницы и на
   * необходимость ее отрисовки
   */
  function renderNextPageIfNeeded() {
    var filteredPictures = filterPictures.getFilteredPicturesByCurrentFilter(pictures);
    renderPictures.renderNextPageIfNeeded(filteredPictures);
  }

  /**
   * Отрисовка при скроллинге следующующей страницы картинок, если достигнут
   * конец текущей страницы. Применяется троттлинг
   */
  function setScrollEnabled() {
    var scrollTimeout;

    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(renderNextPageIfNeeded, SCROLL_TIMEOUT);
    });
  }

  /**
   * Отрисовка следующей страницы картинок при изменении размеров экрана
   */
  window.addEventListener('resize', renderNextPageIfNeeded);

})();
