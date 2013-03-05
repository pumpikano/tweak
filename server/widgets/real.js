
registerRenderer(function (binding) {

    var resolutionFactor = 1000;

    var control = $('<div class="bound-control type-int" id="' + binding.name + '"></div>')
        .css('margin', 10);

    var name = $('<div>' + binding.name + ': ' + binding.value + '</div>');
    var slider = $('<div></div>')
        .slider({
            min: binding.min * resolutionFactor,
            max: binding.max * resolutionFactor,
            step: 1,
            value: (binding.value !== undefined) ?
                    binding.value * resolutionFactor :
                    binding.min * resolutionFactor,
            slide: function (event, ui) {
                var value = ui.value / resolutionFactor;
                name.html(binding.name + ': ' + value);
                setValue(binding.name, value);
            }
        });
    control.append(name).append(slider);

    return control;
});
