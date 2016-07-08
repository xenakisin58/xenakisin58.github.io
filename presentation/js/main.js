L.mapbox.accessToken = 'pk.eyJ1IjoidGVhbW1pZGRsZXRhYmxlIiwiYSI6ImNpbDZ0cHRuMDA1eml1MGx2bjVvd2RpNm8ifQ.H7TauzsEVrD4fvr0ORQq8w';

var map = L.mapbox.map('map', 'mapbox.light', {
                zoomControl: false
            }).setView([43.535139, -80.235302], 12);

map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.keyboard.disable();

// Disable tap handler, if present.
if (map.tap) map.tap.disable();

var getWardData = function(wardNum) {
    if (wardNum == "1") {
        return ward1;
    } else if (wardNum == "2") {
        return ward2;
    } else if (wardNum == "3") {
        return ward3;
    } else if (wardNum == "4") {
        return ward4;
    } else if (wardNum == "5") {
        return ward5;
    } else if (wardNum == "6") {
        return ward6;
    }
};

var aggregateBreaks = {
    0.001: '#fdd0a2',
    0.2: '#fdae6b',
    0.4: '#fd8d3c',
    0.6: '#e6550d',
    0.8: '#a63603'
}

var mbmBreaks = {
    30: '#fdd0a2',
    40: '#fdae6b',
    45: '#fd8d3c',
    50: '#e6550d',
    55: '#a63603'
}

var busBreaks = {
    2: '#fdd0a2',
    4: '#fdae6b',
    6: '#fd8d3c',
    8: '#e6550d',
    10: '#a63603'
}

var medIncomeBreaks = {
    50000: '#fdd0a2',
    60000: '#fdae6b',
    70000: '#fd8d3c',
    80000: '#e6550d',
    100000: '#a63603'
}

var rentBreaks = {
    400: '#fdd0a2',
    500: '#fdae6b',
    600: '#fd8d3c',
    700: '#e6550d',
    1000: '#a63603'
}

var layerMenus = {
        "food": $("#collapseOne"),
        "rent": $("#collapseTwo"),
        "income": $("#collapseThree"),
    },
    layerItemTemplate = _.template($("#layerTPL").html()),
    legendUnitTemplate = _.template($("#legendUnitTPL").html()),

    wardLabelsLayer = L.geoJson(wardLabels, {
        pointToLayer: function(feature, ll) {
            return L.marker(ll, {
                icon: L.divIcon({
                    className: 'ward-label',
                    html: feature.properties.title,
                    iconSize: [60, 60]
                })
            });
        }
    }),

    //Food
    foodAggregate = L.geoJson(wards, {
        style: function(feature ) {
            wardData = getWardData(feature.properties.WARD)
            value = getAggregateValue(wardData.food, 'food');
            return {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.8,
                fillColor: getColour(value, aggregateBreaks)
            };
        }
    }),

    marketBasket = L.geoJson(wards, {
        style: function(feature ) {
            wardData = getWardData(feature.properties.WARD);
            return {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.8,
                fillColor: getColour(wardData.food.market_basket, mbmBreaks)
            };
        }
    }),

    busStops = L.geoJson(wards, {
        style: function(feature ) {
            wardData = getWardData(feature.properties.WARD);
            value = wardData.food.bus_stops / wardData.general.area
            return {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.8,
                fillColor: getColour(value, busBreaks)
            };
        }
    }),

    //Housing
    medRentLayer = L.geoJson(wards, {
        style: function(feature ) {
            wardData = getWardData(feature.properties.WARD);
            return {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.8,
                fillColor: getColour(wardData.housing.median_rent_unit, rentBreaks)
            };
        }
    }),

    avgRentLayer = L.geoJson(wards, {
        style: function(feature ) {
            wardData = getWardData(feature.properties.WARD);
            return {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.8,
                fillColor: getColour(wardData.housing.average_rent_unit, rentBreaks)
            };
        }
    }),

    //Income & Employment
    incomeAggregate = L.geoJson(wards, {
        style: function(feature ) {
            wardData = getWardData(feature.properties.WARD)
            value = getAggregateValue(wardData.income_employment, 'income_employment');
            return {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.8,
                fillColor: getColour(value, aggregateBreaks) // TODO?
            };
        }
    }),

    medFamIncLayer = L.geoJson(wards, {
        style: function(feature ) {
            wardData = getWardData(feature.properties.WARD);
            return {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.8,
                fillColor: getColour(wardData.income_employment.median_fam, medIncomeBreaks)
            };
        }
    });

function getAggregateValue(dataSet, concept) {
    values = [];
    min = 0;
    max = 0;
    i = 0;

    allTheWards = [ward1, ward2, ward3, ward4, ward5, ward6];

    for (var key in dataSet) {
        i = 0;
        allTheWards.forEach(function(wardData){
            tmp = wardData[concept][key]
            if (i == 0){
                min = tmp;
                max = tmp;
            }
            else {
                if (tmp > max) {
                    max = tmp;
                } else if (tmp < min) {
                    min = tmp;
                }
            }
            i = i + 1;
        });

        tmp = dataSet[key];
        values.push((tmp - min) / (max - min));
    }

    //average all the standardized values
    value = 0;
    values.forEach(function(item) {
        value = value + item
    });
    value = value / values.length;

    return value
}

addLayer(medRentLayer, layerMenus["rent"], 'Median Rent / Unit', 1, rentBreaks)
addLayer(avgRentLayer, layerMenus["rent"], 'Average Rent / Unit', 2, rentBreaks)

addLayer(foodAggregate, layerMenus["food"], 'Food Aggregate', 1, aggregateBreaks)
addLayer(marketBasket, layerMenus["food"], 'Market Basket Measure ($)', 3, mbmBreaks)
addLayer(busStops, layerMenus["food"], 'Bus Stops (stops/sqkm)', 4, busBreaks)

addLayer(incomeAggregate, layerMenus["income"], 'Income & Employment Aggregate', 1, aggregateBreaks)
addLayer(medFamIncLayer, layerMenus["income"], 'Median Family Income ($)', 3, medIncomeBreaks)

allLayers = [medRentLayer, avgRentLayer, foodAggregate, marketBasket, busStops, incomeAggregate, medFamIncLayer, wardLabelsLayer];

function addLayer(layer, layerMenu, name, zIndex, breaks) {
    layer.setZIndex(zIndex);
        // .addTo(map);

    // Create a simple layer switcher that
    // toggles layers on and off.
    var link = $.parseHTML(layerItemTemplate({ layerName: name }).trim())[0];
    if (name == 'Food Aggregate') {
        link.className = link.className + ' active';
        map.addLayer(layer);
        map.addLayer(wardLabelsLayer);

        var legend = $(".legend");

        legend.empty();
        legend.append(legendUnitTemplate({
            colour: "#feedde",
            unit: "0",
        }));
        for (var key in breaks) {
            legend.append(legendUnitTemplate({
                colour: breaks[key],
                unit: key,
            }));
        }
    }

    link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        allLayers.forEach(function(item) {
            if (map.hasLayer(item)) {
                map.removeLayer(item);
                item.className = '';
            }
        });

        var legend = $(".legend");

        legend.empty();
        legend.append(legendUnitTemplate({
            colour: "#feedde",
            unit: "0",
        }));
        for (var key in breaks) {
            legend.append(legendUnitTemplate({
                colour: breaks[key],
                unit: key,
            }));
        }

        $(".menu-ui .list-group-item").removeClass("active")
        $(this).addClass('active');
        map.addLayer(layer);
        map.addLayer(wardLabelsLayer);
    };
    layerMenu.append(link);
}

function getColour(val, breaks) {
    colour = '#feedde'
    for (var key in breaks) {
        if (val > Number(key)) {
            colour = breaks[key]
        }
    }
    return colour
}
