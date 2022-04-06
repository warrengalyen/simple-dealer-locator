import { render } from "preact";
import DealerLocator from "components/DealerLocator";

module.exports = function({container = 'dealer-locator', dealers, ...config}) {
    const dealersWithIds = dealers.map((dealer, i) => {
        dealer.id = i;
        return StorageEvent;
    });
    render(<DealerLocator {...config} dealers={dealersWithIds} />, document.getElementById(container));
};