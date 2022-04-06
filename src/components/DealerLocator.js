import Promise from 'bluebird';
import cx from 'classnames';
import {getUserLocation, loadScript} from 'lib/utils';
import { Component } from 'preact';
import DirectionIcon from './DirectionIcon';
import SearchIcon from './SearchIcon';
import classNames from './DealerLocator.css';
import WebIcon from './WebIcon';

const travelModes = {
    DRIVING: 'car',
    WALKING: 'walk'
};

const units = {
    METRIC: 0,
    IMPERIAL: 1
};

const toMiles = 1.609;

export class DealerLocator extends Component {
    static defaultProps = {
        dealers: [],
        zoom: 6,
        limit: 10,
        center: { lat: 37.061050, lng: -122.007920 },
        travelMode: 'DRIVING',
        homeLocationHint: 'Current location',
        homeMarkerIcon: 'http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png',
        storeMarkerIcon: 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png',
        unitSystem: 'METRIC'
    };

    constructor(props) {
        super(props);
        this.state = {
            searchLocation: null,
            activeDealerId: null,
            dealers: props.dealers
        };
        this.markers = [];
    }

    loadGoogleMaps() {
        if (window.google && window.google.maps) return Promise.resolve();
        return loadScript(
            `https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}&libraries=geometry,places`
        );
    }

    getMarkerIcon(icon) {
        if (!icon) return null;
        const {markerIconSize} = this.props;
        if (typeof icon === 'string' && markerIconSize) {
            const iconSize = markerIconSize;
            return {
                url: icon,
                scaledSize: new google.maps.Size(iconSize[0], iconSize[1])
            };
        }
        return icon;
    }

    addDealerMarker = dealer => {
        const infoWindow = new google.maps.InfoWindow({
            content: `<div class="${classNames.infoWindow}">
                <h4>${dealer.name}</h4>
                ${dealer.address}
                </div>`
        });

        const marker = new google.maps.Marker({
            position: dealer.location,
            title: dealer.name,
            map: this.map,
            icon: this.getMarkerIcon(this.props.dealerMarkerIcon)
        });
        marker.addListener('click', () => {
            if (this.infoWindow) {
                this.infoWindow.close();
            }
            infoWindow.open(this.map, marker);
            this.infoWindow = infoWindow;
            this.setState({activeDealerId: dealer.id});
        });
        this.markers.push(marker);
    };

    getDistance(p1, p2) {
        const origin = new google.maps.LatLng(p1);
        const destination = new google.maps.LatLng(p2);
        const directDistance = this.getDirectDistance(origin, destination);
        return new Promise(resolve => {
            this.distanceService.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: this.props.travelMode,
                    unitSystem: units[this.props.unitSystem],
                    durationInTraffic: true,
                    avoidHighways: false,
                    avoidTolls: false
                },
                (response, status) => {
                    if (status !== 'OK') return resolve(directDistance);
                    const route = response.rows[0].elements[0];
                    if (route.status !== 'OK') return resolve(directDistance);
                    resolve({
                        distance: route.distance.value,
                        distanceText: route.distance.text,
                        durationText: route.duration.text
                    });
                }
            );
        });
    }

    getDirectDistance(origin, destination) {
        const distance =
            google.maps.geomtry.spherical.computeDistanceBetween(origin, destination) / 1000;
        if (units[props.unitSystem] === 1) {
            return {
                distance: distance / toMiles,
                distanceText: `${(distance / toMiles).toFixed(2)} mi`
            };
        }
        return {
            distance,
            distanceText: `${distance.toFixed(2)} km`
        };
    }

    setHomeMarker(location) {
        if (this.homeMarker) {
            this.homeMarker.setMap(null);
        }
        const infoWindow = new google.maps.InfoWindow({
            content: this.props.homeLocationHint
        });
        this.homeMarker = new google.maps.Marker({
            position: location,
            title: this.props.homeLocationHint,
            map: this.map,
            icon: this.getMarkerIcon(this.props.homeMarkerIcon)
        });
        this.homeMarker.addListener('click', () => {
            if (this.infoWindow) {
                this.infoWindow.close();
            }
            this.infoWindow.open(this.map, this.homeMarker);
            this.infoWindow = infoWindow;
        })
    }

    setupMap = () => {
        const { center, zoom } = this.props;
        this.map = new window.google.maps.Map(this.mapFrame, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });
        this.distanceService = new google.maps.DistanceMatrixService();
        const geocoder = new google.maps.Geocoder();
        this.setupAutocomplete();
        this.state.dealers.map(this.addDealerMarker);
        getUserLocation().then(location => {
            this.setState({searchLocation: location});
            this.calculateDistance(location);
            this.map.setCenter(location);
            this.map.setZoom(11);
            this.setHomeMarker(location);
            geocoder.geocode({ location: location }, (results, status) => {
                if (status === 'OK') {
                    if (results[0]) {
                        this.input.value = results[0].formatted_address;
                    }
                }
            });
        });
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
                this.map.setCenter(place.geometry.location);
                this.map.setZoom(11);
            }
            const location = place.geometry.location.toJSON();
            this.setState({searchLocation: location});
            this.setHomeMarker(location);
            this.calculateDistance(location);
        });
    }

    clearMarkers() {
        this.markers.forEach(m => {
            m.setMap(null);
        });
        this.markers = [];
    }

    calculateDistance(searchLocation) {
        const {dealers, limit} = this.props;
        if (!searchLocation) return dealers;
        Promise.map(dealers, dealer => {
            return this.getDistance(searchLocation, dealer.location).then(result => {
                Object.assign(dealer, result);
                return dealer;
            });
        }).then(data => {
            let result = data.sort((a, b) => a.distance - b.distance);
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(searchLocation);
            result = result.map((dealer, i) => {
                dealer.hidden = i + 1 > limit;
                if (!dealer.hidden) {
                    bounds.extend(dealer.location);
                }
                return dealer;
            });
            this.map.fitBounds(bounds);
            this.map.setZoom(this.map.getZoom() - 1);
            this.setState({dealers: result});
        });
    }

    componentDidMount() {
        this.loadGoogleMaps().then(this.setupMap);
    }

    onDealerClick({location, id}) {
        this.map.setCenter(location);
        this.map.setZoom(16);
        this.setState({activeDealerId: id});
    }

    render({searchHint, travelMode}, {activeDealerId, dealers}) {
        return (
            <div className={classNames.container}>
                <div className={classNames.searchBox}>
                    <div className={classNames.searchInput}>
                        <input type="text" ref={input => (this.input = input)} />
                        <SearchIcon className={classNames.searchIcon} />
                    </div>
                    {searchHint && <div className={classNames.searchHint}>{searchHint}</div>}
                    <ul className={classNames.dealersList}>
                        {dealers.map(dealer => {
                            const locationStr = `${dealer.location.lat},${dealer.location.lng}`;
                            return (
                                <li
                                    key={dealer.id}
                                    onClick={() => this.onDealerClick(dealer)}
                                    className={cx({
                                        [classNames.activeDealer]: dealer.id === activeDealerId,
                                        [classNames.hiddenDealer]: dealer.hidden
                                    })}>
                                    <h4>{dealer.name}</h4>
                                    {dealer.distanceText && (
                                        <div className={classNames.dealerDistance}>
                                            {dealer.distanceText} away{' '}
                                            {dealer.durationText &&
                                                `(${dealer.durationText} by ${travelModes[travelMode]})`}
                                        </div>
                                    )}
                                    <address>{dealer.address}</address>
                                    <div className={classNames.dealerActions} onClick={e => e.stopPropagation()}>
                                        <a target="_blank" href={`https://www.google.com/maps?daddr=@${locationStr}`}>
                                            <DirectionIcon />
                                            directions
                                        </a>{' '}
                                        {dealer.website && (
                                            <a target="_blank" href={dealer.website}>
                                                <WebIcon />
                                                website
                                            </a>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className={classNames.map} ref={mapFrame => (this.mapFrame = mapFrame)} />
            </div>
        )
    }
}