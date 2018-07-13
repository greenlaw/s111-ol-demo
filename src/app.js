import 'ol/ol.css';
import './css/s111.css';

import { fromLonLat } from 'ol/proj';
import ArcGISRestImageSource from 'ol/source/ImageArcGISRest';
import ArcGISRestTileSource from 'ol/source/TileArcGISRest';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageWMSSource from 'ol/source/ImageWMS';
import OSMSource from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import XYZSource from 'ol/source/XYZ';

export default class {
  constructor() {
    this.initMap();
    this.initBasemapControl();
    this.initENC();
    this.initS111();
  }

  initMap() {
    this.basemapSourceStamen = new XYZSource({
      url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
    });

    this.basemapSourceOSM = new OSMSource();

    this.basemapSourceESRISatellite = new ArcGISRestTileSource({
      url: "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
    });

    this.basemapSourceESRITopo = new ArcGISRestTileSource({
      url: "http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer"
    })

    this.basemapLayer = new TileLayer({
      source: this.basemapSourceStamen
    });

    this.map = new Map({
      target: 'map-container',
      layers: [
        this.basemapLayer
      ],
      view: new View({
        center: fromLonLat([-82.773, 27.557]),
        zoom: 10
      })
    });
  }

  initRNC() {
    this.layer_rnc = new TileLayer({
      source: new XYZSource({
        url: 'http://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png'
      })
    });
    this.map.addLayer(this.layer_rnc);
  }

  /**
   * NOT WORKING - DISPLAY PROBLEM
   */
  initENC() {
    const source_enc = new ArcGISRestImageSource({
      url: "https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/ENCOnline/MapServer/exts/Maritime%20Chart%20Server/MapServer",
      params: {
        'layers': 'show:0,2,3,4,5,6,7',
        'format': 'png8',
        'bboxsr': `{"wkid":3857}`,
        'display_params':`{"ECDISParameters":{"version":"1.0","StaticParameters":{"Parameter":[{"name":"AreaSymbolizationType","value":2},{"name":"PointSymbolizationType","value":2}]},"DynamicParameters":{"Parameter":[{"name":"ColorScheme","value":3},{"name":"DisplayDepthUnits","value":1},{"name":"TwoDepthShades","value":1},{"name":"DisplayNOBJNM","value":1},{"name":"HonorScamin","value":2},{"name":"ShallowDepthPattern","value":1},{"name":"ShallowContour","value":2},{"name":"SafetyContour","value":10},{"name":"DeepContour","value":30},{"name":"DisplayCategory","value":"1,2,4"}]}}}`
      }
    });

    const oldfunc = source_enc.getRequestUrl_;
    source_enc.getRequestUrl_ = function(extent, size, pixelRatio, projection, params) {
      return oldfunc.apply(this, arguments)
        .replace('BBOX=','bbox=')
        .replace('BBOXSR=','bboxsr=')
        .replace('F=','f=')
        .replace('FORMAT=','format=')
        .replace('TRANSPARENT=','transparent=')
        .replace('SIZE=','size=')
        .replace('IMAGESR=','imagesr=')
        .replace('DPI=','dpi=');
    };

    this.layer_enc = new ImageLayer({
      source: source_enc
    });
    this.map.addLayer(this.layer_enc);
  }

  initBasemapControl() {
    this.basemapControl = document.createElement('select');
    this.basemapControl.setAttribute('id', 'basemap');
    const basemaps = {
      'stamen': {
        'label': 'Stamen',
        'source': this.basemapSourceStamen
      }, 'osm': {
        'label': 'OpenStreetMap',
        'source': this.basemapSourceOSM
      }, 'esri-sat': {
        'label': 'ESRI Satellite Imagery',
        'source': this.basemapSourceESRISatellite
      }, 'esri-topo': {
        'label': 'ESRI Topographic',
        'source': this.basemapSourceESRITopo
      }
    };
    Object.entries(basemaps).forEach(([id, bm]) => {
      let option = document.createElement('option');
      option.setAttribute('value', id);
      //option.setAttribute('selected', 'selected');
      option.appendChild(document.createTextNode(bm.label));
      this.basemapControl.appendChild(option);
    });

    this.basemapControl.addEventListener('change', (evt) => {
      this.basemapLayer.setSource(basemaps[evt.target.value].source);
    });

    document.getElementById('map-container').appendChild(this.basemapControl);
  }

  initS111() {
    const startTime = new Date("2018-07-11T13:00:00.000Z");
    const endTime = new Date("2018-07-13T12:00:00.000Z");
    const timeStep = 1 *60*60*1000; // 1 hour
    let timeval = startTime;
    this.layer_s111 = new ImageLayer({
      source: new ImageWMSSource({
        url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
        params: {
          'layers': 's100ofs_Geo:s100ofs',
          'format': 'image/png8',
          'transparent': 'true',
          'time': timeval
        },
        ratio: 1
      })
    });
    this.map.addLayer(this.layer_s111);

    const label = document.createElement('div');
    label.setAttribute("id", "label");
    const labelText = document.createTextNode(`Valid Time: ${timeval.toGMTString()}`);
    label.appendChild(labelText);
    document.getElementById('map-container').appendChild(label);

    setInterval(() => {
      if (timeval >= endTime) {
        timeval = startTime;
      } else {
        timeval = new Date(timeval.getTime() + timeStep);
      }
      const params = this.layer_s111.getSource().getParams();
      params.time = timeval.toISOString();
      this.layer_s111.getSource().updateParams(params);
      labelText.nodeValue = `Valid Time: ${timeval.toGMTString()}`;
    }, 2000);
  }
}
