import 'ol/ol.css';
import './css/s111.css';
import '@fortawesome/fontawesome-free/css/all.css';

import {defaults as defaultControls, ScaleLine} from 'ol/control.js';
import {
  fromLonLat,
  toLonLat,
  METERS_PER_UNIT,
  get as getProjection
} from 'ol/proj';
import { getWidth, getTopLeft } from 'ol/extent';
import { GeoJSON } from 'ol/format';
import ArcGISRestImageSource from 'ol/source/ImageArcGISRest';
import ArcGISRestTileSource from 'ol/source/TileArcGISRest';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageWMSSource from 'ol/source/ImageWMS';
import OSMSource from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import XYZSource from 'ol/source/XYZ';
import { Overlay } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

const S111_MODELS = {
  'cbofs': {
    'label': 'Chesapeake Bay',
    'center': [-76.087, 37.6],
    'zoom': 9,
    'source': new ImageWMSSource({
      url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'layers': 's100ofs_Geo:pn_cbofs',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2019-12-31T19:00:00.000Z'),
    'end_time': new Date('2020-01-02T18:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  // 'dbofs': {
  //   'label': 'Delaware Bay',
  //   'center': [-74.574, 38.75],
  //   'zoom': 10,
  //   'source': new ImageWMSSource({
  //     url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
  //     params: {
  //       'layers': 's100ofs_Geo:dbofs',
  //       'format': 'image/png8',
  //       'transparent': 'true'
  //     },
  //     ratio: 1
  //   }),
  //   'start_time': new Date('2018-07-13T13:00:00.000Z'),
  //   'end_time': new Date('2018-07-15T12:00:00.000Z'),
  //   'time_step': 1 * 6 * 60 * 1000 // 1 hour
  // },
  'gomofs': {
    'label': 'Gulf of Maine',
    'center': [-69.833, 42.223],
    'zoom': 8,
    'source': new ImageWMSSource({
      url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'layers': 's100ofs_Geo:pn_gomofs',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2019-12-31T21:00:00.000Z'),
    'end_time': new Date('2020-01-03T18:00:00.000Z'),
    'time_step': 3 * 60 * 60 * 1000 // 3 hours
  },
  'ngofs': {
    'label': 'Northern Gulf of Mexico',
    'center': [-90.925, 28.960],
    'zoom': 8,
    'source': new ImageWMSSource({
      url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'layers': 's100ofs_Geo:pn_ngofs',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2019-12-31T16:00:00.000Z'),
    'end_time': new Date('2020-01-02T15:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'nyofs': {
    'label': 'New York/New Jersey Harbor',
    'center': [-74.009, 40.551],
    'zoom': 11,
    'source': new ImageWMSSource({
      url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'layers': 's100ofs_Geo:pn_nyofs',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2019-12-31T18:00:00.000Z'),
    'end_time': new Date('2020-01-02T23:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  }
  // ,
  // 'tbofs': {
  //   'label': 'Tampa Bay',
  //   'center': [-82.773, 27.557],
  //   'zoom': 10,
  //   'source': new ImageWMSSource({
  //     url: 'https://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
  //     params: {
  //       'layers': 's100ofs_Geo:tbofs',
  //       'format': 'image/png8',
  //       'transparent': 'true'
  //     },
  //     ratio: 1
  //   }),
  //   'start_time': new Date('2018-07-11T13:00:00.000Z'),
  //   'end_time': new Date('2018-07-13T12:00:00.000Z'),
  //   'time_step': 1 * 60 * 60 * 1000 // 1 hour
  // }
};

export default class {
  constructor() {
    this.initMap();
    this.initEventHandlers();
    this.initLabels();
    this.initMenu();
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

  /**
   * Vector layer for highlighting selected features.
   */
  initHighlightLayer() {
    this.source_highlight = new VectorSource();
    this.layer_highlight = new VectorLayer({
      source: this.source_highlight,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(255,255,0,1.0)',
          width: 4
        })
      })
    });
    this.map.addLayer(this.layer_highlight);
  }

  buildAttributeTable(container, attributes) {
    container.innerHTML = `<table class="popup_table">
  <thead>
    <tr>
      <th>S-100 Product</th>
      <th>${attributes.S100_Prod}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Forecast Model System</td>
      <td>${attributes.OFS}</td>
    </tr>
    <tr>
      <td>Agency</td>
      <td>NOS</td>
    </tr>
    <tr>
      <td>Forecast Cycles</td>
      <td>${attributes.Cycles}</td>
    </tr>
    <tr>
       <td>Forecast Horizon</td>
       <td>${attributes.Projection}</td>
    </tr>
    <tr>
       <td>Product Type</td>
       <td>${attributes.Prod_Type}</td>
    </tr>
      <tr>
       <td>Variable</td>
       <td>${attributes.Variable}</td>
    </tr>
     <tr>
       <td>Depth</td>
       <td>${attributes.Depth}</td>
    </tr>
    <tr>
       <td>Spatial Resolution</td>
       <td>${attributes.SpatialRes}</td>
    </tr>
    <tr>
       <td>Cell Name</td>
       <td>${attributes.CellName}</td>
    </tr>
    <tr>
       <td>Band Number</td>
       <td>${attributes.Band_Num}</td>
    </tr>
    <tr>
       <td>Download</td>
       <td><a href=''>Latest Forecast File (S-111 HDF-5)</a></td>
    </tr>
  </tbody>
</table>`;
  }

  initEventHandlers() {
    this.clickOverlay = new Overlay({
      element: document.getElementById("query-popup"),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    this.map.addOverlay(this.clickOverlay);

    this.map.on("singleclick", (evt) => {
      //const lonLat = toLonLat(evt.coordinate);
      let queryURL = this.source_tilescheme.getGetFeatureInfoUrl(
        evt.coordinate,
        this.map.getView().getResolution(),
        'EPSG:3857',
        {'INFO_FORMAT': 'application/json'}
      );
      // Workaround issue with GeoServer 2.12 WMS 1.3.0 GetFeatureInfo requests
      queryURL = queryURL.replace("VERSION=1.3.0","VERSION=1.1.1");
      queryURL = queryURL.replace("I=", "X=");
      queryURL = queryURL.replace("J=", "Y=");
      queryURL = queryURL.replace("CRS=", "SRS=");
      
      fetch(queryURL)
        .then(response => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0 && data.features[0].properties) {
            this.source_highlight.clear();
            const geojsonFeature = new GeoJSON().readFeature(data.features[0]);
            this.source_highlight.addFeature(geojsonFeature);
            const contentElem = document.getElementById("query-popup-content");
            
            if (this.popupTableContainer) {
              this.popupTableContainer.remove();
              this.popupTableContainer = null;
            }
            this.popupTableContainer = document.createElement('div');
            this.buildAttributeTable(this.popupTableContainer, data.features[0].properties);
            contentElem.appendChild(this.popupTableContainer);
            this.clickOverlay.setPosition(evt.coordinate);
          }
        });
    });

    this.overlayCloser = document.getElementById("query-popup-closer");
    this.overlayCloser.onclick = () => {
      this.source_highlight.clear();
      this.clickOverlay.setPosition(undefined);
      this.overlayCloser.blur();
      return false;
    }
  }

  initMenu() {
    this.menu_outer = document.createElement('div');
    this.menu_outer.className = 'menu-outer';
    this.menu_inner = document.createElement('div');
    this.menu_inner.className = 'menu-inner';

    this.initBasemapControl();
    this.initS111();
    this.initENC();
    this.initTileScheme();
    this.initBathy();
    this.initHighlightLayer();
    this.initAnimationControl();

    // Trigger layer update
    this.updateOFS(this.ofsControl.options[this.ofsControl.selectedIndex].value);

    this.menu_outer.appendChild(this.menu_inner);
    document.getElementById('map-container').appendChild(this.menu_outer);
  }

  initBathy() {
    const epsg3857 = getProjection('EPSG:3857');
    const size = getWidth(epsg3857.getExtent()) / 256;
    const resolutions = new Array(19);
    const matrixIds = new Array(19);
    for (let z=0; z < 19; z++) {
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = z;
    }
    this.source_bag_hillshade = new WMTS({
      url: 'https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer/WMTS',
      layer: 'bag_hillshades',
      matrixSet: 'GoogleMapsCompatible',
      format: 'image/jpgpng',
      projection: epsg3857,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(epsg3857.getExtent()),
        resolutions: resolutions,
        matrixIds: matrixIds
      }),
      style: 'default',
      wrapX: true
    });
    this.layer_bag_hillshade = new TileLayer({
      source: this.source_bag_hillshade
    });
    this.map.addLayer(this.layer_bag_hillshade);

    this.bathyControlElem = document.createElement('div');
    this.bathyControlElem.className = 'layer-toggle';
    this.bathyControlLabel = document.createElement('label');
    this.bathyControl = document.createElement('input');
    this.bathyControl.setAttribute('type', 'checkbox');
    this.bathyControl.setAttribute('checked', 'checked');
    this.bathyControlLabel.appendChild(this.bathyControl);
    this.bathyControlLabelSpan = document.createElement('span');
    this.bathyControlLabel.appendChild(this.bathyControlLabelSpan);
    this.bathyControlLabelSpan.appendChild(document.createTextNode('Bathymetry'));
    this.bathyControlElem.appendChild(this.bathyControlLabel);
    const bathyControlChanged = (evt) => {
      if (this.bathyControl.checked) {
        this.layer_bag_hillshade.setVisible(true);
      } else {
        this.layer_bag_hillshade.setVisible(false);
      }
    };
    this.bathyControl.addEventListener('change', bathyControlChanged);
    bathyControlChanged();
    this.menu_inner.appendChild(this.bathyControlElem);
  }

  initTileScheme() {
    this.source_tilescheme = new TileWMS({
      url: 'http://nimbostratus.ccom.nh/geoserver/s100ofs_Geo/wms',
      params: {
        'LAYERS': 'S111_Tiles',
        'FORMAT': 'image/png',
        'TRANSPARENT': 'true'
      }
    });
    this.layer_tilescheme = new TileLayer({
      source: this.source_tilescheme
    });
    this.map.addLayer(this.layer_tilescheme);

    this.tileControlElem = document.createElement('div');
    this.tileControlElem.className = 'layer-toggle';
    this.tileControlLabel = document.createElement('label');
    this.tileControl = document.createElement('input');
    this.tileControl.setAttribute('type', 'checkbox');
    this.tileControl.setAttribute('checked', 'checked');
    this.tileControlLabel.appendChild(this.tileControl);
    this.tileControlLabelSpan = document.createElement('span');
    this.tileControlLabel.appendChild(this.tileControlLabelSpan);
    this.tileControlLabelSpan.appendChild(document.createTextNode('ENC Tile Scheme'));
    this.tileControlElem.appendChild(this.tileControlLabel);
    const tileControlChanged = (evt) => {
      if (this.tileControl.checked) {
        this.layer_tilescheme.setVisible(true);
      } else {
        this.layer_tilescheme.setVisible(false);
      }
    };
    this.tileControl.addEventListener('change', tileControlChanged);
    tileControlChanged();
    this.menu_inner.appendChild(this.tileControlElem);
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
      url: 'https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/ENCOnline/MapServer/exts/MaritimeChartService/MapServer',
      params: {
        'layers': 'show:2,3,4,5,6,7',
        'format': 'png8',
        'bboxsr': '{"wkid":3857}',
        'display_params': JSON.stringify({
          "ECDISParameters": {
            "version": "10.6.1 P5",
            "DynamicParameters": {
              "Parameter": [{
                "name": "AreaSymbolizationType",
                "value": 2
              }, {
                "name": "AttDesc",
                "value": 1
              }, {
                "name": "ColorScheme",
                "value": 0
              }, {
                "name": "CompassRose",
                "value": 1
              }, {
                "name": "DataQuality",
                "value": 1
              }, {
                "name": "DateDependencyRange",
                "value": ""
              }, {
                "name": "DateDependencySymbols",
                "value": 1
              }, {
                "name": "DeepContour",
                "value": 30
              }, {
                "name": "DisplayAIOFeatures",
                "value": "1,2,3,4,5,6,7"
              }, {
                "name": "DisplayCategory",
                "value": "1,2,4"
              }, {
                "name": "DisplayDepthUnits",
                "value": 1
              }, {
                "name": "DisplayFrames",
                "value": 2
              }, {
                "name": "DisplayFrameText",
                "value": 0
              }, {
                "name": "DisplayFrameTextPlacement",
                "value": 1
              }, {
                "name": "DisplayLightSectors",
                "value": 2
              }, {
                "name": "DisplayNOBJNM",
                "value": 2
              }, {
                "name": "DisplaySafeSoundings",
                "value": 2
              }, {
                "name": "HonorScamin",
                "value": 2
              }, {
                "name": "IntendedUsage",
                "value": "0"
              }, {
                "name": "IsolatedDangers",
                "value": 1
              }, {
                "name": "IsolatedDangersOff",
                "value": 1
              }, {
                "name": "LabelContours",
                "value": 1
              }, {
                "name": "LabelSafetyContours",
                "value": 1
              }, {
                "name": "OptionalDeepSoundings",
                "value": 1
              }, {
                "name": "PointSymbolizationType",
                "value": 2
              }, {
                "name": "RemoveDuplicateText",
                "value": 2
              }, {
                "name": "SafetyContour",
                "value": 30
              }, {
                "name": "SafetyDepth",
                "value": 30
              }, {
                "name": "ShallowContour",
                "value": 2
              }, {
                "name": "TextHalo",
                "value": 2
              }, {
                "name": "TwoDepthShades",
                "value": 1
              }],
              "ParameterGroup": [{
                "name": "AreaSymbolSize",
                "Parameter": [{
                  "name": "scaleFactor",
                  "value": 1
                }, {
                  "name": "minZoom",
                  "value": 0.1
                }, {
                  "name": "maxZoom",
                  "value": 1.2
                }]
              }, {
                "name": "DatasetDisplayRange",
                "Parameter": [{
                  "name": "minZoom",
                  "value": 0.1
                }, {
                  "name": "maxZoom",
                  "value": 1.2
                }]
              }, {
                "name": "LineSymbolSize",
                "Parameter": [{
                  "name": "scaleFactor",
                  "value": 1
                }, {
                  "name": "minZoom",
                  "value": 0.1
                }, {
                  "name": "maxZoom",
                  "value": 1.2
                }]
              }, {
                "name": "PointSymbolSize",
                "Parameter": [{
                  "name": "scaleFactor",
                  "value": 1
                }, {
                  "name": "minZoom",
                  "value": 0.1
                }, {
                  "name": "maxZoom",
                  "value": 1.2
                }]
              }, {
                "name": "TextGroups",
                "Parameter": [{
                  "name": "11",
                  "value": 2
                }, {
                  "name": "21",
                  "value": 2
                }, {
                  "name": "23",
                  "value": 2
                }, {
                  "name": "24",
                  "value": 2
                }, {
                  "name": "25",
                  "value": 2
                }, {
                  "name": "26",
                  "value": 2
                }, {
                  "name": "27",
                  "value": 2
                }, {
                  "name": "28",
                  "value": 2
                }, {
                  "name": "29",
                  "value": 2
                }, {
                  "name": "30",
                  "value": 2
                }]
              }, {
                "name": "TextSize",
                "Parameter": [{
                  "name": "scaleFactor",
                  "value": 1
                }, {
                  "name": "minZoom",
                  "value": 0.1
                }, {
                  "name": "maxZoom",
                  "value": 1.2
                }]
              }]
            }
          }
        })
      }
    });

    // Workaround for case sensitivity on ArcGIS Server Maritime Chart Service
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
      source: source_enc,
      visible: false
    });
    this.map.addLayer(this.layer_enc);

    this.encControlElem = document.createElement('div');
    this.encControlElem.className = 'layer-toggle';
    this.encControlLabel = document.createElement('label');
    this.encControl = document.createElement('input');
    this.encControl.setAttribute('type', 'checkbox');
    this.encControl.setAttribute('checked', 'checked');
    this.encControlLabel.appendChild(this.encControl);
    this.encControlLabelSpan = document.createElement('span');
    this.encControlLabel.appendChild(this.encControlLabelSpan);
    this.encControlLabelSpan.appendChild(document.createTextNode('Electronic Charts'));
    this.encControlElem.appendChild(this.encControlLabel);
    const encControlChanged = (evt) => {
      if (this.encControl.checked) {
        this.layer_enc.setVisible(true);
      } else {
        this.layer_enc.setVisible(false);
      }
    };
    this.encControl.addEventListener('change', encControlChanged);
    encControlChanged();
    this.menu_inner.appendChild(this.encControlElem);
  }

  initBasemapControl() {
    this.basemapControlElem = document.createElement('div');
    this.basemapControl = document.createElement('select');
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

    this.basemapControlElem.appendChild(this.basemapControl);
    this.menu_inner.appendChild(this.basemapControlElem);
  }

  initAnimationControl() {
    this.playPauseButtonContainer = document.createElement('div');
    this.playPauseButtonContainer.className = 'animation-playpause';
    this.playPauseButton = document.createElement('i');
    this.playPauseButton.className = 'fa fa-2x fa-play';
    this.playPauseButtonContainer.appendChild(this.playPauseButton);

    this.playing = false;

    const togglePlay = () => {
      this.playing = !this.playing;
      if (this.animation_interval) {
        clearInterval(this.animation_interval);
      }
      if (this.playing) {
        this.playPauseButton.className = 'fa fa-2x fa-pause';
        this.animation_interval = setInterval(() => {
          this.ofs_play();
        }, 2000);
      } else {
        this.playPauseButton.className = 'fa fa-2x fa-play';
      }
    };

    this.playPauseButtonContainer.addEventListener('click', (evt) => {
      togglePlay();
    });

    document.getElementById('map-container').appendChild(this.playPauseButtonContainer);
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

    this.ofs_play = () => {
      if (timeval >= ofs.end_time) {
        timeval = ofs.start_time;
      } else {
        timeval = new Date(timeval.getTime() + ofs.time_step);
      }
      const params = ofs.source.getParams();
      params.time = timeval.toISOString();
      ofs.source.updateParams(params);
      this.updateTimeLabel(timeval);
    };
  }

  initLabels() {
    this.time_label = document.createElement('div');
    this.time_label.className = 'time_label';
    this.time_label_text = document.createTextNode('');
    this.time_label.appendChild(this.time_label_text);
    document.getElementById('map-container').appendChild(this.time_label);

    this.scale_label = document.createElement('div');
    this.scale_label.className = 'scale_label';
    this.scale_label_text = document.createTextNode('');
    this.scale_label.appendChild(this.scale_label_text);
    document.getElementById('map-container').appendChild(this.scale_label);

    this.map.getView().on('change:resolution', (evt) => {
      const resolution = evt.target.get('resolution');
      const units = this.map.getView().getProjection().getUnits();
      const dpi = 90;//25.4 / 0.28;
      const mpu = METERS_PER_UNIT[units];
      const scale = Math.round(resolution * mpu * 39.37 * dpi);
      this.updateScaleLabel(scale);
    });
  }

  initS111() {
    this.ofsControlElem = document.createElement('div');
    this.ofsControl = document.createElement('select');
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

    this.ofsControlElem.appendChild(this.ofsControl);
    this.menu_inner.appendChild(this.ofsControlElem);
  }
}
