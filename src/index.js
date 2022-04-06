import { render } from "preact";
import DealerLocator from "components/DealerLocator";

module.exports = function({container = 'dealer-locator', ...config}) {
    render(<DealerLocator {...config} />, document.getElementById(container));
};