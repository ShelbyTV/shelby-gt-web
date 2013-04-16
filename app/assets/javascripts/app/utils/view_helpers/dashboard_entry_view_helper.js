/*
 * JSTs aren't the place to do all sorts of fancy logic for displaying DashboardEntri.
 *
 * This should help to DRY them up.
 */
libs.shelbyGT.viewHelpers.dashboardEntry = {

  /*
   * Mimicks the same permalink you would get from the backend, except
   * this will not be shortened.
   *
   */
  permalink: function(dashboardEntry){
    return 'http://shelby.tv/channels/' + shelby.models.dashboard.get('channel') + '/' + dashboardEntry.id;
  }

};