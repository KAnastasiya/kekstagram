'use strict';

(function() {

  module.exports = {
    showElement: showElement,
    hideElement: hideElement,
    updateUploadFormBackground: updateUploadFormBackground,
    getCookiesExpireDate: getCookiesExpireDate
  };

  /**
   * CSS-класс, отвечающий за скрытие DOM-элементов
   * @type  {String}
   */
  var HIDE_ELEMENTS_CLASS = 'invisible';

  /**
   * Показать элемент со страницы
   */
  function showElement(element) {
    element.classList.remove(HIDE_ELEMENTS_CLASS);
  }

  /**
   * Скрыть элемент со страницы
   */
  function hideElement(element) {
    element.classList.add(HIDE_ELEMENTS_CLASS);
  }

  /**
   * Отображение в качестве фона формы формы загрузки случайной картинки
   * из списка предустановленных
   */
  function updateUploadFormBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload'),
      randomImageNumber = Math.round(Math.random() * (images.length - 1));

    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Опредение срока жизни cookies, как количество дней, прошедшее
   * с ближайшего дня рождения
   * @return  {Date}  Срок жизни cookies
   */
  function getCookiesExpireDate() {
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

})();
