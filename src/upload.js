/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

var browserCookies = require('browser-cookies');

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Обращение к элементам формы кадрирования
   * @type {String}
   */
  var resizeLeft = document.querySelector('#resize-x'),
    resizeTop = document.querySelector('#resize-y'),
    resizeSide = document.querySelector('#resize-size'),
    resizeSubmitButton = document.querySelector('#resize-fwd');

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var maxWidth = currentResizer._image.naturalWidth,
      maxHeight = currentResizer._image.naturalHeight,
      resizeLeftValue = +resizeLeft.value,
      resizeTopValue = +resizeTop.value,
      resizeSideValue = +resizeSide.value;

    return (resizeLeft.validity.valid
            && resizeTop.validity.valid
            && resizeSide.validity.valid
            && resizeTopValue >= 0
            && resizeLeftValue >= 0
            && resizeSideValue >= 0
            && resizeLeftValue + +resizeSideValue <= maxWidth
            && resizeTopValue + +resizeSideValue <= maxHeight) ? true : false;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * В качестве фильтра выбираем либо последний примененный фильтр,
   * либо значение "none"
   * @type {String}
   */
  var selectedFilter = browserCookies.get('filter') || 'none';

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;

      case Action.CUSTOM:
        isError = true;
        message = message || 'Неверное значение поля';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.onchange = function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  };

  /**
   * Обработка ошибок заполнения полей формы кадрирования
   */
  resizeForm.oninput = function resizeOnInput() {
    var maxWidth = currentResizer._image.naturalWidth,
      maxHeight = currentResizer._image.naturalHeight,
      resizeLeftValue = +resizeLeft.value,
      resizeTopValue = +resizeTop.value,
      resizeSideValue = +resizeSide.value,
      errorMessage = '';

    if (resizeFormIsValid()) {
      resizeSubmitButton.disabled = false;
      hideMessage();
    } else {
      resizeSubmitButton.disabled = true;

      if (resizeLeftValue < 0 || resizeTopValue < 0 || resizeSideValue < 0) {
        errorMessage = 'Значение поля должно быть положительный';
      } else if (resizeLeftValue + resizeSideValue >= maxWidth
                || resizeTopValue + resizeSideValue >= maxHeight) {
        errorMessage = 'Кадрированное изображение должно находиться в пределах исходного изображения';
      }
      showMessage(Action.CUSTOM, errorMessage);
    }
  };

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.onreset = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');

    resizeLeft.value = resizeTop.value = resizeSide.value = '';
    resizeSubmitButton.disabled = false;
    hideMessage();
  };

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.onreset = function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.onchange = function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    // Запить выбранного фильтра
    selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  };

  /**
   * Опредение срока жизни cookies
   * @return {Date}
   */
  function getFilterExpireDate() {
    var birthday = new Date('1987-04-12'),
      currentDate = new Date(),
      currentDay = currentDate.getDate(),
      birthdayDay = birthday.getDate(),
      currentMonth = currentDate.getMonth(),
      birthdayMonth = birthday.getMonth(),
      currentYear = currentDate.getFullYear(),
      previousBirthday,
      expireDateMillisecond,
      expireDate;

    currentDate.setHours(0, 0, 0, 0);

    if (currentMonth > birthdayMonth || (currentMonth === birthdayMonth && currentDay >= birthdayDay)) {
      previousBirthday = new Date(currentYear, birthdayMonth, birthdayDay, 0, 0, 0, 0);
    } else {
      previousBirthday = new Date(currentYear - 1, birthdayMonth, birthdayDay, 0, 0, 0, 0);
    }

    expireDateMillisecond = currentDate.getTime() + (currentDate.getTime() - previousBirthday.getTime());
    expireDate = new Date(expireDateMillisecond);
    expireDate.setHours(23, 59, 59, 999);

    return expireDate;
  }

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    browserCookies.set('filter', selectedFilter, {
      expires: getFilterExpireDate().toString()
    });

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  cleanupResizer();
  updateBackground();
})();
