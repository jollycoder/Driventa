"use strict";

window.addEventListener('load', function () {
    buttonAnimate({
        elem: document.getElementsByClassName('button_inversion')[0],
        fillToCursor: true,         // если true, заливка при наведении будет идти к курсору, если false — к центру
        clickFillColor: '#164d8b',  // цвет заливки при клике
        clickTextColor: 'white',    // цвет текста при клике
        parts: 12                   // из скольки частей будет состоять анимация, чем больше — тем плавнее, но медленнее
    })
});

function buttonAnimate(options) {
    var button = options.elem;
    var parts = options.parts;
    var interval = 10;

    var firstColor = '#eb4634';
    var secondColor = 'white';
    var style = button.style;

    function getOffsetRect(elem) {
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
    }

    function getEventCoordOnElem(event, elem) {
        return  {
            x: event.pageX - getOffsetRect(elem).left,
            y: event.pageY - getOffsetRect(elem).top
        }
    }

    function setOnEvents() {
        style.transitionProperty = 'color';
        style.transitionDuration = interval * parts + 'ms';

        var eventsData = [{
            event: 'mouseover',
            buttonTextColor: firstColor,
            initGradientColor: 'rgba(255, 255, 255, 0)',
            fillColor: secondColor
        },
        {
            event: 'mouseout',
            buttonTextColor: secondColor,
            initGradientColor: secondColor,
            fillColor: 'rgba(255, 255, 255, 0)'
        },
        {
            event: 'click',
            buttonTextColor: options.clickTextColor,
            initGradientColor: secondColor,
            fillColor: options.clickFillColor
        }];

        function onEvent(eventData, event) {
            var e = eventData.event;
            var fillColor = eventData.fillColor;

            style.color = eventData.buttonTextColor;

            var gradientArray = [];
            for (var i = 0; i < parts; i++)  {
                gradientArray[i] = eventData.initGradientColor
            }

            var left = '50%', top = '50%';
            if ((e == 'mouseover' || e == 'mouseout') && options.fillToCursor)
                left = getEventCoordOnElem(event, button).x + 'px';

            if (e == 'click')  {
                left = getEventCoordOnElem(event, button).x + 'px';
                top = getEventCoordOnElem(event, button).y + 'px';

                eventsData.forEach(function (item) {
                    button.removeEventListener(item.event, item.listener)
                })
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

        eventsData.forEach(function (item) {
            button.addEventListener(item.event, item.listener = onEvent.bind(null, item))
        });
    }

    setOnEvents();
}
