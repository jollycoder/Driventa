"use strict";

window.addEventListener('load', function () {
    var animate = new AnimateButton({
        elem: document.getElementsByClassName('button_inversion')[0],
        fillToCursor: true,                             // если true, заливка при наведении будет идти к курсору, если false — к центру
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

    function onEvent(eventData, event) {
        var e = eventData.event;
        var fillColor = eventData.fillColor;
        style.color = eventData.buttonTextColor;

        var gradientArray = [];
        for (var i = 0; i < parts; i++)  {
            gradientArray[i] = eventData.initGradientColor;
        }

        var left = '50%', top = '50%';
        if (e != 'click' && options.fillToCursor)
            left = this.getEventCoordOnElem(event, button).x + 'px';

        if (e == 'click')  {
            left = this.getEventCoordOnElem(event, button).x + 'px';
            top = this.getEventCoordOnElem(event, button).y + 'px';
            style.cursor = 'default';

            eventsData.forEach(function (item) {
                button.removeEventListener(item.event, item.listener)
            });
        }

        var counter = 0;
        var timer = setInterval(function () {
            var index = (e != 'mouseover' ? counter : parts - 1 - counter);
            gradientArray[index] = fillColor;
            style.background = 'radial-gradient(at ' + left + ' ' + top + ',' + gradientArray.join(',') + ')';
            if (++counter == parts)  {
                style.background = fillColor;
                clearInterval(timer);
            }
        }, interval);
    }

    function setOnEvents()  {
        style.transitionProperty = 'color';
        style.transitionDuration = interval * parts + 'ms';

        eventsData.forEach((function (item) {
            button.addEventListener(item.event, item.listener = onEvent.bind(this, item))
        }).bind(this));
    }

    setOnEvents.call(this);
}
