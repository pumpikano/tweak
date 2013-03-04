
registerRenderer(function (binding) {

    var control = $('<div class="bound-control type-int" id="' + binding.name + '"></div>')
        .css('margin', 10);

    var name = $('<div>' + binding.name + '</div>');
    var slider = $('<div></div>')
        .slider({
            min: binding.min,
            max: binding.max,
            step: 1,
            value: binding.value,
            slide: function (event, ui) {
                setValue(binding.name, ui.value);
            }
        });
    control.append(name).append(slider);

    return control;
});
