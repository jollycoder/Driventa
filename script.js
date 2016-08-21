"use strict";

window.addEventListener('load', function () {
    animateButton({
        elem: document.getElementsByClassName('button_inversion')[0],
        fillToCursor: true,                             // если true, заливка при наведении будет идти к курсору, если false — к центру
        fillScreenOnClick: true,                        // если true, при клике по кнопке заливаем весь экран
        clickScreenFillColor: 'rgba(22, 77, 139, .5)',  // цвет заливки экрана при клике
        clickButtonFillColor: '#164d8b',                // цвет заливки кнопки при клике
        clickTextColor: 'white',                        // цвет текста кнопки при клике
        parts: 12                                       // количество частей в анимации кнопки, чем больше — тем плавнее, но медленнее
    })
});

function animateButton(options) {
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
            fillColor: options.clickButtonFillColor
        }];

        function onEvent(eventData, event) {
            var e = eventData.event;
            var fillColor = eventData.fillColor;
            var prefix = '';
            var elem = button;
            var initGradientColor = eventData.initGradientColor;

            if (options.fillScreenOnClick && e == 'click')  {
                var cover = document.createElement("DIV");
                style = cover.style;
             // style.pointerEvents = 'none';  // прозрачность для событий мыши
                style.position = 'absolute';
                style.left = style.top = 0;
                style.width = '100vw';
                style.height = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                ) + 'px';
                document.body.appendChild(cover);
                prefix = 'circle ';
                initGradientColor = 'rgba(255, 255, 255, 0)';
                fillColor = options.clickScreenFillColor;
                parts = 50;
                elem = cover;
            }

            style.color = eventData.buttonTextColor;

            var gradientArray = [];
            for (var i = 0; i < parts; i++)  {
                gradientArray[i] = initGradientColor
            }

            var left = '50%', top = '50%';
            if (e != 'click' && options.fillToCursor)
                left = getEventCoordOnElem(event, elem).x + 'px';

            if (e == 'click')  {
                left = getEventCoordOnElem(event, elem).x + 'px';
                top = getEventCoordOnElem(event, elem).y + 'px';
                style.cursor = 'default';

                eventsData.forEach(function (item) {
                    button.removeEventListener(item.event, item.listener)
                });
            }

            var counter = 0;
            var timer = setInterval(function () {
                var index = (e != 'mouseover' ? counter : parts - 1 - counter);
                gradientArray[index] = fillColor;
                style.background = 'radial-gradient(' + prefix + 'at ' + left + ' ' + top + ',' + gradientArray.join(',') + ')';
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
