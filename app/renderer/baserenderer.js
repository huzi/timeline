'use strict';

var BaseRenderer = function(timeline, data){
    that.timeline = timeline;
    that.originalData = _.sortBy(data, 'date');
}

BaseRenderer.prototype._filterData = function () {
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
    console.log(filtered.length);
}