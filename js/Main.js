require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/Basemap",
    "esri/tasks/Locator",
    "esri/layers/TileLayer",
    "esri/layers/MapImageLayer",
    "esri/views/SceneView",
    "esri/widgets/Search",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/widgets/BasemapGallery",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/symbols/SimpleFillSymbol",

], function (Map, MapView, FeatureLayer, Basemap, Locator, TileLayer, MapImageLayer, SceneView, Search, QueryTask, Query, BasemapGallery, GraphicsLayer, Graphic, SimpleFillSymbol) {

    //3dMap
    var map = new Map({
        // basemap: "satellite",
        // ground: "world-elevation"
    });

    var view3d = new SceneView({
        scale: 123456789,
        //   承载地图的容器ID,container
        container: null,
        map: map,
        //   center: [120.18376,35.948377],//视点中心位置
        //创建相机，即视图位置
        camera: {
            position: {
                // observation point
                x: 120.175,
                y: 35.93,
                z: 2500 // altitude in meters
            },
            tilt: 30 // perspective in degrees
        }
    });

    // var view3d = new SceneView({
    //     container: null,
    //     map: map,
    //     scale: 500000000000,
    //     center: [88.387, 31.658]
    // });


    var searchWidget = new Search({
        view: view3d
    });
    // Add the search widget to the top right corner of the view
    view3d.ui.add(searchWidget, {
        position: "top-right"
    });










    //2dMap
    var locatorTask = new Locator({
        url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
    });

    // var map = new Map({
    //     // basemap: basemap
    // });

    var pBackground = new MapImageLayer({
        url: "http://localhost:6080/arcgis/rest/services/BackgroundMap/MapServer",
    });

    var pRegion = new FeatureLayer({
        url: "http://localhost:6080/arcgis/rest/services/BackgroundMap/MapServer/2",
        id: "Region"
    });
    var pRoad = new FeatureLayer({
        url: "http://localhost:6080/arcgis/rest/services/BackgroundMap/MapServer/1",
        id: "Road"
    });
    var pPoint = new FeatureLayer({
        url: "http://localhost:6080/arcgis/rest/services/BackgroundMap/MapServer/0",
        id: "Point",
    });

    map.add(pBackground);
    map.add(pRegion);
    map.add(pRoad);
    map.add(pPoint);

    //创建view
    var view = new MapView({
        container: "SchoolMap",
        map: map,
        id: "ppview"

    });
    var basemapGallery = new BasemapGallery({
        view: view,
        opacity: "0.5"
    });
    // Add the widget to the top-right corner of the view
    view.ui.add(basemapGallery, {
        position: "top-right"
    });



    //功能一
    //------控制地图图层的显示
    // Create a variable referencing the checkbox node
    var pPointToggle = document.getElementById("streetsLayer");

    // Listen to the change event for the checkbox
    pPointToggle.addEventListener("change", function () {
        // When the checkbox is checked (true), set the layer's visibility to true
        pBackground.visible = pPointToggle.checked;
    });




    //--------清楚要素
    var pClear=document.getElementById("pclear");
    pClear.addEventListener("click", function () {
        // When the checkbox is checked (true), set the layer's visibility to true
        layerchoosefill.removeAll();
    });



    //------转换为3d地图


    var qiehuandbtn = document.getElementById("ll");
    qiehuandbtn.onclick = function () {

        if (qiehuandbtn.innerText == "转为3D地图") {
            qiehuandbtn.innerText = "转为2D地图";
            view.container = null;
            view3d.container = "SchoolMap";
            map.basemap="satellite";
            map.ground="world-elevation";

            view3d.center = view.center;
            view3d.scale = view.scale;
        }
        else if (qiehuandbtn.innerText == "转为2D地图") {
            qiehuandbtn.innerText = "转为3D地图";
            view3d.container = null;
            view.container = "SchoolMap";


            map.basemap=null;
            map.ground=null;

            view.center = view3d.center;
            view.scale = view3d.scale;

        }
    }











    //功能二
    //-------弹窗显示相应坐标
    //在单击的位置显示弹出窗口
    view.popup.autoOpenEnabled = false;
    view.on("click", function (event) {
        // Get the coordinates of the click on the view
        // around the decimals to 3 decimals
        var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
        var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;
        view.popup.open({
            // Set the popup's title to the coordinates of the clicked location
            title: "位置: [" + lon + ", " + lat + "]",
            location: event.mapPoint // Set the location of the popup to the clicked location
        });
    });
















    //功能三
    //-----------全图显示
    var pFullMap = document.getElementById("Fullmap");
    pFullMap.addEventListener("click", function (event) {
        view.extent = pRoad.fullExtent;
    });











    //功能四
    // 树的查询
    $(document).ready(function () {
        $("#treeContainer").tree({
            data: treeData,
            onClick: function (node) {
                // SqlQuery(node.text, nodeName); //查询，定位
                DisplayInformation(node.text, node.id);
                filterQuery(node.text);
            }
        });
    });
    view.whenLayerView(pPoint).then(function (layerView) {
        pPoint.layerView = layerView;
    })
    //  //查询
    function filterQuery(filter2) {

        pPoint.layerView.filter = {
            where: "NAME like " + "'" + filter2 + "%" + "'"
        };
        view.whenLayerView(pPoint).then(function (layerView) {
            pPoint.layerView = layerView;
        })
    }





    var layerchoosefill = new GraphicsLayer({
        id: "layerchoosefill"
    });
    map.add(layerchoosefill);
    //功能五
    //属性查询
    $('#ss').searchbox({
        searcher: function (value, name) {
            if (name == "pPoint") {

                var query = pPoint.createQuery();
                var inputname = "NAME like '%" + value + "%'";
                query.where = inputname;
                query.outFields = ["*"];

                
                
                //选中以后面图层高亮样式
                var choosemakersymbol = {
                    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                    style: "circle",
                    color: "red",
                    size: "8px", // pixels
                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [255, 0, 0],
                        width: 3 // points
                    }

                };

                pPoint.queryFeatures(query)
                    .then(function (result) {


                            layerchoosefill.removeAll();
                            for (var i = 0; i < result.features.length; i++) {
                                graphic = result.features[i];
                                geometry = graphic.geometry;

                                geo = new Graphic(geometry, choosemakersymbol, null);

                                layerchoosefill.add(geo);
                            }



                            // center the feature
                            view
                                .goTo({
                                    target: result.features[0].geometry,
                                    tilt: 70
                                }, {
                                    duration: 2000,
                                    easing: "in-out-expo"
                                })
                                .catch(function (error) {
                                    if (error.name != "AbortError") {
                                        console.log(error);
                                    }
                                });

                        }

                    );



            } else if (name == "pRegion") {

                var query = pRegion.createQuery();
                var inputname = "NAME like '%" + value + "%'";
                query.where = inputname;
                query.outFields = ["*"];

               
                //选中以后面图层高亮样式
                var choosefillsymbol = {
                    type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    color: "transparent",

                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [255, 0, 0, 1],
                        width: "4px"
                    }

                };

                pRegion.queryFeatures(query)
                    .then(function (result) {


                        layerchoosefill.removeAll();
                        for (var i = 0; i < result.features.length; i++) {
                            graphic = result.features[i];
                            geometry = graphic.geometry;

                            geo = new Graphic(geometry, choosefillsymbol, null);

                            layerchoosefill.add(geo);
                        }
                        view
                            .goTo({
                                target: result.features[0].geometry,
                                tilt: 70
                            }, {
                                duration: 2000,
                                easing: "in-out-expo"
                            })
                            .catch(function (error) {
                                if (error.name != "AbortError") {
                                    console.log(error);
                                }
                            });



                    });

            } else if (name == "pRoad") {
                var query = pRoad.createQuery();
                var inputname = "NAME like '%" + value + "%'";
                query.where = inputname;
                query.outFields = ["*"];

               
                //选中以后面图层高亮样式
                var choosefillsymbol = {
                    type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    color: "transparent",

                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [255, 0, 0, 1],
                        width: "4px"
                    }

                };
                var chooselinesymbol = {
                    type: "simple-line", // autocasts as new SimpleFillSymbol()
                    color: [255, 0, 0, 1],
                    width: "4px"

                };

                pRoad.queryFeatures(query)
                    .then(function (result) {


                        layerchoosefill.removeAll();
                        for (var i = 0; i < result.features.length; i++) {
                            graphic = result.features[i];
                            geometry = graphic.geometry;

                            geo = new Graphic(geometry, chooselinesymbol, null);

                            layerchoosefill.add(geo);
                        }


                        // center the feature
                        view
                            .goTo({
                                target: result.features[0].geometry,
                                tilt: 70
                            }, {
                                duration: 2000,
                                easing: "in-out-expo"
                            })
                            .catch(function (error) {
                                if (error.name != "AbortError") {
                                    console.log(error);
                                }
                            });

                    });

            } else {
                alert("请输入正确的查询名称！")
            }


        }
    });

  























});