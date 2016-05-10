'use strict';

var testTextElement = d3.select('body')
    .append('svg')
    .style({
        position: 'absolute',
        left: '' + (-2 * document.body.clientWidth) + 'px',
        top: '' + (-2 * document.body.clientHeight) + 'px'
    })
    .attr('id', 'truncation-test')
    .append('text').node();

testTextElement.textContent = ' ';

testTextElement.getComputedTextLength();

function TruncationService() {

}

/**
 * Calculate the width of a character
 *
 * This method is memoized, so it only has to be calculated once per character.
 * This way there is only one reflow happening per character.
 * Most characters are already cached in the first few truncation calls, so the performance.
 *
 * @param character The character whose width needs to be calculated
 * @param style The styles of the original element, to make sure the width is calculated according to that
 * @returns {Number}
 * @private
 */
function _getCharacterWidth(character, style) {

    if (character.length !== 1) {
        throw new Error('Can only get the width of a single character');
    }

    _.extend(testTextElement.style, style);
    // A space does not take up space on its own, so it needs to be wrapped inbetween some characters that do take up space
    if (character === ' ') {
        testTextElement.textContent = 'a a';

        return testTextElement.getComputedTextLength() - 2 * getCharacterWidth('a', style);
    }

    testTextElement.textContent = character;

    return testTextElement.getComputedTextLength();
}

function _getCharacterWidthHasher(character, style) {
    return '' + character + '-' + JSON.stringify({
        'font-family': style['font-family'],
        'font-size': style['font-size'],
        'font-style': style['font-style']
    });
}

var getCharacterWidth = _.memoize(_getCharacterWidth, _getCharacterWidthHasher);

/**
 * Truncate the text with the given style to the maximum width.
 *
 * @param text
 * @param style The style in which the text should be preseted. It can be gotten using `getComputedStyle(element)`
 * @param maxWidth
 * @returns {String}
 * @private
 */
function _getTruncatedText(text, style, maxWidth) {
    var length = 0,
        width = 0,
        threeDotWidth = 3 * getCharacterWidth('.', style);

    if (text === null || text === undefined || text.length === 0) {
        return '';
    }

    text = text.replace(/\s*$/, '');

    for (;
        (width < maxWidth) && (length < text.length); length++) {
        width += getCharacterWidth(text.charAt(length), style);
    }

    if (length === text.length) {
        return text;
    }

    if (threeDotWidth > maxWidth) {
        return '';
    }

    // remove trailing whitespaces, because they are not counted in the truncation
    return text
        .slice(0, length - 1)
        .slice(0, -3) + '...';
}

function _getTruncatedTextHasher(text, style, maxWidth) {
    return '' + text + '-' + maxWidth + '-' + JSON.stringify({
        'font-family': style['font-family'],
        'font-size': style['font-size'],
        'font-style': style['font-style']
    });
}

var getTruncatedText = _.memoize(_getTruncatedText, _getTruncatedTextHasher);
TruncationService.prototype.getTruncatedText = getTruncatedText;

function _getTextWidth(text, style) {
    var width = 0;

    _.each(text, function (character) {
        width += getCharacterWidth(character, style)
    });

    return width;
}

var getTextWidth = _.memoize(_getTextWidth, _getTruncatedTextHasher);
TruncationService.prototype.getTextWidth = getTextWidth;

/**
 * Truncation method
 * The truncation is done by calculating the width of each character.
 * The width is then memoized, so it only has to be calculated once.
 * This reduces the amount of reflows per truncation to a minimum. (sometimes it is none)
 *
 * Important, this does not work for multiline texts.
 *
 * @param element The element, which should be truncated.
 * @param maxWidth The maximum width, to which the element should be truncated
 */
function truncate(element, maxWidth) {
    if ((element !== undefined) && (element !== null)) {
        element.textContent = getTruncatedText(element.textContent, getComputedStyle(element), maxWidth);
    }
    // TODO: Store truncation cache in localstorage
}
TruncationService.prototype.truncate = truncate;