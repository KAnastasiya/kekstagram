'use strict';

(function() {
  /**
   * Объект кадрирования
   * @constructor
   * @param  {string}  image  Картинка, которая будет кадрироваться
   */
  var Resizer = function(image) {
    this._image = new Image();
    this._image.src = image;

    this._container = document.createElement('canvas');
    this._ctx = this._container.getContext('2d');

    this._image.onload = function() {
      // Размер холста равен размеру загруженного изображения
      this._container.width = this._image.naturalWidth;
      this._container.height = this._image.naturalHeight;

      // Размер кадра в виде коэффициента относительно меньшей стороны картинки
      var INITIAL_SIDE_RATIO = 0.75;

      // Размер меньшей стороны изображения
      var side = Math.min(
          this._container.width * INITIAL_SIDE_RATIO,
          this._container.height * INITIAL_SIDE_RATIO);

      // Область кадрирования по умолчанию (область по центру с размером в 3/4
      // от размера меньшей стороны)
      this._resizeConstraint = new Square(
          this._container.width / 2 - side / 2,
          this._container.height / 2 - side / 2,
          side);

      // Отрисовка изначального состояния канваса
      this.setConstraint();
    }.bind(this);

    // Фиксирование контекста обработчиков
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._onDrag = this._onDrag.bind(this);
  };

  Resizer.prototype = {
    /**
     * Родительский элемент канваса
     * @type  {Element}
     * @private
     */
    _element: null,

    /**
     * Положение курсора в момент перетаскивания. От положения курсора
     * рассчитывается смещение на которое нужно переместить изображение
     * за каждую итерацию перетаскивания
     * @type  {Coordinate}
     * @private
     */
    _cursorPosition: null,

    /**
     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
     * от верхнего левого угла исходного изображения
     * @type  {Square}
     * @private
     */
    _resizeConstraint: null,

    /**
     * Отрисовка канваса
     */
    redraw: function() {
      // Очистка изображения
      this._ctx.clearRect(0, 0, this._container.width, this._container.height);

      // Параметры линии
      this._ctx.lineWidth = 6;
      this._ctx.strokeStyle = '#ffe753';
      this._ctx.setLineDash([15, 10]);
      this._ctx.lineDashOffset = 7;

      // Сохранение состояния канваса
      this._ctx.save();

      // Установка начальной точки системы координат в центр холста
      this._ctx.translate(this._container.width / 2, this._container.height / 2);

      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2),
        displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);

      // Отрисовка изображения на холсте. Параметры задают изображение, которое
      // нужно отрисовать и координаты его верхнего левого угла.
      // Координаты задаются от центра холста
      this._ctx.drawImage(this._image, displX, displY);

      // Параметры рамки вокруг области кадрирования
      var strokeSize = this._resizeConstraint.side,
        strokeWidth = this._ctx.lineWidth;

      // Отрисовка рамки вокруг области кадрирования
      drawcrankleStroke(this._ctx, strokeSize, 1);
      drawcrankleStroke(this._ctx, strokeSize, -1);

      // Затемнение области вне кадра
      showDarkenedArea(strokeWidth, this._container, this._ctx, this._resizeConstraint);

      // Отображение размеров изображения
      showResizePictureSize(strokeWidth, this._ctx, this._resizeConstraint, this._image);

      // Восстановление состояния канваса, которое было до вызова ctx.save
      // и последующего изменения системы координат. Нужно для того, чтобы
      // следующий кадр рисовался с привычной системой координат, где точка
      // 0 0 находится в левом верхнем углу холста, в противном случае
      // некорректно сработает даже очистка холста или нужно будет использовать
      // сложные рассчеты для координат прямоугольника, который нужно очистить
      this._ctx.restore();
    },

    /**
     * Включение режима перемещения. Запоминается текущее положение курсора,
     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
     * позволяющие перерисовывать изображение по мере перетаскивания
     * @param  {Number}  x  Координата по оси X
     * @param  {Number}  y  Координата по оси Y
     * @private
     */
    _enterDragMode: function(x, y) {
      this._cursorPosition = new Coordinate(x, y);
      document.body.addEventListener('mousemove', this._onDrag);
      document.body.addEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Выключение режима перемещения
     * @private
     */
    _exitDragMode: function() {
      this._cursorPosition = null;
      document.body.removeEventListener('mousemove', this._onDrag);
      document.body.removeEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Перемещение изображения относительно кадра
     * @param  {Number}  x  Координата по оси X
     * @param  {Number}  y  Координата по оси Y
     * @private
     */
    updatePosition: function(x, y) {
      this.moveConstraint(
          this._cursorPosition.x - x,
          this._cursorPosition.y - y);
      this._cursorPosition = new Coordinate(x, y);
    },

    /**
     * Обработчик начала перетаскивания
     * @param  {MouseEvent}  evt
     * @private
     */
    _onDragStart: function(evt) {
      this._enterDragMode(evt.clientX, evt.clientY);
    },

    /**
     * Обработчик окончания перетаскивания
     * @private
     */
    _onDragEnd: function() {
      this._exitDragMode();
    },

    /**
     * Обработчик события перетаскивания
     * @param  {MouseEvent}  evt
     * @private
     */
    _onDrag: function(evt) {
      this.updatePosition(evt.clientX, evt.clientY);
    },

    /**
     * Добавление элемента в DOM
     * @param  {Element}  element
     */
    setElement: function(element) {
      if (this._element === element) {
        return;
      }
      this._element = element;
      this._element.insertBefore(this._container, this._element.firstChild);
      this._container.addEventListener('mousedown', this._onDragStart);
    },

    /**
     * Возврат кадрированного изображения
     * @return  {Square}
     */
    getConstraint: function() {
      return this._resizeConstraint;
    },

    /**
     * Смещение кадрирования на значение указанное в параметрах
     * @param  {Number}  deltaX     Смещение по оси X
     * @param  {Number}  deltaY     Смещение по оси Y
     * @param  {Number}  deltaSide  Разница между старым и новым размером
     *                              стороны картинки
     */
    moveConstraint: function(deltaX, deltaY, deltaSide) {
      this.setConstraint(
          this._resizeConstraint.x + (deltaX || 0),
          this._resizeConstraint.y + (deltaY || 0),
          this._resizeConstraint.side + (deltaSide || 0));
    },

    /**
     * Установка в качестве размеров кадра значений из параметров
     * @param  {Number}  x     Смещение по оси X
     * @param  {Number}  y     Смещение по оси Y
     * @param  {Number}  side  Размер стороны картинки
     */
    setConstraint: function(x, y, side) {
      if (typeof x !== 'undefined') {
        this._resizeConstraint.x = x;
      }

      if (typeof y !== 'undefined') {
        this._resizeConstraint.y = y;
      }

      if (typeof side !== 'undefined') {
        this._resizeConstraint.side = side;
      }

      requestAnimationFrame(function() {
        this.redraw();
        window.dispatchEvent(new CustomEvent('resizerchange'));
      }.bind(this));
    },

    /**
     * Удаление. Убирает контейнер из родительского элемента, убирает
     * все обработчики событий и убирает ссылки
     */
    remove: function() {
      this._element.removeChild(this._container);

      this._container.removeEventListener('mousedown', this._onDragStart);
      this._container = null;
    },

    /**
     * Экспорт обрезанного изображения как HTMLImageElement и исходником
     * картинки в src в формате dataURL
     * @return {Image}
     */
    exportImage: function() {
      // Создаем Image, с размерами, указанными при кадрировании
      var imageToExport = new Image();

      // Создается новый canvas, по размерам совпадающий с кадрированным
      // изображением, в него добавляется изображение взятое из канваса
      // с измененными координатами и сохраняется в dataURL, с помощью метода
      // toDataURL. Полученный исходный код, записывается в src у ранее
      // созданного изображения
      var temporaryCanvas = document.createElement('canvas');
      var temporaryCtx = temporaryCanvas.getContext('2d');
      temporaryCanvas.width = this._resizeConstraint.side;
      temporaryCanvas.height = this._resizeConstraint.side;
      temporaryCtx.drawImage(this._image,
          -this._resizeConstraint.x,
          -this._resizeConstraint.y);
      imageToExport.src = temporaryCanvas.toDataURL('image/png');

      return imageToExport;
    }
  };

  /**
   * Описывает квадрат
   * @constructor
   * @param  {Number}  x     Координата начальной точки по по оси X
   * @param  {Number}  y     Координата начальной точки по по оси Y
   * @param  {Number}  side  Длина стороны
   * @private
   */
  var Square = function(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
  };

  /**
   * Описывает координату
   * @constructor
   * @param  {Number}  x  Координата по по оси X
   * @param  {Number}  y  Координата по по оси Y
   * @private
   */
  var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
  };

  /**
   * Рисует рамку вокруг области кадрирования
   * @param  {Object}  context        Контекст канваса
   * @param  {Number}  framePosition  Расположение рамки относительно центра канваса:
   *                                  1 (справа), -1 (слева)
   */
  function drawcrankleStroke(context, strokeSize, framePosition) {
    /**
     * Количество отрезков, из которых состоит рамка. Под отрезком подразумевается
     * половина "зигзага"
     * @constant
     * @type  {Number}
     */
    var LINE_COUNT = 32;

    // Параметры рамки
    context.fillStyle = context.strokeStyle;
    context.setLineDash([]);
    context.lineCap = 'square';

    for (var i = 0; i < LINE_COUNT; i += 2) {
      // Длина половины стороны рамки. Поскольку центр канваса расположен в центре
      // области кадрирования, то эта величина будет полезна при построении рамки
      var strokeSizeHalf = strokeSize / 2;

      // Длина одного отрезка рамки
      var lineSize = strokeSize / LINE_COUNT;

      // Начальная и конечная точка каждого отрезка рамки по оси Y для горизонтальной
      // рамки и по оси X для вертикальной рамки
      var basicPointStaticAxis = framePosition * (strokeSizeHalf - lineSize);

      // Точка "провала" каждого зигзага рамки по оси Y для горизонтальной рамки и по
      // оси X для вертикальной рамки
      var addiionalPointStaticAxis = framePosition * strokeSizeHalf;

      // Начальная точка каждого отрезка рамки по оси Y для вертикальной рамки и по
      // оси X для горизонтальной рамки
      var startPointDynamicAxis = -strokeSizeHalf + lineSize * i;

      // Точка "провала" каждого зигзага рамки по оси Y для вертикальной рамки и по
      // оси X для горизонтальной рамки
      var additionalPointDynamicAxis = -strokeSizeHalf + lineSize + lineSize * i;

      // Конечная точка каждого зигзага рамки по оси Y для вертикальной рамки и по
      // оси X для горизонтальной рамки
      var endPointDynamicAxis = -strokeSizeHalf + 2 * lineSize + lineSize * i;

      // Отрисовка горизонтальных частей рамки
      context.beginPath();
      context.moveTo(startPointDynamicAxis, basicPointStaticAxis);
      context.lineTo(additionalPointDynamicAxis, addiionalPointStaticAxis);
      context.lineTo(endPointDynamicAxis, basicPointStaticAxis);
      context.stroke();

      // Отрисовка вертикальных частей рамки
      context.beginPath();
      context.moveTo(basicPointStaticAxis, startPointDynamicAxis);
      context.lineTo(addiionalPointStaticAxis, additionalPointDynamicAxis);
      context.lineTo(basicPointStaticAxis, endPointDynamicAxis);
      context.stroke();
    }
  }

  /**
   * Затемняет картинку вне области кадрирования
   * @param  {Number}  stroke            Ширина рамки вокрут области кадрирования
   * @param  {Object}  container         Канвас
   * @param  {Object}  context           Контекст канваса
   * @param  {Square}  resizeConstraint  Область кадрирования
   */
  function showDarkenedArea(stroke, container, context, resizeConstraint) {
    context.strokeStyle = '#000';
    context.globalAlpha = 0.8;
    context.setLineDash([]);
    context.lineWidth = container.width - resizeConstraint.side - stroke;
    context.strokeRect(-container.width / 2, -container.height / 2, container.width, container.height);
  }

  /**
   * Отображает размеры картинки
   * @param  {Number}  stroke            Ширина рамки вокруг области кадрирования
   * @param  {Object}  context           Контекст канваса
   * @param  {Square}  resizeConstraint  Область кадрирования
   * @param  {Image}   image             Кадрируемая картинка
   */
  function showResizePictureSize(stroke, context, resizeConstraint, image) {
    context.font = '22px Arial';
    context.fillStyle = '#fff';
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.fillText(image.naturalWidth + ' x ' + image.naturalHeight, 0, -resizeConstraint.side / 2 - stroke * 1.5);
  }

  window.Resizer = Resizer;
})();
