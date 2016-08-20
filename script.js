window.addEventListener('load', function () {
    var animate = new ButtonAnimate({
        elem: document.getElementsByClassName('button_inversion')[0],
        fillToCursor: true,         // если true, заливка при наведении будет идти к курсору, если false — к центру
        clickFillColor: '#164d8b',  // цвет заливки при клике
        clickTextColor: 'white',    // цвет текста при клике
        parts: 12,                  // из скольки частей будет состоять анимация, чем больше — тем плавнее, но медленнее
        delay: 10                   // задержка между частями анимации
    })
});

function ButtonAnimate(options) {
    var button = options.elem;
    var parts = options.parts;
    var delay = options.delay;

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

    function getCoord(event, elem) {
        return  {
            x: event.pageX - getOffsetRect(elem).left,
            y: event.pageY - getOffsetRect(elem).top
        }
    }
    
    function setOnEvents() {
        style.transitionProperty = 'color';
        style.transitionDuration = delay * parts + 'ms';

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

            style.color = eventData.buttonTextColor;

            var gradientArray = [];
            for (var i = 0; i < parts; i++)  {
                gradientArray[i] = eventData.initGradientColor
            }

            var x = '50%', y = '50%';
            if ((e == 'mouseover' || e == 'mouseout') && options.fillToCursor)
                x = getCoord(event, button).x + 'px';

            if (e == 'click')  {
                x = getCoord(event, button).x + 'px';
                y = getCoord(event, button).y + 'px';
            }

            var counter = 0;
            var timer = setInterval(function () {
                var index = e != 'mouseover' ? counter : parts - 1 - counter;
                gradientArray[index] = eventData.fillColor;
                style.background = 'radial-gradient(at ' + x + ' ' + y + ',' + gradientArray.join(',') + ')';
                if (++counter == parts) clearInterval(timer)
            }, delay);

            if (e == 'click')  {
                eventsData.forEach(function (item) {
                    button.removeEventListener(item.event, item.listener)
                })
            }
        }

        eventsData.forEach(function (item) {
            button.addEventListener(item.event, item.listener = onEvent.bind(null, item))
        });
    }

    setOnEvents();
}
