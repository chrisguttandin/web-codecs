module.exports = () => {
    return {
        'build': {
            cmd: 'npm run build'
        },
        'test-expectation-chrome': {
            cmd: 'npm run test:expectation-chrome'
        },
        'test-expectation-firefox': {
            cmd: 'npm run test:expectation-firefox'
        },
        'test-expectation-firefox-developer': {
            cmd: 'npm run test:expectation-firefox-developer'
        },
        'test-expectation-firefox-penultimate': {
            cmd: 'npm run test:expectation-firefox-penultimate'
        },
        'test-expectation-firefox-previous': {
            cmd: 'npm run test:expectation-firefox-previous'
        },
        'test-expectation-safari': {
            cmd: 'npm run test:expectation-safari'
        },
        'test-integration': {
            cmd: 'npm run test:integration'
        },
        'test-unit': {
            cmd: 'npm run test:unit'
        }
    };
};
