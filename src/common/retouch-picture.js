'use strict';

module.exports = {
  initRetouch: initRetouch,
  hideRetouch: hideRetouch
};

var uploadPicture = require('./upload-picture'),
  resizePicture = require('./resize-picture'),
  utilities = require('./utils'),
  browserCookies = require('browser-cookies');

var filterMap,
  filterForm = document.forms['upload-filter'],
  filtersList = filterForm.querySelectorAll('.upload-filter-controls input'),
  filterImage = filterForm.querySelector('.filter-image-preview'),
  selectedFilter = browserCookies.get('filter') || 'none';

/**
 * Инициализация формы ретуширования картинки
 * @param  {String}  src  Путь к загруженной картинке
 */
function initRetouch(src) {
  for (var j = 0; j < filtersList.length; j++) {
    filtersList[j].removeAttribute('checked');
  }
  filterForm.querySelector('#upload-filter-' + selectedFilter).setAttribute('checked', 'true');
  filterImage.src = src;
  _onChangePicture();
  utilities.showElement(filterForm);
}

/**
 * Скрытие формы ретуширования картинки
 */
function hideRetouch() {
  utilities.hideElement(filterForm);
}

/**
 * Ретуширование картинки согласно выбранного фильтра
 */
function _onChangePicture() {
  if (!filterMap) {
    // Ленивая инициализация (объект не создается, пока впервые не понадобится)
    filterMap = {
      'none': 'filter-none',
      'chrome': 'filter-chrome',
      'sepia': 'filter-sepia'
    };
  }

  selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
    return item.checked;
  })[0].value;

  // Класс перезаписывается, а не обновляется через classList, потому что нужно
  // убрать предыдущий примененный класс
  filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
}

/**
 * Сохранение ретуширования картинки. Сохранение в cookies выбранного фильтра.
 * Возвращает в начальное состояние - к загрузке новой картинки
 */
function _onSubmitForm(event) {
  event.preventDefault();
  browserCookies.set('filter', selectedFilter, {
    expires: utilities.getCookiesExpireDate().toString()
  });
  hideRetouch();
  uploadPicture.showUpload();
}

/**
 * Сброс ретуширования картинки. Возврат к кадрированию картинки
 */
function _onResetForm(event) {
  event.preventDefault();
  hideRetouch();
  resizePicture.showResizer();
}

// Навешивание обработчиков событий
filterForm.addEventListener('change', _onChangePicture);
filterForm.addEventListener('submit', _onSubmitForm);
filterForm.addEventListener('reset', _onResetForm);
