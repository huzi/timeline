'use strict';
var BarRenderer = function (timeline, selector, data) {
    var that = this;

    var width = 1000,
        height = 33;
    that._selector = selector;
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

BarRenderer.prototype._filterData = function () {
    var that = this;
    var data = that.originalData;
    var filtered = [],
        scaleStart = that.timeline.scale.domain()[0].getTime(),
        scaleEnd = that.timeline.scale.domain()[1].getTime(),
        scaleDelta = scaleEnd - scaleStart,
        dataTime,
        start = new Date().getTime();
    for (var i = 0; i < data.length; i++) {
        dataTime = data[i].date.getTime();
        if (dataTime > scaleStart - scaleDelta && dataTime < scaleEnd + scaleDelta) {
            var item = data[i];
            item.x = that.timeline.xForDate(item.date);
            item.type = 'single';
            var thresholdDate = that.timeline.scale.invert(item.x + 14)
            var cnt = i + 1;
            var nextItem = data[cnt];
            while (nextItem && nextItem.date < thresholdDate) {
                item.type = 'group';
                cnt++;
                nextItem = data[cnt];
            }
            if (nextItem) {
                item.width = that.timeline.xForDate(nextItem.date) - item.x;
            }
            item.cnt = cnt - i;
            i = cnt - 1;
            filtered.push(item);
        }
    }
    that._filtered = filtered;
}

var _getText = function (d) {
    return d.label + '(' + d.cnt + ',' + d.date.toISOString() + ')';
};

BarRenderer.prototype.draw = function () {
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

BarRenderer.prototype.redraw = function () {
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