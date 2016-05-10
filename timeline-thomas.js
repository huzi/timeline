(function (d3) {
    'use strict';

    var element = document.getElementById('chart');
    element.classList.add('timeline-chart');
    var elementWidth = element.clientWidth;
    var elementHeight = element.clientHeight;
    var margin = {
        top: 0,
        right: 0,
        bottom: 20,
        left: 0
    };
    var groupWidth = 200;

    var width = elementWidth - margin.left - margin.right;
    var height = elementHeight - margin.top - margin.bottom;
    var scale = d3.time.scale().domain([new Date(2016, 1, 1), new Date(2016, 12, 31)]).range([groupWidth, width]);
    var zoom = d3.behavior.zoom().x(scale).on('zoom', zoomed);
    var xAxis = d3.svg.axis().scale(scale).orient('bottom').tickSize(-10);
    var svg = d3.select(element).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('defs').append('clipPath').attr('id', 'chart-content').append('rect').attr('x', groupWidth).attr('y', 0).attr('height', height).attr('width', width - groupWidth);

    svg.append('rect').attr('class', 'chart-bounds').attr('x', groupWidth).attr('y', 0).attr('height', height).attr('width', width - groupWidth);

    svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

    function zoomed() {
        console.log('zoomed');
        svg.select('.x.axis').call(xAxis);
    }

}(d3));