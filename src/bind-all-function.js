'use strict';

module.exports = bindAllFunc;

/**
 * Функция, устанавливающая контекст для всех методов объекста
 * @param  {Object}  object  Объект, свойствам которого необходимо зафиксировать контекст
 */
function bindAllFunc(object) {
  for (var property in object) {
    if (typeof object[property] === 'function') {
      object[property] = object[property].bind(object);
    }
  }
}
