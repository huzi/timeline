'use strict';
var TextRenderer = function (timeline, selector, data) {
    var that = this;

    var width = 1000,
        height = 33;
    
    _.assign(that, BaseRenderer.prototype);
    
    that.timeline = timeline;
    that.originalData = _.sortBy(data, 'date');
    that._filterData();

    that.dataSvg = d3.select(selector).append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        //.call(that.timeline.zoom);
    that.dataSvgGraphic = that.dataSvg.append('g').attr('class', 'container');
    that.draw();
    that.redraw();

    events.subscribe('redraw', function () {
        that.redraw();
    });
    events.subscribe('zoomend', function () {
        that._filterData();
        that.draw();
        that.redraw();
    });
}

var _getText = function (d) {
    return d.label + '(' + d.cnt + ',' + d.date.toISOString() + ')';
};

TextRenderer.prototype.draw = function () {
    var start = new Date().getTime();
    var that = this;
    var offset = that.timeline.xForDate(that._filtered[0].date);
    var updateSelection = that.dataSvgGraphic.selectAll('g.data-item').data(that._filtered);

    that.dataSvgGraphic
        .attr('transform', function () {
            that._filtered.forEach(function (point) {
                //console.log(point.date, that.timeline.xForDate(point.date))
            });
            return 'translate(' + offset + ')';
        })

    updateSelection.select('line')
        .attr('x1', function (data) {
            return that.timeline.xForDate(data.date) - offset;
        }).attr('x2', function (data) {
            return that.timeline.xForDate(data.date) - offset;
        }).classed('group', function (item) {
            return item.type === 'group'
        });
    updateSelection.select('text')
        .attr('x', function (data) {
            return that.timeline.xForDate(data.date) - offset + 4;
        }).text('group');

    updateSelection.exit().remove();

    var enterSelection = updateSelection.enter();
    enterSelection.append('g')
        .attr('class', 'data-item')
        .call(function (g) {
            g.append('line')
                .attr('x1', function (data) {
                    return that.timeline.xForDate(data.date) - offset;
                }).attr('x2', function (data) {
                    return that.timeline.xForDate(data.date) - offset;
                }).attr('y1', 0).attr('y2', 10).classed('group', function (item) {
                    return item.type === 'group'
                });
            g.append('text')
                .attr('x', function (data) {
                    return that.timeline.xForDate(data.date) - offset + 4;
                }).attr('y', 10).text('group');

        });

    //console.log('renderer draw', new Date().getTime() - start);

}

TextRenderer.prototype.redraw = function () {
    var start = new Date().getTime();
    var that = this;
    that.dataSvgGraphic
        .attr('transform', function () {
            that._filtered.forEach(function (point) {
                //console.log(point.date, that.timeline.xForDate(point.date))
            });
            return 'translate(' + that.timeline.xForDate(that._filtered[0].date) + ')';
        });
}