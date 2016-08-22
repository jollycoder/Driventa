"use strict";

window.addEventListener('load', function () {
    var animate = new AnimateButton({
        elem: document.querySelector('.button_inversion'),
        fillToCursor: true,                             // если true — заливка при наведении будет идти к курсору, если false — к центру
        fillScreenOnClick: true,                        // если true — при клике по кнопке заливаем весь экран
        clickScreenFillColor: 'rgba(22, 77, 139, .5)',  // цвет заливки экрана при клике
        clickButtonFillColor: '#164d8b',                // цвет заливки кнопки при клике
        clickTextColor: 'white',                        // цвет текста кнопки при клике
        parts: 12                                       // количество частей в анимации кнопки, чем больше — тем плавнее, но медленнее
    })
});

function GetCoords() {
    this.getOffsetRect = function (elem) {
        var box = elem.getBoundingClientRect();
        var body = document.body;
        var docElem = document.documentElement;
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        var top  = box.top +  scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left) }
    };

    this.getEventCoordOnElem = function (event, elem) {
        return  {
            x: event.pageX - this.getOffsetRect(elem).left,
            y: event.pageY - this.getOffsetRect(elem).top
        }
    };

    this.getScrollHeight = function () {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        )
    }
}

function AnimateButton(options) {
    GetCoords.call(this);

    var button = options.elem;
    var parts = options.parts;

    var interval = 10;
    var firstColor = '#eb4634';
    var secondColor = 'white';
    var style = button.style;

    var eventsData = [{
        event: 'mouseover',
        buttonTextColor: firstColor,
        initGradientColor: 'rgba(255, 255, 255, 0)',
        fillColor: secondColor
    },  {
        event: 'mouseout',
        buttonTextColor: secondColor,
        initGradientColor: secondColor,
        fillColor: 'rgba(255, 255, 255, 0)'
    },  {
        event: 'click',
        buttonTextColor: options.clickTextColor,
        initGradientColor: secondColor,
        fillColor: options.clickButtonFillColor
    }];

    function createDivOverAll()  {
        var cover = document.createElement("DIV");
        var s = cover.style;
        s.pointerEvents = 'none';  // прозрачность для событий мыши
        s.position = 'absolute';
        s.left = s.top = 0;
        s.width = '100vw';
        s.height = this.getScrollHeight() + 'px';
        document.body.appendChild(cover);
        return cover
    }

    function onEvent(eventData, event) {
        var e = eventData.event;
        var fillColor = eventData.fillColor;
        var gradType = 'ellipse';
        var elem = button;
        var initGradientColor = eventData.initGradientColor;

        if (options.fillScreenOnClick && e == 'click')  {
            gradType = 'circle';
            initGradientColor = 'rgba(255, 255, 255, 0)';
            fillColor = options.clickScreenFillColor;
            parts = 60;
            elem = createDivOverAll.call(this);
            style = elem.style
        }
        else style.color = eventData.buttonTextColor;

        var gradientColors = [];
        for (var i = 0; i < parts; i++)  {
            gradientColors[i] = initGradientColor
        }

        var left = '50%', top = '50%';
        if (e != 'click' && options.fillToCursor)
            left = this.getEventCoordOnElem(event, elem).x + 'px';

        if (e == 'click')  {
            left = this.getEventCoordOnElem(event, elem).x + 'px';
            top = this.getEventCoordOnElem(event, elem).y + 'px';
            button.style.cursor = 'default';

            eventsData.forEach(function (item) {
                button.removeEventListener(item.event, item.listener)
            });
        }

        var counter = 0;
        var timer = setInterval(function () {
            var index = (e != 'mouseover' ? counter : parts - 1 - counter);
            gradientColors[index] = fillColor;
            style.background = 'radial-gradient(' + gradType + ' at ' + left + ' ' + top + ',' + gradientColors.join(',') + ')';
            if (++counter == parts)  {
                style.background = fillColor;
                clearInterval(timer);
            }
        }, interval);
    }

    (function setOnEvents()  {
        style.transitionProperty = 'color';
        style.transitionDuration = interval * parts + 'ms';

        eventsData.forEach((function (item) {
            button.addEventListener(item.event, item.listener = onEvent.bind(this, item))
        }).bind(this));
    }).call(this);
}
