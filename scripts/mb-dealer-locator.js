---
sitemap:
  exclude: 'yes'
layout: none
---
$(function() {
    var requestDealer = $("#requestDealer")
    $("#dealerResults").hide()
    $("#tryAgain").hide()

    requestDealer.bind("submit", function(e) {
        e.preventDefault()
        findDealerByPostalCode($("#dlPostalCode").val())
    })

    if (!navigator.geolocation) {
        $("#locate").hide()
    } else {
        $("#locate").bind("click", function(e) {
            e.preventDefault()

            var successHandler = function (pos) {
                console.log(pos.coords)
                findDealerByPostalCode(pos.coords.latitude + "," + pos.coords.longitude)
            }

            var errorHandler = function(err) { alert("Error: " + err.code) }

            navigator.geolocation.getCurrentPosition(successHandler, errorHandler)
        })
    }

    $("#tryAgain").click(function() {
        $("#requestDealer").show()
        $("#dealerResults")
            .hide()
            .html("")
        $("#tryAgain").hide()
        $("#dlPostalCode")
            .focus()
            .val("")
    })
})

var findDealerByPostalCode = function(postalCode) {
    var url = "https://spatial.virtualearth.net/REST/v1/data/d563bf2b2be2461bb384f97c34e0fee7/mb-sports-dealers/mb-sports-dealer"
    var params = {
        spatialFilter : "nearby('" + postalCode + "',1000)",
        "orderBy" : "_distance",
        "$select" : "*,__distance",
        "$top" : 1,
        "$format" : "json",
        key: "{{site.bing-maps-key}}",
        jsonp: "displayDealerSearchResults"
    }

    var urlWithQuery = url + "?" + decodeURIComponent(jQuery.param(params, true))
    MakeServiceRequest(urlWithQuery)
}

var displayDealerSearchResults = function(data){
    var result = data.d.results[0]

    var dealerTemplate = $("#dealerResultTemplate")
        .html()
        .replace(/{dealerName}/g, result.DealerName)
        .replace(/{imageUrl}/g, result.ImageUrl)
        .replace(/{addressLine}/, result.AddressLine)
        .replace(/{locality}/, result.Locality)
        .replace(/{region}/, result.AdminDistrict)
        .replace(/{postalCode}/, result.PostalCode)
        .replace(/{phone}/, result.Phone)
        .replace(/{fax}/, result.Fax)
        .replace(/{email}/, result.Email)

    $("#dealerResults").html(dealerTemplate).show()
    $("#tryAgain").show()
    $("#requestDealer").hide()

    var map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), {
        credentials:"{{site.bing-maps-key}}",
        center: new Microsoft.Maps.Location(result.Latitude, result.Longitude),
        zoom: 7,
        mapTypeId: Microsoft.Maps.MapTypeId.road
        })
}

var MakeServiceRequest = function(request) {
    var script = document.createElement("script")
    script.setAttribute("type", "text/javascript")
    script.setAttribute("src", request)

    document.body.appendChild(script)
}
