
registerRenderer(function (binding) {

    var resolutionFactor = 1000;

    var control = $('<div class="bound-control type-int" id="' + binding.name + '"></div>')
        .css('margin', 10);

    var name = $('<div>' + binding.name + '</div>');
    var slider = $('<div></div>')
        .slider({
            min: binding.min * resolutionFactor,
            max: binding.max * resolutionFactor,
            step: 1,
            value: binding.value * resolutionFactor,
            slide: function (event, ui) {
                setValue(binding.name, ui.value / resolutionFactor);
            }
        });
    control.append(name).append(slider);

    return control;
});
