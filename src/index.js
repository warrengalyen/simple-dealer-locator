import { render } from "preact";
import DealerLocator from "components/DealerLocator";

module.exports = function({container, stores, apiKey, zoom, defaultCenter, markerIcon}) {
    render(
        <DealerLocator 
            dealers={dealers} 
            apiKey={apiKey} 
            zoom={zoom} 
            defaultCenter={defaultCenter} 
            markerIcon={markerIcon}
        />,
        document.getElementById(container)
    );
};