const { env } = require('process');

// eslint-disable-next-line padding-line-between-statements
const filter = (predicate, ...tasks) => (predicate ? tasks : []);
const isTarget = (...targets) => env.TARGET === undefined || targets.includes(env.TARGET);
const isType = (...types) => env.TYPE === undefined || types.includes(env.TYPE);

module.exports = {
    build: ['sh:build'],
    test: [
        ...filter(
            isType('expectation'),
            ...filter(isTarget('chrome'), 'sh:test-expectation-chrome'),
            ...filter(isTarget('firefox'), 'sh:test-expectation-firefox'),
            ...filter(isTarget('firefox-developer'), 'sh:test-expectation-firefox-developer'),
            ...filter(isTarget('firefox-penultimate'), 'sh:test-expectation-firefox-penultimate'),
            ...filter(isTarget('firefox-previous'), 'sh:test-expectation-firefox-previous'),
            ...filter(isTarget('safari'), 'sh:test-expectation-safari')
        ),
        ...filter(isType('integration'), 'sh:test-integration'),
        ...filter(isType('unit'), 'sh:test-unit')
    ]
};
