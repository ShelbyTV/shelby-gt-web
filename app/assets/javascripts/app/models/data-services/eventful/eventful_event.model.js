EventfulEventModel = Backbone.Model.extend({
  defaults : {
    city_name : 'New York City',
    country_abbr2 : 'US',
    performers : [{
      name : 'Prince'
    }],
    price : '$25.00',
    start_time : '2013-04-11 20:00:00',
    venue_name : 'The Creamery'
  }
});