import { Component } from 'preact';
import { loadScript, getUserLocation } from './lib/utils';
import classNames from './DealerLocator.css';
import markerIcon from './pin.svg';
import searchIcon from './search.svg';

class DealerLocator extends Component {
    static defaultProps = {
        dealers: [],
        zoom: 6,
        center: { lat: 37.061050, lng: -122.007920 },
        markerIcon: markerIcon
    };

    loadGoogleMaps() {
        if (window.google && window.google.maps) return Promise.resolve();
        return loadScript(
            `https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}&libraries=geometry,places`
        );
    }

    addDealerMarker = dealer => {
        const infoWindow = new google.maps.InfoWindow({
            content: `<div class=${classNames.infoWindow}">
                <h4>${dealer.name}</h4>
                ${dealer.address}
                </div>`
        });
        const marker = new google.maps.Marker({
            position: dealer.position,
            title: dealer.name,
            map: this.map,
            icon: this.props.markerIcon
        });
        marker.addListener('click', function () {
            if (this.infoWindow) {
                this.infoWindow.close();
            }
            infoWindow.open(this.map, marker);
            this.infoWindow = infoWindow;
        });
    };

    setupMap = () => {
        const { center, zoom } = this.props;
        this.map = new window.google.maps.Map(this.mapFrame, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenCotnrol: false
        });
        this.geocoder = new google.maps.Geocoder();
        this.autocomplete = new google.maps.places.Autocomplete(this.input);
        this.autocomplate.bindTo('bounds', this.map);
        getUserLocation().then(location => {
            this.map.setCenter(location);
            this.geocoder.geocode({ location: location }, (results, status) => {
                if (status === 'OK') {
                    if (results[0]) {
                        this.input.value = results[0].formatted_address;
                    }
                }
            });
        });
        this.props.dealers.forEach(this.addDealerMarker);
    };

    componentDidMount() {
        this.loadGoogleMaps().then(this.setupMap);
    }

    render({ dealers, searchHint }) {
        return (
            <div className={classNames.container}>
                <div className={classNames.searchBox}>
                    <div className={classNames.searchInput}>
                        <input type="text" ref={input => (this.input = input)} />
                        <img className={classNames.searchIcon} src={searchIcon} />
                    </div>
                    {searchHint && <div className={classNames.searchHint}>{searchHint}</div>}
                    <ul className={classNames.dealersList}>
                        {dealers.map((dealer, i) => (
                            <li key={i}>
                                <h4>{dealer.name}</h4>
                                <address>{dealer.address}</address>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={classNames.map} ref={mapFrame => (this.mapFrame = mapFrame)} />
            </div>
        )
    }
}

export default DealerLocator;