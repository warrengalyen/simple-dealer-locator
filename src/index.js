const { render } = require('preact');
const { DealerLocator } = require('components/DealerLocator');

module.exports = function ({ container = 'dealer-locator', ...config }) {
    render(<DealerLocator {...config} />, document.getElementById(container));
};