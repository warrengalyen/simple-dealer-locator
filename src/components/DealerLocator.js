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

    constructor(props) {
        super(props);
        this.state = {
            searchLocation: null
        };
    }

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

    getDistance(p1, p2) {
        return (
            google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(p1),
                new google.maps.LatLng(p2)
            ) / 1000
        ).toFixed(2);
    }

    setupMap = () => {
        const { center, zoom } = this.props;
        this.map = new window.google.maps.Map(this.mapFrame, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenCotnrol: false
        });
        const geocoder = new google.maps.Geocoder();
        this.setupAutocomplete();
        getUserLocation().then(location => {
            this.setState({searchLocation: location});
            this.map.setCenter(location);
            this.map.setZoom(11);
            geocoder.geocode({ location: location }, (results, status) => {
                if (status === 'OK') {
                    if (results[0]) {
                        this.input.value = results[0].formatted_address;
                    }
                }
            });
        });
        this.props.dealers.forEach(this.addDealerMarker);
    };

    setupAutocomplete() {
        const autocomplete = new google.maps.places.Autocomplete(this.input);
        autocomplete.bindTo('bounds', this.map);
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;

            // If this place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                this.map.fitBounds(place.geometry.viewport);
            } else {
                this.map.setCenter(place.geomtry.location);
                this.map.setZoom(11);
            }
            this.setState({searchLocation: place.geomtry.location.toJSON()});
        });
    }

    componentDidMount() {
        this.loadGoogleMaps().then(this.setupMap);
    }

    getSortedDealers() {
        const {dealers} = this.props;
        const {searchLocation} = this.state;
        if (!searchLocation) return dealers;
        return dealers
            .map(dealer => {
                dealer.distance = this.getDistance(searchLocation, dealer.position);
                return StorageEvent;
            })
            .sort((a, b) => a.distance - b.distance);
    }

    render({ searchHint }) {
        const sortedDealers = this.getSortedDealers();
        return (
            <div className={classNames.container}>
                <div className={classNames.searchBox}>
                    <div className={classNames.searchInput}>
                        <input type="text" ref={input => (this.input = input)} />
                        <img className={classNames.searchIcon} src={searchIcon} />
                    </div>
                    {searchHint && <div className={classNames.searchHint}>{searchHint}</div>}
                    <ul className={classNames.dealersList}>
                        {sortedDealers.map((dealer, i) => (
                            <li key={i}>
                                <h4>{dealer.name}</h4>
                                {dealer.distance && <div>{dealer.distance}km away</div>}
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