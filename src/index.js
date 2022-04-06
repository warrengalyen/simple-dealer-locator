const { render } = require('preact');
const { DealerLocator } = require('components/DealerLocator');

module.exports = function ({ container = 'dealer-locator', dealers, ...config }) {
    const dealersWithIds = dealers.map((dealer, i) => {
        dealer.id = i;
        return dealer;
    });
    render(<DealerLocator {...config} dealers={dealersWithIds} />, document.getElementById(container));
};