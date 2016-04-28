'use strict';

module.exports = BaseComponent;

var utils = require('./utils');

/**
 * Функция-конструктор DOM-элемента, который является
 * родителем всех других DOM-элементов
 * @param  {Element}  element  DOM-элемент родителя
 */
function BaseComponent(element) {
  utils.bindAllFunc(this);
  this.element = element;
}

/**
 * Прототип конструктора BaseComponent. Отрисовка элемента
 */
BaseComponent.prototype.renderTo = function(container) {
  container.appendChild(this.element);
};

/**
 * Прототип конструктора BaseComponent. Удаление элемента
 */
BaseComponent.prototype.remove = function() {
  this.element.parentNode.removeChild(this.element);
};
