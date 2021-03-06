import 'ol/ol.css';
import './css/s111.css';
import '@fortawesome/fontawesome-free/css/all.css';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
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

const REGIONS = {
  'chesapeake': {
    'label': 'Chesapeake Bay',
    'center': [-76.087, 37.6],
    'zoom': 9
  },
  'delaware': {
    'label': 'Delaware Bay',
    'center': [-74.957, 38.862],
    'zoom': 10
  },
  // 'gomaine': {
  //   'label': 'Gulf of Maine',
  //   'center': [-69.833, 42.223],
  //   'zoom': 8
  // },
  'gomex': {
    'label': 'Northern Gulf of Mexico',
    'center': [-90.925, 28.960],
    'zoom': 8
  },
  'gomex_ne': {
    'label': 'Northeast Gulf of Mexico',
    'center': [-88.617, 30.229],
    'zoom': 10
  },
  'gomex_nw': {
    'label': 'Northwest Gulf of Mexico',
    'center': [-94.356, 29.200],
    'zoom': 9
  },
  'lake_erie': {
    'label': 'Lake Erie',
    'center': [-81.019, 42.281],
    'zoom': 9
  },
  'lake_mich_huron': {
    'label': 'Lake Michigan & Huron',
    'center': [-84.512, 44.190],
    'zoom': 8
  },
  'lake_ontario': {
    'label': 'Lake Ontario',
    'center': [-77.750, 43.658],
    'zoom': 9
  },
  'lake_superior': {
    'label': 'Lake Superior',
    'center': [-87.539, 47.702],
    'zoom': 8
  },
  'ny': {
    'label': 'New York/New Jersey Harbor',
    'center': [-74.009, 40.551],
    'zoom': 12
  },
  'san_fran': {
    'label': 'San Francisco Bay',
    'center': [-122.489, 37.808],
    'zoom': 11
  },
  'tampa': {
    'label': 'Tampa Bay',
    'center': [-82.773, 27.557],
    'zoom': 11
  }
};

const S111_MODELS = {
  'chesapeake': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'cbofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T13:00:00.000Z'),
    'end_time': new Date('2020-04-16T12:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'delaware': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'dbofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T13:00:00.000Z'),
    'end_time': new Date('2020-04-16T12:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  // 'gomaine': {
  //   'source': new ImageWMSSource({
  //     url: '/geoserver/ofs/wms',
  //     params: {
  //       'layers': 'gomofs_sfc_currents',
  //       'format': 'image/png8',
  //       'transparent': 'true'
  //     },
  //     ratio: 1
  //   }),
  //   'start_time': new Date('2020-04-03T13:00:00.000Z'),
  //   'end_time': new Date('2020-04-05T12:00:00.000Z'),
  //   'time_step': 3 * 60 * 60 * 1000 // 3 hours
  // },
  'gomex': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'ngofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T16:00:00.000Z'),
    'end_time': new Date('2020-04-16T21:00:00.000Z'),
    'time_step': 3 * 60 * 60 * 1000 // 1 hour
  },
  'gomex_ne': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'negofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T16:00:00.000Z'),
    'end_time': new Date('2020-04-16T15:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'gomex_nw': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'nwgofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T16:00:00.000Z'),
    'end_time': new Date('2020-04-16T15:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'lake_erie': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'leofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T13:00:00.000Z'),
    'end_time': new Date('2020-04-19T12:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'lake_mich_huron': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'lmhofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T13:00:00.000Z'),
    'end_time': new Date('2020-04-19T12:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'lake_ontario': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'loofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T13:00:00.000Z'),
    'end_time': new Date('2020-04-17T00:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'lake_superior': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'lsofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T13:00:00.000Z'),
    'end_time': new Date('2020-04-17T00:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'ny': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'nyofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T12:00:00.000Z'),
    'end_time': new Date('2020-04-16T17:00:14.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'san_fran': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'sfbofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T16:00:00.000Z'),
    'end_time': new Date('2020-04-16T15:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  },
  'tampa': {
    'source': new ImageWMSSource({
      url: '/geoserver/ofs/wms',
      params: {
        'layers': 'tbofs_sfc_currents',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    }),
    'start_time': new Date('2020-04-14T13:00:00.000Z'),
    'end_time': new Date('2020-04-16T12:00:00.000Z'),
    'time_step': 1 * 60 * 60 * 1000 // 1 hour
  }
};

export default class {
  constructor() {
    this.initMap();
    this.initEventHandlers();
    this.initLabels();
    this.initMenu();
  }

  initMap() {
    // this.basemapSourceStamen = new XYZSource({
    //   url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
    // });

    // this.basemapSourceOSM = new OSMSource();

    this.basemapSourceESRISatellite = new ArcGISRestTileSource({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
    });

    this.basemapSourceESRIOcean = new ArcGISRestTileSource({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer'
    })

    // this.basemapSourceESRITopo = new ArcGISRestTileSource({
    //   url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer'
    // });

    this.basemapSourceESRIDarkGray = new ArcGISRestTileSource({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer'
    });

    this.basemapLayer = new TileLayer({
      source: this.basemapSourceESRIDarkGray
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

  showAttributeTableS102(container, attributes) {
    container.innerHTML = `<table class="popup_table">
  <thead>
    <tr>
      <th>S-100 Product</th>
      <th>S-102 Bathymetry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Agency</td>
      <td>NOS</td>
    </tr>
    <tr>
       <td>Spatial Resolution</td>
       <td> - </td>
    </tr>
    <tr>
       <td>Cell Name</td>
       <td>${attributes.Cell_Name}</td>
    </tr>
    <tr>
       <td>Band Number</td>
       <td>4</td>
    </tr>
    <tr>
       <td>Get Data</td>
       <td><a href='https://ocs-pn-dev-public-data.s3.amazonaws.com/index.html'>S-102 HDF-5 Files</a></td>
    </tr>
  </tbody>
</table>`;
  }

  showAttributeTableS111(container, attributes) {
    container.innerHTML = `<table class="popup_table">
  <thead>
    <tr>
      <th>S-100 Product</th>
      <th>S-111</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Forecast Model System</td>
      <td>CBOFS</td>
    </tr>
    <tr>
      <td>Agency</td>
      <td>NOS</td>
    </tr>
    <tr>
      <td>Forecast Cycles</td>
      <td>00, 06, 12, 18</td>
    </tr>
    <tr>
       <td>Forecast Horizon</td>
       <td>48 Hours</td>
    </tr>
    <tr>
       <td>Product Type</td>
       <td>Model Guidance</td>
    </tr>
      <tr>
       <td>Variable</td>
       <td>Surface Currents</td>
    </tr>
     <tr>
       <td>Depth</td>
       <td>4.5m</td>
    </tr>
    <tr>
       <td>Spatial Resolution</td>
       <td>500m</td>
    </tr>
    <tr>
       <td>Cell Name</td>
       <td>${attributes.Cell_Name}</td>
    </tr>
    <tr>
       <td>Band Number</td>
       <td>4</td>
    </tr>
    <tr>
       <td>Get Data</td>
       <td><a href='https://ocs-pn-dev-public-data.s3.amazonaws.com/index.html'>S-111 HDF-5 Files</a></td>
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
      // const lonLat = toLonLat(evt.coordinate);
      // console.log(lonLat);
      // let queryURL = this.source_tilescheme.getGetFeatureInfoUrl(
      //   evt.coordinate,
      //   this.map.getView().getResolution(),
      //   'EPSG:3857',
      //   {'INFO_FORMAT': 'application/json'}
      // );
      // // Workaround issue with GeoServer 2.12 WMS 1.3.0 GetFeatureInfo requests
      // queryURL = queryURL.replace("VERSION=1.3.0","VERSION=1.1.1");
      // queryURL = queryURL.replace("I=", "X=");
      // queryURL = queryURL.replace("J=", "Y=");
      // queryURL = queryURL.replace("CRS=", "SRS=");
      
      //console.log("clicked coord:", evt.coordinate);
      let queryString = "f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry="
          // + JSON.stringify(geometryParams)
          + evt.coordinate[0] + "," + evt.coordinate[1]
          + "&geometryType=esriGeometryPoint&inSR=102100&outFields=OBJECTID,Cell_Name,Scale,Title,Branch,Coast_Guard,Status,Fiscal_Year_Complete&outSR=102100"
          // + "&quantizationParameters="
          // + JSON.stringify(quantizationParams);
      let queryURL = "https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/Status_New_NOAA_ENCs/MapServer/2/query?" + queryString;
      
      fetch(queryURL)
        .then(response => response.json())
        .then((data) => {
          //console.log(data);
          if (data.features && data.features.length > 0 && data.features[0].attributes) {
            this.source_highlight.clear();
            const feature = data.features[0];
            // Monkey patch ESRI feature into GeoJSON feature object
            feature.type = "Feature"
            feature.properties = feature.attributes;
            feature.geometry.type = "Polygon"
            feature.geometry.coordinates = feature.geometry.rings;
            const geojsonFeature = new GeoJSON().readFeature(feature);
            this.source_highlight.addFeature(geojsonFeature);

            this.identifyAttributes = feature.attributes;

            const contentElem = document.getElementById("query-popup-content");
            
            if (this.navElem) {
              this.navElem.remove();
              this.navElem = null;
            }

            this.navElem = document.createElement('div');
            this.navElem.innerHTML = `<nav aria-label="S100 Products">
  <ul class="pagination">
    <li class="page-item" id="popup-nav-item-s102"><a class="page-link" id="popup-nav-link-s102">S-102</a></li>
    <li class="page-item disabled" id="popup-nav-item-s104"><a class="page-link" id="popup-nav-link-s104" tabindex="-1">S-104</a></li>
    <li class="page-item active" id="popup-nav-item-s111"><a class="page-link" id="popup-nav-link-s111">S-111</a></li>
  </ul>
</nav>`;

            contentElem.appendChild(this.navElem);

            const popupButtonS102 = document.getElementById("popup-nav-link-s102");
            const popupItemS102 = document.getElementById("popup-nav-item-s102");
            popupButtonS102.onclick = (evt) => {
              popupItemS111.className = "page-item";
              popupItemS102.className = "page-item active";
              this.showAttributeTableS102(this.popupTableContainer, this.identifyAttributes);
            };
            const popupButtonS111 = document.getElementById("popup-nav-link-s111");
            const popupItemS111 = document.getElementById("popup-nav-item-s111");
            popupButtonS111.onclick = (evt) => {
              popupItemS102.className = "page-item";
              popupItemS111.className = "page-item active";
              this.showAttributeTableS111(this.popupTableContainer, this.identifyAttributes);
            };

            if (this.popupTableContainer) {
              this.popupTableContainer.remove();
              this.popupTableContainer = null;
            }
            this.popupTableContainer = document.createElement('div');
            this.showAttributeTableS111(this.popupTableContainer, this.identifyAttributes);
            contentElem.appendChild(this.popupTableContainer);
            this.clickOverlay.setPosition(evt.coordinate);
          }
//           if (data.features && data.features.length > 0 && data.features[0].properties) {
//             this.source_highlight.clear();
//             const geojsonFeature = new GeoJSON().readFeature(data.features[0]);
//             this.source_highlight.addFeature(geojsonFeature);

//             this.identifyAttributes = data.features[0].properties;

//             const contentElem = document.getElementById("query-popup-content");
            
//             if (this.navElem) {
//               this.navElem.remove();
//               this.navElem = null;
//             }

//             this.navElem = document.createElement('div');
//             this.navElem.innerHTML = `<nav aria-label="S100 Products">
//   <ul class="pagination">
//     <li class="page-item" id="popup-nav-item-s102"><a class="page-link" id="popup-nav-link-s102">S-102</a></li>
//     <li class="page-item disabled" id="popup-nav-item-s104"><a class="page-link" id="popup-nav-link-s104" tabindex="-1">S-104</a></li>
//     <li class="page-item active" id="popup-nav-item-s111"><a class="page-link" id="popup-nav-link-s111">S-111</a></li>
//   </ul>
// </nav>`;

//             contentElem.appendChild(this.navElem);

//             const popupButtonS102 = document.getElementById("popup-nav-link-s102");
//             const popupItemS102 = document.getElementById("popup-nav-item-s102");
//             popupButtonS102.onclick = (evt) => {
//               popupItemS111.className = "page-item";
//               popupItemS102.className = "page-item active";
//               this.showAttributeTableS102(this.popupTableContainer, this.identifyAttributes);
//             };
//             const popupButtonS111 = document.getElementById("popup-nav-link-s111");
//             const popupItemS111 = document.getElementById("popup-nav-item-s111");
//             popupButtonS111.onclick = (evt) => {
//               popupItemS102.className = "page-item";
//               popupItemS111.className = "page-item active";
//               this.showAttributeTableS111(this.popupTableContainer, this.identifyAttributes);
//             };

//             if (this.popupTableContainer) {
//               this.popupTableContainer.remove();
//               this.popupTableContainer = null;
//             }
//             this.popupTableContainer = document.createElement('div');
//             this.showAttributeTableS111(this.popupTableContainer, this.identifyAttributes);
//             contentElem.appendChild(this.popupTableContainer);
//             this.clickOverlay.setPosition(evt.coordinate);
//           }
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
    this.initRegions();
    this.initLayers();
    this.initLayerTogglers();
    this.initAnimationControl();

    // Trigger layer update
    this.updateRegion(this.regionControl.options[this.regionControl.selectedIndex].value);

    this.menu_outer.appendChild(this.menu_inner);
    document.getElementById('map-container').appendChild(this.menu_outer);
  }

  initLayers() {
    this.initENC();
    this.initBathy();
    this.initTileSchemeBand4();
    this.updateOFS(this.regionControl.options[this.regionControl.selectedIndex].value);
    this.initHighlightLayer();
  }

  initLayerTogglers() {
    this.initTileSchemeToggler();
    this.initENCToggler();
    this.initBathyToggler();
    this.initS111Toggler();
    this.initS104Toggler();
    this.initS412Toggler();
  }

  initBathy() {
    this.source_nbs_la = new ImageArcGISRest({
      url: 'https://devgis.charttools.noaa.gov/arcgis/rest/services/NBS/LA_LongBeach_NBStiles/ImageServer',
      params: {
        FORMAT: 'jpgpng',
        compressionQuality: 75,
        renderingRule: JSON.stringify({"rasterFunction":"Colormap","rasterFunctionArguments":{"ColorrampName":"Purple to Green Diverging, Bright","Raster":{"rasterFunction":"Stretch","rasterFunctionArguments":{"StretchType":5,"Statistics":[[-44.400001525878906,3.794548988342285,-20.139903407513135,7.109085656599334]],"DRA":false,"UseGamma":true,"Gamma":[1],"ComputeGamma":false},"variableName":"Raster","outputPixelType":"U8"}},"variableName":"Raster"})
      },
      ratio: 1
    });
    this.layer_nbs_la = new ImageLayer({
      source: this.source_nbs_la
    });
    this.map.addLayer(this.layer_nbs_la);

    this.source_nbs_ny = new ImageWMSSource({
      url: '/geoserver/bathy/wms',
      params: {
        'layers': 'nbs_ny_hillshade,nbs_ny_bathy',
        'format': 'image/png8',
        'transparent': 'true'
      },
      ratio: 1
    });
    this.layer_nbs_ny = new ImageLayer({
      source: this.source_nbs_ny
    });
    this.map.addLayer(this.layer_nbs_ny);
  }

  initBathyNCEI() {
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
  }

  initBathyToggler() {
    this.bathyControlElem = document.createElement('div');
    this.bathyControlElem.className = 'layer-toggle';
    this.bathyControlLabel = document.createElement('label');
    this.bathyControl = document.createElement('input');
    this.bathyControl.setAttribute('type', 'checkbox');
    this.bathyControl.setAttribute('checked', 'checked');
    this.bathyControlLabel.appendChild(this.bathyControl);
    this.bathyControlLabelSpan = document.createElement('span');
    this.bathyControlLabel.appendChild(this.bathyControlLabelSpan);
    this.bathyControlLabelSpan.appendChild(document.createTextNode('Bathymetry (S-102)'));
    this.bathyControlElem.appendChild(this.bathyControlLabel);
    this.bathyControlChanged = (evt) => {
      if (this.bathyControl.checked) {
        this.layer_nbs_la.setVisible(true);
        this.layer_nbs_ny.setVisible(true);
      } else {
        this.layer_nbs_ny.setVisible(false);
        this.layer_nbs_la.setVisible(false);
      }
    };
    this.bathyControl.addEventListener('change', this.bathyControlChanged);
    this.bathyControlChanged();
    this.menu_inner.appendChild(this.bathyControlElem);
  }

  initTileSchemeBand4() {
    this.source_tilescheme_band4 = new ImageArcGISRest({
      url: 'https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/Status_New_NOAA_ENCs/MapServer',
      params: {
        FORMAT: 'png8',
        compressionQuality: 75,
        LAYERS: 'show:2'
      },
      ratio: 1
    });
    this.layer_tilescheme_band4 = new ImageLayer({
      source: this.source_tilescheme_band4
    });
    this.map.addLayer(this.layer_tilescheme_band4);
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
  }

  initTileSchemeToggler() {
    this.tileControlElem = document.createElement('div');
    this.tileControlElem.className = 'layer-toggle';
    this.tileControlLabel = document.createElement('label');
    this.tileControl = document.createElement('input');
    this.tileControl.setAttribute('type', 'checkbox');
    this.tileControl.setAttribute('checked', 'checked');
    this.tileControlLabel.appendChild(this.tileControl);
    this.tileControlLabelSpan = document.createElement('span');
    this.tileControlLabel.appendChild(this.tileControlLabelSpan);
    this.tileControlLabelSpan.appendChild(document.createTextNode('Nautical Product Tile Scheme'));
    this.tileControlElem.appendChild(this.tileControlLabel);
    this.tileControlChanged = (evt) => {
      if (this.tileControl.checked) {
        this.layer_tilescheme_band4.setVisible(true);
      } else {
        this.layer_tilescheme_band4.setVisible(false);
      }
    };
    this.tileControl.addEventListener('change', this.tileControlChanged);
    this.tileControlChanged();
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
  }

  initENCToggler() {
    this.encControlElem = document.createElement('div');
    this.encControlElem.className = 'layer-toggle';
    this.encControlLabel = document.createElement('label');
    this.encControl = document.createElement('input');
    this.encControl.setAttribute('type', 'checkbox');
    this.encControl.setAttribute('checked', 'checked');
    this.encControlLabel.appendChild(this.encControl);
    this.encControlLabelSpan = document.createElement('span');
    this.encControlLabel.appendChild(this.encControlLabelSpan);
    this.encControlLabelSpan.appendChild(document.createTextNode('Electronic Navigational Charts'));
    this.encControlElem.appendChild(this.encControlLabel);
    this.encControlChanged = (evt) => {
      if (this.encControl.checked) {
        this.layer_enc.setVisible(true);
      } else {
        this.layer_enc.setVisible(false);
      }
    };
    this.encControl.addEventListener('change', this.encControlChanged);
    this.encControlChanged();
    this.menu_inner.appendChild(this.encControlElem);
  }

  initS104Toggler() {
    this.s104ControlElem = document.createElement('div');
    this.s104ControlElem.className = 'layer-toggle layer-disabled';
    this.s104ControlLabel = document.createElement('label');
    this.s104Control = document.createElement('input');
    this.s104Control.setAttribute('type', 'checkbox');
    this.s104Control.setAttribute('disabled', 'disabled');
    // this.s104Control.setAttribute('checked', 'checked');
    this.s104ControlLabel.appendChild(this.s104Control);
    this.s104ControlLabelSpan = document.createElement('span');
    this.s104ControlLabel.appendChild(this.s104ControlLabelSpan);
    this.s104ControlLabelSpan.appendChild(document.createTextNode('Water Levels (S-104)'));
    this.s104ControlElem.appendChild(this.s104ControlLabel);
    this.menu_inner.appendChild(this.s104ControlElem);
  }

  initS412Toggler() {
    this.s412ControlElem = document.createElement('div');
    this.s412ControlElem.className = 'layer-toggle layer-disabled';
    this.s412ControlLabel = document.createElement('label');
    this.s412Control = document.createElement('input');
    this.s412Control.setAttribute('type', 'checkbox');
    this.s412Control.setAttribute('disabled', 'disabled');
    // this.s412Control.setAttribute('checked', 'checked');
    this.s412ControlLabel.appendChild(this.s412Control);
    this.s412ControlLabelSpan = document.createElement('span');
    this.s412ControlLabel.appendChild(this.s412ControlLabelSpan);
    this.s412ControlLabelSpan.appendChild(document.createTextNode('Weather and Wave Hazards (S-412)'));
    this.s412ControlElem.appendChild(this.s412ControlLabel);
    this.menu_inner.appendChild(this.s412ControlElem);
  }

  initS111Toggler() {
    this.ofsControlElem = document.createElement('div');
    this.ofsControlElem.className = 'layer-toggle';
    this.ofsControlLabel = document.createElement('label');
    this.ofsControl = document.createElement('input');
    this.ofsControl.setAttribute('type', 'checkbox');
    this.ofsControl.setAttribute('checked', 'checked');
    this.ofsControlLabel.appendChild(this.ofsControl);
    this.ofsControlLabelSpan = document.createElement('span');
    this.ofsControlLabel.appendChild(this.ofsControlLabelSpan);
    this.ofsControlLabelSpan.appendChild(document.createTextNode('Surface Currents (S-111)'));
    this.ofsControlElem.appendChild(this.ofsControlLabel);
    this.ofsControlChanged = (evt) => {
      if (this.ofsControl.checked) {
        this.updateOFS(this.regionControl.options[this.regionControl.selectedIndex].value);
      } else {
        this.updateOFS(null);
      }
    };
    this.ofsControl.addEventListener('change', this.ofsControlChanged);
    this.ofsControlChanged();
    this.menu_inner.appendChild(this.ofsControlElem);
  }

  initBasemapControl() {
    this.basemapControlElem = document.createElement('div');
    this.basemapControl = document.createElement('select');
    const basemaps = {
      'dark-gray': {
        'label': 'Dark Gray Canvas',
        'source': this.basemapSourceESRIDarkGray
      }, 'satellite': {
        'label': 'Satellite',
        'source': this.basemapSourceESRISatellite
      }, 'ocean': {
        'label': 'Ocean',
        'source': this.basemapSourceESRIOcean
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
        this.playPauseButton.className = 'fa fa-pause';
        this.animation_interval = setInterval(() => {
          this.ofs_play();
        }, 2000);
      } else {
        this.playPauseButton.className = 'fa fa-play';
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

  updateRegion(region) {
    if (!(region in REGIONS)) {
      console.error('Region not defined:', region);
      return;
    }

    this.map.getView().setCenter(fromLonLat(REGIONS[region].center));
    this.map.getView().setZoom(REGIONS[region].zoom);
  }

  updateOFS(region) {
    if (!region) {
      if (this.layer_s111) {
        this.layer_s111.setVisible(false);
      }
      return;
    } else if (!(region in S111_MODELS)) {
      console.error('Model does not defined for region:', region);
      return;
    }

    if (this.animation_interval) {
      clearInterval(this.animation_interval);
      this.animation_interval = null;
    }

    const ofs = S111_MODELS[region];

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
      this.layer_s111.setSource(ofs.source);
      this.layer_s111.setVisible(true);
    }

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

  initRegions() {
    this.regionControlElem = document.createElement('div');
    this.regionControl = document.createElement('select');
    Object.entries(REGIONS).forEach(([id, region]) => {
      const option = document.createElement('option');
      option.setAttribute('value', id);
      //option.setAttribute('selected', 'selected');
      option.appendChild(document.createTextNode(region.label));
      this.regionControl.appendChild(option);
    });
    this.regionControl.addEventListener('change', (evt) => {
      this.updateRegion(evt.target.value);
      this.ofsControlChanged();
    });

    this.regionControlElem.appendChild(this.regionControl);
    this.menu_inner.appendChild(this.regionControlElem);
  }
}
