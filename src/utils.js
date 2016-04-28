'use strict';

module.exports = {
  inherit: inherit,
  bindAllFunc: bindAllFunc
};

/**
 * Механизм наследования
 * @param   {Object}  child  Дочерний элемент
 * @param   {Object}  base   Родительский элемент
 */
function inherit(child, base) {
  function EmptyCtor() {}
  EmptyCtor.prototype = base.prototype;
  child.prototype = new EmptyCtor();
}

/**
 * Установка контекста для всех методов объекста
 * @param  {Object}  object  Объект, для которого необходимо зафиксировать контекст
 */
function bindAllFunc(object) {
  for (var property in object) {
    if (typeof object[property] === 'function') {
      object[property] = object[property].bind(object);
    }
  }
}
