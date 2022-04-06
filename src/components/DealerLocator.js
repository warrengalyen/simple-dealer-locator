import { Component } from 'preact';
import { loadScript } from './lib/utils';
import classNames from './DealerLocator.css';
import markerIcon from './pin.svg';

class DealerLocator extends Component {
    static defaultProps = {
        dealers: [],
        zoom: 6,
        center: {lat: 37.061050, lng: -122.007920},
        markerIcon: markerIcon
    };

    loadGoogleMaps() {
       if (window.google && window.google.maps) return Promise.resolve();
       return loadScript(
            `https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}&libraries=geometry,places`
       );
    }

    centerOnUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                p => {
                    this.map.setCenter(new google.maps.LatLng(p.coords.latitude, p.coords.longitude));
                },
                () => {
                    throw new Error('user denied request for position');
                }
            );
        } else {
            throw new Error('no geolocation support')
        }
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
        marker.addListener('click', function() {
            if (this.infoWindow) {
                this.infoWindow.close();
            }
            infoWindow.open(this.map, marker);
            this.infoWindow = infoWindow;
        });
    };

    constructMap = () => {
        const {center, zoom} = this.props;
        this.map = new window.google.maps.Map(this.mapFrame, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenCotnrol: false
        });
        this.centerOnUserLocation();
        this.props.dealers.forEach(this.addDealerMarker);
    };

    componentDidMount() {
        this.loadGoogleMaps().then(this.constructMap);
    }

    render({dealers}) {
        return (
            <div className={classNames.container}>
                <div className={classNames.searchBox}>
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