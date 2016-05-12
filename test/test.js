'use strict';

var assert = chai.assert;
describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1, 2, 3].indexOf(5));
            assert.equal(-1, [1, 2, 3].indexOf(0));
        });
    });
});

describe('Timeline', function () {
    describe('constructor', function () {
        beforeEach(function () {
            $('#test').html('<div id="tl"></div>')
        });

        it('should init timescale for current year', function () {
            // WHEN
            var timeline = new Timeline('#tl')

            // THEN
            var domain = timeline.scale.domain();
            assert.equal(domain[0].getFullYear(), 2016);
            assert.equal(domain[0].getMonth(), 0);
            assert.equal(domain[0].getDate(), 1);
            assert.equal(domain[1].getFullYear(), 2016);
            assert.equal(domain[1].getMonth(), 11);
            assert.equal(domain[1].getDate(), 31);
        });

        it('should overwrite timescale domain with constructor options', function () {
            // GIVEN
            var options = {
                startDate: new Date(2014, 0, 1),
                endDate: new Date(2017, 2, 3)
            };

            // WHEN
            var timeline = new Timeline('#tl', options);

            // THEN
            var domain = timeline.scale.domain();
            assert.equal(domain[0].getFullYear(), 2014);
            assert.equal(domain[0].getMonth(), 0);
            assert.equal(domain[0].getDate(), 1);
            assert.equal(domain[1].getFullYear(), 2017);
            assert.equal(domain[1].getMonth(), 2);
            assert.equal(domain[1].getDate(), 3);
        });
    });
});


describe('BarRenderer', function () {
    var timeline;
    var data;

    function _createData() {
        var data = [];
        for (var i = 0; i < 10; i++) {
            data.push({
                id: i,
                label: 'Data ' + i,
                date: new Date(2016, 0, i + 1)
            });
        }
        return data;
    }

    describe('constructor', function () {

        beforeEach(function () {
            data = _createData();
            $('#test').html('<div id="tl"></div><div id="renderer"></div>')
            timeline = new Timeline('#tl', {
                startDate: new Date(2016, 0, 1),
                endDate: new Date(2016, 0, 2)
            });
        });

        it('should display all data', function () {
            // GIVEN
            timeline = new Timeline('#tl', {
                startDate: new Date(2016, 0, 1),
                endDate: new Date(2016, 0, 10)
            });

            // WHEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // THEN
            assert.equal(renderer._filtered.length, 10);
        });

        it('should calculate data x positions', function () {
            // WHEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // THEN
            assert.equal(renderer._filtered[0].x, 0);
            assert.equal(renderer._filtered[1].x, 1000);
        });

        it('should calculate data x positions when date is different', function () {
            // GIVEN
            timeline = new Timeline('#tl', {
                startDate: new Date(2016, 0, 1, 12, 0, 0),
                endDate: new Date(2016, 0, 2, 12, 0, 0)
            });

            // WHEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // THEN
            assert.equal(renderer._filtered[0].x, -500);
            assert.equal(renderer._filtered[1].x, 500);
            assert.equal(renderer._filtered[2].x, 1500);
        });
    });


    describe('_filter', function () {

        beforeEach(function () {
            data = _createData();
            $('#test').html('<div id="tl"></div><div id="renderer"></div>')
            timeline = new Timeline('#tl', {
                startDate: new Date(2016, 0, 1),
                endDate: new Date(2016, 0, 2)
            });
        });

        it('should filter data for domain', function () {
            // WHEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // THEN
            assert.equal(renderer._filtered.length, 2);
        });

        it('should filter data for domain slightly different date', function () {
            // GIVEN
            timeline = new Timeline('#tl', {
                startDate: new Date(2016, 0, 1, 0, 0, 1),
                endDate: new Date(2016, 0, 2, 0, 0, 1)
            });

            // WHEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // THEN
            assert.equal(renderer._filtered.length, 3);
        });

        it('should filter data for domain different date', function () {
            // GIVEN
            timeline = new Timeline('#tl', {
                startDate: new Date(2016, 0, 1, 12, 0, 0),
                endDate: new Date(2016, 0, 2, 12, 0, 0)
            });

            // WHEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // THEN
            assert.equal(renderer._filtered.length, 3);
        });

    });

    describe('draw', function () {

        beforeEach(function () {
            data = _createData();
            $('#test').html('<div id="tl"></div><div id="renderer"></div>')
            timeline = new Timeline('#tl', {
                startDate: new Date(2016, 0, 1, 0, 0, 0),
                endDate: new Date(2016, 0, 2, 0, 0, 0)
            });
        });

        it('should draw bars initially', function () {
            // WHEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // THEN
            var container = $('#renderer svg g.container');
            var lines = container.find('g.data-item line');
            assert.equal(container.attr('transform'), 'translate(0)');
            assert.equal(lines.length, 2);
            assert.equal($(lines[0]).attr('x1'), '0');
            assert.equal($(lines[1]).attr('x1'), '1000');
        });

        it('should draw bars after domain change', function () {
            // GIVEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // WHEN 
            timeline.scale.domain([new Date(2016, 0, 1, 1, 0, 0), new Date(2016, 0, 2, 1, 0, 0)]);
            events.publish('zoomend');

            // THEN
            var container = $('#renderer svg g.container');
            var lines = container.find('g.data-item line');
            assert.equal(container.attr('transform'), 'translate(-42)');
            assert.equal(lines.length, 3);
            assert.equal($(lines[0]).attr('x1'), '0');
            assert.equal($(lines[1]).attr('x1'), '1000');
            assert.equal($(lines[2]).attr('x1'), '2000');
        });
    });

    describe('redraw', function () {

        beforeEach(function () {
            data = _createData();
            $('#test').html('<div id="tl"></div><div id="renderer"></div>')
            timeline = new Timeline('#tl', {
                startDate: new Date(2016, 0, 1, 12, 0, 0),
                endDate: new Date(2016, 0, 2, 12, 0, 0)
            });
        });

        it('should move container, not lines', function () {
            // GIVEN
            var renderer = new BarRenderer(timeline, '#renderer', data);

            // WHEN
            timeline.scale.domain([new Date(2016, 0, 2, 0, 0, 0), new Date(2016, 0, 3, 0, 0, 0)]);
            renderer.redraw();

            // THEN
            var container = $('#renderer svg g.container');
            var lines = container.find('g.data-item line');
            assert.equal(container.attr('transform'), 'translate(-1000)');
            assert.equal($(lines[0]).attr('x1'), '0');
            assert.equal($(lines[1]).attr('x1'), '1000');
            assert.equal($(lines[2]).attr('x1'), '2000');
        });
    });
});