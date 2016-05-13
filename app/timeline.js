'use strict';
var Timeline = function (elmId, options) {
    var that = this;
    var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        width = 1000,
        height = 44;

    that.options = {
        startDate: new Date(2016, 0, 1),
        endDate: new Date(2016, 11, 31)
    }

    _.assign(that.options, options);

    that.element = d3.select(elmId);
    that.scale = d3.time.scale().domain([that.options.startDate, that.options.endDate]).range([0, width]);
    that.xAxis = d3.svg.axis().scale(that.scale).orient('bottom').tickSize(-10);
    that.zoom = d3.behavior.zoom().scaleExtent([0.1, 10])
        .on('zoom', function (a, b, c) {
            var start = new Date().getTime();
            that.redraw();
            console.log('zoom', new Date().getTime() - start);
        })
        .on('zoomstart', function () {
            //console.log('zoomstart', arguments);
        })
        .on('zoomend', function () {
            console.log('zoomend', arguments, that.zoom.scale());
            events.publish('zoomend');
        });

    that.svg = that.element.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(that.zoom);

    that.svg.append('defs').append('clipPath').attr('id', 'chart-content').append('rect').attr('x', 0).attr('y', 0).attr('height', 10).attr('width', width - 0);

    that.svg.append('rect').attr('class', 'chart-bounds').attr('x', 0).attr('y', 0).attr('height', 10).attr('width', width - 0);

    that.svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + 10 + ')').call(that.xAxis);
    that.svg.select('.axis').call(that.zoom);
}

Timeline.prototype.redraw = function () {
    var that = this;
    events.publish('redraw');
    that.svg.select('.x.axis').call(that.xAxis);
}

Timeline.prototype.xForDate = function (date) {
    var that = this;
    return Math.round(that.scale(date));
}