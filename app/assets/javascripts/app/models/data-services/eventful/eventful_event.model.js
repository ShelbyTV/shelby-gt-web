EventfulEventModel = Backbone.Model.extend({
  defaults : {
    city_name : 'New York City',
    country_abbr2 : 'US',
    performers : {
      performer : [{
        name : 'Shelby Boyz'
      }]
    },
    price : null,
    start_time : '2013-04-11 20:00:00',
    region_abbr : 'NY',
    venue_name : 'The Creamery'
  }
});