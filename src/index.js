import { render } from "preact";
import DealerLocator from "components/DealerLocator";

module.exports = function({container, stores, apiKey, zoom, defaultCenter}) {
    render(
        <DealerLocator stores={stores} apiKey={apiKey} zoom={zoom} defaultCenter={defaultCenter} />,
        document.getElementById(container)
    );
};