import 'ol/ol.css';
import './css/s111.css';

import {defaults as defaultControls, ScaleLine} from 'ol/control.js';
import {fromLonLat, METERS_PER_UNIT} from 'ol/proj';
import ArcGISRestImageSource from 'ol/source/ImageArcGISRest';
import ArcGISRestTileSource from 'ol/source/TileArcGISRest';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageWMSSource from 'ol/source/ImageWMS';
import OSMSource from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import XYZSource from 'ol/source/XYZ';

const S111_MODELS = {
  'cbofs': {
    'label': 'Chesapeake Bay',
    'center': [-76.087, 37.6],
    'zoom': 9,
    'source': new ImageWMSSource({
      url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'layers': 's100ofs_Geo:cbofs',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2018-07-13T13:00:00.000Z'),
    'end_time': new Date('2018-07-15T12:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'dbofs': {
    'label': 'Delaware Bay',
    'center': [-74.574, 38.75],
    'zoom': 10,
    'source': new ImageWMSSource({
      url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'layers': 's100ofs_Geo:dbofs',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2018-07-13T13:00:00.000Z'),
    'end_time': new Date('2018-07-15T12:00:00.000Z'),
    'time_step': 1 * 6 * 60 * 1000 // 1 hour
  },
  'gomofs': {
    'label': 'Gulf of Maine',
    'center': [-66.751, 42.019],
    'zoom': 8,
    'source': new ImageWMSSource({
      url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'layers': 's100ofs_Geo:gomofs',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2018-07-13T15:00:00.000Z'),
    'end_time': new Date('2018-07-16T12:00:00.000Z'),
    'time_step': 3 * 60 * 60 * 1000 // 1 hour
  },
  'tbofs': {
    'label': 'Tampa Bay',
    'center': [-82.773, 27.557],
    'zoom': 10,
    'source': new ImageWMSSource({
      url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'layers': 's100ofs_Geo:tbofs',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2018-07-11T13:00:00.000Z'),
    'end_time': new Date('2018-07-13T12:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  }
};

export default class {
  constructor() {
    this.initMap();
    this.initLabels();
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
      url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
    });

    this.basemapSourceESRITopo = new ArcGISRestTileSource({
      url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer'
    });

    this.basemapLayer = new TileLayer({
      source: this.basemapSourceESRISatellite
    });

    this.scaleLine = new ScaleLine();
    this.scaleLine.setUnits('us');

    this.map = new Map({
      controls: defaultControls({
        attributionOptions: {
          collapsible: false
        }})
        .extend([
          this.scaleLine
        ]),
      target: 'map-container',
      layers: [
        this.basemapLayer
      ],
      view: new View({
        //center: fromLonLat([-82.773, 27.557]),
        //zoom: 10
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

  initENC() {
    const source_enc = new ArcGISRestImageSource({
      url: 'https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/ENCOnline/MapServer/exts/Maritime%20Chart%20Server/MapServer',
      params: {
        'layers': 'show:0,2,3,4,5,6,7',
        'format': 'png8',
        'bboxsr': '{"wkid":3857}',
        'display_params':`{"ECDISParameters":{"version":"1.0","StaticParameters":{"Parameter":[{"name":"AreaSymbolizationType","value":2},{"name":"PointSymbolizationType","value":2}]},"DynamicParameters":{"Parameter":[{"name":"ColorScheme","value":3},{"name":"DisplayDepthUnits","value":1},{"name":"TwoDepthShades","value":1},{"name":"DisplayNOBJNM","value":1},{"name":"HonorScamin","value":2},{"name":"ShallowDepthPattern","value":1},{"name":"ShallowContour","value":2},{"name":"SafetyContour","value":10},{"name":"DeepContour","value":30},{"name":"DisplayCategory","value":"1,2,4"}]}}}`
      }
    });

    const oldfunc = source_enc.getRequestUrl_;
    source_enc.getRequestUrl_ = function(extent, size, pixelRatio, projection, params) {
      return oldfunc.apply(this, arguments)
        .replace('BBOX=', 'bbox=')
        .replace('BBOXSR=', 'bboxsr=')
        .replace('F=', 'f=')
        .replace('FORMAT=', 'format=')
        .replace('TRANSPARENT=', 'transparent=')
        .replace('SIZE=', 'size=')
        .replace('IMAGESR=', 'imagesr=')
        .replace('DPI=', 'dpi=');
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
      'esri-sat': {
        'label': 'ESRI Satellite Imagery',
        'source': this.basemapSourceESRISatellite
      }, 'stamen': {
        'label': 'Stamen',
        'source': this.basemapSourceStamen
      }, 'osm': {
        'label': 'OpenStreetMap',
        'source': this.basemapSourceOSM
      }, 'esri-topo': {
        'label': 'ESRI Topographic',
        'source': this.basemapSourceESRITopo
      }
    };
    Object.entries(basemaps).forEach(([id, bm]) => {
      const option = document.createElement('option');
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

  updateScaleLabel(scale) {
    this.scale_label_text.nodeValue = `Map Scale = 1 : ${scale}`;
  }

  updateTimeLabel(timeval) {
    this.time_label_text.nodeValue = `Valid Time: ${timeval.toGMTString()}`;
  }

  updateOFS(ofs_id) {
    if (!(ofs_id in S111_MODELS)) {
      console.error('Model does not exist:', ofs_id);
      return;
    }

    if (this.animation_interval) {
      clearInterval(this.animation_interval);
      this.animation_interval = null;
    }

    const ofs = S111_MODELS[ofs_id];

    let timeval = ofs.start_time;
    const params = ofs.source.getParams();
    params.time = timeval.toISOString();
    this.updateTimeLabel(timeval);
    ofs.source.updateParams(params);

    if (!this.layer_s111) {
      this.layer_s111 = new ImageLayer({
        source: ofs.source
      });
      this.map.addLayer(this.layer_s111);
    } else {
      this.layer_s111.setSource(S111_MODELS[ofs_id].source);
    }

    this.map.getView().setCenter(fromLonLat(ofs.center));
    this.map.getView().setZoom(ofs.zoom);

    // this.animation_interval = setInterval(() => {
    //   if (timeval >= ofs.end_time) {
    //     timeval = ofs.start_time;
    //   } else {
    //     timeval = new Date(timeval.getTime() + ofs.time_step);
    //   }
    //   const params = ofs.source.getParams();
    //   params.time = timeval.toISOString();
    //   ofs.source.updateParams(params);
    //   this.updateTimeLabel(timeval);
    // }, 2000);
  }

  initLabels() {
    this.time_label = document.createElement('div');
    this.time_label.setAttribute('id', 'time_label');
    this.time_label_text = document.createTextNode('');
    this.time_label.appendChild(this.time_label_text);
    document.getElementById('map-container').appendChild(this.time_label);

    this.scale_label = document.createElement('div');
    this.scale_label.setAttribute('id', 'scale_label');
    this.scale_label_text = document.createTextNode('');
    this.scale_label.appendChild(this.scale_label_text);
    document.getElementById('map-container').appendChild(this.scale_label);

    this.map.getView().on('change:resolution', (evt) => {
      const resolution = evt.target.get('resolution');
      const units = this.map.getView().getProjection().getUnits();
      const dpi = 96;//25.4 / 0.28;
      const mpu = METERS_PER_UNIT[units];
      const scale = Math.round(resolution * mpu * 39.37 * dpi);
      this.updateScaleLabel(scale);
    });
  }

  initS111() {
    this.ofsControl = document.createElement('select');
    this.ofsControl.setAttribute('id', 'ofs');
    Object.entries(S111_MODELS).forEach(([id, ofs]) => {
      const option = document.createElement('option');
      option.setAttribute('value', id);
      //option.setAttribute('selected', 'selected');
      option.appendChild(document.createTextNode(ofs.label));
      this.ofsControl.appendChild(option);
    });
    this.ofsControl.addEventListener('change', (evt) => {
      this.updateOFS(evt.target.value);
    });
    this.updateOFS(this.ofsControl.options[this.ofsControl.selectedIndex].value);

    document.getElementById('map-container').appendChild(this.ofsControl);
  }
}
