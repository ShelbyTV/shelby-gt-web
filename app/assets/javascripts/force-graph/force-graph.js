(function(){ width = 942,
    height = 422,
    hasBounced=true,
    isClicked=false,
    elasticity=.05,
    speed=.02;})();

var force = d3.layout.force()
    .gravity(0)
    .theta(0)
    .linkDistance(function(d){return d.length;})
    .size([width, height]);
var svg = d3.select("#socialBox").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class","shelf__svg")
    .attr("id", "frame");
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();
  //set all link data that will be rendered
  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", 1)
      .style("stroke", "grey");
  var node_drag = d3.behavior.drag()
  .on("dragstart", dragstart)
  .on("drag", dragmove)
  .on("dragend",dragend);
  function dragstart(d,i){
    d.fixed=true;
    isClicked=true;
  }
  function dragmove (d,i){
    if (d.group!="profile") {
      d.px += d3.event.dx;
      d.py += d3.event.dy;
      d.x += d3.event.dx;
      d.y += d3.event.dy;
  }
  }
  function dragend(d,i){
    isClicked=false;
    if (d.group!="profile") d.fixed=false;
    force.resume();
  }
  var people = svg.selectAll(".people").data(graph.nodes).enter()
    .append("foreignObject")
    .attr("width",function(d){if (d.group=="video") return d.radius*3; else return d.radius*2})
    .attr("height",function(d){return d.radius*2;})
    .attr("class", "people")
    .append("xhtml:body")
    .html(function(d){
      if (d.group=='video') {
        return '<image src="'+d.picture+'" class="'+d.group+'"/><div class="play__wrapper"><image src="/images/force-graph/player_play.svg" class="play"/></div>';
      }
      else return '<image src="'+d.picture+'" class="'+d.group+'"/>';
    })
    .attr("class",function(d){ if (d.group=='social') return "social__wrapper social--"+d.name;
                                else return d.group+"__wrapper";})
    .call(node_drag);
  //physics work-- hook up changes to objects
  force.on("tick", function() {
    link.attr("x1", function(d) { if (d.source.index==0) return d.source.x;
                                  else return d.source.x+d.source.radius; })
        .attr("y1", function(d) { if (d.source.index==0) return d.source.y;
                                  else return d.source.y+d.source.radius; })
        .attr("x2", function(d) { return d.target.x+d.target.radius; })
        .attr("y2", function(d) { return d.target.y+d.target.radius; });

    d3.selectAll('.people')
    .attr("x", function(d) {
      if (d.group!="profile") {
        if (Math.abs(d.x-d.originX)<1) d.x=d.originX;
        else d.x+=(graph.nodes[0].x-d.x-d.originX)*speed;
      return d.x;
    }
      else return (d.x-d.radius);
    })
    .attr("y", function(d) {
      if (d.group!="profile") {
        if (Math.abs(d.y-d.originY)<1) d.y=d.originY;
        else d.y+=(graph.nodes[0].y-d.y-d.originY)*speed;
      return d.y;
    }
      return (d.y-d.radius);
    });
  });
  //set center nodes attributes
  graph.nodes[0].fixed=true;
  graph.nodes[0].x=700;
  graph.nodes[0].px=700;
  graph.nodes[0].y=200;
  graph.nodes[0].py=200;
  force.tick();
  $(document).ready(function(){

  var $people=$('.people');
  var $shelf__svg=$('.shelf__svg');

  //bounces graph around center
  function bounce (graph) {
    for (var x=1; x<graph.nodes.length; x++){
      graph.nodes[x].x+=(graph.nodes[0].x-graph.nodes[x].x)*elasticity;
      graph.nodes[x].y+=(graph.nodes[0].y-graph.nodes[x].y)*elasticity;
    }
  }
  //set isClicked
  function setDragging(value){
    isClicked=value;
  }
  function tryBounce () {
    if (!isClicked){
    bounce(graph);
    force.resume();
   }
  }
  //check if element is in frame
  function isScrolledIntoView(elem) {
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();

      var elemTop = elem.offset().top;
      var elemBottom = elemTop + elem.height();

      return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }
  $people.on('mousedown', setDragging(true)).on('mouseup', setDragging(false));
  $("#socialBox").mousedown(tryBounce);

  $(window).scroll(function(){
    if (isScrolledIntoView($shelf__svg)) {
      if (hasBounced) {
      hasBounced=false;
      force.resume();
      bounce(graph);
      }
    }
    else hasBounced=true;
  });
});
